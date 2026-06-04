import { jest } from '@jest/globals';
import type { Db, Filter } from 'mongodb';
import {
  blockRetryRequest,
  cancelLatestRetryRequestForTarget,
  claimRetryRequest,
  completeRetryRequest,
  assertNoUnsafeRetryFields,
  createOrFindScheduledRetryRequest,
  listDueScheduledRetryRequests,
  retryRequestSummary
} from '../../../../netlify/functions/_shared/retry-request-store';

type Document = Record<string, unknown>;

function createDb(initial: Document[]) {
  const documents = initial.map((item) => ({ ...item }));
  const collection = {
    findOne: jest.fn(async (filter: Filter<Document>) => documents.find((item) => matches(item, filter)) ?? null),
    find: jest.fn((filter: Filter<Document>) => ({
      sort: jest.fn(() => ({
        limit: jest.fn(() => ({
          toArray: jest.fn(async () => documents.filter((item) => matches(item, filter)))
        }))
      }))
    })),
    findOneAndUpdate: jest.fn(async (filter: Filter<Document>, update: Document) => {
      const index = documents.findIndex((item) => matches(item, filter));
      if (index === -1) {
        return null;
      }
      const set = update.$set as Document | undefined;
      const unset = update.$unset as Record<string, string> | undefined;
      if (set) {
        documents[index] = { ...documents[index], ...set };
      }
      if (unset) {
        for (const key of Object.keys(unset)) {
          delete documents[index][key];
        }
      }
      return documents[index];
    }),
    insertOne: jest.fn(async (document: Document) => {
      const inserted = { ...document, id: `retry-${documents.length + 1}` };
      documents.push(inserted);
      return { insertedId: { toString: () => inserted.id } };
    })
  };

  return { db: { collection: () => collection } as unknown as Db, documents };
}

function matches(document: Document, filter: Filter<Document>): boolean {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === '$or' && Array.isArray(expected)) {
      return expected.some((option) => matches(document, option as Filter<Document>));
    }

    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      const operators = expected as Record<string, unknown>;
      if ('$exists' in operators) {
        return operators.$exists ? key in document : !(key in document);
      }
      if ('$lte' in operators) {
        return typeof document[key] === 'string' && typeof operators.$lte === 'string' && document[key] <= operators.$lte;
      }
      if ('$in' in operators && Array.isArray(operators.$in)) {
        return operators.$in.includes(document[key]);
      }
    }

    return document[key] === expected;
  });
}

function retryDocument(overrides: Document = {}): Document {
  return {
    id: 'retry-1',
    corporationId: '123456789',
    targetType: 'worker_handoff',
    targetId: 'handoff-1',
    status: 'scheduled',
    reason: 'Commander approved retry.',
    createdBy: 'commander',
    createdAt: '2026-06-02T17:00:00.000Z',
    updatedAt: '2026-06-02T17:00:00.000Z',
    ...overrides
  };
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
      status: 'scheduled',
      policy: {
        canCancel: true,
        activeScheduledLimit: 1
      }
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

  it('lists only due scheduled retries', async () => {
    const { db } = createDb([
      retryDocument({ id: 'retry-due', notBefore: '2026-06-02T17:00:00.000Z' }),
      retryDocument({ id: 'retry-future', notBefore: '2026-06-02T19:00:00.000Z' }),
      retryDocument({ id: 'retry-completed', status: 'completed' })
    ]);

    const due = await listDueScheduledRetryRequests(db, new Date('2026-06-02T18:00:00.000Z'));

    expect(due.map((item) => item.id)).toEqual(['retry-due']);
  });

  it('claims and blocks scheduled retries', async () => {
    const { db } = createDb([retryDocument()]);

    const claimed = await claimRetryRequest(db, 'retry-1', 'retry-worker-1', new Date('2026-06-02T18:00:00.000Z'));
    const duplicateClaim = await claimRetryRequest(db, 'retry-1', 'retry-worker-2', new Date('2026-06-02T18:01:00.000Z'));
    const blocked = await blockRetryRequest(
      db,
      'retry-1',
      'retry-worker-1',
      'Only failed worker handoffs can be retried.',
      new Date('2026-06-02T18:02:00.000Z')
    );

    expect(claimed?.status).toBe('claimed');
    expect(duplicateClaim).toBeNull();
    expect(blocked?.status).toBe('blocked');
    expect(retryRequestSummary(blocked!).blockedReason).toContain('Only failed');
  });

  it('cancels only scheduled or blocked retries for a target', async () => {
    const { db } = createDb([retryDocument()]);

    const canceled = await cancelLatestRetryRequestForTarget(
      db,
      '123456789',
      'worker_handoff',
      'handoff-1',
      { reason: 'Commander canceled retry after policy review.' },
      'commander',
      new Date('2026-06-02T18:04:00.000Z')
    );
    const duplicateCancel = await cancelLatestRetryRequestForTarget(
      db,
      '123456789',
      'worker_handoff',
      'handoff-1',
      { reason: 'Cancel again.' },
      'commander',
      new Date('2026-06-02T18:05:00.000Z')
    );
    const summary = retryRequestSummary(canceled!);

    expect(summary).toMatchObject({
      status: 'canceled',
      canceledBy: 'commander',
      cancelReason: 'Commander canceled retry after policy review.',
      policy: {
        canCancel: false
      }
    });
    expect(duplicateCancel).toBeNull();
  });

  it('completes claimed retries with safe replacement summaries', async () => {
    const { db } = createDb([retryDocument({ status: 'claimed', claimedBy: 'retry-worker-1' })]);

    const completed = await completeRetryRequest(
      db,
      'retry-1',
      'retry-worker-1',
      {
        targetType: 'worker_handoff',
        targetId: 'handoff-1',
        replacementTargetId: 'handoff-2',
        replacementTargetStatus: 'ready',
        summary: 'Prepared replacement worker handoff from commander-approved retry.'
      },
      new Date('2026-06-02T18:03:00.000Z')
    );

    const summary = retryRequestSummary(completed!);

    expect(summary.status).toBe('completed');
    expect(summary.result?.replacementTargetId).toBe('handoff-2');
    expect(JSON.stringify(summary)).not.toContain('accessToken');
  });
});
