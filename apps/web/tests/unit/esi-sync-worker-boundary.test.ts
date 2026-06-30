import {
  assertSafeEsiSyncWorkerResult,
  isClaimableEsiSyncWorkerDomain,
  isExternallyCompletableEsiSyncWorkerDomain,
  isRunnableEsiSyncWorkerDomain
} from '../../../../netlify/functions/esi-sync-worker';

describe('ESI sync worker domain boundary', () => {
  it('runs only Numbers sync requests in the People worker planning slice', () => {
    expect(isRunnableEsiSyncWorkerDomain('numbers')).toBe(true);
    expect(isRunnableEsiSyncWorkerDomain('people')).toBe(false);
    expect(isRunnableEsiSyncWorkerDomain('opportunity')).toBe(false);
  });

  it('lets trusted workers claim Numbers and People ESI requests only', () => {
    expect(isClaimableEsiSyncWorkerDomain('numbers')).toBe(true);
    expect(isClaimableEsiSyncWorkerDomain('people')).toBe(true);
    expect(isClaimableEsiSyncWorkerDomain('opportunity')).toBe(false);
  });

  it('accepts external completion only for People ESI requests', () => {
    expect(isExternallyCompletableEsiSyncWorkerDomain('numbers')).toBe(false);
    expect(isExternallyCompletableEsiSyncWorkerDomain('people')).toBe(true);
    expect(isExternallyCompletableEsiSyncWorkerDomain('opportunity')).toBe(false);
  });

  it('rejects unsafe worker result material before external completion', () => {
    expect(() =>
      assertSafeEsiSyncWorkerResult({
        sourceCount: 1,
        summary: 'People sync completed.',
        sectionStatuses: [{ key: 'membership', status: 'processed' }],
        failures: []
      })
    ).not.toThrow();

    expect(() =>
      assertSafeEsiSyncWorkerResult({
        sourceCount: 1,
        summary: 'accessToken leaked from worker',
        sectionStatuses: [{ key: 'membership', status: 'processed' }],
        failures: []
      })
    ).toThrow('unsafe material');
  });
});
