import { workerHandoffStatusSchema } from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { findWorkerHandoff, listWorkerHandoffs } from './_shared/worker-handoff-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';

function handoffPathId(event: FunctionEvent): string | null {
  const match = event.path?.match(/\/worker-handoffs\/([^/]+)$/);
  return match?.[1] ?? null;
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();

    if (method !== 'GET') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const id = handoffPathId(event);
    if (id) {
      const handoff = await findWorkerHandoff(db, corporationId, id);

      if (!handoff) {
        return safeErrorResponse('Worker handoff not found', 404);
      }

      return jsonResponse(200, { handoff });
    }

    const status = event.queryStringParameters?.status
      ? workerHandoffStatusSchema.parse(event.queryStringParameters.status)
      : undefined;
    const handoffs = await listWorkerHandoffs(db, corporationId, {
      status,
      queueItemId: event.queryStringParameters?.queueItemId
    });

    return jsonResponse(200, { handoffs });
  } catch (error) {
    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Worker handoff request is invalid', 400);
    }

    return safeErrorResponse('Unable to load worker handoffs');
  }
}
