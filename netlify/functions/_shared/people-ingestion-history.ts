import { ObjectId, type Db } from 'mongodb';
import type {
  MemberProfile,
  PeopleIngestionWorkerCompleteRequest,
  PeopleIngestionWorkerRequestSummary,
  PeopleCoverageState,
  PeopleIngestionHistoryItem,
  PeopleIngestionProvenance,
  PeopleIngestionSectionKey,
  PeopleIngestionSectionStatus,
  PeopleIngestionStatus
} from '../../../packages/contracts/src/index';
import { peopleIngestionProvenanceSchema, peopleIngestionStatuses } from '../../../packages/contracts/src/index';

const collectionName = 'people_ingestion_requests';
const boundary =
  'People ingestion history is read-only. This view does not retry, dispatch, fetch ESI, change roles, change access, or execute external services.';
const prepareBoundary =
  'Prepared for future People ingestion. No worker was dispatched, no ESI data was fetched, and no EVE role/access or external-service change occurred.';
const sectionKeys: PeopleIngestionSectionKey[] = ['identity', 'roles', 'activity', 'delegation'];

export type PeopleIngestionRequestDocument = Record<string, unknown> & {
  _id?: ObjectId | { toString(): string };
  id?: string;
  status?: unknown;
  corporationId?: unknown;
  requestedBy?: unknown;
  source?: unknown;
  requestedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  claimedBy?: unknown;
  claimedAt?: unknown;
  completedAt?: unknown;
  result?: unknown;
  failure?: unknown;
};

function peopleIngestionRequestIdFilter(id: string) {
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

function normalizeStatus(value: unknown): PeopleIngestionStatus {
  return peopleIngestionStatuses.includes(value as PeopleIngestionStatus) ? (value as PeopleIngestionStatus) : 'queued';
}

function normalizeCoverageState(value: unknown): PeopleCoverageState | undefined {
  return value === 'present' || value === 'stale' || value === 'missing' ? value : undefined;
}

function aggregateCoverageState(members: MemberProfile[], key: PeopleIngestionSectionKey): PeopleCoverageState {
  if (members.length === 0) {
    return 'missing';
  }

  const states = members.map((member) => member.coverage[key]);

  if (states.includes('missing')) {
    return 'missing';
  }

  if (states.includes('stale')) {
    return 'stale';
  }

  return 'present';
}

export function aggregatePeopleIngestionSectionStatuses(members: MemberProfile[]): PeopleIngestionSectionStatus[] {
  return sectionKeys.map((key) => ({ key, status: aggregateCoverageState(members, key) }));
}

function normalizeSectionStatuses(value: unknown, fallback: PeopleIngestionSectionStatus[]): PeopleIngestionSectionStatus[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const statuses = value.flatMap((item) => {
    const source = recordValue(item);
    const key = optionalString(source.key);
    const status = normalizeCoverageState(source.status);

    if (!key || !sectionKeys.includes(key as PeopleIngestionSectionKey) || !status) {
      return [];
    }

    return [{ key: key as PeopleIngestionSectionKey, status }];
  });

  return statuses.length > 0 ? statuses : fallback;
}

export function normalizePeopleIngestionHistoryItem(
  document: PeopleIngestionRequestDocument,
  fallbackSections: PeopleIngestionSectionStatus[]
): PeopleIngestionHistoryItem {
  const result = recordValue(document.result);
  const failure = recordValue(document.failure);
  const failedAt = optionalIsoDate(failure.failedAt ?? document.updatedAt);
  const reason = optionalString(failure.reason ?? failure.message);

  return {
    id: String(document.id ?? document._id?.toString() ?? 'unknown'),
    status: normalizeStatus(document.status),
    requestedAt: isoDate(document.requestedAt ?? document.createdAt),
    claimedBy: optionalString(document.claimedBy),
    claimedAt: optionalIsoDate(document.claimedAt),
    completedAt: optionalIsoDate(document.completedAt),
    sourceCount: nonNegativeNumber(result.sourceCount),
    failure: reason && failedAt ? { reason, failedAt } : undefined,
    sectionStatuses: normalizeSectionStatuses(result.sectionStatuses, fallbackSections),
    boundary
  };
}

export async function listPeopleIngestionHistory(
  db: Db,
  corporationId: string,
  fallbackSections: PeopleIngestionSectionStatus[],
  limit = 5
): Promise<PeopleIngestionHistoryItem[]> {
  const documents = await db
    .collection(collectionName)
    .find({ corporationId })
    .sort({ requestedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return documents.map((document) =>
    normalizePeopleIngestionHistoryItem(document as PeopleIngestionRequestDocument, fallbackSections)
  );
}

export async function findPeopleIngestionRequest(db: Db, id: string): Promise<PeopleIngestionRequestDocument | null> {
  const document = await db.collection(collectionName).findOne(peopleIngestionRequestIdFilter(id));
  return document ? normalizePeopleIngestionRequestDocument(document as PeopleIngestionRequestDocument) : null;
}

export async function findActivePeopleIngestionRequest(
  db: Db,
  corporationId: string
): Promise<PeopleIngestionRequestDocument | null> {
  const document = await db.collection(collectionName).findOne({
    corporationId,
    status: { $in: ['queued', 'claimed'] }
  });

  return document ? normalizePeopleIngestionRequestDocument(document as PeopleIngestionRequestDocument) : null;
}

export async function listQueuedPeopleIngestionRequests(db: Db): Promise<PeopleIngestionRequestDocument[]> {
  const documents = await db.collection(collectionName).find({ status: 'queued' }).sort({ requestedAt: 1, createdAt: 1 }).toArray();
  return documents.map((document) => normalizePeopleIngestionRequestDocument(document as PeopleIngestionRequestDocument));
}

export async function createOrFindQueuedPeopleIngestionRequest(
  db: Db,
  corporationId: string,
  requestedBy: string,
  reason?: string
): Promise<{ request: PeopleIngestionRequestDocument; duplicate: boolean }> {
  const existing = await findActivePeopleIngestionRequest(db, corporationId);
  if (existing) {
    return { request: existing, duplicate: true };
  }

  const now = new Date().toISOString();
  const document: Omit<PeopleIngestionRequestDocument, '_id' | 'id'> = {
    corporationId,
    status: 'queued',
    requestedBy,
    requestedAt: now,
    source: reason?.trim() || 'Commander prepared People ingestion for worker pickup.',
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection(collectionName).insertOne(document);
  return {
    request: normalizePeopleIngestionRequestDocument({ ...document, _id: result.insertedId } as PeopleIngestionRequestDocument),
    duplicate: false
  };
}

export async function claimPeopleIngestionRequest(
  db: Db,
  id: string,
  workerId: string
): Promise<PeopleIngestionRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...peopleIngestionRequestIdFilter(id),
      status: 'queued'
    },
    {
      $set: {
        status: 'claimed',
        claimedBy: workerId,
        claimedAt: now,
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizePeopleIngestionRequestDocument(result as PeopleIngestionRequestDocument) : null;
}

export async function completePeopleIngestionRequest(
  db: Db,
  id: string,
  workerId: string,
  request: PeopleIngestionWorkerCompleteRequest
): Promise<PeopleIngestionRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...peopleIngestionRequestIdFilter(id),
      status: 'claimed',
      claimedBy: workerId
    },
    {
      $set: {
        status: 'completed',
        completedAt: now,
        result: {
          sourceCount: request.sourceCount,
          sectionStatuses: request.sectionStatuses
        },
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizePeopleIngestionRequestDocument(result as PeopleIngestionRequestDocument) : null;
}

export async function failPeopleIngestionRequest(
  db: Db,
  id: string,
  workerId: string,
  reason: string
): Promise<PeopleIngestionRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...peopleIngestionRequestIdFilter(id),
      status: 'claimed',
      claimedBy: workerId
    },
    {
      $set: {
        status: 'failed',
        failure: {
          reason,
          failedAt: now
        },
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizePeopleIngestionRequestDocument(result as PeopleIngestionRequestDocument) : null;
}

export function peopleIngestionPrepareSummary(
  request: PeopleIngestionRequestDocument,
  fallbackSections: PeopleIngestionSectionStatus[]
): PeopleIngestionHistoryItem {
  return {
    ...normalizePeopleIngestionHistoryItem(request, fallbackSections),
    boundary: prepareBoundary
  };
}

export function peopleIngestionWorkerSummary(
  request: PeopleIngestionRequestDocument,
  fallbackSections: PeopleIngestionSectionStatus[] = []
): PeopleIngestionWorkerRequestSummary {
  return {
    ...normalizePeopleIngestionHistoryItem(request, fallbackSections),
    corporationId: String(request.corporationId ?? ''),
    requestedBy: optionalString(request.requestedBy) ?? 'unknown'
  };
}

export function buildPeopleIngestionProvenance(
  members: MemberProfile[],
  history: PeopleIngestionHistoryItem[]
): PeopleIngestionProvenance {
  const sectionStatuses = aggregatePeopleIngestionSectionStatuses(members);
  const latestCompleted = history.find((item) => item.status === 'completed');
  const mode = latestCompleted ? 'latest_ingestion' : members.length > 0 ? 'historical_profiles' : 'unavailable';
  const sourceCount = latestCompleted?.sourceCount ?? members.length;

  const message =
    mode === 'latest_ingestion'
      ? 'Latest People profiles are linked to completed ingestion history.'
      : mode === 'historical_profiles'
        ? 'People profiles are available from historical member profile records.'
        : 'No People profile ingestion history is available for this corporation scope.';

  return peopleIngestionProvenanceSchema.parse({
    mode,
    sourceCount,
    profileCount: members.length,
    sectionStatuses,
    history,
    message,
    boundary
  });
}

function normalizePeopleIngestionRequestDocument(document: PeopleIngestionRequestDocument): PeopleIngestionRequestDocument {
  return {
    ...document,
    id: document.id ?? document._id?.toString()
  };
}
