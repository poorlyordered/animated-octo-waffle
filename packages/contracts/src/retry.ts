export const retryTargetTypes = ['worker_handoff', 'esi_sync_request'] as const;
export type RetryTargetType = (typeof retryTargetTypes)[number];

export const retryRequestStatuses = ['scheduled'] as const;
export type RetryRequestStatus = (typeof retryRequestStatuses)[number];

export interface RetryRequestSummary {
  id: string;
  targetType: RetryTargetType;
  targetId: string;
  status: RetryRequestStatus;
  reason: string;
  notBefore?: string;
  createdAt: string;
  boundary: string;
}

export interface ScheduleRetryRequest {
  reason: string;
  notBefore?: string;
}

export interface ScheduleRetryResponse {
  retry: RetryRequestSummary;
  duplicate: boolean;
}
