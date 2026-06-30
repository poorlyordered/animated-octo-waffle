import {
  allRequiredReadOnlyScopes,
  assertNoUnsafeEsiSyncFields,
  domainSummaries,
  missingScopes,
  sealTokenMaterial,
  unsealTokenMaterial,
  vaultSummary,
  type EsiTokenVaultDocument
} from '../../../../netlify/functions/_shared/esi-token-vault';
import { activeEsiSyncStatus, allEsiRequiredScopes, esiRequiredScopes, opportunityEsiRequiredScopes, peopleEsiRequiredScopes } from '../fixtures/esiSync';

const activeVault: EsiTokenVaultDocument = {
  id: 'vault-1',
  corporationId: '123456789',
  characterId: '2110000001',
  characterName: 'Ari Voss',
  corporationName: 'Session Corp',
  grantedScopes: allEsiRequiredScopes,
  requestedScopes: allEsiRequiredScopes,
  sealedAccessToken: 'sealed-access',
  sealedRefreshToken: 'sealed-refresh',
  accessTokenExpiresAt: '2026-06-02T12:20:00.000Z',
  consentedAt: '2026-06-02T12:00:00.000Z',
  status: 'active',
  createdAt: '2026-06-02T12:00:00.000Z',
  updatedAt: '2026-06-02T12:00:00.000Z'
};

describe('ESI token vault helpers', () => {
  it('seals and unseals token material without preserving plaintext shape', () => {
    const env = { ESI_TOKEN_VAULT_SEALING_KEY: 'test-sealing-key' };
    const sealed = sealTokenMaterial('refresh-token-secret-value', env);

    expect(sealed).not.toContain('refresh-token-secret-value');
    expect(unsealTokenMaterial(sealed, env)).toBe('refresh-token-secret-value');
  });

  it('creates browser-safe vault summaries without token material', () => {
    const summary = vaultSummary(activeVault);
    const serialized = JSON.stringify(summary);

    expect(summary).toEqual(activeEsiSyncStatus.vault);
    expect(serialized).not.toContain('sealed-access');
    expect(serialized).not.toContain('sealed-refresh');
    expect(serialized).not.toContain('token');
    expect(serialized).not.toContain('secret');
  });

  it('reports missing consent and missing read-only scopes', () => {
    expect(vaultSummary(null).status).toBe('missing');
    expect(allRequiredReadOnlyScopes()).toEqual(allEsiRequiredScopes);
    expect(missingScopes(['esi-wallet.read_corporation_wallets.v1'], esiRequiredScopes)).toEqual(
      esiRequiredScopes.slice(1)
    );
    expect(domainSummaries(null)[0]).toEqual(
      expect.objectContaining({
        domain: 'numbers',
        available: false,
        missingScopes: esiRequiredScopes
      })
    );
    expect(domainSummaries(null)[1]).toEqual(
      expect.objectContaining({
        domain: 'people',
        available: false,
        missingScopes: peopleEsiRequiredScopes
      })
    );
    expect(domainSummaries(null)[2]).toEqual(
      expect.objectContaining({
        domain: 'opportunity',
        available: false,
        missingScopes: opportunityEsiRequiredScopes
      })
    );
  });

  it('rejects unsafe ESI sync request fields', () => {
    expect(() => assertNoUnsafeEsiSyncFields({ domain: 'numbers', refreshToken: 'browser-token' })).toThrow(
      'Unsafe ESI sync field rejected: refreshToken'
    );
    expect(() => assertNoUnsafeEsiSyncFields({ domain: 'numbers', walletAction: 'transfer' })).toThrow(
      'Unsafe ESI sync field rejected: walletAction'
    );
    expect(() => assertNoUnsafeEsiSyncFields({ domain: 'numbers' })).not.toThrow();
  });
});
