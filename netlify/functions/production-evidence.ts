import { createProductionEvidenceRequestSchema } from '../../packages/contracts/src/index';
import { authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import {
  assertValueFreeProductionEvidence,
  createProductionEvidenceRecord,
  listProductionEvidenceRecords,
  UnsafeProductionEvidenceError
} from './_shared/production-evidence-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function recordedByFromScope(scope: ReturnType<typeof getAuthScope>): string {
  if (scope.source === 'session' && scope.session?.characterName) {
    return `session:${scope.session.characterName}`;
  }

  return `command-scope:${scope.corporationId}`;
}

function parseLimit(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const scope = getAuthScope(event);
    const db = await getMongoDb();

    if (method === 'GET') {
      return jsonResponse(
        200,
        await listProductionEvidenceRecords(db, scope.corporationId, parseLimit(event.queryStringParameters?.limit))
      );
    }

    if (method === 'POST') {
      const body = parseJsonBody(event);
      assertValueFreeProductionEvidence(body);
      const request = createProductionEvidenceRequestSchema.parse(body);
      const record = await createProductionEvidenceRecord(db, scope.corporationId, recordedByFromScope(scope), request);
      return jsonResponse(201, { record });
    }

    return safeErrorResponse('Method not allowed', 405);
  } catch (error) {
    const authError = authScopeErrorResponse(error);
    if (authError) {
      return authError;
    }

    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof UnsafeProductionEvidenceError) {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Production evidence request is invalid', 400);
    }

    return safeErrorResponse('Unable to update production evidence');
  }
}
