import { ObjectId, type Db } from 'mongodb';
import type {
  CommandBrief,
  CoverageState,
  OpportunityIngestionHistoryItem,
  OpportunityIngestionProvenance,
  OpportunityIngestionSectionKey,
  OpportunityIngestionSectionStatus,
  OpportunityIngestionWorkerCompleteRequest,
  OpportunityIngestionWorkerRequestSummary,
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
const prepareBoundary =
  'Prepared for future Opportunity ingestion. No research pull was scheduled, no worker was dispatched, no ESI data was fetched, no EVE write occurred, and no external service was executed.';
const sectionKeys: OpportunityIngestionSectionKey[] = ['sources', 'impacts', 'recommendations', 'watchlist'];

export type OpportunityResearchRequestDocument = Record<string, unknown> & {
  _id?: ObjectId | { toString(): string };
  id?: string;
  status?: unknown;
  corporationId?: unknown;
  focus?: unknown;
  requestedBy?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  claimedBy?: unknown;
  claimedAt?: unknown;
  result?: unknown;
  rawItemCount?: unknown;
  sourceCount?: unknown;
  errorMessage?: unknown;
  failedAt?: unknown;
};

function opportunityResearchRequestIdFilter(id: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
}

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

function optionalIsoDate(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = isoDate(value);
  return parsed === new Date(0).toISOString() ? undefined : parsed;
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
  const failedAt = isoDate(document.failedAt ?? document.updatedAt ?? document.createdAt);

  return {
    id: String(document.id ?? document._id?.toString() ?? 'unknown'),
    status,
    requestedAt: isoDate(document.createdAt ?? document.requestedAt),
    updatedAt,
    requestedBy: optionalString(document.requestedBy),
    claimedBy: optionalString(document.claimedBy),
    claimedAt: optionalIsoDate(document.claimedAt),
    sourceCount: nonNegativeNumber(document.rawItemCount ?? document.sourceCount ?? result.sourceCount),
    failure: status === 'failed' && errorMessage ? { reason: errorMessage, failedAt } : undefined,
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

export async function findOpportunityIngestionRequest(
  db: Db,
  id: string
): Promise<OpportunityResearchRequestDocument | null> {
  const document = await db.collection(requestCollectionName).findOne(opportunityResearchRequestIdFilter(id));
  return document ? normalizeOpportunityResearchRequestDocument(document as OpportunityResearchRequestDocument) : null;
}

export async function findActiveOpportunityIngestionRequest(
  db: Db,
  corporationId: string,
  focus: string
): Promise<OpportunityResearchRequestDocument | null> {
  const document = await db.collection(requestCollectionName).findOne({
    corporationId,
    focus,
    status: { $in: ['queued', 'processing'] }
  });

  return document ? normalizeOpportunityResearchRequestDocument(document as OpportunityResearchRequestDocument) : null;
}

export async function listQueuedOpportunityIngestionRequests(
  db: Db,
  focus?: string
): Promise<OpportunityResearchRequestDocument[]> {
  const query: Record<string, unknown> = { status: 'queued' };
  if (focus) {
    query.focus = focus;
  }

  const documents = await db.collection(requestCollectionName).find(query).sort({ createdAt: 1 }).toArray();
  return documents.map((document) => normalizeOpportunityResearchRequestDocument(document as OpportunityResearchRequestDocument));
}

export async function createOrFindQueuedOpportunityIngestionRequest(
  db: Db,
  corporationId: string,
  focus: string,
  requestedBy: string,
  reason?: string
): Promise<{ request: OpportunityResearchRequestDocument; duplicate: boolean }> {
  const existing = await findActiveOpportunityIngestionRequest(db, corporationId, focus);
  if (existing) {
    return { request: existing, duplicate: true };
  }

  const now = new Date().toISOString();
  const document: Omit<OpportunityResearchRequestDocument, '_id' | 'id'> = {
    corporationId,
    focus,
    status: 'queued',
    requestedBy,
    requestReason: reason?.trim() || 'Commander prepared Opportunity ingestion for worker pickup.',
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection(requestCollectionName).insertOne(document);
  return {
    request: normalizeOpportunityResearchRequestDocument({ ...document, _id: result.insertedId } as OpportunityResearchRequestDocument),
    duplicate: false
  };
}

export async function claimOpportunityIngestionRequest(
  db: Db,
  id: string,
  workerId: string
): Promise<OpportunityResearchRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(requestCollectionName).findOneAndUpdate(
    {
      ...opportunityResearchRequestIdFilter(id),
      status: 'queued'
    },
    {
      $set: {
        status: 'processing',
        claimedBy: workerId,
        claimedAt: now,
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeOpportunityResearchRequestDocument(result as OpportunityResearchRequestDocument) : null;
}

export async function completeOpportunityIngestionRequest(
  db: Db,
  id: string,
  workerId: string,
  request: OpportunityIngestionWorkerCompleteRequest
): Promise<OpportunityResearchRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(requestCollectionName).findOneAndUpdate(
    {
      ...opportunityResearchRequestIdFilter(id),
      status: 'processing',
      claimedBy: workerId
    },
    {
      $set: {
        status: 'processed',
        rawItemCount: request.sourceCount,
        result: {
          sourceCount: request.sourceCount,
          sectionStatuses: request.sectionStatuses
        },
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeOpportunityResearchRequestDocument(result as OpportunityResearchRequestDocument) : null;
}

export async function failOpportunityIngestionRequest(
  db: Db,
  id: string,
  workerId: string,
  reason: string
): Promise<OpportunityResearchRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(requestCollectionName).findOneAndUpdate(
    {
      ...opportunityResearchRequestIdFilter(id),
      status: 'processing',
      claimedBy: workerId
    },
    {
      $set: {
        status: 'failed',
        errorMessage: reason,
        failedAt: now,
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeOpportunityResearchRequestDocument(result as OpportunityResearchRequestDocument) : null;
}

export function opportunityIngestionPrepareSummary(
  request: OpportunityResearchRequestDocument,
  fallbackSections: OpportunityIngestionSectionStatus[]
): OpportunityIngestionHistoryItem {
  return {
    ...normalizeOpportunityIngestionHistoryItem(request, fallbackSections),
    boundary: prepareBoundary
  };
}

export function opportunityIngestionWorkerSummary(
  request: OpportunityResearchRequestDocument,
  fallbackSections: OpportunityIngestionSectionStatus[] = []
): OpportunityIngestionWorkerRequestSummary {
  return {
    ...normalizeOpportunityIngestionHistoryItem(request, fallbackSections),
    corporationId: String(request.corporationId ?? ''),
    focus: String(request.focus ?? defaultResearchFocus)
  };
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

function normalizeOpportunityResearchRequestDocument(
  document: OpportunityResearchRequestDocument
): OpportunityResearchRequestDocument {
  return {
    ...document,
    id: document.id ?? document._id?.toString()
  };
}
