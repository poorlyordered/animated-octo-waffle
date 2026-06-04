export const retryTargetTypes = ['worker_handoff', 'esi_sync_request'] as const;
export type RetryTargetType = (typeof retryTargetTypes)[number];

export const retryRequestStatuses = ['scheduled', 'claimed', 'completed', 'blocked', 'canceled'] as const;
export type RetryRequestStatus = (typeof retryRequestStatuses)[number];

export interface RetryPolicySummary {
  canSchedule: boolean;
  canCancel: boolean;
  activeScheduledLimit: number;
  cancelableStatuses: Array<'scheduled' | 'blocked'>;
  boundary: string;
}

export interface RetryExecutionResult {
  targetType: RetryTargetType;
  targetId: string;
  replacementTargetId: string;
  replacementTargetStatus: 'ready' | 'queued';
  workerId: string;
  summary: string;
  executedAt: string;
}

export interface RetryRequestSummary {
  id: string;
  targetType: RetryTargetType;
  targetId: string;
  status: RetryRequestStatus;
  reason: string;
  notBefore?: string;
  createdAt: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  blockedAt?: string;
  blockedReason?: string;
  canceledAt?: string;
  canceledBy?: string;
  cancelReason?: string;
  result?: RetryExecutionResult;
  policy: RetryPolicySummary;
  boundary: string;
}

export interface ScheduleRetryRequest {
  reason: string;
  notBefore?: string;
}

export interface CancelRetryRequest {
  reason: string;
}

export interface ScheduleRetryResponse {
  retry: RetryRequestSummary;
  duplicate: boolean;
}

export interface CancelRetryResponse {
  retry: RetryRequestSummary;
}

export interface RetryWorkerRequest {
  workerId: string;
}

export interface RetryWorkerReadyResponse {
  retries: RetryRequestSummary[];
}

export interface RetryWorkerResponse {
  retry: RetryRequestSummary;
}
