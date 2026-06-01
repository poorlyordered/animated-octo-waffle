import { defaultResearchFocus } from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { normalizeResearchRequestDocument } from './_shared/research-request-normalizer';
import { jsonResponse, safeErrorResponse } from './_shared/http';

export async function handler(event: FunctionEvent) {
  try {
    const { corporationId } = getAuthScope();
    const focus = event.queryStringParameters?.focus ?? defaultResearchFocus;
    const db = await getMongoDb();
    const document = await db
      .collection('research_requests')
      .find({ corporationId, focus })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    return jsonResponse(200, {
      request: document ? normalizeResearchRequestDocument(document) : null
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    return safeErrorResponse('Unable to load research status');
  }
}
