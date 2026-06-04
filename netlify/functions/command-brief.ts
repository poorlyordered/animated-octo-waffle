import { defaultResearchFocus } from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import { normalizeCommandBriefDocument } from './_shared/command-brief-normalizer';
import {
  buildOpportunityIngestionProvenance,
  countOpportunityBriefs,
  listOpportunityIngestionHistory,
  opportunitySectionStatuses
} from './_shared/opportunity-ingestion-history';
import { jsonResponse, safeErrorResponse } from './_shared/http';

export async function handler(event: FunctionEvent) {
  try {
    const { corporationId } = getAuthScope(event);
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
    const [history, briefCount] = await Promise.all([
      listOpportunityIngestionHistory(db, corporationId, focus, fallbackSections),
      countOpportunityBriefs(db, corporationId, focus)
    ]);

    return jsonResponse(200, {
      brief,
      opportunityProvenance: buildOpportunityIngestionProvenance(brief, history, briefCount, focus)
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    return safeErrorResponse('Unable to load command brief');
  }
}
