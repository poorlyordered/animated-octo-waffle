import { jest } from '@jest/globals';
import type { Db, Filter } from 'mongodb';
import {
  aggregatePeopleIngestionSectionStatuses,
  buildPeopleIngestionProvenance,
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
        }))
      }))
    }))
  };

  return { db: { collection: () => collection } as unknown as Db, collection };
}

function matches(document: Document, filter: Filter<Document>) {
  return Object.entries(filter).every(([key, expected]) => document[key] === expected);
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
});
