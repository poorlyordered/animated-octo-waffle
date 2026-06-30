import { jest } from '@jest/globals';
import type { Db, Filter } from 'mongodb';
import {
  aggregatePeopleIngestionSectionStatuses,
  buildPeopleIngestionProvenance,
  claimPeopleIngestionRequest,
  completePeopleIngestionRequest,
  createOrFindQueuedPeopleIngestionRequest,
  failPeopleIngestionRequest,
  listPeopleIngestionHistory
} from '../../../../netlify/functions/_shared/people-ingestion-history';
import { completeMember, missingDataMember } from '../fixtures/people';

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

  return { db: { collection: () => collection } as unknown as Db, collection };
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

describe('People ingestion history provenance', () => {
  it('normalizes recent history and computes latest ingestion provenance', async () => {
    const fallbackSections = aggregatePeopleIngestionSectionStatuses([completeMember, missingDataMember]);
    const { db } = createDb([
      {
        id: 'people-sync-1',
        corporationId: completeMember.corporationId,
        status: 'completed',
        requestedAt: '2026-06-02T09:00:00.000Z',
        completedAt: '2026-06-02T09:20:00.000Z',
        result: {
          sourceCount: 2,
          sectionStatuses: [{ key: 'identity', status: 'present' }]
        }
      }
    ]);

    const history = await listPeopleIngestionHistory(db, completeMember.corporationId, fallbackSections);
    const provenance = buildPeopleIngestionProvenance([completeMember, missingDataMember], history);

    expect(history[0]).toMatchObject({
      id: 'people-sync-1',
      status: 'completed',
      sourceCount: 2
    });
    expect(provenance).toMatchObject({
      mode: 'latest_ingestion',
      sourceCount: 2,
      profileCount: 2
    });
    expect(provenance.sectionStatuses).toContainEqual({ key: 'roles', status: 'missing' });
    expect(provenance.boundary).toContain('does not retry, dispatch, fetch ESI');
  });

  it('falls back to historical profile provenance when no ingestion history exists', () => {
    const provenance = buildPeopleIngestionProvenance([completeMember], []);

    expect(provenance).toMatchObject({
      mode: 'historical_profiles',
      sourceCount: 1,
      profileCount: 1
    });
    expect(provenance.history).toHaveLength(0);
  });

  it('creates one active queued request per corporation', async () => {
    const { db } = createDb([]);

    const first = await createOrFindQueuedPeopleIngestionRequest(db, completeMember.corporationId, 'Commander', 'Refresh people.');
    const second = await createOrFindQueuedPeopleIngestionRequest(db, completeMember.corporationId, 'Commander', 'Refresh people.');

    expect(first.duplicate).toBe(false);
    expect(first.request.status).toBe('queued');
    expect(second.duplicate).toBe(true);
    expect(second.request.id).toBe(first.request.id);
  });

  it('requires the claiming worker to complete or fail ingestion requests', async () => {
    const { db } = createDb([
      {
        id: 'people-sync-queued',
        corporationId: completeMember.corporationId,
        status: 'queued',
        requestedBy: 'Commander',
        requestedAt: '2026-06-30T12:00:00.000Z',
        createdAt: '2026-06-30T12:00:00.000Z',
        updatedAt: '2026-06-30T12:00:00.000Z'
      },
      {
        id: 'people-sync-failable',
        corporationId: completeMember.corporationId,
        status: 'claimed',
        requestedBy: 'Commander',
        requestedAt: '2026-06-30T12:00:00.000Z',
        claimedBy: 'people-worker-2',
        claimedAt: '2026-06-30T12:05:00.000Z',
        createdAt: '2026-06-30T12:00:00.000Z',
        updatedAt: '2026-06-30T12:05:00.000Z'
      }
    ]);

    const claimed = await claimPeopleIngestionRequest(db, 'people-sync-queued', 'people-worker-1');
    const duplicateClaim = await claimPeopleIngestionRequest(db, 'people-sync-queued', 'people-worker-2');
    const wrongWorkerComplete = await completePeopleIngestionRequest(db, 'people-sync-queued', 'people-worker-2', {
      workerId: 'people-worker-2',
      sourceCount: 1,
      sectionStatuses: [{ key: 'identity', status: 'present' }]
    });
    const completed = await completePeopleIngestionRequest(db, 'people-sync-queued', 'people-worker-1', {
      workerId: 'people-worker-1',
      sourceCount: 2,
      sectionStatuses: [{ key: 'identity', status: 'present' }]
    });
    const failed = await failPeopleIngestionRequest(db, 'people-sync-failable', 'people-worker-2', 'ESI unavailable.');

    expect(claimed?.status).toBe('claimed');
    expect(duplicateClaim).toBeNull();
    expect(wrongWorkerComplete).toBeNull();
    expect(completed?.status).toBe('completed');
    expect(failed?.status).toBe('failed');
    expect(failed?.failure).toMatchObject({ reason: 'ESI unavailable.' });
  });
});
