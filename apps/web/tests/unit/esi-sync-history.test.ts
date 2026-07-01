import { latestNumbersLiveProvenance, syncHistoryItems } from '../../../../netlify/functions/_shared/esi-sync-history';
import type { EsiSyncRequestDocument } from '../../../../netlify/functions/_shared/esi-sync-request-store';
import { numbersSnapshot } from '../fixtures/numbers';

const completedSync: EsiSyncRequestDocument = {
  id: 'sync-completed',
  corporationId: '917701062',
  characterId: '2110000001',
  vaultId: 'vault-1',
  domain: 'numbers',
  requiredScopes: ['esi-wallet.read_corporation_wallets.v1'],
  status: 'completed',
  requestedBy: 'Ari Voss',
  requestedAt: '2026-06-02T12:45:00.000Z',
  source: 'Commander-prepared from explicit ESI read-sync consent.',
  claimedBy: 'worker-a',
  claimedAt: '2026-06-02T12:46:00.000Z',
  completedAt: '2026-06-02T12:48:00.000Z',
  result: {
    snapshotId: numbersSnapshot.id,
    sourceCount: 4,
    summary: 'Numbers snapshot written.',
    sectionStatuses: [
      { key: 'wallet', status: 'healthy' },
      { key: 'market', status: 'stale' }
    ],
    failures: ['Market data was partial.']
  },
  createdAt: '2026-06-02T12:45:00.000Z',
  updatedAt: '2026-06-02T12:48:00.000Z'
};

describe('ESI sync history helpers', () => {
  it('creates live provenance for snapshots linked to completed syncs', () => {
    const provenance = latestNumbersLiveProvenance(numbersSnapshot, completedSync);

    expect(provenance.mode).toBe('live_sync');
    expect(provenance.syncRequestId).toBe('sync-completed');
    expect(provenance.sourceCount).toBe(4);
    expect(provenance.sectionStatuses).toContainEqual({ key: 'market', status: 'stale' });

    const body = JSON.stringify(provenance);
    expect(body).not.toContain('accessToken');
    expect(body).not.toContain('refreshToken');
    expect(body).not.toContain('secret');
    expect(body).not.toContain('retrySchedule');
    expect(body).not.toContain('dispatchTarget');
  });

  it('distinguishes historical and unavailable provenance modes', () => {
    expect(latestNumbersLiveProvenance(numbersSnapshot, null).mode).toBe('historical_snapshot');
    expect(latestNumbersLiveProvenance(null, null).mode).toBe('unavailable');
  });

  it('creates browser-safe recent history summaries', () => {
    const failedSync: EsiSyncRequestDocument = {
      ...completedSync,
      id: 'sync-failed',
      status: 'failed',
      completedAt: undefined,
      result: undefined,
      failure: {
        reason: 'Safe ESI failure summary.',
        failedAt: '2026-06-02T12:49:00.000Z'
      }
    };

    const history = syncHistoryItems([completedSync, failedSync]);

    expect(history).toHaveLength(2);
    expect(history[0].snapshotId).toBe(numbersSnapshot.id);
    expect(history[1].failure?.reason).toBe('Safe ESI failure summary.');
    expect(JSON.stringify(history)).not.toContain('token');
    expect(JSON.stringify(history)).not.toContain('dispatchTarget');
  });

  it('includes Opportunity outcomes in browser-safe history summaries', () => {
    const opportunitySync: EsiSyncRequestDocument = {
      ...completedSync,
      id: 'sync-opportunity',
      domain: 'opportunity',
      result: {
        snapshotId: 'opportunity-snapshot-1',
        sourceCount: 2,
        summary: 'Opportunity structures read completed.',
        sectionStatuses: [{ key: 'structures', status: 'processed' }],
        failures: []
      }
    };

    const history = syncHistoryItems([completedSync, opportunitySync]);

    expect(history.map((item) => item.domain)).toEqual(['numbers', 'opportunity']);
    expect(history[1].snapshotId).toBe('opportunity-snapshot-1');
    expect(JSON.stringify(history)).not.toContain('refreshToken');
    expect(JSON.stringify(history)).not.toContain('workerSecret');
    expect(JSON.stringify(history)).not.toContain('rawPayload');
  });
});
