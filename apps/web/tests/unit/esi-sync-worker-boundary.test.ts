import { isRunnableEsiSyncWorkerDomain } from '../../../../netlify/functions/esi-sync-worker';

describe('ESI sync worker domain boundary', () => {
  it('runs only Numbers sync requests in the consent expansion slice', () => {
    expect(isRunnableEsiSyncWorkerDomain('numbers')).toBe(true);
    expect(isRunnableEsiSyncWorkerDomain('people')).toBe(false);
    expect(isRunnableEsiSyncWorkerDomain('opportunity')).toBe(false);
  });
});
