import { defaultResearchFocus, prepareOpportunityIngestionRequestSchema } from '../../packages/contracts/src/index';
import { authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { normalizeCommandBriefDocument } from './_shared/command-brief-normalizer';
import {
  buildOpportunityIngestionProvenance,
  countOpportunityBriefs,
  createOrFindQueuedOpportunityIngestionRequest,
  listOpportunityIngestionHistory,
  opportunityIngestionPrepareSummary,
  opportunitySectionStatuses
} from './_shared/opportunity-ingestion-history';
import { jsonResponse, safeErrorResponse } from './_shared/http';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

export async function handler(event: FunctionEvent) {
  try {
    const scope = getAuthScope(event);
    const { corporationId } = scope;
    const method = event.httpMethod ?? 'GET';
    const focus = event.queryStringParameters?.focus ?? defaultResearchFocus;
    const db = await getMongoDb();
    const document = await db
      .collection('research_briefs')
      .find({ corporationId, focus })
      .sort({ createdAt: -1 })
      .limit(1)
      .next();

    const brief = document ? normalizeCommandBriefDocument(document) : null;
    const fallbackSections = opportunitySectionStatuses(brief);

    if (method === 'POST' && (event.path ?? '').includes('/command-brief/opportunity/prepare')) {
      const request = prepareOpportunityIngestionRequestSchema.parse(parseJsonBody(event));
      const result = await createOrFindQueuedOpportunityIngestionRequest(
        db,
        corporationId,
        focus,
        scope.session?.characterName ?? `fallback:${corporationId}`,
        request.reason
      );
      const preparedRequest = opportunityIngestionPrepareSummary(result.request, fallbackSections);
      const [existingProvenance, briefCount] = await Promise.all([
        listOpportunityIngestionHistory(db, corporationId, focus, fallbackSections),
        countOpportunityBriefs(db, corporationId, focus)
      ]);
      const history = [preparedRequest, ...existingProvenance].filter(
        (item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index
      );

      return jsonResponse(result.duplicate ? 200 : 201, {
        request: preparedRequest,
        provenance: buildOpportunityIngestionProvenance(brief, history, briefCount, focus),
        duplicate: result.duplicate || undefined,
        message: result.duplicate
          ? 'Existing active Opportunity ingestion request surfaced. No duplicate was created.'
          : 'Opportunity ingestion prepared for worker pickup. No research pull was scheduled, no worker was dispatched, no ESI data was fetched, no EVE write occurred, and no external service was executed.'
      });
    }

    if (method !== 'GET') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const [history, briefCount] = await Promise.all([
      listOpportunityIngestionHistory(db, corporationId, focus, fallbackSections),
      countOpportunityBriefs(db, corporationId, focus)
    ]);

    return jsonResponse(200, {
      brief,
      opportunityProvenance: buildOpportunityIngestionProvenance(brief, history, briefCount, focus)
    });
  } catch (error) {
    const authError = authScopeErrorResponse(error);
    if (authError) {
      return authError;
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Opportunity ingestion request is invalid', 400);
    }

    return safeErrorResponse('Unable to load command brief');
  }
}
