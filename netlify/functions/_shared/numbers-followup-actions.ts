import type {
  AutomationQueueItem,
  DecisionRecord,
  NumbersApprovalHandoff,
  NumbersFollowUpOrigin
} from '../../../packages/contracts/src/index';

const unsafeRequestFields = new Set([
  'corporationId',
  'approval',
  'approvalHandoff',
  'approvalText',
  'approvedAt',
  'decisionStatus',
  'queueItemId',
  'queueReady',
  'queueStatus',
  'sourceProvenance',
  'provenance',
  'sourceReferences',
  'confidence',
  'model',
  'promptVersion',
  'execute',
  'executeNow',
  'execution',
  'dispatch',
  'dispatchTarget',
  'workerId',
  'workerSecret',
  'retry',
  'retryAt',
  'walletAction',
  'assetAction',
  'eveWrite',
  'contractAction',
  'externalService'
]);

const unsafeStatusRequestFields = new Set(
  [...unsafeRequestFields].filter((field) => field !== 'approvalText')
);

const approvalBoundary = 'Approval handoff only. No worker was dispatched and no execution occurred.';
const queueBoundary = 'Queued work handoff only. No worker was dispatched and no execution occurred.';

export function assertNoUnsafeNumbersFollowUpFields(value: unknown): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const unsafeField = Object.keys(record).find((key) => unsafeRequestFields.has(key));

  if (unsafeField) {
    throw new Error(`Unsafe Numbers follow-up action field rejected: ${unsafeField}`);
  }
}

export function assertNoUnsafeNumbersFollowUpStatusFields(value: unknown): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const unsafeField = Object.keys(record).find((key) => unsafeStatusRequestFields.has(key));

  if (unsafeField) {
    throw new Error(`Unsafe Numbers follow-up status field rejected: ${unsafeField}`);
  }
}

export function numbersApprovalHandoff(
  origin: NumbersFollowUpOrigin,
  decision: DecisionRecord,
  options: { queueItem?: AutomationQueueItem; duplicate?: boolean } = {}
): NumbersApprovalHandoff {
  const queueItem = options.queueItem;
  const queueReady = decision.status === 'approved';
  const approvalRequired = decision.status === 'proposed';

  const handoff: NumbersApprovalHandoff = {
    candidateId: origin.candidateId,
    snapshotId: origin.snapshotId,
    decisionId: decision.id,
    decisionStatus: decision.status,
    approvalRequired,
    queueReady,
    duplicate: options.duplicate || undefined,
    message: queueItem
      ? `${options.duplicate ? 'Existing queued work is linked' : 'Queued work is linked'} to approved Numbers decision ${decision.id}.`
      : queueReady
        ? `Decision ${decision.id} is approved and ready for queued work.`
        : decision.status === 'rejected'
          ? `Decision ${decision.id} is rejected. Queued work cannot be created from this decision.`
          : `Decision ${decision.id} is ${decision.status}. Approval is required before queued work can be created.`,
    boundary: queueItem ? queueBoundary : approvalBoundary
  };

  if (queueItem) {
    handoff.queueItemId = queueItem.id;
    handoff.queueStatus = queueItem.status;
  }

  return handoff;
}
