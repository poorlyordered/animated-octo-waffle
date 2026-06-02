import { jest } from '@jest/globals';
import type { Db, Filter } from 'mongodb';
import {
  assertNoUnsafeRetryFields,
  createOrFindScheduledRetryRequest,
  retryRequestSummary
} from '../../../../netlify/functions/_shared/retry-request-store';

type Document = Record<string, unknown>;

function createDb(initial: Document[]) {
  const documents = initial.map((item) => ({ ...item }));
  const collection = {
    findOne: jest.fn(async (filter: Filter<Document>) => documents.find((item) => matches(item, filter)) ?? null),
    insertOne: jest.fn(async (document: Document) => {
      const inserted = { ...document, id: `retry-${documents.length + 1}` };
      documents.push(inserted);
      return { insertedId: { toString: () => inserted.id } };
    })
  };

  return { db: { collection: () => collection } as unknown as Db, documents };
}

function matches(document: Document, filter: Filter<Document>) {
  return Object.entries(filter).every(([key, expected]) => document[key] === expected);
}

describe('retry request store', () => {
  it('creates and surfaces duplicate scheduled retries', async () => {
    const { db, documents } = createDb([]);

    const first = await createOrFindScheduledRetryRequest(db, '123456789', 'worker_handoff', 'handoff-1', {
      reason: 'Commander approved retry.'
    });
    const duplicate = await createOrFindScheduledRetryRequest(db, '123456789', 'worker_handoff', 'handoff-1', {
      reason: 'Commander approved retry again.'
    });

    expect(first.duplicate).toBe(false);
    expect(duplicate.duplicate).toBe(true);
    expect(documents).toHaveLength(1);
    expect(retryRequestSummary(first.retry)).toMatchObject({
      targetType: 'worker_handoff',
      targetId: 'handoff-1',
      status: 'scheduled'
    });
  });

  it('rejects unsafe retry execution fields', () => {
    expect(() => assertNoUnsafeRetryFields({ reason: 'Retry', dispatchNow: true })).toThrow(
      'Unsafe retry field rejected: dispatchNow'
    );
    expect(() => assertNoUnsafeRetryFields({ reason: 'Retry', accessToken: 'secret' })).toThrow(
      'Unsafe retry field rejected: accessToken'
    );
  });
});
