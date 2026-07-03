import type { EsiSyncDomain } from './esi-sync.js';

export const intelligenceRefreshDomains = ['numbers', 'opportunity', 'people'] as const;
export type IntelligenceRefreshDomain = (typeof intelligenceRefreshDomains)[number];

export const intelligenceRefreshModes = ['evaluate_existing', 'prepare_sources', 'full_refresh'] as const;
export type IntelligenceRefreshMode = (typeof intelligenceRefreshModes)[number];

export const intelligenceRefreshRunStatuses = [
  'queued',
  'running',
  'waiting_for_evaluation',
  'evaluating',
  'completed',
  'completed_with_warnings',
  'failed',
  'cancelled'
] as const;
export type IntelligenceRefreshRunStatus = (typeof intelligenceRefreshRunStatuses)[number];

export const intelligenceRefreshStepStatuses = ['queued', 'prepared', 'running', 'completed', 'failed', 'blocked', 'skipped'] as const;
export type IntelligenceRefreshStepStatus = (typeof intelligenceRefreshStepStatuses)[number];

export const intelligenceRefreshEvaluationStatuses = ['not_ready', 'ready', 'running', 'completed', 'failed'] as const;
export type IntelligenceRefreshEvaluationStatus = (typeof intelligenceRefreshEvaluationStatuses)[number];

export type IntelligenceRefreshPreparedRequestType =
  | 'esi_sync_request'
  | 'people_ingestion_request'
  | 'opportunity_ingestion_request'
  | 'brain_run';

export interface IntelligenceRefreshPreparedRequest {
  type: IntelligenceRefreshPreparedRequestType;
  id: string;
}

export interface IntelligenceRefreshSectionStatus {
  key: string;
  status: string;
}

export interface IntelligenceRefreshFailureSummary {
  reason: string;
  failedAt: string;
}

export interface IntelligenceRefreshStepResult {
  sourceCount: number;
  summary: string;
  sectionStatuses: IntelligenceRefreshSectionStatus[];
  linkedRequest?: IntelligenceRefreshPreparedRequest;
  warnings: string[];
}

export interface IntelligenceRefreshDomainStep {
  id: string;
  domain: IntelligenceRefreshDomain;
  status: IntelligenceRefreshStepStatus;
  preparedRequest?: IntelligenceRefreshPreparedRequest;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  failedAt?: string;
  skippedAt?: string;
  sourceCount?: number;
  freshness?: string;
  sectionStatuses: IntelligenceRefreshSectionStatus[];
  failure?: IntelligenceRefreshFailureSummary;
  warnings: string[];
}

export interface IntelligenceRefreshEvaluation {
  status: IntelligenceRefreshEvaluationStatus;
  brainRunId?: string;
  commandBriefId?: string;
  model?: string;
  provider?: string;
  promptVersion?: string;
  confidence?: number;
  sourceSummary: string[];
  createdAt?: string;
  completedAt?: string;
  failedAt?: string;
  failure?: string;
}

export interface IntelligenceRefreshPolicySummary {
  allowPartialEvaluation: boolean;
  boundary: string;
}

export interface IntelligenceRefreshReadinessItem {
  key: string;
  label: string;
  status: 'ready' | 'blocked' | 'warning' | 'unknown';
  reason: string;
  requiredAction?: string;
  safeDetails: string[];
}

export interface IntelligenceRefreshReadinessResponse {
  overallStatus: 'ready' | 'blocked' | 'degraded';
  items: IntelligenceRefreshReadinessItem[];
  boundary: string;
  createdAt: string;
}

export interface IntelligenceRefreshArtifactLink {
  label: string;
  type: IntelligenceRefreshPreparedRequestType | 'command_brief' | 'brain_run';
  id: string;
}

export interface IntelligenceRefreshTimelineItem {
  stepId: string;
  domain: IntelligenceRefreshDomain;
  technicalStatus: IntelligenceRefreshStepStatus;
  statusLabel: string;
  statusTone: 'ready' | 'processing' | 'warning' | 'blocked' | 'failed' | 'complete';
  owner?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  skippedAt?: string;
  blocker?: string;
  failure?: string;
  warnings: string[];
  artifactLinks: IntelligenceRefreshArtifactLink[];
  canRetry: boolean;
  canSkip: boolean;
  nextAction?: string;
}

export interface IntelligenceRefreshRunEvent {
  id: string;
  runId: string;
  corporationId: string;
  eventType:
    | 'run_created'
    | 'readiness_checked'
    | 'step_prepared'
    | 'step_claimed'
    | 'step_completed'
    | 'step_failed'
    | 'step_retry_requested'
    | 'step_skipped'
    | 'evaluation_started'
    | 'evaluation_completed'
    | 'evaluation_failed';
  actor: string;
  stepId?: string;
  domain?: IntelligenceRefreshDomain;
  message: string;
  safeDetails: string[];
  artifactLinks: IntelligenceRefreshArtifactLink[];
  createdAt: string;
}

export interface IntelligenceRefreshRunSummary {
  id: string;
  corporationId: string;
  requestedBy: string;
  mode: IntelligenceRefreshMode;
  requestedDomains: IntelligenceRefreshDomain[];
  status: IntelligenceRefreshRunStatus;
  steps: IntelligenceRefreshDomainStep[];
  evaluation: IntelligenceRefreshEvaluation;
  duplicateOf?: string;
  policy: IntelligenceRefreshPolicySummary;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  failure?: IntelligenceRefreshFailureSummary;
  warnings: string[];
  boundary: string;
}

export interface CreateIntelligenceRefreshRunRequest {
  domains: IntelligenceRefreshDomain[];
  mode?: IntelligenceRefreshMode;
  reason?: string;
}

export interface IntelligenceRefreshRunResponse {
  run: IntelligenceRefreshRunSummary;
}

export interface IntelligenceRefreshRunDetailResponse extends IntelligenceRefreshRunResponse {
  timeline: IntelligenceRefreshTimelineItem[];
  events: IntelligenceRefreshRunEvent[];
  boundary: string;
}

export interface CreateIntelligenceRefreshRunResponse extends IntelligenceRefreshRunResponse {
  duplicate: boolean;
}

export interface IntelligenceRefreshRunListResponse {
  runs: IntelligenceRefreshRunSummary[];
}

export interface IntelligenceRefreshStepRetryRequest {
  reason: string;
}

export interface IntelligenceRefreshStepRetryResponse extends IntelligenceRefreshRunResponse {
  event: IntelligenceRefreshRunEvent;
  boundary: string;
}

export interface IntelligenceRefreshStepSkipRequest {
  reason: string;
}

export interface IntelligenceRefreshStepSkipResponse extends IntelligenceRefreshRunResponse {
  event: IntelligenceRefreshRunEvent;
  boundary: string;
}

export interface IntelligenceRefreshWorkerListResponse {
  steps: Array<{
    runId: string;
    step: IntelligenceRefreshDomainStep;
  }>;
}

export interface IntelligenceRefreshWorkerClaimRequest {
  workerId: string;
}

export interface IntelligenceRefreshWorkerCompleteRequest {
  workerId: string;
  result: IntelligenceRefreshStepResult;
}

export interface IntelligenceRefreshWorkerFailRequest {
  workerId: string;
  reason: string;
}

export interface IntelligenceRefreshWorkerSkipRequest {
  workerId: string;
  reason: string;
}

export interface IntelligenceRefreshWorkerEvaluateRequest {
  workerId: string;
  allowPartial?: boolean;
  reason?: string;
}

export type IntelligenceRefreshEsiDomain = Extract<IntelligenceRefreshDomain, EsiSyncDomain>;
