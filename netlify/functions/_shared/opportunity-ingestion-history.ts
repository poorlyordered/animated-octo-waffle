import type { Db } from 'mongodb';
import type {
  CommandBrief,
  CoverageState,
  OpportunityIngestionHistoryItem,
  OpportunityIngestionProvenance,
  OpportunityIngestionSectionKey,
  OpportunityIngestionSectionStatus,
  ResearchStatus
} from '../../../packages/contracts/src/index';
import {
  defaultResearchFocus,
  opportunityIngestionProvenanceSchema,
  researchStatuses
} from '../../../packages/contracts/src/index';

const requestCollectionName = 'research_requests';
const briefCollectionName = 'research_briefs';
const boundary =
  'Opportunity ingestion history is read-only. This view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, or execute external services.';
const sectionKeys: OpportunityIngestionSectionKey[] = ['sources', 'impacts', 'recommendations', 'watchlist'];

export type OpportunityResearchRequestDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
};

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function isoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date(0).toISOString();
}

function nonNegativeNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : undefined;
}

function normalizeStatus(value: unknown): ResearchStatus {
  return researchStatuses.includes(value as ResearchStatus) ? (value as ResearchStatus) : 'failed';
}

function statusForCount(count: number): CoverageState {
  return count > 0 ? 'present' : 'missing';
}

function normalizeCoverageState(value: unknown): CoverageState | undefined {
  return value === 'present' || value === 'missing' || value === 'stale' ? value : undefined;
}

export function opportunitySectionStatuses(brief: CommandBrief | null): OpportunityIngestionSectionStatus[] {
  return sectionKeys.map((key) => {
    if (!brief) {
      return { key, status: 'missing' };
    }

    if (key === 'sources') {
      return { key, status: statusForCount(Math.max(brief.sourceCount, brief.sourceReferences.length)) };
    }

    if (key === 'impacts') {
      return { key, status: statusForCount(brief.strategicImpacts.length) };
    }

    if (key === 'recommendations') {
      return { key, status: statusForCount(brief.recommendedActions.length) };
    }

    return { key, status: statusForCount(brief.watchlist.length) };
  });
}

function normalizeSectionStatuses(
  value: unknown,
  fallback: OpportunityIngestionSectionStatus[]
): OpportunityIngestionSectionStatus[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const statuses = value.flatMap((item) => {
    const source = recordValue(item);
    const key = optionalString(source.key);
    const status = normalizeCoverageState(source.status);

    if (!key || !sectionKeys.includes(key as OpportunityIngestionSectionKey) || !status) {
      return [];
    }

    return [{ key: key as OpportunityIngestionSectionKey, status }];
  });

  return statuses.length > 0 ? statuses : fallback;
}

export function normalizeOpportunityIngestionHistoryItem(
  document: OpportunityResearchRequestDocument,
  fallbackSections: OpportunityIngestionSectionStatus[]
): OpportunityIngestionHistoryItem {
  const result = recordValue(document.result);
  const errorMessage = optionalString(document.errorMessage);
  const status = normalizeStatus(document.status);
  const updatedAt = isoDate(document.updatedAt ?? document.createdAt);

  return {
    id: String(document.id ?? document._id?.toString() ?? 'unknown'),
    status,
    requestedAt: isoDate(document.createdAt ?? document.requestedAt),
    updatedAt,
    requestedBy: optionalString(document.requestedBy),
    sourceCount: nonNegativeNumber(document.rawItemCount ?? document.sourceCount ?? result.sourceCount),
    failure: status === 'failed' && errorMessage ? { reason: errorMessage, failedAt: updatedAt } : undefined,
    sectionStatuses: normalizeSectionStatuses(result.sectionStatuses, fallbackSections),
    boundary
  };
}

export async function listOpportunityIngestionHistory(
  db: Db,
  corporationId: string,
  focus: string,
  fallbackSections: OpportunityIngestionSectionStatus[],
  limit = 5
): Promise<OpportunityIngestionHistoryItem[]> {
  const documents = await db
    .collection(requestCollectionName)
    .find({ corporationId, focus })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return documents.map((document) =>
    normalizeOpportunityIngestionHistoryItem(document as OpportunityResearchRequestDocument, fallbackSections)
  );
}

export async function countOpportunityBriefs(db: Db, corporationId: string, focus: string): Promise<number> {
  return db.collection(briefCollectionName).countDocuments({ corporationId, focus });
}

export function buildOpportunityIngestionProvenance(
  brief: CommandBrief | null,
  history: OpportunityIngestionHistoryItem[],
  briefCount: number,
  focus = brief?.focus ?? defaultResearchFocus
): OpportunityIngestionProvenance {
  const sectionStatuses = opportunitySectionStatuses(brief);
  const latestProcessed = history.find((item) => item.status === 'processed');
  const mode = latestProcessed ? 'latest_research' : brief ? 'historical_brief' : 'unavailable';
  const sourceCount = latestProcessed?.sourceCount ?? brief?.sourceCount ?? 0;

  const message =
    mode === 'latest_research'
      ? 'Latest Opportunity context is linked to processed research history.'
      : mode === 'historical_brief'
        ? 'Opportunity context is available from historical command brief records.'
        : 'No Opportunity research history is available for this corporation scope.';

  return opportunityIngestionProvenanceSchema.parse({
    mode,
    focus,
    sourceCount,
    briefCount,
    sectionStatuses,
    history,
    message,
    boundary
  });
}
