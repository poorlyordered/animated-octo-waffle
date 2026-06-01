import type {
  AutomationQueueItem,
  DecisionRecord,
  QueueProvenance,
  QueueStatus
} from '../../../packages/contracts/src/index';
import {
  approvalSnapshotFromRecord,
  automationQueueItemSchema,
  queueStatuses
} from '../../../packages/contracts/src/index';

export type QueueDocument = Record<string, unknown> & {
  _id?: { toString(): string };
  id?: string;
  provenance?: Record<string, unknown> | QueueProvenance;
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

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function boolValue(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

function normalizeStatus(value: unknown): QueueStatus {
  return queueStatuses.includes(value as QueueStatus) ? (value as QueueStatus) : 'queued';
}

function sourceReferences(value: unknown): QueueProvenance['sourceReferences'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const record = item as Record<string, unknown>;
    const title = optionalString(record.title);

    if (!title) {
      return [];
    }

    const reference: QueueProvenance['sourceReferences'][number] = { title };
    if (typeof record.url === 'string') {
      reference.url = record.url;
    }
    if (typeof record.sourceId === 'string') {
      reference.sourceId = record.sourceId;
    }

    return [reference];
  });
}

function normalizeProvenance(document: QueueDocument): QueueProvenance {
  const source = document.provenance ?? {};
  const confidence = typeof source.confidence === 'number' ? Math.min(Math.max(source.confidence, 0), 1) : undefined;
  const sourceCount = typeof source.sourceCount === 'number' && source.sourceCount >= 0 ? source.sourceCount : undefined;

  return {
    decisionId: stringValue(source.decisionId, stringValue(document.sourceDecisionId, 'unknown')),
    decisionStatus: 'approved',
    decisionApprovedAt: optionalString(source.decisionApprovedAt),
    sourceBriefId: optionalString(source.sourceBriefId),
    sourceRecommendation: optionalString(source.sourceRecommendation),
    confidence,
    sourceCount,
    sourceReferences: sourceReferences(source.sourceReferences),
    coverage: source.coverage && typeof source.coverage === 'object' ? (source.coverage as QueueProvenance['coverage']) : undefined,
    createdAt: isoDate(source.createdAt ?? document.createdAt)
  };
}

function normalizeApproval(value: unknown): AutomationQueueItem['approval'] {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const approvedAt = optionalString(record.approvedAt);

  if (!approvedAt) {
    return null;
  }

  const approval: NonNullable<AutomationQueueItem['approval']> = { approvedAt };
  if (typeof record.approvedBy === 'string') {
    approval.approvedBy = record.approvedBy;
  }
  if (typeof record.approvalText === 'string') {
    approval.approvalText = record.approvalText;
  }

  return approval;
}

export function queueProvenanceFromDecision(decision: DecisionRecord, createdAt: string): QueueProvenance {
  return {
    decisionId: decision.id,
    decisionStatus: 'approved',
    decisionApprovedAt: decision.approval?.approvedAt,
    sourceBriefId: decision.sourceBriefId,
    sourceRecommendation: decision.sourceRecommendation,
    confidence: decision.sourceProvenance.confidence,
    sourceCount: decision.sourceProvenance.sourceCount,
    sourceReferences: decision.sourceProvenance.sourceReferences,
    coverage: decision.sourceProvenance.coverage,
    createdAt
  };
}

export function normalizeAutomationQueueDocument(document: QueueDocument): AutomationQueueItem {
  const createdAt = isoDate(document.createdAt);
  const updatedAt = isoDate(document.updatedAt ?? document.createdAt);
  const failure = document.failure && typeof document.failure === 'object' ? (document.failure as AutomationQueueItem['failure']) : undefined;
  const output = document.output && typeof document.output === 'object' ? (document.output as AutomationQueueItem['output']) : undefined;
  const retry = document.retry && typeof document.retry === 'object' ? (document.retry as AutomationQueueItem['retry']) : undefined;

  return automationQueueItemSchema.parse({
    id: document.id ?? document._id?.toString() ?? 'unknown',
    corporationId: String(document.corporationId ?? ''),
    sourceDecisionId: stringValue(document.sourceDecisionId, 'unknown'),
    taskIntent: stringValue(document.taskIntent, 'Queued automation work'),
    inputSummary: stringValue(document.inputSummary, 'No input summary recorded.'),
    expectedOutput: stringValue(document.expectedOutput, 'No expected output recorded.'),
    status: normalizeStatus(document.status),
    requestedBy: optionalString(document.requestedBy),
    owner: optionalString(document.owner),
    isPlayerImpacting: boolValue(document.isPlayerImpacting),
    approval: normalizeApproval(document.approval),
    provenance: normalizeProvenance(document),
    attempts: Math.max(0, Math.trunc(numberValue(document.attempts))),
    lastAttemptedAt: document.lastAttemptedAt ? isoDate(document.lastAttemptedAt) : undefined,
    failure,
    output,
    retry,
    createdAt,
    updatedAt
  });
}

export function approvalSnapshotFromDecision(decision: DecisionRecord) {
  return approvalSnapshotFromRecord(decision.approval);
}
