import type { AutomationQueueItem, WorkerHandoff } from '../../../packages/contracts/src/index';
import { activeWorkerHandoffStatuses } from '../../../packages/contracts/src/index';

export function isActiveWorkerHandoff(handoff: WorkerHandoff): boolean {
  return activeWorkerHandoffStatuses.includes(handoff.status as (typeof activeWorkerHandoffStatuses)[number]);
}

export function assertQueueEligibleForHandoff(queueItem: AutomationQueueItem): void {
  if (queueItem.status === 'completed' || queueItem.status === 'canceled') {
    throw new Error('Queue item is not eligible for worker handoff');
  }

  if (queueItem.isPlayerImpacting && !queueItem.approval?.approvedAt) {
    throw new Error('Explicit approval is required before preparing player-impacting worker handoff');
  }
}

export function assertNoExecutionRequest(body: unknown): void {
  if (!body || typeof body !== 'object') {
    return;
  }

  const record = body as Record<string, unknown>;
  if (record.executeNow === true || record.dispatchNow === true || record.retryNow === true) {
    throw new Error('Worker handoff does not execute, dispatch, or retry work');
  }
}
