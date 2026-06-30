import {
  createLeadershipFollowUpRequestSchema,
  createPeopleFollowUpDecisionRequestSchema,
  createPeopleFollowUpQueueRequestSchema,
  followUpPrioritySchema,
  followUpStatusSchema,
  updatePeopleFollowUpDecisionStatusRequestSchema
} from '../../packages/contracts/src/index';
import { authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';
import {
  createDecisionRecordFromPeopleFollowUp,
  createLeadershipFollowUp,
  createQueueItemFromPeopleFollowUp,
  findMemberProfile,
  getPeopleIngestionProvenance,
  listLeadershipFollowUps,
  listMemberProfiles,
  updatePeopleFollowUpDecisionStatus
} from './_shared/people-store';
import {
  assertNoUnsafePeopleFollowUpFields,
  assertNoUnsafePeopleFollowUpStatusFields,
  peopleFollowUpHandoff
} from './_shared/people-rules';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function peoplePathId(event: FunctionEvent, segment: 'members'): string | null {
  const match = event.path?.match(new RegExp(`/people/${segment}/([^/]+)$`));
  return match?.[1] ?? null;
}

function followUpActionPath(event: FunctionEvent): { followUpId: string; action: 'decision' | 'decision-status' | 'queue' } | null {
  const match = event.path?.match(/\/people\/follow-ups\/([^/]+)\/(decision\/status|decision|queue)$/);

  if (!match) {
    return null;
  }

  return {
    followUpId: decodeURIComponent(match[1]),
    action: match[2] === 'decision/status' ? 'decision-status' : (match[2] as 'decision' | 'queue')
  };
}

function booleanFilter(value: string | undefined): boolean | undefined {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();
    const path = event.path ?? '';

    if (method === 'GET' && path.includes('/people/members')) {
      const id = peoplePathId(event, 'members');

      if (id) {
        const member = await findMemberProfile(db, corporationId, id);

        if (!member) {
          return safeErrorResponse('Member profile not found', 404);
        }

        const followUps = await listLeadershipFollowUps(db, corporationId, { memberProfileId: member.id });
        return jsonResponse(200, { member, followUps });
      }

      const activity = event.queryStringParameters?.activity;
      const members = await listMemberProfiles(db, corporationId, {
        activity: activity === 'active' || activity === 'stale' || activity === 'missing' ? activity : undefined,
        needsFollowUp: booleanFilter(event.queryStringParameters?.needsFollowUp)
      });
      const ingestionProvenance = await getPeopleIngestionProvenance(db, corporationId, members);
      return jsonResponse(200, { members, ingestionProvenance });
    }

    if (method === 'GET' && path.includes('/people/follow-ups')) {
      const status = event.queryStringParameters?.status
        ? followUpStatusSchema.parse(event.queryStringParameters.status)
        : undefined;
      const priority = event.queryStringParameters?.priority
        ? followUpPrioritySchema.parse(event.queryStringParameters.priority)
        : undefined;
      const followUps = await listLeadershipFollowUps(db, corporationId, {
        status,
        priority,
        memberProfileId: event.queryStringParameters?.memberProfileId
      });

      return jsonResponse(200, { followUps });
    }

    if (method === 'POST' && path.includes('/people/follow-ups')) {
      const actionPath = followUpActionPath(event);

      if (actionPath?.action === 'decision') {
        const body = parseJsonBody(event);
        assertNoUnsafePeopleFollowUpFields(body);
        const request = createPeopleFollowUpDecisionRequestSchema.parse(body);
        const result = await createDecisionRecordFromPeopleFollowUp(db, corporationId, actionPath.followUpId, request);

        return jsonResponse(result.duplicate ? 200 : 201, {
          followUp: result.followUp,
          decision: result.decision,
          handoff: peopleFollowUpHandoff(result.followUp, { decision: result.decision, duplicate: result.duplicate }),
          duplicate: result.duplicate || undefined,
          message: result.duplicate
            ? 'Existing People follow-up decision surfaced. No duplicate was created.'
            : 'People follow-up decision recorded. No queued work, worker dispatch, EVE role/access change, retry, or external execution was performed.'
        });
      }

      if (actionPath?.action === 'queue') {
        const body = parseJsonBody(event);
        assertNoUnsafePeopleFollowUpFields(body);
        const request = createPeopleFollowUpQueueRequestSchema.parse(body);
        const result = await createQueueItemFromPeopleFollowUp(db, corporationId, actionPath.followUpId, request);

        return jsonResponse(result.duplicate ? 200 : 201, {
          followUp: result.followUp,
          queueItem: result.queueItem,
          handoff: peopleFollowUpHandoff(result.followUp, {
            decision: result.decision,
            queueItem: result.queueItem,
            duplicate: result.duplicate
          }),
          duplicate: result.duplicate || undefined,
          message: result.duplicate
            ? 'Existing People queued work surfaced. No duplicate was created.'
            : 'People queued work created. No worker dispatch, handoff preparation, retry scheduling, EVE role/access change, or external execution was performed.'
        });
      }

      const request = createLeadershipFollowUpRequestSchema.parse(parseJsonBody(event));
      const followUp = await createLeadershipFollowUp(db, corporationId, request);

      if (!followUp) {
        return safeErrorResponse('Member profile not found', 404);
      }

      return jsonResponse(201, { followUp });
    }

    if (method === 'PATCH' && path.includes('/people/follow-ups')) {
      const actionPath = followUpActionPath(event);

      if (actionPath?.action !== 'decision-status') {
        return safeErrorResponse('People follow-up action path is invalid', 404);
      }

      const body = parseJsonBody(event);
      assertNoUnsafePeopleFollowUpStatusFields(body);
      const request = updatePeopleFollowUpDecisionStatusRequestSchema.parse(body);
      const result = await updatePeopleFollowUpDecisionStatus(db, corporationId, actionPath.followUpId, request);

      return jsonResponse(200, {
        followUp: result.followUp,
        decision: result.decision,
        handoff: peopleFollowUpHandoff(result.followUp, { decision: result.decision }),
        message:
          request.status === 'approved'
            ? 'People follow-up decision approved. Queue creation remains a separate commander action; no queued work, worker dispatch, EVE role/access change, retry, or external execution was performed.'
            : 'People follow-up decision rejected. No queued work, worker dispatch, EVE role/access change, retry, or external execution was performed.'
      });
    }

    return safeErrorResponse('Method not allowed', 405);
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

    if (
      error instanceof Error &&
      (error.message === 'Explicit approval is required for player-impacting follow-ups' ||
        error.message === 'Leadership follow-up already exists for this member and reason')
    ) {
      return safeErrorResponse(error.message, 400);
    }

    if (
      error instanceof Error &&
      (error.message.startsWith('Unsafe People follow-up action field rejected') ||
        error.message.startsWith('Unsafe People follow-up status field rejected'))
    ) {
      return safeErrorResponse(error.message, 400);
    }

    if (
      error instanceof Error &&
      (error.message === 'Leadership follow-up not found' || error.message === 'People follow-up decision not found')
    ) {
      return safeErrorResponse(error.message, 404);
    }

    if (error instanceof Error && error.message === 'Decision does not match this People follow-up') {
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
      return safeErrorResponse('People follow-up queued work requires an approved source decision.', 409);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('People request is invalid', 400);
    }

    return safeErrorResponse('Unable to update people operating layer');
  }
}
