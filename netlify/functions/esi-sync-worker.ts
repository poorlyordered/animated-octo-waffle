import {
  esiSyncDomainSchema,
  type EsiSyncWorkerResultSummary,
  esiSyncWorkerClaimRequestSchema,
  esiSyncWorkerCompleteRequestSchema,
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

const runnableWorkerDomain = 'numbers';
const externallyCompletableWorkerDomains = ['people', 'opportunity'] as const;
type ExternallyCompletableWorkerDomain = (typeof externallyCompletableWorkerDomains)[number];
const unsafeWorkerResultPattern =
  /(accessToken|refreshToken|sealed|client[-_ ]?secret|bearer\s+[A-Za-z0-9._-]+|dispatchTarget|retrySchedule|walletAction|roleMutation|accessMutation|rawEsi|rawPayload|eyJ[A-Za-z0-9_-]{10,})/i;

export function isRunnableEsiSyncWorkerDomain(domain: string): domain is typeof runnableWorkerDomain {
  return domain === runnableWorkerDomain;
}

export function isClaimableEsiSyncWorkerDomain(domain: string): domain is typeof runnableWorkerDomain | ExternallyCompletableWorkerDomain {
  return domain === runnableWorkerDomain || externallyCompletableWorkerDomains.includes(domain as ExternallyCompletableWorkerDomain);
}

export function isExternallyCompletableEsiSyncWorkerDomain(domain: string): domain is ExternallyCompletableWorkerDomain {
  return externallyCompletableWorkerDomains.includes(domain as ExternallyCompletableWorkerDomain);
}

export function assertSafeEsiSyncWorkerResult(result: EsiSyncWorkerResultSummary): void {
  const serialized = JSON.stringify(result);
  if (unsafeWorkerResultPattern.test(serialized)) {
    throw new Error('ESI sync worker result contains unsafe material');
  }
}

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function workerActionPath(event: FunctionEvent): { id: string; action: 'claim' | 'run' | 'complete' | 'fail' } | null {
  const match = event.path?.match(/\/esi-sync-worker\/([^/]+)\/(claim|run|complete|fail)$/);
  return match ? { id: decodeURIComponent(match[1]), action: match[2] as 'claim' | 'run' | 'complete' | 'fail' } : null;
}

export async function handler(event: FunctionEvent) {
  try {
    assertWorkerCallbackAuthorized(event, 'esi_sync');
    const method = event.httpMethod ?? 'GET';
    const db = await getMongoDb();

    if (method === 'GET') {
      const domain = event.queryStringParameters?.domain
        ? esiSyncDomainSchema.parse(event.queryStringParameters.domain)
        : runnableWorkerDomain;
      const syncRequests = isClaimableEsiSyncWorkerDomain(domain) ? await listQueuedSyncRequests(db, domain) : [];
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
      const existing = await findSyncRequest(db, actionPath.id);
      if (existing && !isClaimableEsiSyncWorkerDomain(existing.domain)) {
        return safeErrorResponse('Only Numbers, People, and Opportunity ESI sync requests are claimable in this worker slice', 409);
      }
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

      if (!isRunnableEsiSyncWorkerDomain(claimed.domain)) {
        return safeErrorResponse('Only Numbers ESI sync requests are runnable in this worker slice', 409);
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

    if (actionPath.action === 'complete') {
      const request = esiSyncWorkerCompleteRequestSchema.parse(body);
      assertSafeEsiSyncWorkerResult(request.result);
      const existing = await findClaimedByWorker(db, actionPath.id, request.workerId);
      if (existing && !isExternallyCompletableEsiSyncWorkerDomain(existing.domain)) {
        return safeErrorResponse('Only People and Opportunity ESI sync requests are externally completable in this worker slice', 409);
      }
      const completed = existing ? await completeSyncRequest(db, actionPath.id, request.workerId, request.result) : null;
      return completed
        ? jsonResponse(200, { syncRequest: workerSyncRequestSummary(completed) })
        : missingOrConflictResponse(db, actionPath.id, 'ESI sync request is not completable');
    }

    const request = esiSyncWorkerFailRequestSchema.parse(body);
    const existing = await findClaimedByWorker(db, actionPath.id, request.workerId);
    if (existing && !isClaimableEsiSyncWorkerDomain(existing.domain)) {
      return safeErrorResponse('Only Numbers, People, and Opportunity ESI sync requests are failable in this worker slice', 409);
    }
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

    if (error instanceof Error && error.message === 'ESI sync worker result contains unsafe material') {
      return safeErrorResponse(error.message, 400);
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
