import { ObjectId, type Db, type Filter, type UpdateFilter } from 'mongodb';
import {
  claimRefreshStep,
  completeRefreshStep,
  createOrFindActiveRefreshRun,
  failRefreshStep,
  listClaimableRefreshSteps
} from '../../../../netlify/functions/_shared/intelligence-refresh-store';

type Document = Record<string, unknown>;
type Collections = Record<string, Document[]>;

function createDb(initial: Collections) {
  const collections: Collections = Object.fromEntries(
    Object.entries(initial).map(([name, documents]) => [name, documents.map((document) => ({ ...document }))])
  );

  const collection = (name: string) => {
    const documents = (collections[name] ??= []);
    return {
      find: (filter: Filter<Document>) => ({
        sort: () => ({
          limit: (limit: number) => ({
            toArray: async () => documents.filter((item) => matches(item, filter)).slice(0, limit).map((item) => clone(item)),
            next: async () => clone(documents.find((item) => matches(item, filter)) ?? null)
          }),
          toArray: async () => documents.filter((item) => matches(item, filter)).map((item) => clone(item))
        })
      }),
      findOne: async (filter: Filter<Document>) => clone(documents.find((item) => matches(item, filter)) ?? null),
      insertOne: async (document: Document) => {
        const insertedId = new ObjectId();
        documents.push({ ...document, _id: insertedId });
        return { insertedId };
      },
      updateOne: async (filter: Filter<Document>, update: UpdateFilter<Document>) => {
        const document = documents.find((item) => matches(item, filter));
        if (document) applyUpdate(document, update);
        return { matchedCount: document ? 1 : 0, modifiedCount: document ? 1 : 0 };
      },
      findOneAndUpdate: async (filter: Filter<Document>, update: UpdateFilter<Document>) => {
        const document = documents.find((item) => matches(item, filter));
        if (!document) return null;
        applyUpdate(document, update);
        return clone(document);
      }
    };
  };

  return { db: { collection } as unknown as Db, collections };
}

function matches(document: Document, filter: Filter<Document>) {
  return Object.entries(filter).every(([key, expected]) => {
    const actual = document[key];
    if (expected && typeof expected === 'object' && '$in' in expected) {
      return (expected.$in as unknown[]).includes(actual);
    }
    if (actual instanceof ObjectId && expected instanceof ObjectId) {
      return actual.toHexString() === expected.toHexString();
    }
    return actual === expected;
  });
}

function applyUpdate(document: Document, update: UpdateFilter<Document>) {
  if (update.$set) {
    Object.assign(document, update.$set);
  }
  if (update.$unset) {
    for (const key of Object.keys(update.$unset)) {
      delete document[key];
    }
  }
}

function clone<T>(value: T): T {
  if (value === null) return value;
  if (value instanceof ObjectId) return new ObjectId(value.toHexString()) as T;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => clone(item)) as T;
  return Object.fromEntries(Object.entries(value as Document).map(([key, item]) => [key, clone(item)])) as T;
}

const corporationId = '98677876';
const commander = 'Ari Voss';
const grantedScopes = [
  'esi-wallet.read_corporation_wallets.v1',
  'esi-assets.read_corporation_assets.v1',
  'esi-industry.read_corporation_jobs.v1',
  'esi-markets.read_corporation_orders.v1'
];

describe('intelligence refresh store', () => {
  it('creates a prepared run and prevents duplicate active runs for the same domain set', async () => {
    const { db, collections } = createDb({
      esi_token_vaults: [
        {
          id: 'vault-1',
          corporationId,
          characterId: '2110000001',
          characterName: commander,
          corporationName: 'Gryyk-47',
          grantedScopes,
          requestedScopes: grantedScopes,
          sealedAccessToken: 'sealed-access',
          sealedRefreshToken: 'sealed-refresh',
          accessTokenExpiresAt: '2026-07-03T00:00:00.000Z',
          consentedAt: '2026-07-02T00:00:00.000Z',
          status: 'active',
          createdAt: '2026-07-02T00:00:00.000Z',
          updatedAt: '2026-07-02T00:00:00.000Z'
        }
      ],
      esi_sync_requests: [],
      people_ingestion_requests: [],
      research_requests: [],
      intelligence_refresh_runs: []
    });

    const first = await createOrFindActiveRefreshRun(db, {
      corporationId,
      requestedBy: commander,
      domains: ['numbers', 'people', 'opportunity'],
      reason: 'Refresh command intelligence.'
    });
    const second = await createOrFindActiveRefreshRun(db, {
      corporationId,
      requestedBy: commander,
      domains: ['opportunity', 'numbers', 'people'],
      reason: 'Duplicate request.'
    });

    expect(first.duplicate).toBe(false);
    expect(first.run.steps.map((step) => step.status)).toEqual(['prepared', 'prepared', 'prepared']);
    expect(first.run.steps.map((step) => step.preparedRequest?.type)).toEqual([
      'esi_sync_request',
      'people_ingestion_request',
      'opportunity_ingestion_request'
    ]);
    expect(second.duplicate).toBe(true);
    expect(second.run.id).toBe(first.run.id);
    expect(collections.intelligence_refresh_runs).toHaveLength(1);
  });

  it('claims and completes only steps owned by the requesting worker', async () => {
    const { db } = createDb({
      esi_token_vaults: [],
      esi_sync_requests: [],
      people_ingestion_requests: [],
      research_requests: [],
      intelligence_refresh_runs: []
    });
    const created = await createOrFindActiveRefreshRun(db, {
      corporationId,
      requestedBy: commander,
      domains: ['people'],
      reason: 'Refresh people.'
    });
    const stepId = created.run.steps[0].id;

    const ready = await listClaimableRefreshSteps(db, 'people');
    const claimed = await claimRefreshStep(db, created.run.id, stepId, 'people-worker-1');
    const duplicateClaim = await claimRefreshStep(db, created.run.id, stepId, 'people-worker-2');
    const wrongWorker = await completeRefreshStep(db, created.run.id, stepId, 'people-worker-2', {
      sourceCount: 3,
      summary: 'People completed.',
      sectionStatuses: [{ key: 'membership', status: 'captured' }],
      warnings: []
    });
    const completed = await completeRefreshStep(db, created.run.id, stepId, 'people-worker-1', {
      sourceCount: 3,
      summary: 'People completed.',
      sectionStatuses: [{ key: 'membership', status: 'captured' }],
      warnings: []
    });

    expect(ready).toHaveLength(1);
    expect(claimed?.steps[0]).toMatchObject({ status: 'running', claimedBy: 'people-worker-1' });
    expect(duplicateClaim).toBeNull();
    expect(wrongWorker).toBeNull();
    expect(completed?.steps[0]).toMatchObject({ status: 'completed', sourceCount: 3 });
    expect(completed?.status).toBe('waiting_for_evaluation');
  });

  it('records worker step failures and makes partial evaluation ready when useful data exists', async () => {
    const { db } = createDb({
      esi_token_vaults: [],
      esi_sync_requests: [],
      people_ingestion_requests: [],
      research_requests: [],
      intelligence_refresh_runs: []
    });
    const created = await createOrFindActiveRefreshRun(db, {
      corporationId,
      requestedBy: commander,
      domains: ['people', 'opportunity'],
      reason: 'Refresh available operational intelligence.'
    });

    const peopleStep = created.run.steps.find((step) => step.domain === 'people')!;
    const opportunityStep = created.run.steps.find((step) => step.domain === 'opportunity')!;
    await claimRefreshStep(db, created.run.id, peopleStep.id, 'people-worker-1');
    await completeRefreshStep(db, created.run.id, peopleStep.id, 'people-worker-1', {
      sourceCount: 7,
      summary: 'People completed.',
      sectionStatuses: [{ key: 'membership', status: 'captured' }],
      warnings: []
    });
    await claimRefreshStep(db, created.run.id, opportunityStep.id, 'opportunity-worker-1');
    const failed = await failRefreshStep(db, created.run.id, opportunityStep.id, 'opportunity-worker-1', 'Source unavailable.');

    expect(failed?.status).toBe('waiting_for_evaluation');
    expect(failed?.evaluation.status).toBe('ready');
    expect(failed?.steps.find((step) => step.domain === 'opportunity')).toMatchObject({
      status: 'failed',
      failure: { reason: 'Source unavailable.' }
    });
  });
});
