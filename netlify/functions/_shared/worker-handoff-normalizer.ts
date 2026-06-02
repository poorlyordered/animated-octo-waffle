import type {
  AutomationQueueItem,
  HandoffPayloadSummary,
  WorkerHandoff,
  WorkerProgressEvent,
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
  progress?: WorkerProgressEvent[];
  result?: unknown;
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
    claimedBy: stringValue(document.claimedBy) || undefined,
    claimedAt: optionalIsoDate(document.claimedAt),
    completedAt: optionalIsoDate(document.completedAt),
    progress: Array.isArray(document.progress) ? document.progress : [],
  result: document.result,
    failure: document.failure,
    retry: document.retry
  });
}

export function workerHandoffSummaryFromHandoff(handoff: WorkerHandoff): WorkerHandoffSummary {
  return workerHandoffSummarySchema.parse({
    id: handoff.id,
    status: handoff.status,
    createdAt: handoff.createdAt,
    updatedAt: handoff.updatedAt,
    claimedBy: handoff.claimedBy,
    claimedAt: handoff.claimedAt,
    completedAt: handoff.completedAt,
    progress: handoff.progress,
    result: handoff.result,
    failure: handoff.failure,
    retry: handoff.retry
  });
}
