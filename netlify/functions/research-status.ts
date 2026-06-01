import { defaultResearchFocus } from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { normalizeResearchRequestDocument } from './_shared/research-request-normalizer';
import { jsonResponse, safeErrorResponse } from './_shared/http';

export async function handler(event: FunctionEvent) {
  try {
    const { corporationId } = getAuthScope(event);
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
    if (error instanceof Error && error.message === 'Missing corporation scope') {
      return safeErrorResponse('Missing corporation scope', 401);
    }

    return safeErrorResponse('Unable to load research status');
  }
}
