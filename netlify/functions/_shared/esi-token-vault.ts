import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type {
  EsiSyncDomain,
  EsiSyncDomainSummary,
  EsiSyncLastSyncSummary,
  EsiVaultSummary
} from '../../../packages/contracts/src/index';
import type { EveSsoIdentity } from './eve-sso';
import { readEsiTokenVaultEnv } from './env';

export const readOnlyEsiScopesByDomain: Record<EsiSyncDomain, { label: string; requiredScopes: string[] }> = {
  numbers: {
    label: 'Numbers',
    requiredScopes: [
      'esi-wallet.read_corporation_wallets.v1',
      'esi-assets.read_corporation_assets.v1',
      'esi-industry.read_corporation_jobs.v1',
      'esi-markets.read_corporation_orders.v1'
    ]
  },
  people: {
    label: 'People',
    requiredScopes: ['esi-corporations.read_corporation_membership.v1']
  },
  opportunity: {
    label: 'Opportunity',
    requiredScopes: ['esi-corporations.read_structures.v1']
  }
};

const unsafeEsiSyncFields = new Set([
  'accessToken',
  'refreshToken',
  'token',
  'tokens',
  'grantedScopes',
  'requestedScopes',
  'scopes',
  'corporationId',
  'characterId',
  'approval',
  'executeNow',
  'dispatch',
  'dispatchTarget',
  'workerDispatch',
  'retry',
  'retrySchedule',
  'walletAction',
  'assetAction',
  'contractAction',
  'roleChange',
  'eveWrite',
  'externalExecution'
]);

export interface EsiTokenVaultDocument {
  _id?: { toString(): string };
  id?: string;
  corporationId: string;
  characterId: string;
  characterName: string;
  corporationName: string;
  grantedScopes: string[];
  requestedScopes: string[];
  sealedAccessToken: string;
  sealedRefreshToken: string;
  accessTokenExpiresAt: string;
  consentedAt: string;
  revokedAt?: string;
  status: 'active' | 'revoked' | 'unavailable';
  lastSyncRequestId?: string;
  lastSyncDomain?: EsiSyncDomain;
  lastSyncStatus?: EsiSyncLastSyncSummary['status'];
  lastSyncRequestedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EsiTokenPayload {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  grantedScopes: string[];
}

export function allRequiredReadOnlyScopes(): string[] {
  return [...new Set(Object.values(readOnlyEsiScopesByDomain).flatMap((domain) => domain.requiredScopes))];
}

export function domainSummaries(vault: EsiTokenVaultDocument | null): EsiSyncDomainSummary[] {
  return Object.entries(readOnlyEsiScopesByDomain).map(([domain, config]) => {
    const missing = missingScopes(vault?.grantedScopes ?? [], config.requiredScopes);
    return {
      domain: domain as EsiSyncDomain,
      label: config.label,
      requiredScopes: config.requiredScopes,
      available: Boolean(vault && vault.status === 'active' && missing.length === 0),
      missingScopes: missing
    };
  });
}

export function requiredScopesForDomain(domain: EsiSyncDomain): string[] {
  return readOnlyEsiScopesByDomain[domain].requiredScopes;
}

export function missingScopes(grantedScopes: string[], requiredScopes: string[]): string[] {
  const granted = new Set(grantedScopes);
  return requiredScopes.filter((scope) => !granted.has(scope));
}

export function assertNoUnsafeEsiSyncFields(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return;
  }

  for (const key of Object.keys(value)) {
    if (unsafeEsiSyncFields.has(key)) {
      throw new Error(`Unsafe ESI sync field rejected: ${key}`);
    }
  }
}

export function sealTokenMaterial(value: string, env: NodeJS.ProcessEnv = process.env): string {
  const { sealingKey } = readEsiTokenVaultEnv(env);
  const key = createHash('sha256').update(sealingKey).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${authTag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

export function unsealTokenMaterial(value: string, env: NodeJS.ProcessEnv = process.env): string {
  const [version, encodedIv, encodedAuthTag, encodedCiphertext] = value.split('.');
  if (version !== 'v1' || !encodedIv || !encodedAuthTag || !encodedCiphertext) {
    throw new Error('Sealed ESI token material is invalid');
  }

  const { sealingKey } = readEsiTokenVaultEnv(env);
  const key = createHash('sha256').update(sealingKey).digest();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(encodedIv, 'base64url'));
  decipher.setAuthTag(Buffer.from(encodedAuthTag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}

export function createVaultDocument(
  corporationId: string,
  identity: EveSsoIdentity,
  token: EsiTokenPayload,
  now = new Date()
): Omit<EsiTokenVaultDocument, '_id' | 'id'> {
  const timestamp = now.toISOString();
  const requestedScopes = allRequiredReadOnlyScopes();
  const allowedGrantedScopes = token.grantedScopes.filter((scope) => requestedScopes.includes(scope)).sort();

  return {
    corporationId,
    characterId: identity.characterId,
    characterName: identity.characterName,
    corporationName: identity.corporationName,
    grantedScopes: allowedGrantedScopes,
    requestedScopes,
    sealedAccessToken: sealTokenMaterial(token.accessToken),
    sealedRefreshToken: sealTokenMaterial(token.refreshToken),
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    consentedAt: timestamp,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function vaultSummary(vault: EsiTokenVaultDocument | null): EsiVaultSummary {
  const requiredScopes = allRequiredReadOnlyScopes();

  if (!vault) {
    return {
      status: 'missing',
      character: null,
      corporation: null,
      grantedScopes: [],
      requiredScopes,
      consentedAt: null,
      revokedAt: null,
      lastSync: null,
      boundaries: ['Explicit ESI consent is required before read sync can be prepared.']
    };
  }

  const lastSync =
    vault.lastSyncRequestId && vault.lastSyncDomain && vault.lastSyncStatus && vault.lastSyncRequestedAt
      ? {
          id: vault.lastSyncRequestId,
          domain: vault.lastSyncDomain,
          status: vault.lastSyncStatus,
          requestedAt: vault.lastSyncRequestedAt
        }
      : null;

  const boundaries =
    vault.status === 'active'
      ? ['Vaulted consent can prepare read-only sync requests. No ESI data is fetched in browser request paths.']
      : ['Revoked token material cannot prepare sync requests.'];

  return {
    status: vault.status,
    character: { id: vault.characterId, name: vault.characterName },
    corporation: { id: vault.corporationId, name: vault.corporationName },
    grantedScopes: vault.status === 'active' ? vault.grantedScopes : [],
    requiredScopes,
    consentedAt: vault.consentedAt,
    revokedAt: vault.revokedAt ?? null,
    lastSync,
    boundaries
  };
}
