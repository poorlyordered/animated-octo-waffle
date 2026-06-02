import {
  esiSyncBlockedResponseSchema,
  esiSyncStatusResponseSchema,
  prepareEsiSyncResponseSchema,
  revokeEsiVaultResponseSchema,
  scheduleRetryResponseSchema,
  startEsiSyncConsentResponseSchema
} from '@gryyk/contracts';
import {
  activeEsiSyncStatus,
  duplicatePrepareEsiSyncResponse,
  activeEsiSyncStatusWithHistory,
  failedEsiSyncHistoryItemWithBlockedRetry,
  missingEsiSyncStatus,
  prepareEsiSyncResponse,
  revokeEsiVaultResponse,
  startEsiSyncConsentResponse
} from '../fixtures/esiSync';
import { esiSyncRetryResponse } from '../fixtures/retry';

describe('ESI sync API contract', () => {
  it('accepts missing and active vault status responses', () => {
    expect(esiSyncStatusResponseSchema.parse(missingEsiSyncStatus).vault.status).toBe('missing');
    expect(esiSyncStatusResponseSchema.parse(activeEsiSyncStatus).vault.status).toBe('active');
    expect(esiSyncStatusResponseSchema.parse(activeEsiSyncStatusWithHistory).history).toHaveLength(3);
  });

  it('accepts consent start responses without token material', () => {
    const parsed = startEsiSyncConsentResponseSchema.parse(startEsiSyncConsentResponse);
    const serialized = JSON.stringify(parsed);

    expect(parsed.requestedScopes).toContain('esi-wallet.read_corporation_wallets.v1');
    expect(serialized).not.toContain('refreshToken');
    expect(serialized).not.toContain('accessToken');
    expect(serialized).not.toContain('secret');
  });

  it('accepts revoke responses and blocks sync preparation from revoked vaults', () => {
    const parsed = revokeEsiVaultResponseSchema.parse(revokeEsiVaultResponse);

    expect(parsed.vault.status).toBe('revoked');
    expect(parsed.vault.grantedScopes).toEqual([]);
  });

  it('accepts prepare sync success and duplicate responses', () => {
    expect(prepareEsiSyncResponseSchema.parse(prepareEsiSyncResponse).duplicate).toBe(false);
    expect(prepareEsiSyncResponseSchema.parse(duplicatePrepareEsiSyncResponse).duplicate).toBe(true);
  });

  it('accepts scheduled ESI sync retry responses', () => {
    const parsed = scheduleRetryResponseSchema.parse(esiSyncRetryResponse);

    expect(parsed.retry.targetType).toBe('esi_sync_request');
    expect(parsed.retry.status).toBe('scheduled');
    expect(JSON.stringify(parsed)).not.toContain('accessToken');
    expect(JSON.stringify(parsed)).not.toContain('dispatchTarget');
  });

  it('accepts blocked ESI sync retry execution summaries in history', () => {
    const parsed = esiSyncStatusResponseSchema.parse({
      ...activeEsiSyncStatus,
      history: [failedEsiSyncHistoryItemWithBlockedRetry]
    });

    expect(parsed.history?.[0].retry?.status).toBe('blocked');
    expect(parsed.history?.[0].retry?.blockedReason).toContain('Active ESI consent');
  });

  it('accepts missing-scope blocked responses', () => {
    const parsed = esiSyncBlockedResponseSchema.parse({
      error: 'missing_scope',
      message: 'Read sync requires additional ESI consent.',
      missingScopes: ['esi-wallet.read_corporation_wallets.v1'],
      boundary: 'No sync request was created.'
    });

    expect(parsed.missingScopes).toHaveLength(1);
  });

  it('does not include secrets or execution handles in browser-visible ESI sync JSON', () => {
    const body = JSON.stringify({
      status: activeEsiSyncStatus,
      history: activeEsiSyncStatusWithHistory.history,
      prepare: prepareEsiSyncResponse,
      revoke: revokeEsiVaultResponse
    });

    expect(body).not.toContain('refreshToken');
    expect(body).not.toContain('accessToken');
    expect(body).not.toContain('sealed');
    expect(body).not.toContain('client-secret');
    expect(body).not.toContain('dispatchTarget');
    expect(body).not.toContain('retrySchedule');
    expect(body).not.toContain('walletAction');
  });
});
