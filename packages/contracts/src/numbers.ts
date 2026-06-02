import type { OperatingLegCoverage, SourceReference } from './command-brief.js';
import type { AutomationQueueItem } from './automation-queue.js';
import type { DecisionRecord } from './decision-record.js';
import type { EsiSyncRequestStatus, EsiSyncSectionStatusSummary } from './esi-sync.js';

export const numbersSectionKeys = ['wallet', 'assets', 'logistics', 'market', 'activity'] as const;
export type NumbersSectionKey = (typeof numbersSectionKeys)[number];

export const numbersSectionStatuses = ['healthy', 'watch', 'critical', 'stale', 'missing'] as const;
export type NumbersSectionStatus = (typeof numbersSectionStatuses)[number];

export const numbersMetricTrends = ['up', 'down', 'flat', 'unknown'] as const;
export type NumbersMetricTrend = (typeof numbersMetricTrends)[number];

export const numbersMetricSeverities = ['info', 'watch', 'critical'] as const;
export type NumbersMetricSeverity = (typeof numbersMetricSeverities)[number];

export interface NumbersMetric {
  label: string;
  value: string;
  unit?: string;
  trend?: NumbersMetricTrend;
  severity?: NumbersMetricSeverity;
}

export interface NumbersSection {
  key: NumbersSectionKey;
  label: string;
  status: NumbersSectionStatus;
  summary: string;
  metrics: NumbersMetric[];
  updatedAt?: string;
  staleReason?: string;
  missingReason?: string;
}

export interface NumbersFollowUpCandidate {
  id: string;
  title: string;
  rationale: string;
  suggestedPath: 'decision' | 'queue';
  isPlayerImpacting: boolean;
  relatedSection?: NumbersSectionKey;
}

export interface NumbersProvenance {
  sourceCount: number;
  sourceReferences: SourceReference[];
  confidence?: number;
  model?: string;
  promptVersion?: string;
  createdAt: string;
}

export interface NumbersSnapshot {
  id: string;
  corporationId: string;
  focus: string;
  sections: NumbersSection[];
  observations: string[];
  risks: string[];
  opportunities: string[];
  followUps: NumbersFollowUpCandidate[];
  provenance: NumbersProvenance;
  coverage?: OperatingLegCoverage;
  createdAt: string;
  updatedAt: string;
}

export type NumbersLiveProvenanceMode = 'live_sync' | 'historical_snapshot' | 'unavailable';

export interface NumbersLiveProvenance {
  mode: NumbersLiveProvenanceMode;
  syncRequestId?: string;
  snapshotId?: string;
  status?: EsiSyncRequestStatus;
  requestedAt?: string;
  completedAt?: string;
  snapshotCreatedAt?: string;
  sourceCount: number;
  sectionStatuses: EsiSyncSectionStatusSummary[];
  message: string;
  boundary: string;
}

export interface NumbersSnapshotResponse {
  snapshot: NumbersSnapshot | null;
  liveProvenance?: NumbersLiveProvenance;
}

export interface NumbersFollowUpOrigin {
  sourceType: 'numbers_follow_up';
  snapshotId: string;
  candidateId: string;
  relatedSection?: NumbersSectionKey;
  suggestedPath: NumbersFollowUpCandidate['suggestedPath'];
}

export interface CreateNumbersFollowUpDecisionRequest {
  snapshotId: string;
  expectedResult?: string;
}

export interface NumbersFollowUpDecisionResponse {
  decision: DecisionRecord;
  origin: NumbersFollowUpOrigin;
  duplicate?: boolean;
  message: string;
}

export interface CreateNumbersFollowUpQueueRequest {
  snapshotId: string;
  sourceDecisionId: string;
  taskIntent: string;
  inputSummary: string;
  expectedOutput: string;
  owner?: string;
}

export interface NumbersFollowUpQueueResponse {
  queueItem: AutomationQueueItem;
  origin: NumbersFollowUpOrigin;
  duplicate?: boolean;
  message: string;
}
