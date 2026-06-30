export const operationsHealthStatuses = ['ready', 'degraded', 'blocked'] as const;
export type OperationsHealthStatus = (typeof operationsHealthStatuses)[number];

export const operationsHealthWarningSeverities = ['info', 'warning', 'critical'] as const;
export type OperationsHealthWarningSeverity = (typeof operationsHealthWarningSeverities)[number];

export const workerSecretStates = ['configured', 'fallback', 'missing'] as const;
export type WorkerSecretState = (typeof workerSecretStates)[number];

export type OperationsCommandApiKey =
  | 'command_brief'
  | 'numbers'
  | 'opportunity'
  | 'people'
  | 'decision_records'
  | 'automation_queue'
  | 'esi_sync';

export type OperationsIngestionKey = 'numbers_esi_sync' | 'people_ingestion' | 'opportunity_ingestion';

export type OperationsWorkerClass =
  | 'worker_handoff'
  | 'retry_worker'
  | 'esi_sync'
  | 'people_ingestion'
  | 'opportunity_ingestion';

export interface CommandApiHealthSummary {
  key: OperationsCommandApiKey;
  label: string;
  status: OperationsHealthStatus;
  evidence: string;
  lastUpdatedAt: string | null;
}

export interface IngestionHealthSummary {
  key: OperationsIngestionKey;
  label: string;
  status: OperationsHealthStatus;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  latestAt: string | null;
  evidence: string;
}

export interface RetryPostureSummary {
  scheduled: number;
  claimed: number;
  completed: number;
  blocked: number;
  canceled: number;
  workerHandoffTargets: number;
  esiSyncTargets: number;
  evidence: string;
}

export interface WorkerReadinessSummary {
  workerClass: OperationsWorkerClass;
  label: string;
  secretState: WorkerSecretState;
  status: OperationsHealthStatus;
  evidence: string;
}

export interface OperationsHealthWarning {
  key: string;
  severity: OperationsHealthWarningSeverity;
  message: string;
}

export interface OperationsHealthResponse {
  generatedAt: string;
  corporationId: string;
  overallStatus: OperationsHealthStatus;
  commandApis: CommandApiHealthSummary[];
  ingestion: IngestionHealthSummary[];
  retryPosture: RetryPostureSummary;
  workerReadiness: WorkerReadinessSummary[];
  warnings: OperationsHealthWarning[];
  boundary: string;
}
