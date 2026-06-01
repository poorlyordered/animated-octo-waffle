import {
  createDecisionRecordRequestSchema,
  decisionStatusSchema,
  updateDecisionStatusRequestSchema
} from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { createDecisionRecord, listDecisionRecords, updateDecisionStatus } from './_shared/decision-record-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

function statusPathId(event: FunctionEvent): string | null {
  const match = event.path?.match(/\/decision-records\/([^/]+)\/status$/);
  return match?.[1] ?? null;
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const { corporationId } = getAuthScope();
    const db = await getMongoDb();

    if (method === 'GET') {
      const status = event.queryStringParameters?.status
        ? decisionStatusSchema.parse(event.queryStringParameters.status)
        : undefined;
      const decisions = await listDecisionRecords(db, corporationId, {
        sourceBriefId: event.queryStringParameters?.sourceBriefId,
        status
      });

      return jsonResponse(200, { decisions });
    }

    if (method === 'POST') {
      const request = createDecisionRecordRequestSchema.parse(parseJsonBody(event));
      const decision = await createDecisionRecord(db, corporationId, request);

      if (!decision) {
        return safeErrorResponse('Source brief not found', 404);
      }

      return jsonResponse(201, { decision });
    }

    if (method === 'PATCH') {
      const id = statusPathId(event);
      if (!id) {
        return safeErrorResponse('Decision status path is invalid', 404);
      }

      const request = updateDecisionStatusRequestSchema.parse(parseJsonBody(event));
      const decision = await updateDecisionStatus(db, corporationId, id, request);

      if (!decision) {
        return safeErrorResponse('Decision not found', 404);
      }

      return jsonResponse(200, { decision });
    }

    return safeErrorResponse('Method not allowed', 405);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (error instanceof Error && error.message.startsWith('Invalid decision status transition')) {
      return safeErrorResponse(error.message, 400);
    }

    if (error instanceof Error && error.message === 'Explicit approval is required for player-impacting decisions') {
      return safeErrorResponse(error.message, 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Decision request is invalid', 400);
    }

    return safeErrorResponse('Unable to update decision records');
  }
}
