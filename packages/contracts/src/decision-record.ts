import type { OperatingLegCoverage, SourceReference } from './command-brief.js';

export const decisionStatuses = ['proposed', 'approved', 'delegated', 'done', 'rejected'] as const;
export type DecisionStatus = (typeof decisionStatuses)[number];

export const decisionRecordSourceFilters = ['opportunity', 'numbers', 'people'] as const;
export type DecisionRecordSourceFilter = (typeof decisionRecordSourceFilters)[number];

export const decisionRecordPageSizes = [3, 5, 10] as const;
export type DecisionRecordPageSize = (typeof decisionRecordPageSizes)[number];

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

export interface DecisionSourceContext {
  sourceType: 'research_brief' | 'numbers_follow_up' | 'people_follow_up' | 'commander_chat';
  snapshotId?: string;
  candidateId?: string;
  followUpId?: string;
  memberProfileId?: string;
  chatSessionId?: string;
  chatMessageId?: string;
  draftDecisionId?: string;
  relatedSection?: string;
  suggestedPath?: string;
}

export interface DecisionRecord {
  id: string;
  corporationId: string;
  sourceBriefId: string;
  sourceRecommendation: string;
  sourceProvenance: SourceProvenanceSnapshot;
  sourceContext?: DecisionSourceContext;
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
  pagination: {
    page: number;
    pageSize: DecisionRecordPageSize;
    totalItems: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
  };
}

export interface DecisionRecordResponse {
  decision: DecisionRecord;
}
