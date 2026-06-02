import { ObjectId, type Db } from 'mongodb';
import type { EveSsoIdentity } from './eve-sso';
import { createVaultDocument, vaultSummary, type EsiTokenPayload, type EsiTokenVaultDocument } from './esi-token-vault';

const collectionName = 'esi_token_vaults';

export async function findActiveOrLatestVault(db: Db, corporationId: string): Promise<EsiTokenVaultDocument | null> {
  const document = await db
    .collection(collectionName)
    .find({ corporationId })
    .sort({ status: 1, updatedAt: -1, createdAt: -1 })
    .limit(1)
    .next();

  return document ? normalizeVaultDocument(document as unknown as EsiTokenVaultDocument) : null;
}

export async function upsertActiveVault(
  db: Db,
  corporationId: string,
  identity: EveSsoIdentity,
  token: EsiTokenPayload
): Promise<EsiTokenVaultDocument> {
  const document = createVaultDocument(corporationId, identity, token);
  const result = await db.collection(collectionName).findOneAndUpdate(
    { corporationId, characterId: identity.characterId },
    {
      $set: document,
      $unset: { revokedAt: '', lastSyncRequestId: '', lastSyncDomain: '', lastSyncStatus: '', lastSyncRequestedAt: '' }
    },
    { returnDocument: 'after', upsert: true }
  );

  return normalizeVaultDocument(result as unknown as EsiTokenVaultDocument);
}

export async function revokeActiveVault(db: Db, corporationId: string): Promise<EsiTokenVaultDocument | null> {
  const vault = await findActiveOrLatestVault(db, corporationId);
  if (!vault) {
    return null;
  }

  const now = new Date().toISOString();
  const result = await db.collection(collectionName).findOneAndUpdate(
    idFilter(vault),
    {
      $set: {
        status: 'revoked',
        revokedAt: now,
        updatedAt: now
      }
    },
    { returnDocument: 'after' }
  );

  return result ? normalizeVaultDocument(result as unknown as EsiTokenVaultDocument) : null;
}

export async function markVaultLastSync(
  db: Db,
  vault: EsiTokenVaultDocument,
  syncRequestId: string,
  domain: EsiTokenVaultDocument['lastSyncDomain'],
  requestedAt: string
) {
  await db.collection(collectionName).updateOne(idFilter(vault), {
    $set: {
      lastSyncRequestId: syncRequestId,
      lastSyncDomain: domain,
      lastSyncStatus: 'queued',
      lastSyncRequestedAt: requestedAt,
      updatedAt: new Date().toISOString()
    }
  });
}

export function normalizeVaultDocument(document: EsiTokenVaultDocument): EsiTokenVaultDocument {
  return {
    ...document,
    id: document.id ?? document._id?.toString()
  };
}

export { vaultSummary };

function idFilter(vault: EsiTokenVaultDocument) {
  if (vault._id && ObjectId.isValid(vault._id.toString())) {
    return { _id: new ObjectId(vault._id.toString()) };
  }

  return { id: vault.id };
}
