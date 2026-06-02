import type { RetryRequestSummary, ScheduleRetryResponse } from '@gryyk/contracts';

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

export const handoffRetryResponse: ScheduleRetryResponse = {
  retry: handoffRetry,
  duplicate: false
};

export const esiSyncRetryResponse: ScheduleRetryResponse = {
  retry: esiSyncRetry,
  duplicate: false
};
