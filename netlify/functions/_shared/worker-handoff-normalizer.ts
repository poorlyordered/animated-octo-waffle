import type {
  AutomationQueueItem,
  HandoffPayloadSummary,
  WorkerHandoff,
  WorkerHandoffStatus,
  WorkerHandoffSummary
} from '../../../packages/contracts/src/index';
import {
  workerHandoffSchema,
  workerHandoffStatuses,
  workerHandoffSummarySchema
} from '../../../packages/contracts/src/index';

export type WorkerHandoffDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
  payloadSummary?: unknown;
  failure?: unknown;
};

function isoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date(0).toISOString();
}

function optionalIsoDate(value: unknown): string | undefined {
  return value ? isoDate(value) : undefined;
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function normalizeStatus(value: unknown): WorkerHandoffStatus {
  return workerHandoffStatuses.includes(value as WorkerHandoffStatus) ? (value as WorkerHandoffStatus) : 'ready';
}

export function payloadSummaryFromQueueItem(queueItem: AutomationQueueItem): HandoffPayloadSummary {
  return {
    taskIntent: queueItem.taskIntent,
    inputSummary: queueItem.inputSummary,
    expectedOutput: queueItem.expectedOutput,
    sourceDecisionId: queueItem.sourceDecisionId,
    sourceBriefId: queueItem.provenance.sourceBriefId,
    sourceReferences: queueItem.provenance.sourceReferences,
    coverage: queueItem.provenance.coverage
  };
}

export function normalizeWorkerHandoffDocument(document: WorkerHandoffDocument): WorkerHandoff {
  const createdAt = isoDate(document.createdAt);
  const updatedAt = isoDate(document.updatedAt ?? document.createdAt);

  return workerHandoffSchema.parse({
    id: document.id ?? document._id?.toString() ?? 'unknown',
    corporationId: stringValue(document.corporationId),
    queueItemId: stringValue(document.queueItemId),
    sourceDecisionId: stringValue(document.sourceDecisionId),
    status: normalizeStatus(document.status),
    payloadSummary: document.payloadSummary,
    createdBy: stringValue(document.createdBy, 'commander'),
    createdAt,
    updatedAt,
    claimedAt: optionalIsoDate(document.claimedAt),
    completedAt: optionalIsoDate(document.completedAt),
    failure: document.failure
  });
}

export function workerHandoffSummaryFromHandoff(handoff: WorkerHandoff): WorkerHandoffSummary {
  return workerHandoffSummarySchema.parse({
    id: handoff.id,
    status: handoff.status,
    createdAt: handoff.createdAt,
    updatedAt: handoff.updatedAt,
    failure: handoff.failure
  });
}
