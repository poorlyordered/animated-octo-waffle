import type { DecisionStatus } from '../../../packages/contracts/src/index';

const transitions: Record<DecisionStatus, DecisionStatus[]> = {
  proposed: ['approved', 'delegated', 'rejected'],
  approved: ['delegated', 'done', 'rejected'],
  delegated: ['done', 'rejected'],
  done: [],
  rejected: []
};

export function isValidDecisionTransition(fromStatus: DecisionStatus, toStatus: DecisionStatus): boolean {
  if (fromStatus === toStatus) {
    return true;
  }

  return transitions[fromStatus].includes(toStatus);
}

export function assertDecisionTransition(fromStatus: DecisionStatus, toStatus: DecisionStatus): void {
  if (!isValidDecisionTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid decision status transition: ${fromStatus} to ${toStatus}`);
  }
}

export function requiresApprovalForStatus(isPlayerImpacting: boolean, toStatus: DecisionStatus): boolean {
  return isPlayerImpacting && ['approved', 'delegated', 'done'].includes(toStatus);
}

export function assertApprovalBoundary(
  isPlayerImpacting: boolean,
  toStatus: DecisionStatus,
  approvalText?: string | null
): void {
  if (requiresApprovalForStatus(isPlayerImpacting, toStatus) && !approvalText?.trim()) {
    throw new Error('Explicit approval is required for player-impacting decisions');
  }
}
