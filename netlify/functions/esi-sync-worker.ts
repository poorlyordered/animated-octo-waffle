import {
  esiSyncDomainSchema,
  esiSyncWorkerClaimRequestSchema,
  esiSyncWorkerFailRequestSchema,
  esiSyncWorkerRunRequestSchema
} from '../../packages/contracts/src/index';
import type { FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { assertWorkerCallbackAuthorized } from './_shared/worker-callback-auth';
import {
  claimQueuedSyncRequest,
  completeSyncRequest,
  failSyncRequest,
  findSyncRequest,
  listQueuedSyncRequests,
  workerSyncRequestSummary
} from './_shared/esi-sync-request-store';
import { ingestNumbersFromEsiSyncRequest } from './_shared/esi-numbers-ingestion';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function workerActionPath(event: FunctionEvent): { id: string; action: 'claim' | 'run' | 'fail' } | null {
  const match = event.path?.match(/\/esi-sync-worker\/([^/]+)\/(claim|run|fail)$/);
  return match ? { id: decodeURIComponent(match[1]), action: match[2] as 'claim' | 'run' | 'fail' } : null;
}

export async function handler(event: FunctionEvent) {
  try {
    assertWorkerCallbackAuthorized(event);
    const method = event.httpMethod ?? 'GET';
    const db = await getMongoDb();

    if (method === 'GET') {
      const domain = event.queryStringParameters?.domain
        ? esiSyncDomainSchema.parse(event.queryStringParameters.domain)
        : undefined;
      const syncRequests = await listQueuedSyncRequests(db, domain);
      return jsonResponse(200, { syncRequests: syncRequests.map(workerSyncRequestSummary) });
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const actionPath = workerActionPath(event);
    if (!actionPath) {
      return safeErrorResponse('ESI sync worker action not found', 404);
    }

    const body = parseJsonBody(event);

    if (actionPath.action === 'claim') {
      const request = esiSyncWorkerClaimRequestSchema.parse(body);
      const syncRequest = await claimQueuedSyncRequest(db, actionPath.id, request.workerId);
      return syncRequest
        ? jsonResponse(200, { syncRequest: workerSyncRequestSummary(syncRequest) })
        : missingOrConflictResponse(db, actionPath.id, 'ESI sync request is not claimable');
    }

    if (actionPath.action === 'run') {
      const request = esiSyncWorkerRunRequestSchema.parse(body);
      const claimed =
        (await claimQueuedSyncRequest(db, actionPath.id, request.workerId)) ??
        (await findClaimedByWorker(db, actionPath.id, request.workerId));
      if (!claimed) {
        return missingOrConflictResponse(db, actionPath.id, 'ESI sync request is not runnable');
      }

      try {
        const result = await ingestNumbersFromEsiSyncRequest(db, claimed);
        const completed = await completeSyncRequest(db, actionPath.id, request.workerId, result);
        return completed
          ? jsonResponse(200, { syncRequest: workerSyncRequestSummary(completed) })
          : missingOrConflictResponse(db, actionPath.id, 'ESI sync request is not completable');
      } catch (ingestionError) {
        const failed = await failSyncRequest(
          db,
          actionPath.id,
          request.workerId,
          ingestionError instanceof Error ? ingestionError.message : 'ESI Numbers ingestion failed'
        );
        return failed
          ? jsonResponse(200, { syncRequest: workerSyncRequestSummary(failed) })
          : missingOrConflictResponse(db, actionPath.id, 'ESI sync request is not failable');
      }
    }

    const request = esiSyncWorkerFailRequestSchema.parse(body);
    const failed = await failSyncRequest(db, actionPath.id, request.workerId, request.reason);
    return failed
      ? jsonResponse(200, { syncRequest: workerSyncRequestSummary(failed) })
      : missingOrConflictResponse(db, actionPath.id, 'ESI sync request is not failable');
  } catch (error) {
    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'Worker callback is not authorized') {
      return safeErrorResponse('Worker callback is not authorized', 401);
    }

    if (error instanceof Error && error.message === 'MONGODB_URI must start with mongodb:// or mongodb+srv://') {
      return safeErrorResponse('MongoDB is not configured', 500);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('ESI sync worker request is invalid', 400);
    }

    return safeErrorResponse('Unable to process ESI sync worker request');
  }
}

async function findClaimedByWorker(db: Awaited<ReturnType<typeof getMongoDb>>, id: string, workerId: string) {
  const syncRequest = await findSyncRequest(db, id);
  return syncRequest?.status === 'claimed' && syncRequest.claimedBy === workerId ? syncRequest : null;
}

async function missingOrConflictResponse(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  id: string,
  conflictMessage: string
) {
  const existing = await findSyncRequest(db, id);
  return existing ? safeErrorResponse(conflictMessage, 409) : safeErrorResponse('ESI sync request not found', 404);
}
