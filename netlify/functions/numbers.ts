import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { findLatestNumbersSnapshot } from './_shared/numbers-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    if (method !== 'GET') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();
    const focus = event.queryStringParameters?.focus ?? 'corporation';
    const snapshot = await findLatestNumbersSnapshot(db, corporationId, focus);

    return jsonResponse(200, { snapshot });
  } catch (error) {
    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    return safeErrorResponse('Unable to load numbers snapshot');
  }
}
