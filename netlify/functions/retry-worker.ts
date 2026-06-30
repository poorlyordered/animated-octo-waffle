import { retryWorkerRequestSchema } from '../../packages/contracts/src/index';
import type { FunctionEvent } from './_shared/auth-scope';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';
import { assertWorkerCallbackAuthorized } from './_shared/worker-callback-auth';
import { claimRetryForWorker, executeRetryForWorker, retryRequestSummary } from './_shared/retry-execution-service';
import {
  findRetryRequest,
  listDueScheduledRetryRequests,
  retryRequestSummary as scheduledRetrySummary
} from './_shared/retry-request-store';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function retryWorkerActionPath(event: FunctionEvent): { id: string; action: 'claim' | 'execute' } | null {
  const match = event.path?.match(/\/retry-worker\/([^/]+)\/(claim|execute)$/);
  return match ? { id: decodeURIComponent(match[1]), action: match[2] as 'claim' | 'execute' } : null;
}

export async function handler(event: FunctionEvent) {
  try {
    assertWorkerCallbackAuthorized(event, 'retry_worker');
    const method = event.httpMethod ?? 'GET';
    const db = await getMongoDb();

    if (method === 'GET') {
      const retries = await listDueScheduledRetryRequests(db);
      return jsonResponse(200, { retries: retries.map(scheduledRetrySummary) });
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const actionPath = retryWorkerActionPath(event);
    if (!actionPath) {
      return safeErrorResponse('Retry worker action not found', 404);
    }

    const request = retryWorkerRequestSchema.parse(parseJsonBody(event));

    if (actionPath.action === 'claim') {
      const retry = await claimRetryForWorker(db, actionPath.id, request.workerId);
      return retry
        ? jsonResponse(200, { retry: retryRequestSummary(retry) })
        : missingOrConflictResponse(db, actionPath.id, 'Retry request is not claimable');
    }

    const retry = await executeRetryForWorker(db, actionPath.id, request.workerId);
    return retry
      ? jsonResponse(200, { retry: retryRequestSummary(retry) })
      : missingOrConflictResponse(db, actionPath.id, 'Retry request is not executable');
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
      return safeErrorResponse('Retry worker request is invalid', 400);
    }

    return safeErrorResponse('Unable to process retry worker request');
  }
}

async function missingOrConflictResponse(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  id: string,
  conflictMessage: string
) {
  const existing = await findRetryRequest(db, id);
  return existing ? safeErrorResponse(conflictMessage, 409) : safeErrorResponse('Retry request not found', 404);
}
