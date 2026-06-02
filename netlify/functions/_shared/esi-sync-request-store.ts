import { ObjectId, type Db } from 'mongodb';
import type {
  EsiSyncDomain,
  EsiSyncHistoryItem,
  EsiSyncRequestSummary,
  EsiSyncWorkerFailureSummary,
  EsiSyncWorkerRequestSummary,
  EsiSyncWorkerResultSummary
} from '../../../packages/contracts/src/index';
import type { EsiTokenVaultDocument } from './esi-token-vault';
import { markVaultLastSync } from './esi-token-vault-store';
import type { RetryRequestDocument } from './retry-request-store';
import { retryRequestSummary } from './retry-request-store';

const collectionName = 'esi_sync_requests';

export interface EsiSyncRequestDocument {
  _id?: { toString(): string };
  id?: string;
  corporationId: string;
  characterId: string;
  vaultId: string;
  domain: EsiSyncDomain;
  requiredScopes: string[];
  status: 'queued' | 'claimed' | 'completed' | 'failed' | 'cancelled';
  requestedBy: string;
  requestedAt: string;
  source: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  failure?: EsiSyncWorkerFailureSummary;
  result?: EsiSyncWorkerResultSummary;
  retry?: RetryRequestDocument;
  createdAt: string;
  updatedAt: string;
}

function syncRequestIdFilter(id: string) {
  return ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
}

export async function findActiveSyncRequest(
  db: Db,
  corporationId: string,
  vaultId: string,
  domain: EsiSyncDomain
): Promise<EsiSyncRequestDocument | null> {
  const document = await db.collection(collectionName).findOne({
    corporationId,
    vaultId,
    domain,
    status: { $in: ['queued', 'claimed'] }
  });

  return document ? normalizeSyncRequestDocument(document as unknown as EsiSyncRequestDocument) : null;
}

export async function findSyncRequest(db: Db, id: string): Promise<EsiSyncRequestDocument | null> {
  const document = await db.collection(collectionName).findOne(syncRequestIdFilter(id));
  return document ? normalizeSyncRequestDocument(document as unknown as EsiSyncRequestDocument) : null;
}

export async function listQueuedSyncRequests(
  db: Db,
  domain?: EsiSyncDomain
): Promise<EsiSyncRequestDocument[]> {
  const query: Record<string, unknown> = { status: 'queued' };
  if (domain) {
    query.domain = domain;
  }

  const documents = await db.collection(collectionName).find(query).sort({ requestedAt: 1, createdAt: 1 }).toArray();
  return documents.map((document) => normalizeSyncRequestDocument(document as unknown as EsiSyncRequestDocument));
}

export async function listRecentSyncRequests(
  db: Db,
  corporationId: string,
  domain: EsiSyncDomain,
  limit = 5
): Promise<EsiSyncRequestDocument[]> {
  const documents = await db
    .collection(collectionName)
    .find({ corporationId, domain })
    .sort({ requestedAt: -1, createdAt: -1 })
    .limit(limit)
    .toArray();

  return documents.map((document) => normalizeSyncRequestDocument(document as unknown as EsiSyncRequestDocument));
}

export async function findCompletedSyncRequestForSnapshot(
  db: Db,
  corporationId: string,
  domain: EsiSyncDomain,
  snapshotId: string
): Promise<EsiSyncRequestDocument | null> {
  const document = await db.collection(collectionName).findOne(
    {
      corporationId,
      domain,
      status: 'completed',
      'result.snapshotId': snapshotId
    },
    { sort: { completedAt: -1, requestedAt: -1 } }
  );

  return document ? normalizeSyncRequestDocument(document as unknown as EsiSyncRequestDocument) : null;
}

export async function claimQueuedSyncRequest(
  db: Db,
  id: string,
  workerId: string
): Promise<EsiSyncRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...syncRequestIdFilter(id),
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

  return result ? normalizeSyncRequestDocument(result as unknown as EsiSyncRequestDocument) : null;
}

export async function completeSyncRequest(
  db: Db,
  id: string,
  workerId: string,
  resultSummary: EsiSyncWorkerResultSummary
): Promise<EsiSyncRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...syncRequestIdFilter(id),
      status: 'claimed',
      claimedBy: workerId
    },
    {
      $set: {
        status: 'completed',
        completedAt: now,
        result: resultSummary,
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeSyncRequestDocument(result as unknown as EsiSyncRequestDocument) : null;
}

export async function failSyncRequest(
  db: Db,
  id: string,
  workerId: string,
  reason: string
): Promise<EsiSyncRequestDocument | null> {
  const now = new Date().toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    {
      ...syncRequestIdFilter(id),
      status: 'claimed',
      claimedBy: workerId
    },
    {
      $set: {
        status: 'failed',
        failure: { reason, failedAt: now },
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeSyncRequestDocument(result as unknown as EsiSyncRequestDocument) : null;
}

export async function createOrFindQueuedSyncRequest(
  db: Db,
  vault: EsiTokenVaultDocument,
  domain: EsiSyncDomain,
  requiredScopes: string[]
): Promise<{ syncRequest: EsiSyncRequestDocument; duplicate: boolean }> {
  const vaultId = vault.id ?? vault._id?.toString();
  if (!vaultId) {
    throw new Error('ESI token vault identifier is required');
  }

  const existing = await findActiveSyncRequest(db, vault.corporationId, vaultId, domain);
  if (existing) {
    return { syncRequest: existing, duplicate: true };
  }

  const now = new Date().toISOString();
  const document: Omit<EsiSyncRequestDocument, '_id' | 'id'> = {
    corporationId: vault.corporationId,
    characterId: vault.characterId,
    vaultId,
    domain,
    requiredScopes,
    status: 'queued',
    requestedBy: vault.characterName,
    requestedAt: now,
    source: 'Commander-prepared from explicit ESI read-sync consent.',
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection(collectionName).insertOne(document);
  const syncRequest = normalizeSyncRequestDocument({ ...document, _id: result.insertedId } as EsiSyncRequestDocument);
  await markVaultLastSync(db, vault, syncRequest.id ?? result.insertedId.toString(), domain, now);

  return { syncRequest, duplicate: false };
}

export async function createRetryReplacementSyncRequest(
  db: Db,
  failedSyncRequest: EsiSyncRequestDocument,
  retryRequestId: string,
  workerId: string
): Promise<EsiSyncRequestDocument> {
  const now = new Date().toISOString();
  const document: Omit<EsiSyncRequestDocument, '_id' | 'id'> = {
    corporationId: failedSyncRequest.corporationId,
    characterId: failedSyncRequest.characterId,
    vaultId: failedSyncRequest.vaultId,
    domain: failedSyncRequest.domain,
    requiredScopes: failedSyncRequest.requiredScopes,
    status: 'queued',
    requestedBy: `retry-worker:${workerId}`,
    requestedAt: now,
    source: `Worker retry execution from retry request ${retryRequestId}.`,
    createdAt: now,
    updatedAt: now
  };

  const result = await db.collection(collectionName).insertOne(document);
  return normalizeSyncRequestDocument({ ...document, _id: result.insertedId } as EsiSyncRequestDocument);
}

export function syncRequestSummary(syncRequest: EsiSyncRequestDocument, duplicate = false): EsiSyncRequestSummary {
  return {
    id: syncRequest.id ?? syncRequest._id?.toString() ?? '',
    domain: syncRequest.domain,
    status: 'queued',
    requiredScopes: syncRequest.requiredScopes,
    requestedAt: syncRequest.requestedAt,
    boundary: duplicate
      ? 'Existing queued sync request surfaced. No duplicate was created.'
      : 'Queued for future read-only worker sync. No ESI data was fetched and no worker was dispatched.'
  };
}

export function workerSyncRequestSummary(syncRequest: EsiSyncRequestDocument): EsiSyncWorkerRequestSummary {
  const summary: EsiSyncWorkerRequestSummary = {
    id: syncRequest.id ?? syncRequest._id?.toString() ?? '',
    corporationId: syncRequest.corporationId,
    domain: syncRequest.domain,
    status: syncRequest.status,
    requiredScopes: syncRequest.requiredScopes,
    requestedAt: syncRequest.requestedAt
  };

  if (syncRequest.claimedBy) summary.claimedBy = syncRequest.claimedBy;
  if (syncRequest.claimedAt) summary.claimedAt = syncRequest.claimedAt;
  if (syncRequest.completedAt) summary.completedAt = syncRequest.completedAt;
  if (syncRequest.result) summary.result = syncRequest.result;
  if (syncRequest.failure) summary.failure = syncRequest.failure;

  return summary;
}

export function syncHistoryItem(syncRequest: EsiSyncRequestDocument): EsiSyncHistoryItem {
  const item: EsiSyncHistoryItem = {
    id: syncRequest.id ?? syncRequest._id?.toString() ?? '',
    domain: syncRequest.domain,
    status: syncRequest.status,
    requestedAt: syncRequest.requestedAt,
    sectionStatuses: syncRequest.result?.sectionStatuses ?? [],
    boundary: 'Read-only sync history. No worker was dispatched and no retry was scheduled.'
  };

  if (syncRequest.claimedBy) item.claimedBy = syncRequest.claimedBy;
  if (syncRequest.claimedAt) item.claimedAt = syncRequest.claimedAt;
  if (syncRequest.completedAt) item.completedAt = syncRequest.completedAt;
  if (syncRequest.result?.snapshotId) item.snapshotId = syncRequest.result.snapshotId;
  if (syncRequest.result) item.sourceCount = syncRequest.result.sourceCount;
  if (syncRequest.failure) item.failure = syncRequest.failure;
  if (syncRequest.retry) item.retry = retryRequestSummary(syncRequest.retry);

  return item;
}

function normalizeSyncRequestDocument(document: EsiSyncRequestDocument): EsiSyncRequestDocument {
  return {
    ...document,
    id: document.id ?? document._id?.toString()
  };
}
