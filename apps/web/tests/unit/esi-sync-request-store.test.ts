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

const queuedPeopleSync = {
  ...queuedSync,
  id: 'sync-people',
  domain: 'people',
  requiredScopes: ['esi-corporations.read_corporation_membership.v1']
};

const queuedOpportunitySync = {
  ...queuedSync,
  id: 'sync-opportunity',
  domain: 'opportunity',
  requiredScopes: ['esi-corporations.read_structures.v1']
};

describe('ESI sync request store worker transitions', () => {
  it('lists queued sync requests by domain', async () => {
    const { db } = createDb([queuedSync, queuedPeopleSync, queuedOpportunitySync, { ...queuedSync, id: 'sync-2', status: 'completed' }]);

    const ready = await listQueuedSyncRequests(db, 'numbers');
    const peopleReady = await listQueuedSyncRequests(db, 'people');
    const opportunityReady = await listQueuedSyncRequests(db, 'opportunity');

    expect(ready).toHaveLength(1);
    expect(peopleReady).toHaveLength(1);
    expect(opportunityReady).toHaveLength(1);
    expect(workerSyncRequestSummary(ready[0])).toMatchObject({
      id: 'sync-1',
      domain: 'numbers',
      status: 'queued'
    });
    expect(workerSyncRequestSummary(peopleReady[0])).toMatchObject({
      id: 'sync-people',
      domain: 'people',
      status: 'queued'
    });
    expect(workerSyncRequestSummary(opportunityReady[0])).toMatchObject({
      id: 'sync-opportunity',
      domain: 'opportunity',
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
    const { db } = createDb([
      { ...queuedSync, status: 'claimed', claimedBy: 'numbers-worker-1' },
      { ...queuedPeopleSync, status: 'claimed', claimedBy: 'people-esi-worker-1' },
      { ...queuedOpportunitySync, status: 'claimed', claimedBy: 'opportunity-esi-worker-1' },
      { ...queuedOpportunitySync, id: 'sync-opportunity-failed', status: 'claimed', claimedBy: 'opportunity-esi-worker-2' }
    ]);
    const result = {
      snapshotId: 'snapshot-1',
      sourceCount: 4,
      summary: 'Numbers ESI sync completed.',
      sectionStatuses: [{ key: 'wallet', status: 'healthy' }],
      failures: []
    };
    const peopleResult = {
      sourceCount: 25,
      summary: 'People ESI membership read completed.',
      sectionStatuses: [{ key: 'membership', status: 'processed' }],
      failures: []
    };
    const opportunityResult = {
      snapshotId: 'opportunity-sync-1',
      sourceCount: 3,
      summary: 'Opportunity ESI structures read completed.',
      sectionStatuses: [{ key: 'structures', status: 'processed' }],
      failures: []
    };

    const completed = await completeSyncRequest(db, 'sync-1', 'numbers-worker-1', result);
    const completedPeople = await completeSyncRequest(db, 'sync-people', 'people-esi-worker-1', peopleResult);
    const completedOpportunity = await completeSyncRequest(db, 'sync-opportunity', 'opportunity-esi-worker-1', opportunityResult);
    const failedOpportunity = await failSyncRequest(db, 'sync-opportunity-failed', 'opportunity-esi-worker-2', 'Structures endpoint unavailable.');
    const failed = await failSyncRequest(db, 'sync-1', 'numbers-worker-1', 'Should not apply after completion');

    expect(completed).toMatchObject({ status: 'completed', result });
    expect(completedPeople).toMatchObject({ status: 'completed', domain: 'people', result: peopleResult });
    expect(completedOpportunity).toMatchObject({ status: 'completed', domain: 'opportunity', result: opportunityResult });
    expect(failedOpportunity).toMatchObject({
      status: 'failed',
      domain: 'opportunity',
      failure: { reason: 'Structures endpoint unavailable.' }
    });
    expect(failed).toBeNull();
  });
});
