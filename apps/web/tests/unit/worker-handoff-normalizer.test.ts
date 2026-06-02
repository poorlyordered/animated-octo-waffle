import { queuedItem } from '../fixtures/automationQueue';
import { readyHandoff } from '../fixtures/workerHandoff';
import {
  normalizeWorkerHandoffDocument,
  payloadSummaryFromQueueItem,
  workerHandoffSummaryFromHandoff
} from '../../../../netlify/functions/_shared/worker-handoff-normalizer';

describe('worker handoff normalizer', () => {
  it('derives safe payload summaries from queue items', () => {
    expect(payloadSummaryFromQueueItem(queuedItem)).toMatchObject({
      taskIntent: queuedItem.taskIntent,
      inputSummary: queuedItem.inputSummary,
      expectedOutput: queuedItem.expectedOutput,
      sourceDecisionId: queuedItem.sourceDecisionId
    });
  });

  it('normalizes handoff documents into contract records', () => {
    const normalized = normalizeWorkerHandoffDocument({
      ...readyHandoff,
      _id: { toString: () => 'mongo-id' },
      id: undefined
    });

    expect(normalized.id).toBe('mongo-id');
    expect(normalized.status).toBe('ready');
  });

  it('creates queue-detail summaries without payload internals', () => {
    expect(workerHandoffSummaryFromHandoff(readyHandoff)).toEqual({
      id: readyHandoff.id,
      status: 'ready',
      createdAt: readyHandoff.createdAt,
      updatedAt: readyHandoff.updatedAt,
      claimedBy: undefined,
      claimedAt: undefined,
      completedAt: undefined,
      progress: [],
      result: undefined,
      failure: undefined
    });
  });
});
