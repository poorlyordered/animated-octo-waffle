import {
  workerClaimRequestSchema,
  workerCompleteRequestSchema,
  workerFailRequestSchema,
  workerHandoffStatusSchema,
  workerProgressRequestSchema,
  cancelRetryRequestSchema,
  scheduleRetryRequestSchema
} from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { assertWorkerCallbackAuthorized } from './_shared/worker-callback-auth';
import {
  claimWorkerHandoff,
  completeWorkerHandoff,
  failWorkerHandoff,
  findWorkerHandoff,
  listWorkerHandoffs,
  recordWorkerProgress
} from './_shared/worker-handoff-store';
import {
  assertNoUnsafeRetryFields,
  cancelLatestRetryRequestForTarget,
  createOrFindScheduledRetryRequest,
  findLatestRetryRequest,
  retryRequestSummary
} from './_shared/retry-request-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';

function handoffPathId(event: FunctionEvent): string | null {
  const match = event.path?.match(/\/worker-handoffs\/([^/]+)$/);
  return match?.[1] ?? null;
}

function handoffActionPath(event: FunctionEvent): { id: string; action: string } | null {
  const match = event.path?.match(/\/worker-handoffs\/([^/]+)\/(claim|progress|complete|fail|retry|retry\/cancel)$/);
  return match ? { id: match[1], action: match[2] } : null;
}

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

async function missingOrConflictResponse(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  corporationId: string,
  id: string,
  conflictMessage: string
) {
  const existing = await findWorkerHandoff(db, corporationId, id);
  return existing ? safeErrorResponse(conflictMessage, 409) : safeErrorResponse('Worker handoff not found', 404);
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();

    if (method === 'POST') {
      const actionPath = handoffActionPath(event);

      if (!actionPath) {
        return safeErrorResponse('Worker handoff action not found', 404);
      }

      const body = parseJsonBody(event);
      if (actionPath.action === 'retry') {
        assertNoUnsafeRetryFields(body);
        const request = scheduleRetryRequestSchema.parse(body);
        const handoff = await findWorkerHandoff(db, corporationId, actionPath.id);
        if (!handoff) {
          return safeErrorResponse('Worker handoff not found', 404);
        }
        if (handoff.status !== 'failed') {
          return safeErrorResponse('Only failed worker handoffs are retry-eligible', 409);
        }
        const { retry, duplicate } = await createOrFindScheduledRetryRequest(
          db,
          corporationId,
          'worker_handoff',
          handoff.id,
          request
        );
        return jsonResponse(duplicate ? 200 : 201, { retry: retryRequestSummary(retry), duplicate });
      }

      if (actionPath.action === 'retry/cancel') {
        assertNoUnsafeRetryFields(body);
        const request = cancelRetryRequestSchema.parse(body);
        const handoff = await findWorkerHandoff(db, corporationId, actionPath.id);
        if (!handoff) {
          return safeErrorResponse('Worker handoff not found', 404);
        }
        const retry = await cancelLatestRetryRequestForTarget(db, corporationId, 'worker_handoff', handoff.id, request);
        return retry
          ? jsonResponse(200, { retry: retryRequestSummary(retry) })
          : safeErrorResponse('Only scheduled or blocked worker handoff retries can be canceled', 409);
      }

      assertWorkerCallbackAuthorized(event);
      if (actionPath.action === 'claim') {
        const request = workerClaimRequestSchema.parse(body);
        const handoff = await claimWorkerHandoff(db, corporationId, actionPath.id, request.workerId);
        return handoff
          ? jsonResponse(200, { handoff })
          : missingOrConflictResponse(db, corporationId, actionPath.id, 'Worker handoff is not claimable');
      }

      if (actionPath.action === 'progress') {
        const request = workerProgressRequestSchema.parse(body);
        const handoff = await recordWorkerProgress(db, corporationId, actionPath.id, request);
        return handoff
          ? jsonResponse(200, { handoff })
          : missingOrConflictResponse(db, corporationId, actionPath.id, 'Worker handoff is not claimed by worker');
      }

      if (actionPath.action === 'complete') {
        const request = workerCompleteRequestSchema.parse(body);
        const handoff = await completeWorkerHandoff(db, corporationId, actionPath.id, request);
        return handoff
          ? jsonResponse(200, { handoff })
          : missingOrConflictResponse(db, corporationId, actionPath.id, 'Worker handoff is not claimed by worker');
      }

      const request = workerFailRequestSchema.parse(body);
      const handoff = await failWorkerHandoff(db, corporationId, actionPath.id, request);
      return handoff
        ? jsonResponse(200, { handoff })
        : missingOrConflictResponse(db, corporationId, actionPath.id, 'Worker handoff is not claimed by worker');
    }

    if (method !== 'GET') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const id = handoffPathId(event);
    if (id) {
      const handoff = await findWorkerHandoff(db, corporationId, id);

      if (!handoff) {
        return safeErrorResponse('Worker handoff not found', 404);
      }

      const retry = await findLatestRetryRequest(db, corporationId, 'worker_handoff', handoff.id);
      if (retry) {
        handoff.retry = retryRequestSummary(retry);
      }

      return jsonResponse(200, { handoff });
    }

    const status = event.queryStringParameters?.status
      ? workerHandoffStatusSchema.parse(event.queryStringParameters.status)
      : undefined;
    if (status === 'ready' && hasWorkerCallbackSecret(event)) {
      assertWorkerCallbackAuthorized(event);
    }
    const handoffs = await listWorkerHandoffs(db, corporationId, {
      status,
      queueItemId: event.queryStringParameters?.queueItemId
    });

    return jsonResponse(200, { handoffs });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (error instanceof Error && error.message === 'Worker callback is not authorized') {
      return safeErrorResponse('Worker callback is not authorized', 401);
    }

    if (error instanceof Error && error.message.startsWith('Unsafe retry field rejected')) {
      return safeErrorResponse(error.message, 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Worker handoff request is invalid', 400);
    }

    return safeErrorResponse('Unable to load worker handoffs');
  }
}

function hasWorkerCallbackSecret(event: FunctionEvent): boolean {
  return Object.keys(event.headers ?? {}).some((key) => key.toLowerCase() === 'x-worker-callback-secret');
}
