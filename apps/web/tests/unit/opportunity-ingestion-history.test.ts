import { jest } from '@jest/globals';
import type { Db, Filter } from 'mongodb';
import {
  buildOpportunityIngestionProvenance,
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
        }))
      }))
    }))
  };

  return { db: { collection: () => collection } as unknown as Db };
}

function matches(document: Document, filter: Filter<Document>) {
  return Object.entries(filter).every(([key, expected]) => document[key] === expected);
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
});
