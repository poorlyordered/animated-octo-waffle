import {
  defaultResearchFocus,
  opportunityIngestionWorkerClaimRequestSchema,
  opportunityIngestionWorkerCompleteRequestSchema,
  opportunityIngestionWorkerFailRequestSchema
} from '../../packages/contracts/src/index';
import type { FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { assertWorkerCallbackAuthorized } from './_shared/worker-callback-auth';
import {
  claimOpportunityIngestionRequest,
  completeOpportunityIngestionRequest,
  failOpportunityIngestionRequest,
  findOpportunityIngestionRequest,
  listQueuedOpportunityIngestionRequests,
  opportunityIngestionWorkerSummary
} from './_shared/opportunity-ingestion-history';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function workerActionPath(event: FunctionEvent): { id: string; action: 'claim' | 'complete' | 'fail' } | null {
  const match = event.path?.match(/\/opportunity-ingestion-worker\/([^/]+)\/(claim|complete|fail)$/);
  return match ? { id: decodeURIComponent(match[1]), action: match[2] as 'claim' | 'complete' | 'fail' } : null;
}

export async function handler(event: FunctionEvent) {
  try {
    assertWorkerCallbackAuthorized(event);
    const method = event.httpMethod ?? 'GET';
    const db = await getMongoDb();

    if (method === 'GET') {
      const focus = event.queryStringParameters?.focus ?? defaultResearchFocus;
      const requests = await listQueuedOpportunityIngestionRequests(db, focus);
      return jsonResponse(200, { requests: requests.map((request) => opportunityIngestionWorkerSummary(request)) });
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const actionPath = workerActionPath(event);
    if (!actionPath) {
      return safeErrorResponse('Opportunity ingestion worker action not found', 404);
    }

    const body = parseJsonBody(event);

    if (actionPath.action === 'claim') {
      const request = opportunityIngestionWorkerClaimRequestSchema.parse(body);
      const claimed = await claimOpportunityIngestionRequest(db, actionPath.id, request.workerId);
      return claimed
        ? jsonResponse(200, { request: opportunityIngestionWorkerSummary(claimed) })
        : missingOrConflictResponse(db, actionPath.id, 'Opportunity ingestion request is not claimable');
    }

    if (actionPath.action === 'complete') {
      const request = opportunityIngestionWorkerCompleteRequestSchema.parse(body);
      const completed = await completeOpportunityIngestionRequest(db, actionPath.id, request.workerId, request);
      return completed
        ? jsonResponse(200, { request: opportunityIngestionWorkerSummary(completed) })
        : missingOrConflictResponse(db, actionPath.id, 'Opportunity ingestion request is not completable');
    }

    const request = opportunityIngestionWorkerFailRequestSchema.parse(body);
    const failed = await failOpportunityIngestionRequest(db, actionPath.id, request.workerId, request.reason);
    return failed
      ? jsonResponse(200, { request: opportunityIngestionWorkerSummary(failed) })
      : missingOrConflictResponse(db, actionPath.id, 'Opportunity ingestion request is not failable');
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
      return safeErrorResponse('Opportunity ingestion worker request is invalid', 400);
    }

    return safeErrorResponse('Unable to process Opportunity ingestion worker request');
  }
}

async function missingOrConflictResponse(
  db: Awaited<ReturnType<typeof getMongoDb>>,
  id: string,
  conflictMessage: string
) {
  const existing = await findOpportunityIngestionRequest(db, id);
  return existing ? safeErrorResponse(conflictMessage, 409) : safeErrorResponse('Opportunity ingestion request not found', 404);
}
