import type {
  CancelRetryResponse,
  RetryPolicySummary,
  RetryRequestSummary,
  RetryWorkerReadyResponse,
  RetryWorkerResponse,
  ScheduleRetryResponse
} from '@gryyk/contracts';

export const cancelableRetryPolicy: RetryPolicySummary = {
  canSchedule: false,
  canCancel: true,
  canReschedule: true,
  activeScheduledLimit: 1,
  cancelableStatuses: ['scheduled', 'blocked'],
  boundary:
    'Retry policy: one active scheduled retry is allowed per target. Scheduled and blocked retries can be canceled; claimed and completed retries cannot.'
};

export const finalRetryPolicy: RetryPolicySummary = {
  ...cancelableRetryPolicy,
  canSchedule: true,
  canCancel: false,
  canReschedule: false
};

export const blockedRetryPolicy: RetryPolicySummary = {
  ...cancelableRetryPolicy,
  canReschedule: false
};

export const handoffRetry: RetryRequestSummary = {
  id: 'retry-handoff-1',
  targetType: 'worker_handoff',
  targetId: 'handoff-browser-failed',
  status: 'scheduled',
  reason: 'Commander approved retry scheduling for failed worker handoff.',
  createdAt: '2026-06-02T17:30:00.000Z',
  policy: cancelableRetryPolicy,
  boundary: 'Retry scheduled only. No worker was dispatched and no execution occurred.'
};

export const esiSyncRetry: RetryRequestSummary = {
  id: 'retry-esi-sync-1',
  targetType: 'esi_sync_request',
  targetId: 'sync-request-failed',
  status: 'scheduled',
  reason: 'Commander approved retry scheduling for failed ESI sync.',
  createdAt: '2026-06-02T17:31:00.000Z',
  policy: cancelableRetryPolicy,
  boundary: 'Retry scheduled only. No worker was dispatched and no execution occurred.'
};

export const completedHandoffRetry: RetryRequestSummary = {
  ...handoffRetry,
  id: 'retry-handoff-completed',
  status: 'completed',
  claimedBy: 'retry-worker-1',
  claimedAt: '2026-06-02T17:32:00.000Z',
  completedAt: '2026-06-02T17:33:00.000Z',
  result: {
    targetType: 'worker_handoff',
    targetId: 'handoff-browser-failed',
    replacementTargetId: 'handoff-browser-retry-ready',
    replacementTargetStatus: 'ready',
    workerId: 'retry-worker-1',
    summary: 'Prepared replacement worker handoff from commander-approved retry.',
    executedAt: '2026-06-02T17:33:00.000Z'
  },
  policy: finalRetryPolicy,
  boundary: 'Retry execution is worker-only and uses prior commander approval.'
};

export const blockedEsiSyncRetry: RetryRequestSummary = {
  ...esiSyncRetry,
  id: 'retry-esi-sync-blocked',
  status: 'blocked',
  claimedBy: 'retry-worker-1',
  claimedAt: '2026-06-02T17:34:00.000Z',
  blockedAt: '2026-06-02T17:35:00.000Z',
  blockedReason: 'Active ESI consent is required before this sync retry can be queued.',
  policy: blockedRetryPolicy,
  boundary: 'Retry execution is worker-only and uses prior commander approval.'
};

export const canceledHandoffRetry: RetryRequestSummary = {
  ...handoffRetry,
  id: 'retry-handoff-canceled',
  status: 'canceled',
  canceledAt: '2026-06-02T17:36:00.000Z',
  canceledBy: 'commander',
  cancelReason: 'Commander canceled retry after policy review.',
  policy: finalRetryPolicy,
  boundary: 'Retry canceled by commander. No worker was dispatched and no execution occurred.'
};

export const handoffRetryResponse: ScheduleRetryResponse = {
  retry: handoffRetry,
  duplicate: false
};

export const rescheduledHandoffRetry: RetryRequestSummary = {
  ...handoffRetry,
  id: 'retry-handoff-rescheduled',
  reason: 'Commander deferred scheduled worker handoff retry for later review.',
  notBefore: '2026-06-02T18:30:00.000Z'
};

export const rescheduledEsiSyncRetry: RetryRequestSummary = {
  ...esiSyncRetry,
  id: 'retry-esi-sync-rescheduled',
  reason: 'Commander deferred scheduled ESI sync retry for later review.',
  notBefore: '2026-06-02T18:31:00.000Z'
};

export const esiSyncRetryResponse: ScheduleRetryResponse = {
  retry: esiSyncRetry,
  duplicate: false
};

export const handoffRetryCancelResponse: CancelRetryResponse = {
  retry: canceledHandoffRetry
};

export const esiSyncRetryCancelResponse: CancelRetryResponse = {
  retry: {
    ...canceledHandoffRetry,
    id: 'retry-esi-sync-canceled',
    targetType: 'esi_sync_request',
    targetId: 'sync-request-failed',
    reason: 'Commander approved retry scheduling for failed ESI sync.'
  }
};

export const canceledEsiSyncRetry: RetryRequestSummary = esiSyncRetryCancelResponse.retry;

export const handoffRetryRescheduleResponse = {
  retry: rescheduledHandoffRetry
};

export const esiSyncRetryRescheduleResponse = {
  retry: rescheduledEsiSyncRetry
};

export const retryWorkerReadyResponse: RetryWorkerReadyResponse = {
  retries: [handoffRetry, esiSyncRetry]
};

export const retryWorkerHandoffCompletedResponse: RetryWorkerResponse = {
  retry: completedHandoffRetry
};

export const retryWorkerEsiBlockedResponse: RetryWorkerResponse = {
  retry: blockedEsiSyncRetry
};
