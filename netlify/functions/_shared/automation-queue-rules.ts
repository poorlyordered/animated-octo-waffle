import type { DecisionRecord } from '../../../packages/contracts/src/index';

export function assertQueueEligibleDecision(decision: DecisionRecord): void {
  if (decision.status !== 'approved') {
    throw new Error('Only approved decisions can create automation queue items');
  }

  if (decision.isPlayerImpacting && !decision.approval?.approvedAt) {
    throw new Error('Explicit approval is required before queuing player-impacting work');
  }
}
