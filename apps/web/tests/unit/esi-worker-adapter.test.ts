import { jest } from '@jest/globals';
import type { Db } from 'mongodb';
import {
  classifyHttpStatus,
  createEsiWorkerAdapter,
  readEndpoint
} from '../../../../netlify/functions/_shared/esi-worker-adapter';
import { sealTokenMaterial, type EsiTokenVaultDocument } from '../../../../netlify/functions/_shared/esi-token-vault';

type Document = Record<string, unknown>;

const env = {
  ESI_TOKEN_VAULT_SEALING_KEY: 'test-sealing-key',
  EVE_ESI_BASE_URL: 'https://esi.test/latest',
  EVE_SSO_CLIENT_ID: 'client-id',
  EVE_SSO_CLIENT_SECRET: 'client-secret',
  EVE_SSO_REDIRECT_URI: 'https://app.test/callback',
  EVE_SSO_METADATA_URL: 'https://sso.test/metadata',
  EVE_SSO_TOKEN_URL: 'https://sso.test/token',
  EVE_SSO_SCOPES: 'esi-wallet.read_corporation_wallets.v1'
};

function activeVault(overrides: Partial<EsiTokenVaultDocument> = {}): EsiTokenVaultDocument {
  return {
    id: 'vault-1',
    corporationId: '123456789',
    characterId: '2110000001',
    characterName: 'Ari Voss',
    corporationName: 'Session Corp',
    grantedScopes: ['esi-wallet.read_corporation_wallets.v1'],
    requestedScopes: ['esi-wallet.read_corporation_wallets.v1'],
    sealedAccessToken: sealTokenMaterial('access-token', env),
    sealedRefreshToken: sealTokenMaterial('refresh-token', env),
    accessTokenExpiresAt: '2026-06-02T14:00:00.000Z',
    consentedAt: '2026-06-02T12:00:00.000Z',
    status: 'active',
    createdAt: '2026-06-02T12:00:00.000Z',
    updatedAt: '2026-06-02T12:00:00.000Z',
    ...overrides
  };
}

function createDb(vault: EsiTokenVaultDocument) {
  let currentVault = vault;
  const collections = {
    esi_token_vaults: {
      findOne: jest.fn(async () => currentVault),
      findOneAndUpdate: jest.fn(async (_filter: Document, operation: { $set: Document }) => {
        currentVault = { ...currentVault, ...operation.$set };
        return currentVault;
      })
    }
  };

  return {
    db: {
      collection: (name: keyof typeof collections) => collections[name]
    } as unknown as Db,
    collections
  };
}

describe('ESI worker adapter', () => {
  it.each([
    [401, 'authentication'],
    [403, 'authorization'],
    [404, 'not_found'],
    [420, 'rate_limited'],
    [429, 'rate_limited'],
    [500, 'esi_service']
  ] as const)('classifies HTTP %s as %s', (status, category) => {
    expect(classifyHttpStatus(status)).toBe(category);
  });

  it('refreshes near-expired vault tokens before endpoint reads', async () => {
    const { db, collections } = createDb(
      activeVault({
        accessTokenExpiresAt: '2026-06-02T13:00:30.000Z'
      })
    );
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === 'https://sso.test/token') {
        return new Response(
          JSON.stringify({
            access_token: 'fresh-access-token',
            refresh_token: 'fresh-refresh-token',
            expires_in: 1200,
            scope: 'esi-wallet.read_corporation_wallets.v1'
          })
        );
      }

      return new Response(JSON.stringify([{ balance: 100 }]));
    }) as jest.MockedFunction<typeof fetch>;

    const adapter = await createEsiWorkerAdapter({
      db,
      corporationId: '123456789',
      vaultId: 'vault-1',
      env,
      fetchImpl: fetchMock,
      now: new Date('2026-06-02T13:00:00.000Z')
    });

    const result = await adapter.readEndpoint({
      label: 'Wallet divisions',
      sourceId: 'esi:wallet-divisions',
      path: '/corporations/123456789/wallets/'
    });

    expect(result.ok).toBe(true);
    expect(collections.esi_token_vaults.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://esi.test/latest/corporations/123456789/wallets/?datasource=tranquility',
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: 'Bearer fresh-access-token' })
      })
    );
  });

  it('collects paginated endpoint data within the configured bound', async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (!url.includes('page=')) {
        return new Response(JSON.stringify([{ item_id: 1 }]), { headers: { 'x-pages': '3' } });
      }
      if (url.includes('page=2')) return new Response(JSON.stringify([{ item_id: 2 }]));
      return new Response(JSON.stringify([{ item_id: 3 }]));
    }) as jest.MockedFunction<typeof fetch>;

    const result = await readEndpoint(
      {
        label: 'Corporation assets',
        sourceId: 'esi:corporation-assets',
        path: '/corporations/123456789/assets/',
        paginated: true,
        maxPages: 3
      },
      'Bearer access-token',
      env,
      fetchMock
    );

    expect(result).toMatchObject({ ok: true, pageCount: 3, attemptCount: 1 });
    expect(result.data).toEqual([{ item_id: 1 }, { item_id: 2 }, { item_id: 3 }]);
  });

  it('retries transient failures and returns a safe classified failure when exhausted', async () => {
    const fetchMock = jest.fn(async () => new Response(JSON.stringify({ error: 'busy' }), { status: 503 })) as jest.MockedFunction<
      typeof fetch
    >;

    const result = await readEndpoint(
      {
        label: 'Market orders',
        sourceId: 'esi:market-orders',
        path: '/corporations/123456789/orders/'
      },
      'Bearer access-token',
      env,
      fetchMock
    );

    expect(result).toMatchObject({
      ok: false,
      attemptCount: 2,
      retryable: true,
      failureCategory: 'esi_service'
    });
    expect(result.failure).not.toContain('access-token');
  });

  it('does not retry permanent authorization failures', async () => {
    const fetchMock = jest.fn(async () => new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 })) as jest.MockedFunction<
      typeof fetch
    >;

    const result = await readEndpoint(
      {
        label: 'Corporation assets',
        sourceId: 'esi:corporation-assets',
        path: '/corporations/123456789/assets/'
      },
      'Bearer access-token',
      env,
      fetchMock
    );

    expect(result).toMatchObject({
      ok: false,
      attemptCount: 1,
      retryable: false,
      failureCategory: 'authorization'
    });
  });
});
