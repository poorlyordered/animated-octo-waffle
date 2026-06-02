import type { Db } from 'mongodb';
import type { EsiSyncDomain, EsiSyncRequestSummary } from '../../../packages/contracts/src/index';
import type { EsiTokenVaultDocument } from './esi-token-vault';
import { markVaultLastSync } from './esi-token-vault-store';

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
  createdAt: string;
  updatedAt: string;
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

function normalizeSyncRequestDocument(document: EsiSyncRequestDocument): EsiSyncRequestDocument {
  return {
    ...document,
    id: document.id ?? document._id?.toString()
  };
}
