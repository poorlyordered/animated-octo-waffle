import { jest } from '@jest/globals';
import type { Db, Filter, UpdateFilter } from 'mongodb';
import {
  claimQueuedSyncRequest,
  completeSyncRequest,
  failSyncRequest,
  listQueuedSyncRequests,
  workerSyncRequestSummary
} from '../../../../netlify/functions/_shared/esi-sync-request-store';

type Document = Record<string, unknown>;

function createDb(initial: Document[]) {
  const documents = initial.map((item) => ({ ...item }));
  const collection = {
    find: jest.fn((filter: Filter<Document>) => ({
      sort: jest.fn(() => ({
        toArray: jest.fn(async () => documents.filter((item) => matches(item, filter)).map((item) => ({ ...item })))
      }))
    })),
    findOneAndUpdate: jest.fn((filter: Filter<Document>, update: UpdateFilter<Document>) => {
      const document = documents.find((item) => matches(item, filter));
      if (!document) return null;
      applyUpdate(document, update);
      return { ...document };
    })
  };

  return { db: { collection: () => collection } as unknown as Db, documents };
}

function matches(document: Document, filter: Filter<Document>) {
  return Object.entries(filter).every(([key, expected]) => {
    if (expected && typeof expected === 'object' && '$in' in expected) {
      return (expected.$in as unknown[]).includes(document[key]);
    }

    return document[key] === expected;
  });
}

function applyUpdate(document: Document, update: UpdateFilter<Document>) {
  if (update.$set) {
    Object.assign(document, update.$set);
  }
}

const queuedSync = {
  id: 'sync-1',
  corporationId: '123456789',
  characterId: '2110000001',
  vaultId: 'vault-1',
  domain: 'numbers',
  requiredScopes: ['esi-wallet.read_corporation_wallets.v1'],
  status: 'queued',
  requestedBy: 'Ari Voss',
  requestedAt: '2026-06-02T12:45:00.000Z',
  source: 'Commander-prepared from explicit ESI read-sync consent.',
  createdAt: '2026-06-02T12:45:00.000Z',
  updatedAt: '2026-06-02T12:45:00.000Z'
};

describe('ESI sync request store worker transitions', () => {
  it('lists queued sync requests by domain', async () => {
    const { db } = createDb([queuedSync, { ...queuedSync, id: 'sync-2', status: 'completed' }]);

    const ready = await listQueuedSyncRequests(db, 'numbers');

    expect(ready).toHaveLength(1);
    expect(workerSyncRequestSummary(ready[0])).toMatchObject({
      id: 'sync-1',
      domain: 'numbers',
      status: 'queued'
    });
  });

  it('atomically claims only queued sync requests', async () => {
    const { db } = createDb([queuedSync]);

    const claimed = await claimQueuedSyncRequest(db, 'sync-1', 'numbers-worker-1');
    const duplicate = await claimQueuedSyncRequest(db, 'sync-1', 'numbers-worker-2');

    expect(claimed).toMatchObject({
      id: 'sync-1',
      status: 'claimed',
      claimedBy: 'numbers-worker-1'
    });
    expect(duplicate).toBeNull();
  });

  it('completes and fails only requests claimed by the worker', async () => {
    const { db } = createDb([{ ...queuedSync, status: 'claimed', claimedBy: 'numbers-worker-1' }]);
    const result = {
      snapshotId: 'snapshot-1',
      sourceCount: 4,
      summary: 'Numbers ESI sync completed.',
      sectionStatuses: [{ key: 'wallet', status: 'healthy' }],
      failures: []
    };

    const completed = await completeSyncRequest(db, 'sync-1', 'numbers-worker-1', result);
    const failed = await failSyncRequest(db, 'sync-1', 'numbers-worker-1', 'Should not apply after completion');

    expect(completed).toMatchObject({ status: 'completed', result });
    expect(failed).toBeNull();
  });
});
