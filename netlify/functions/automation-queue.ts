import {
  createAutomationQueueItemRequestSchema,
  queueStatusSchema
} from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import {
  createAutomationQueueItem,
  findAutomationQueueItem,
  listAutomationQueueItems
} from './_shared/automation-queue-store';
import {
  findLatestWorkerHandoff,
  prepareWorkerHandoff,
  workerHandoffSummaryFromHandoff
} from './_shared/worker-handoff-store';
import { findScheduledRetryRequest, retryRequestSummary } from './_shared/retry-request-store';
import { assertNoExecutionRequest } from './_shared/worker-handoff-rules';
import { jsonResponse, safeErrorResponse } from './_shared/http';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function queuePathId(event: FunctionEvent): string | null {
  const match = event.path?.match(/\/automation-queue\/([^/]+)$/);
  return match?.[1] ?? null;
}

function handoffPathId(event: FunctionEvent): string | null {
  const match = event.path?.match(/\/automation-queue\/([^/]+)\/handoff$/);
  return match?.[1] ?? null;
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();

    if (method === 'GET') {
      const id = queuePathId(event);

      if (id) {
        const queueItem = await findAutomationQueueItem(db, corporationId, id);

        if (!queueItem) {
          return safeErrorResponse('Queue item not found', 404);
        }

        const handoff = await findLatestWorkerHandoff(db, corporationId, queueItem.id);
        if (handoff) {
          const retry = await findScheduledRetryRequest(db, corporationId, 'worker_handoff', handoff.id);
          if (retry) {
            handoff.retry = retryRequestSummary(retry);
          }
        }

        return jsonResponse(200, {
          queueItem,
          handoff: handoff ? workerHandoffSummaryFromHandoff(handoff) : undefined
        });
      }

      const status = event.queryStringParameters?.status
        ? queueStatusSchema.parse(event.queryStringParameters.status)
        : undefined;
      const queueItems = await listAutomationQueueItems(db, corporationId, {
        status,
        sourceDecisionId: event.queryStringParameters?.sourceDecisionId
      });

      return jsonResponse(200, { queueItems });
    }

    if (method === 'POST') {
      const handoffQueueItemId = handoffPathId(event);
      if (handoffQueueItemId) {
        assertNoExecutionRequest(parseJsonBody(event));
        const handoff = await prepareWorkerHandoff(db, corporationId, handoffQueueItemId);

        if (!handoff) {
          return safeErrorResponse('Queue item not found', 404);
        }

        return jsonResponse(201, { handoff });
      }

      const request = createAutomationQueueItemRequestSchema.parse(parseJsonBody(event));
      const queueItem = await createAutomationQueueItem(db, corporationId, request);

      if (!queueItem) {
        return safeErrorResponse('Source decision not found', 404);
      }

      return jsonResponse(201, { queueItem });
    }

    return safeErrorResponse('Method not allowed', 405);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (error instanceof Error && error.message === 'Only approved decisions can create automation queue items') {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message === 'Explicit approval is required before queuing player-impacting work') {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message === 'Automation queue item already exists for this decision and task intent') {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message === 'Queue item is not eligible for worker handoff') {
      return safeErrorResponse(error.message, 400);
    }

    if (
      error instanceof Error &&
      error.message === 'Explicit approval is required before preparing player-impacting worker handoff'
    ) {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message === 'Worker handoff does not execute, dispatch, or retry work') {
      return safeErrorResponse(error.message, 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Automation queue request is invalid', 400);
    }

    return safeErrorResponse('Unable to update automation queue');
  }
}
