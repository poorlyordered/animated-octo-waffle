import {
  peopleIngestionWorkerClaimRequestSchema,
  peopleIngestionWorkerCompleteRequestSchema,
  peopleIngestionWorkerFailRequestSchema
} from '../../packages/contracts/src/index';
import type { FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { assertWorkerCallbackAuthorized } from './_shared/worker-callback-auth';
import {
  claimPeopleIngestionRequest,
  completePeopleIngestionRequest,
  failPeopleIngestionRequest,
  findPeopleIngestionRequest,
  listQueuedPeopleIngestionRequests,
  peopleIngestionWorkerSummary
} from './_shared/people-ingestion-history';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function workerActionPath(event: FunctionEvent): { id: string; action: 'claim' | 'complete' | 'fail' } | null {
  const match = event.path?.match(/\/people-ingestion-worker\/([^/]+)\/(claim|complete|fail)$/);
  return match ? { id: decodeURIComponent(match[1]), action: match[2] as 'claim' | 'complete' | 'fail' } : null;
}

export async function handler(event: FunctionEvent) {
  try {
    assertWorkerCallbackAuthorized(event);
    const method = event.httpMethod ?? 'GET';
    const db = await getMongoDb();

    if (method === 'GET') {
      const requests = await listQueuedPeopleIngestionRequests(db);
      return jsonResponse(200, { requests: requests.map((request) => peopleIngestionWorkerSummary(request)) });
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const actionPath = workerActionPath(event);
    if (!actionPath) {
      return safeErrorResponse('People ingestion worker action not found', 404);
    }

    const body = parseJsonBody(event);

    if (actionPath.action === 'claim') {
      const request = peopleIngestionWorkerClaimRequestSchema.parse(body);
      const claimed = await claimPeopleIngestionRequest(db, actionPath.id, request.workerId);
      return claimed
        ? jsonResponse(200, { request: peopleIngestionWorkerSummary(claimed) })
        : missingOrConflictResponse(db, actionPath.id, 'People ingestion request is not claimable');
    }

    if (actionPath.action === 'complete') {
      const request = peopleIngestionWorkerCompleteRequestSchema.parse(body);
      const completed = await completePeopleIngestionRequest(db, actionPath.id, request.workerId, request);
      return completed
        ? jsonResponse(200, { request: peopleIngestionWorkerSummary(completed) })
        : missingOrConflictResponse(db, actionPath.id, 'People ingestion request is not completable');
    }

    const request = peopleIngestionWorkerFailRequestSchema.parse(body);
    const failed = await failPeopleIngestionRequest(db, actionPath.id, request.workerId, request.reason);
    return failed
      ? jsonResponse(200, { request: peopleIngestionWorkerSummary(failed) })
      : missingOrConflictResponse(db, actionPath.id, 'People ingestion request is not failable');
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
      return safeErrorResponse('People ingestion worker request is invalid', 400);
    }

    return safeErrorResponse('Unable to process People ingestion worker request');
  }
}

async function missingOrConflictResponse(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  id: string,
  conflictMessage: string
) {
  const existing = await findPeopleIngestionRequest(db, id);
  return existing ? safeErrorResponse(conflictMessage, 409) : safeErrorResponse('People ingestion request not found', 404);
}
