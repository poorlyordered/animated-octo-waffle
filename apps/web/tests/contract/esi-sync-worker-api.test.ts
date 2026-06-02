import {
  esiSyncWorkerClaimRequestSchema,
  esiSyncWorkerFailRequestSchema,
  esiSyncWorkerListResponseSchema,
  esiSyncWorkerRequestResponseSchema,
  esiSyncWorkerRunRequestSchema
} from '@gryyk/contracts';

const workerSummary = {
  id: 'sync-1',
  corporationId: '123456789',
  domain: 'numbers',
  status: 'completed',
  requiredScopes: ['esi-wallet.read_corporation_wallets.v1'],
  requestedAt: '2026-06-02T12:45:00.000Z',
  claimedBy: 'numbers-worker-1',
  claimedAt: '2026-06-02T13:00:00.000Z',
  completedAt: '2026-06-02T13:01:00.000Z',
  result: {
    snapshotId: 'numbers-snapshot-1',
    sourceCount: 4,
    summary: 'Numbers ESI sync completed with 5 sections.',
    sectionStatuses: [{ key: 'wallet', status: 'healthy' }],
    failures: []
  }
};

describe('ESI sync worker API contract', () => {
  it('accepts worker request schemas', () => {
    expect(esiSyncWorkerClaimRequestSchema.parse({ workerId: 'numbers-worker-1' })).toEqual({
      workerId: 'numbers-worker-1'
    });
    expect(esiSyncWorkerRunRequestSchema.parse({ workerId: 'numbers-worker-1' })).toEqual({
      workerId: 'numbers-worker-1'
    });
    expect(esiSyncWorkerFailRequestSchema.parse({ workerId: 'numbers-worker-1', reason: 'ESI returned 403' })).toEqual({
      workerId: 'numbers-worker-1',
      reason: 'ESI returned 403'
    });
  });

  it('accepts worker-safe list and completion responses', () => {
    expect(esiSyncWorkerListResponseSchema.parse({ syncRequests: [workerSummary] }).syncRequests).toHaveLength(1);
    expect(esiSyncWorkerRequestResponseSchema.parse({ syncRequest: workerSummary }).syncRequest.result?.snapshotId).toBe(
      'numbers-snapshot-1'
    );
  });

  it('keeps token and execution handles out of worker-safe responses', () => {
    const body = JSON.stringify({ syncRequest: workerSummary });

    expect(body).not.toContain('accessToken');
    expect(body).not.toContain('refreshToken');
    expect(body).not.toContain('sealed');
    expect(body).not.toContain('client-secret');
    expect(body).not.toContain('dispatchTarget');
    expect(body).not.toContain('retrySchedule');
    expect(body).not.toContain('walletAction');
  });
});
