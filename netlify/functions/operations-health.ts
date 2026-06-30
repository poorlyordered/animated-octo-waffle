import { authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';
import { buildOperationsHealthResponse } from './_shared/operations-health';

export async function handler(event: FunctionEvent) {
  try {
    if ((event.httpMethod ?? 'GET') !== 'GET') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();
    return jsonResponse(200, await buildOperationsHealthResponse(db, corporationId));
  } catch (error) {
    const authError = authScopeErrorResponse(error);
    if (authError) {
      return authError;
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    return safeErrorResponse('Unable to load operations health');
  }
}
