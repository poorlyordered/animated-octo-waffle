import {
  createNumbersFollowUpDecisionRequestSchema,
  createNumbersFollowUpQueueRequestSchema,
  updateNumbersFollowUpDecisionStatusRequestSchema
} from '../../packages/contracts/src/index';
import { authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { createAutomationQueueItem, findAutomationQueueItemByDecisionAndIntent } from './_shared/automation-queue-store';
import {
  createDecisionRecordFromNumbersFollowUp,
  findDecisionRecord,
  findDecisionRecordByNumbersFollowUpOrigin,
  updateDecisionStatus
} from './_shared/decision-record-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { latestNumbersLiveProvenance } from './_shared/esi-sync-history';
import { findCompletedSyncRequestForSnapshot } from './_shared/esi-sync-request-store';
import {
  assertNoUnsafeNumbersFollowUpFields,
  assertNoUnsafeNumbersFollowUpStatusFields,
  numbersApprovalHandoff
} from './_shared/numbers-followup-actions';
import { findLatestNumbersSnapshot, findNumbersFollowUpCandidate } from './_shared/numbers-store';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function followUpActionPath(event: FunctionEvent): { candidateId: string; action: 'decision' | 'decision-status' | 'queue' } | null {
  const match = event.path?.match(/\/numbers\/follow-ups\/([^/]+)\/(decision\/status|decision|queue)$/);

  if (!match) {
    return null;
  }

  return {
    candidateId: decodeURIComponent(match[1]),
    action: match[2] === 'decision/status' ? 'decision-status' : (match[2] as 'decision' | 'queue')
  };
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    if (method === 'GET') {
      const { corporationId } = getAuthScope(event);
      const db = await getMongoDb();
      const focus = event.queryStringParameters?.focus ?? 'corporation';
      const snapshot = await findLatestNumbersSnapshot(db, corporationId, focus);
      const syncRequest = snapshot ? await findCompletedSyncRequestForSnapshot(db, corporationId, 'numbers', snapshot.id) : null;

      return jsonResponse(200, { snapshot, liveProvenance: latestNumbersLiveProvenance(snapshot, syncRequest) });
    }

    if (method !== 'POST' && method !== 'PATCH') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();
    const path = followUpActionPath(event);

    if (!path) {
      return safeErrorResponse('Numbers follow-up action path is invalid', 404);
    }

    const body = parseJsonBody(event);

    if (method === 'POST' && path.action === 'decision') {
      assertNoUnsafeNumbersFollowUpFields(body);
      const request = createNumbersFollowUpDecisionRequestSchema.parse(body);
      const selection = await findNumbersFollowUpCandidate(db, corporationId, request.snapshotId, path.candidateId);

      if (!selection) {
        return safeErrorResponse('Numbers follow-up candidate not found', 404);
      }

      const existingDecision = await findDecisionRecordByNumbersFollowUpOrigin(db, corporationId, selection.origin);
      const decision =
        existingDecision ??
        (await createDecisionRecordFromNumbersFollowUp(
          db,
          corporationId,
          selection.snapshot,
          selection.candidate,
          selection.origin,
          request.expectedResult
        ));

      return jsonResponse(existingDecision ? 200 : 201, {
        decision,
        origin: selection.origin,
        approvalHandoff: numbersApprovalHandoff(selection.origin, decision, { duplicate: Boolean(existingDecision) }),
        duplicate: existingDecision ? true : undefined,
        message: existingDecision
          ? 'Existing decision surfaced. No duplicate was created.'
          : 'Decision recorded. No EVE action, wallet action, asset action, worker dispatch, or external execution was performed.'
      });
    }

    if (method === 'PATCH' && path.action === 'decision-status') {
      assertNoUnsafeNumbersFollowUpStatusFields(body);
      const request = updateNumbersFollowUpDecisionStatusRequestSchema.parse(body);
      const selection = await findNumbersFollowUpCandidate(db, corporationId, request.snapshotId, path.candidateId);

      if (!selection) {
        return safeErrorResponse('Numbers follow-up candidate not found', 404);
      }

      const decision = await findDecisionRecord(db, corporationId, request.sourceDecisionId);

      if (!decision) {
        return safeErrorResponse('Decision not found', 404);
      }

      if (
        decision.sourceContext?.sourceType !== 'numbers_follow_up' ||
        decision.sourceContext.snapshotId !== selection.origin.snapshotId ||
        decision.sourceContext.candidateId !== selection.origin.candidateId
      ) {
        return safeErrorResponse('Decision does not match this Numbers follow-up candidate', 400);
      }

      const updatedDecision = await updateDecisionStatus(db, corporationId, decision.id, {
        status: request.status,
        approvalText: request.approvalText,
        note: request.note
      });

      if (!updatedDecision) {
        return safeErrorResponse('Decision not found', 404);
      }

      return jsonResponse(200, {
        decision: updatedDecision,
        origin: selection.origin,
        approvalHandoff: numbersApprovalHandoff(selection.origin, updatedDecision),
        message:
          request.status === 'approved'
            ? 'Decision approved. Queue creation remains a separate commander action; no queued work, worker dispatch, EVE action, wallet action, asset action, or external execution was performed.'
            : 'Decision rejected. No queued work, worker dispatch, EVE action, wallet action, asset action, or external execution was performed.'
      });
    }

    if (method !== 'POST' || path.action !== 'queue') {
      return safeErrorResponse('Numbers follow-up action path is invalid', 404);
    }

    assertNoUnsafeNumbersFollowUpFields(body);
    const request = createNumbersFollowUpQueueRequestSchema.parse(body);
    const selection = await findNumbersFollowUpCandidate(db, corporationId, request.snapshotId, path.candidateId);

    if (!selection) {
      return safeErrorResponse('Numbers follow-up candidate not found', 404);
    }

    const decision = await findDecisionRecord(db, corporationId, request.sourceDecisionId);

    if (!decision) {
      return safeErrorResponse('Decision not found', 404);
    }

    if (
      decision.sourceContext?.sourceType !== 'numbers_follow_up' ||
      decision.sourceContext.snapshotId !== selection.origin.snapshotId ||
      decision.sourceContext.candidateId !== selection.origin.candidateId
    ) {
      return safeErrorResponse('Decision does not match this Numbers follow-up candidate', 400);
    }

    const existingQueueItem = await findAutomationQueueItemByDecisionAndIntent(
      db,
      corporationId,
      decision.id,
      request.taskIntent
    );

    if (existingQueueItem) {
      return jsonResponse(200, {
        queueItem: existingQueueItem,
        origin: selection.origin,
        approvalHandoff: numbersApprovalHandoff(selection.origin, decision, {
          queueItem: existingQueueItem,
          duplicate: true
        }),
        duplicate: true,
        message: 'Existing queued work surfaced. No duplicate was created.'
      });
    }

    const queueItem = await createAutomationQueueItem(db, corporationId, request);

    if (!queueItem) {
      return safeErrorResponse('Decision not found', 404);
    }

    return jsonResponse(201, {
      queueItem,
      origin: selection.origin,
      approvalHandoff: numbersApprovalHandoff(selection.origin, decision, { queueItem }),
      message:
        'Queued work created. No worker dispatch, handoff claim, retry scheduling, EVE action, wallet action, asset action, or external execution was performed.'
    });
  } catch (error) {
    const authError = authScopeErrorResponse(error);
    if (authError) {
      return authError;
    }

    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (error instanceof Error && error.message.startsWith('Unsafe Numbers follow-up action field rejected')) {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message.startsWith('Unsafe Numbers follow-up status field rejected')) {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message.startsWith('Invalid decision status transition')) {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message === 'Explicit approval is required for player-impacting decisions') {
      return safeErrorResponse(error.message, 409);
    }

    if (
      error instanceof Error &&
      (error.message === 'Only approved decisions can create automation queue items' ||
        error.message === 'Explicit approval is required before queuing player-impacting work')
    ) {
      return safeErrorResponse('Numbers follow-up queued work requires an approved source decision.', 409);
    }

    if (error instanceof Error && error.message === 'Automation queue item already exists for this decision and task intent') {
      return safeErrorResponse('Existing queued work already exists for this decision and task intent.', 409);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Numbers follow-up action request is invalid', 400);
    }

    return safeErrorResponse('Unable to load numbers snapshot');
  }
}
