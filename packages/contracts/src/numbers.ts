import type { OperatingLegCoverage, SourceReference } from './command-brief.js';

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

export interface NumbersSnapshotResponse {
  snapshot: NumbersSnapshot | null;
}
