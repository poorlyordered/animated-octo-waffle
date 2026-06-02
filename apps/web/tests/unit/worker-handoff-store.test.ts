import { jest } from '@jest/globals';
import type { Db, Filter, UpdateFilter } from 'mongodb';
import { readyHandoff } from '../fixtures/workerHandoff';
import {
  claimWorkerHandoff,
  completeWorkerHandoff,
  failWorkerHandoff,
  recordWorkerProgress
} from '../../../../netlify/functions/_shared/worker-handoff-store';

type Document = Record<string, unknown>;

function createDb(initial: Document[]) {
  const documents = initial.map((item) => ({ ...item }));
  const collection = {
    findOneAndUpdate: jest.fn((filter: Filter<Document>, update: UpdateFilter<Document>) => {
      const document = documents.find((item) => matches(item, filter));

      if (!document) {
        return null;
      }

      applyUpdate(document, update);
      return { ...document };
    })
  };

  return {
    db: { collection: () => collection } as unknown as Db,
    collection,
    documents
  };
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

  if (update.$push) {
    for (const [key, value] of Object.entries(update.$push)) {
      const current = Array.isArray(document[key]) ? document[key] : [];
      document[key] = [...current, value];
    }
  }

  if (update.$unset) {
    for (const key of Object.keys(update.$unset)) {
      delete document[key];
    }
  }
}

describe('worker handoff store callbacks', () => {
  it('atomically claims only ready handoffs', async () => {
    const { db } = createDb([{ ...readyHandoff, status: 'ready', progress: [] }]);

    const claimed = await claimWorkerHandoff(db, readyHandoff.corporationId, readyHandoff.id, 'worker-1');
    const duplicate = await claimWorkerHandoff(db, readyHandoff.corporationId, readyHandoff.id, 'worker-2');

    expect(claimed).toMatchObject({
      id: readyHandoff.id,
      status: 'claimed',
      claimedBy: 'worker-1',
      progress: []
    });
    expect(duplicate).toBeNull();
  });

  it('records progress only for the claiming worker', async () => {
    const { db } = createDb([{ ...readyHandoff, status: 'claimed', claimedBy: 'worker-1', progress: [] }]);

    const progressed = await recordWorkerProgress(db, readyHandoff.corporationId, readyHandoff.id, {
      workerId: 'worker-1',
      message: 'Fetched source documents',
      code: 'sources_fetched'
    });
    const rejected = await recordWorkerProgress(db, readyHandoff.corporationId, readyHandoff.id, {
      workerId: 'worker-2',
      message: 'Wrong worker'
    });

    expect(progressed?.progress).toEqual([
      expect.objectContaining({
        workerId: 'worker-1',
        message: 'Fetched source documents',
        code: 'sources_fetched'
      })
    ]);
    expect(rejected).toBeNull();
  });

  it('completes only claimed handoffs for the claiming worker', async () => {
    const { db } = createDb([{ ...readyHandoff, status: 'claimed', claimedBy: 'worker-1', progress: [] }]);

    const completed = await completeWorkerHandoff(db, readyHandoff.corporationId, readyHandoff.id, {
      workerId: 'worker-1',
      summary: 'Prepared safe output',
      artifactRefs: ['brief:abc123']
    });

    expect(completed).toMatchObject({
      status: 'completed',
      result: {
        workerId: 'worker-1',
        summary: 'Prepared safe output',
        artifactRefs: ['brief:abc123']
      }
    });
  });

  it('fails only claimed handoffs for the claiming worker', async () => {
    const { db } = createDb([{ ...readyHandoff, status: 'claimed', claimedBy: 'worker-1', progress: [] }]);

    const failed = await failWorkerHandoff(db, readyHandoff.corporationId, readyHandoff.id, {
      workerId: 'worker-1',
      message: 'Source unavailable',
      code: 'source_unavailable'
    });

    expect(failed).toMatchObject({
      status: 'failed',
      failure: {
        workerId: 'worker-1',
        message: 'Source unavailable',
        code: 'source_unavailable'
      }
    });
  });
});
