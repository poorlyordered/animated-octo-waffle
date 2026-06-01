import { completedItem, playerImpactingQueuedItem, queuedItem } from '../fixtures/automationQueue';
import { blockedHandoff, readyHandoff } from '../fixtures/workerHandoff';
import {
  assertNoExecutionRequest,
  assertQueueEligibleForHandoff,
  isActiveWorkerHandoff
} from '../../../../netlify/functions/_shared/worker-handoff-rules';

describe('worker handoff rules', () => {
  it('allows eligible queued work', () => {
    expect(() => assertQueueEligibleForHandoff(queuedItem)).not.toThrow();
  });

  it('rejects completed queue items', () => {
    expect(() => assertQueueEligibleForHandoff(completedItem)).toThrow('Queue item is not eligible');
  });

  it('requires approval metadata for player-impacting work', () => {
    expect(() => assertQueueEligibleForHandoff({ ...playerImpactingQueuedItem, approval: null })).toThrow(
      'Explicit approval is required'
    );
  });

  it('identifies active handoff statuses', () => {
    expect(isActiveWorkerHandoff(readyHandoff)).toBe(true);
    expect(isActiveWorkerHandoff(blockedHandoff)).toBe(true);
    expect(isActiveWorkerHandoff({ ...readyHandoff, status: 'completed' })).toBe(false);
  });

  it('rejects browser requests that ask for execution', () => {
    expect(() => assertNoExecutionRequest({ dispatchNow: true })).toThrow('does not execute');
    expect(() => assertNoExecutionRequest({ note: 'prepare only' })).not.toThrow();
  });
});
