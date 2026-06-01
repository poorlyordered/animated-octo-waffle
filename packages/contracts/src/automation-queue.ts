import type { OperatingLegCoverage, SourceReference } from './command-brief.js';
import type { ApprovalRecord } from './decision-record.js';
import type { WorkerHandoffSummary } from './worker-handoff.js';

export const queueStatuses = ['queued', 'blocked', 'running', 'failed', 'completed', 'canceled'] as const;
export type QueueStatus = (typeof queueStatuses)[number];

export interface QueueProvenance {
  decisionId: string;
  decisionStatus: 'approved';
  decisionApprovedAt?: string;
  sourceBriefId?: string;
  sourceRecommendation?: string;
  confidence?: number;
  sourceCount?: number;
  sourceReferences: SourceReference[];
  coverage?: OperatingLegCoverage;
  createdAt: string;
}

export interface ApprovalSnapshot {
  approvedAt: string;
  approvedBy?: string;
  approvalText?: string;
}

export interface QueueFailure {
  message: string;
  code?: string;
  failedAt: string;
}

export interface QueueOutput {
  summary: string;
  completedAt?: string;
  artifactRefs?: string[];
}

export interface QueueRetry {
  eligible: boolean;
  notBefore?: string;
}

export interface AutomationQueueItem {
  id: string;
  corporationId: string;
  sourceDecisionId: string;
  taskIntent: string;
  inputSummary: string;
  expectedOutput: string;
  status: QueueStatus;
  requestedBy?: string;
  owner?: string;
  isPlayerImpacting: boolean;
  approval: ApprovalSnapshot | null;
  provenance: QueueProvenance;
  attempts: number;
  lastAttemptedAt?: string;
  failure?: QueueFailure;
  output?: QueueOutput;
  retry?: QueueRetry;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationQueueItemRequest {
  sourceDecisionId: string;
  taskIntent: string;
  inputSummary: string;
  expectedOutput: string;
  owner?: string;
}

export interface AutomationQueueListResponse {
  queueItems: AutomationQueueItem[];
}

export interface AutomationQueueItemResponse {
  queueItem: AutomationQueueItem;
  handoff?: WorkerHandoffSummary;
}

export function approvalSnapshotFromRecord(approval: ApprovalRecord | null): ApprovalSnapshot | null {
  if (!approval) {
    return null;
  }

  const snapshot: ApprovalSnapshot = {
    approvedAt: approval.approvedAt,
    approvalText: approval.approvalText
  };

  if (typeof approval.approvedBy === 'string') {
    snapshot.approvedBy = approval.approvedBy;
  }

  return snapshot;
}
