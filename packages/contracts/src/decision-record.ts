import type { OperatingLegCoverage, SourceReference } from './command-brief.js';

export const decisionStatuses = ['proposed', 'approved', 'delegated', 'done', 'rejected'] as const;
export type DecisionStatus = (typeof decisionStatuses)[number];

export interface SourceProvenanceSnapshot {
  briefId: string;
  briefCreatedAt: string;
  focus: string;
  model: string;
  promptVersion: string;
  confidence: number;
  sourceCount: number;
  sourceReferences: SourceReference[];
  coverage: OperatingLegCoverage;
}

export interface DecisionStatusHistoryEntry {
  fromStatus?: DecisionStatus;
  toStatus: DecisionStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface ApprovalRecord {
  approvedAt: string;
  approvedBy?: string;
  approvalText: string;
}

export interface DecisionRecord {
  id: string;
  corporationId: string;
  sourceBriefId: string;
  sourceRecommendation: string;
  sourceProvenance: SourceProvenanceSnapshot;
  status: DecisionStatus;
  rationale: string;
  expectedResult: string;
  isPlayerImpacting: boolean;
  approval: ApprovalRecord | null;
  statusHistory: DecisionStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDecisionRecordRequest {
  sourceBriefId: string;
  sourceRecommendation: string;
  rationale: string;
  expectedResult: string;
  isPlayerImpacting: boolean;
}

export interface UpdateDecisionStatusRequest {
  status: DecisionStatus;
  note?: string;
  approvalText?: string;
}

export interface DecisionRecordListResponse {
  decisions: DecisionRecord[];
}

export interface DecisionRecordResponse {
  decision: DecisionRecord;
}
