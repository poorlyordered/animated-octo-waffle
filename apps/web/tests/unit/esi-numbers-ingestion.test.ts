import { jest } from '@jest/globals';
import type { Db } from 'mongodb';
import { ingestNumbersFromEsiSyncRequest } from '../../../../netlify/functions/_shared/esi-numbers-ingestion';
import { sealTokenMaterial } from '../../../../netlify/functions/_shared/esi-token-vault';
import type { EsiSyncRequestDocument } from '../../../../netlify/functions/_shared/esi-sync-request-store';

type Document = Record<string, unknown>;

function createDb(vault: Document) {
  const numbersSnapshots: Document[] = [];
  let currentVault = vault;
  const collections = {
    esi_token_vaults: {
      findOne: jest.fn(async () => currentVault),
      findOneAndUpdate: jest.fn(async (_filter: Document, operation: { $set: Document }) => {
        currentVault = { ...currentVault, ...operation.$set };
        return currentVault;
      })
    },
    numbers_snapshots: {
      insertOne: jest.fn(async (document: Document) => {
        numbersSnapshots.push(document);
        return { insertedId: { toString: () => 'numbers-snapshot-1' } };
      })
    }
  };

  return {
    db: {
      collection: (name: keyof typeof collections) => collections[name]
    } as unknown as Db,
    numbersSnapshots
  };
}

const env = {
  ESI_TOKEN_VAULT_SEALING_KEY: 'test-sealing-key',
  EVE_ESI_BASE_URL: 'https://esi.test/latest',
  EVE_SSO_CLIENT_ID: 'client-id',
  EVE_SSO_CLIENT_SECRET: 'client-secret',
  EVE_SSO_REDIRECT_URI: 'https://app.test/callback',
  EVE_SSO_METADATA_URL: 'https://sso.test/metadata',
  EVE_SSO_TOKEN_URL: 'https://sso.test/token'
};

const syncRequest: EsiSyncRequestDocument = {
  id: 'sync-1',
  corporationId: '123456789',
  characterId: '2110000001',
  vaultId: 'vault-1',
  domain: 'numbers',
  requiredScopes: [
    'esi-wallet.read_corporation_wallets.v1',
    'esi-assets.read_corporation_assets.v1',
    'esi-industry.read_corporation_jobs.v1',
    'esi-markets.read_corporation_orders.v1'
  ],
  status: 'claimed',
  requestedBy: 'Ari Voss',
  requestedAt: '2026-06-02T12:45:00.000Z',
  source: 'Commander-prepared from explicit ESI read-sync consent.',
  claimedBy: 'numbers-worker-1',
  claimedAt: '2026-06-02T13:00:00.000Z',
  createdAt: '2026-06-02T12:45:00.000Z',
  updatedAt: '2026-06-02T13:00:00.000Z'
};

function activeVault(overrides: Partial<Document> = {}) {
  return {
    id: 'vault-1',
    corporationId: '123456789',
    characterId: '2110000001',
    characterName: 'Ari Voss',
    corporationName: 'Session Corp',
    grantedScopes: syncRequest.requiredScopes,
    requestedScopes: syncRequest.requiredScopes,
    sealedAccessToken: sealTokenMaterial('access-token', env),
    sealedRefreshToken: sealTokenMaterial('refresh-token', env),
    accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    consentedAt: '2026-06-02T12:00:00.000Z',
    status: 'active',
    createdAt: '2026-06-02T12:00:00.000Z',
    updatedAt: '2026-06-02T12:00:00.000Z',
    ...overrides
  };
}

describe('ESI Numbers ingestion', () => {
  it('writes a processed Numbers snapshot from read-only ESI responses', async () => {
    const { db, numbersSnapshots } = createDb(activeVault());
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/wallets/')) return new Response(JSON.stringify([{ balance: 1200 }, { balance: 800 }]));
      if (url.includes('/assets/')) return new Response(JSON.stringify([{ item_id: 1 }, { item_id: 2 }]));
      if (url.includes('/industry/jobs/')) return new Response(JSON.stringify([{ job_id: 1 }]));
      return new Response(JSON.stringify([{ order_id: 1 }, { order_id: 2 }, { order_id: 3 }]));
    }) as jest.MockedFunction<typeof fetch>;

    const result = await ingestNumbersFromEsiSyncRequest(db, syncRequest, env, fetchMock);

    expect(result).toMatchObject({
      snapshotId: 'numbers-snapshot-1',
      sourceCount: 4,
      failures: []
    });
    expect(numbersSnapshots[0]).toMatchObject({
      corporationId: '123456789',
      focus: 'corporation'
    });
    expect(JSON.stringify(numbersSnapshots[0])).not.toContain('access-token');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('marks partial ESI failures as missing sections and safe failure summaries', async () => {
    const { db } = createDb(activeVault());
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/assets/')) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
      return new Response(JSON.stringify([]));
    }) as jest.MockedFunction<typeof fetch>;

    const result = await ingestNumbersFromEsiSyncRequest(db, syncRequest, env, fetchMock);

    expect(result.failures).toEqual(['Corporation assets ESI endpoint returned 403.']);
    expect(result.sectionStatuses).toContainEqual({ key: 'assets', status: 'missing' });
  });

  it('collects paginated assets and preserves successful partial snapshots', async () => {
    const { db, numbersSnapshots } = createDb(activeVault());
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/wallets/')) return new Response(JSON.stringify([{ balance: 1200 }]));
      if (url.includes('/assets/') && !url.includes('page=')) {
        return new Response(JSON.stringify([{ item_id: 1 }]), { headers: { 'x-pages': '3' } });
      }
      if (url.includes('/assets/') && url.includes('page=2')) return new Response(JSON.stringify([{ item_id: 2 }]));
      if (url.includes('/assets/') && url.includes('page=3')) return new Response(JSON.stringify([{ item_id: 3 }]));
      if (url.includes('/industry/jobs/')) return new Response(JSON.stringify([]));
      return new Response(JSON.stringify({ error: 'temporary' }), { status: 503 });
    }) as jest.MockedFunction<typeof fetch>;

    const result = await ingestNumbersFromEsiSyncRequest(db, syncRequest, env, fetchMock);

    expect(result.failures).toEqual(['Market orders ESI endpoint returned 503.']);
    expect(result.sectionStatuses).toContainEqual({ key: 'assets', status: 'healthy' });
    expect(result.sectionStatuses).toContainEqual({ key: 'market', status: 'missing' });
    expect(JSON.stringify(numbersSnapshots[0])).not.toContain('access-token');
    expect(JSON.stringify(numbersSnapshots[0])).not.toContain('refresh-token');
  });

  it('refreshes near-expired access tokens before reading Numbers endpoints', async () => {
    const { db } = createDb(
      activeVault({
        accessTokenExpiresAt: new Date(Date.now() - 60_000).toISOString()
      })
    );
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === 'https://sso.test/token') {
        return new Response(
          JSON.stringify({
            access_token: 'fresh-access-token',
            refresh_token: 'fresh-refresh-token',
            scope: syncRequest.requiredScopes.join(' ')
          })
        );
      }

      return new Response(JSON.stringify([]));
    }) as jest.MockedFunction<typeof fetch>;

    const result = await ingestNumbersFromEsiSyncRequest(db, syncRequest, env, fetchMock);

    expect(result.failures).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/wallets/'),
      expect.objectContaining({
        headers: expect.objectContaining({ authorization: 'Bearer fresh-access-token' })
      })
    );
  });
});
