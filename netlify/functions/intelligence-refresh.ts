import { createIntelligenceRefreshRunRequestSchema } from '../../packages/contracts/src/index';
import { authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { assertNoUnsafeRefreshFields } from './_shared/intelligence-refresh-rules';
import {
  createOrFindActiveRefreshRun,
  findRefreshRun,
  listRecentRefreshRuns
} from './_shared/intelligence-refresh-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const path = event.path ?? '';
    const authScope = getAuthScope(event);
    if (authScope.source !== 'session') {
      return safeErrorResponse('Signed EVE session is required', 401);
    }

    const requestedBy = `session:${authScope.session?.characterName ?? authScope.session?.characterId ?? 'commander'}`;
    const db = await getMongoDb();
    const detailMatch = path.match(/\/intelligence-refresh\/([^/]+)$/);

    if (method === 'GET' && detailMatch) {
      const run = await findRefreshRun(db, decodeURIComponent(detailMatch[1]), authScope.corporationId);
      return run ? jsonResponse(200, { run }) : safeErrorResponse('Intelligence refresh run not found', 404);
    }

    if (method === 'GET') {
      const runs = await listRecentRefreshRuns(db, authScope.corporationId);
      return jsonResponse(200, { runs });
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const body = parseJsonBody(event);
    assertNoUnsafeRefreshFields(body);
    const request = createIntelligenceRefreshRunRequestSchema.parse(body);
    const result = await createOrFindActiveRefreshRun(db, {
      corporationId: authScope.corporationId,
      requestedBy,
      domains: request.domains,
      reason: request.reason
    });

    return jsonResponse(result.duplicate ? 200 : 201, result);
  } catch (error) {
    const authResponse = authScopeErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }

    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'Unsafe intelligence refresh field rejected') {
      return safeErrorResponse('Unsafe intelligence refresh field rejected', 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Intelligence refresh request is invalid', 400);
    }

    return safeErrorResponse('Unable to process intelligence refresh request');
  }
}
