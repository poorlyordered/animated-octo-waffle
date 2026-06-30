import { jest } from '@jest/globals';
import type { Db, Filter } from 'mongodb';
import {
  buildOpportunityIngestionProvenance,
  claimOpportunityIngestionRequest,
  completeOpportunityIngestionRequest,
  createOrFindQueuedOpportunityIngestionRequest,
  failOpportunityIngestionRequest,
  listOpportunityIngestionHistory,
  opportunitySectionStatuses
} from '../../../../netlify/functions/_shared/opportunity-ingestion-history';
import { processedBrief } from '../fixtures/commandBrief';

type Document = Record<string, unknown>;

function createDb(initial: Document[]) {
  const documents = initial.map((item) => ({ ...item }));
  const collection = {
    find: jest.fn((filter: Filter<Document>) => ({
      sort: jest.fn(() => ({
        limit: jest.fn(() => ({
          toArray: jest.fn(async () => documents.filter((item) => matches(item, filter)).map((item) => ({ ...item })))
        })),
        toArray: jest.fn(async () => documents.filter((item) => matches(item, filter)).map((item) => ({ ...item })))
      }))
    })),
    findOne: jest.fn(async (filter: Filter<Document>) => documents.find((item) => matches(item, filter)) ?? null),
    insertOne: jest.fn(async (document: Document) => {
      const insertedId = { toString: () => `inserted-${documents.length + 1}` };
      documents.push({ ...document, _id: insertedId });
      return { insertedId };
    }),
    findOneAndUpdate: jest.fn(async (filter: Filter<Document>, update: { $set?: Document }) => {
      const index = documents.findIndex((item) => matches(item, filter));
      if (index === -1) {
        return null;
      }
      documents[index] = { ...documents[index], ...(update.$set ?? {}) };
      return { ...documents[index] };
    })
  };

  return { db: { collection: () => collection } as unknown as Db };
}

function matches(document: Document, filter: Filter<Document>) {
  return Object.entries(filter).every(([key, expected]) => {
    if (expected && typeof expected === 'object' && '$in' in expected) {
      return (expected.$in as unknown[]).includes(document[key]);
    }

    if (key === '_id') {
      return document._id?.toString() === expected?.toString();
    }

    return document[key] === expected;
  });
}

describe('Opportunity ingestion history provenance', () => {
  it('normalizes research history and computes latest research provenance', async () => {
    const fallbackSections = opportunitySectionStatuses(processedBrief);
    const { db } = createDb([
      {
        id: 'research-request-1',
        corporationId: processedBrief.corporationId,
        focus: processedBrief.focus,
        status: 'processed',
        createdAt: '2026-06-04T09:00:00.000Z',
        updatedAt: '2026-06-04T09:20:00.000Z',
        rawItemCount: 4
      }
    ]);

    const history = await listOpportunityIngestionHistory(db, processedBrief.corporationId, processedBrief.focus, fallbackSections);
    const provenance = buildOpportunityIngestionProvenance(processedBrief, history, 1);

    expect(history[0]).toMatchObject({
      id: 'research-request-1',
      status: 'processed',
      sourceCount: 4
    });
    expect(provenance).toMatchObject({
      mode: 'latest_research',
      sourceCount: 4,
      briefCount: 1
    });
    expect(provenance.sectionStatuses).toContainEqual({ key: 'sources', status: 'present' });
    expect(provenance.boundary).toContain('does not schedule research pulls, dispatch workers');
  });

  it('falls back to historical brief provenance when no processed history exists', () => {
    const provenance = buildOpportunityIngestionProvenance(processedBrief, [], 1);

    expect(provenance).toMatchObject({
      mode: 'historical_brief',
      sourceCount: processedBrief.sourceCount,
      briefCount: 1
    });
  });

  it('creates one active queued request per corporation and focus', async () => {
    const { db } = createDb([]);

    const first = await createOrFindQueuedOpportunityIngestionRequest(
      db,
      processedBrief.corporationId,
      processedBrief.focus,
      'Commander',
      'Refresh opportunity.'
    );
    const second = await createOrFindQueuedOpportunityIngestionRequest(
      db,
      processedBrief.corporationId,
      processedBrief.focus,
      'Commander',
      'Refresh opportunity.'
    );

    expect(first.duplicate).toBe(false);
    expect(first.request.status).toBe('queued');
    expect(second.duplicate).toBe(true);
    expect(second.request.id).toBe(first.request.id);
  });

  it('requires the claiming worker to complete or fail ingestion requests', async () => {
    const { db } = createDb([
      {
        id: 'opportunity-sync-queued',
        corporationId: processedBrief.corporationId,
        focus: processedBrief.focus,
        status: 'queued',
        requestedBy: 'Commander',
        createdAt: '2026-06-30T12:00:00.000Z',
        updatedAt: '2026-06-30T12:00:00.000Z'
      },
      {
        id: 'opportunity-sync-failable',
        corporationId: processedBrief.corporationId,
        focus: processedBrief.focus,
        status: 'processing',
        requestedBy: 'Commander',
        claimedBy: 'opportunity-worker-2',
        claimedAt: '2026-06-30T12:05:00.000Z',
        createdAt: '2026-06-30T12:00:00.000Z',
        updatedAt: '2026-06-30T12:05:00.000Z'
      }
    ]);

    const claimed = await claimOpportunityIngestionRequest(db, 'opportunity-sync-queued', 'opportunity-worker-1');
    const duplicateClaim = await claimOpportunityIngestionRequest(db, 'opportunity-sync-queued', 'opportunity-worker-2');
    const wrongWorkerComplete = await completeOpportunityIngestionRequest(db, 'opportunity-sync-queued', 'opportunity-worker-2', {
      workerId: 'opportunity-worker-2',
      sourceCount: 1,
      sectionStatuses: [{ key: 'sources', status: 'present' }]
    });
    const completed = await completeOpportunityIngestionRequest(db, 'opportunity-sync-queued', 'opportunity-worker-1', {
      workerId: 'opportunity-worker-1',
      sourceCount: 2,
      sectionStatuses: [{ key: 'sources', status: 'present' }]
    });
    const failed = await failOpportunityIngestionRequest(
      db,
      'opportunity-sync-failable',
      'opportunity-worker-2',
      'Official feed unavailable.'
    );

    expect(claimed?.status).toBe('processing');
    expect(duplicateClaim).toBeNull();
    expect(wrongWorkerComplete).toBeNull();
    expect(completed?.status).toBe('processed');
    expect(failed?.status).toBe('failed');
    expect(failed?.errorMessage).toBe('Official feed unavailable.');
  });
});
