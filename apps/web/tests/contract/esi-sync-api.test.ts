import {
  esiSyncBlockedResponseSchema,
  esiSyncStatusResponseSchema,
  prepareEsiSyncResponseSchema,
  revokeEsiVaultResponseSchema,
  startEsiSyncConsentResponseSchema
} from '@gryyk/contracts';
import {
  activeEsiSyncStatus,
  duplicatePrepareEsiSyncResponse,
  activeEsiSyncStatusWithHistory,
  missingEsiSyncStatus,
  prepareEsiSyncResponse,
  revokeEsiVaultResponse,
  startEsiSyncConsentResponse
} from '../fixtures/esiSync';

describe('ESI sync API contract', () => {
  it('accepts missing and active vault status responses', () => {
    expect(esiSyncStatusResponseSchema.parse(missingEsiSyncStatus).vault.status).toBe('missing');
    expect(esiSyncStatusResponseSchema.parse(activeEsiSyncStatus).vault.status).toBe('active');
    expect(esiSyncStatusResponseSchema.parse(activeEsiSyncStatusWithHistory).history).toHaveLength(2);
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
