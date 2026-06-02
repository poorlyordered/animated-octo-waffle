import type { RetryRequestSummary, RetryWorkerReadyResponse, RetryWorkerResponse, ScheduleRetryResponse } from '@gryyk/contracts';

export const handoffRetry: RetryRequestSummary = {
  id: 'retry-handoff-1',
  targetType: 'worker_handoff',
  targetId: 'handoff-browser-failed',
  status: 'scheduled',
  reason: 'Commander approved retry scheduling for failed worker handoff.',
  createdAt: '2026-06-02T17:30:00.000Z',
  boundary: 'Retry scheduled only. No worker was dispatched and no execution occurred.'
};

export const esiSyncRetry: RetryRequestSummary = {
  id: 'retry-esi-sync-1',
  targetType: 'esi_sync_request',
  targetId: 'sync-request-failed',
  status: 'scheduled',
  reason: 'Commander approved retry scheduling for failed ESI sync.',
  createdAt: '2026-06-02T17:31:00.000Z',
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
  boundary: 'Retry execution is worker-only and uses prior commander approval.'
};

export const handoffRetryResponse: ScheduleRetryResponse = {
  retry: handoffRetry,
  duplicate: false
};

export const esiSyncRetryResponse: ScheduleRetryResponse = {
  retry: esiSyncRetry,
  duplicate: false
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
