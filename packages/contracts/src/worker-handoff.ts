import type { OperatingLegCoverage, SourceReference } from './command-brief.js';

export const workerHandoffStatuses = ['ready', 'claimed', 'completed', 'blocked', 'failed', 'cancelled'] as const;
export type WorkerHandoffStatus = (typeof workerHandoffStatuses)[number];

export const activeWorkerHandoffStatuses = ['ready', 'claimed', 'blocked'] as const;
export type ActiveWorkerHandoffStatus = (typeof activeWorkerHandoffStatuses)[number];

export interface HandoffPayloadSummary {
  taskIntent: string;
  inputSummary: string;
  expectedOutput: string;
  sourceDecisionId: string;
  sourceBriefId?: string;
  sourceReferences: SourceReference[];
  coverage?: OperatingLegCoverage;
}

export interface HandoffFailure {
  message: string;
  code?: string;
  failedAt: string;
  workerId?: string;
}

export interface WorkerProgressEvent {
  message: string;
  code?: string;
  createdAt: string;
  workerId: string;
}

export interface WorkerCompletionResult {
  summary: string;
  artifactRefs: string[];
  completedAt: string;
  workerId: string;
}

export interface WorkerHandoff {
  id: string;
  corporationId: string;
  queueItemId: string;
  sourceDecisionId: string;
  status: WorkerHandoffStatus;
  payloadSummary: HandoffPayloadSummary;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  progress: WorkerProgressEvent[];
  result?: WorkerCompletionResult;
  failure?: HandoffFailure;
}

export interface WorkerHandoffSummary {
  id: string;
  status: WorkerHandoffStatus;
  createdAt: string;
  updatedAt: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  progress: WorkerProgressEvent[];
  result?: WorkerCompletionResult;
  failure?: HandoffFailure;
}

export interface PrepareWorkerHandoffRequest {
  note?: string;
}

export interface WorkerHandoffResponse {
  handoff: WorkerHandoff;
}

export interface WorkerHandoffListResponse {
  handoffs: WorkerHandoff[];
}

export interface WorkerClaimRequest {
  workerId: string;
}

export interface WorkerProgressRequest {
  workerId: string;
  message: string;
  code?: string;
}

export interface WorkerCompleteRequest {
  workerId: string;
  summary: string;
  artifactRefs?: string[];
}

export interface WorkerFailRequest {
  workerId: string;
  message: string;
  code?: string;
}
