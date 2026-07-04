import { jest } from '@jest/globals';
import type { Db } from 'mongodb';
import { updateVaultTokenMaterial } from '../../../../netlify/functions/_shared/esi-token-vault-store';
import { sealTokenMaterial, unsealTokenMaterial, type EsiTokenVaultDocument } from '../../../../netlify/functions/_shared/esi-token-vault';

type Document = Record<string, unknown>;

const env = {
  ESI_TOKEN_VAULT_SEALING_KEY: 'test-sealing-key'
};

function activeVault(): EsiTokenVaultDocument {
  return {
    id: 'vault-1',
    corporationId: '123456789',
    characterId: '2110000001',
    characterName: 'Ari Voss',
    corporationName: 'Session Corp',
    grantedScopes: ['esi-wallet.read_corporation_wallets.v1'],
    requestedScopes: ['esi-wallet.read_corporation_wallets.v1'],
    sealedAccessToken: sealTokenMaterial('old-access-token', env),
    sealedRefreshToken: sealTokenMaterial('old-refresh-token', env),
    accessTokenExpiresAt: '2026-06-02T13:00:00.000Z',
    consentedAt: '2026-06-02T12:00:00.000Z',
    status: 'active',
    createdAt: '2026-06-02T12:00:00.000Z',
    updatedAt: '2026-06-02T12:00:00.000Z'
  };
}

describe('ESI token vault store', () => {
  it('persists refreshed token material without storing plain token values', async () => {
    const vault = activeVault();
    let update: {
      sealedAccessToken?: string;
      sealedRefreshToken?: string;
      [key: string]: unknown;
    } = {};
    const db = {
      collection: () => ({
        findOneAndUpdate: jest.fn(async (_filter: Document, operation: { $set: Document }) => {
          update = operation.$set;
          return { ...vault, ...operation.$set };
        })
      })
    } as unknown as Db;

    const updated = await updateVaultTokenMaterial(
      db,
      vault,
      {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        accessTokenExpiresAt: '2026-06-02T14:00:00.000Z',
        grantedScopes: ['esi-wallet.read_corporation_wallets.v1', 'ignored-extra-scope']
      },
      env,
      new Date('2026-06-02T13:30:00.000Z')
    );

    expect(updated?.accessTokenExpiresAt).toBe('2026-06-02T14:00:00.000Z');
    expect(JSON.stringify(update)).not.toContain('new-access-token');
    expect(JSON.stringify(update)).not.toContain('new-refresh-token');
    expect(unsealTokenMaterial(String(update.sealedAccessToken), env)).toBe('new-access-token');
    expect(unsealTokenMaterial(String(update.sealedRefreshToken), env)).toBe('new-refresh-token');
    expect(updated?.grantedScopes).toEqual(['esi-wallet.read_corporation_wallets.v1']);
  });
});
