import type { EsiSyncStatusResponse, PrepareEsiSyncResponse, RevokeEsiVaultResponse, StartEsiSyncConsentResponse } from '@gryyk/contracts';

export const esiRequiredScopes = [
  'esi-wallet.read_corporation_wallets.v1',
  'esi-assets.read_corporation_assets.v1',
  'esi-industry.read_corporation_jobs.v1',
  'esi-markets.read_corporation_orders.v1'
];

export const missingEsiSyncStatus: EsiSyncStatusResponse = {
  vault: {
    status: 'missing',
    character: null,
    corporation: null,
    grantedScopes: [],
    requiredScopes: esiRequiredScopes,
    consentedAt: null,
    revokedAt: null,
    lastSync: null,
    boundaries: ['Explicit ESI consent is required before read sync can be prepared.']
  },
  domains: [
    {
      domain: 'numbers',
      label: 'Numbers',
      requiredScopes: esiRequiredScopes,
      available: false,
      missingScopes: esiRequiredScopes
    }
  ]
};

export const activeEsiSyncStatus: EsiSyncStatusResponse = {
  vault: {
    status: 'active',
    character: { id: '2110000001', name: 'Ari Voss' },
    corporation: { id: '123456789', name: 'Session Corp' },
    grantedScopes: esiRequiredScopes,
    requiredScopes: esiRequiredScopes,
    consentedAt: '2026-06-02T12:00:00.000Z',
    revokedAt: null,
    lastSync: null,
    boundaries: ['Vaulted consent can prepare read-only sync requests. No ESI data is fetched in browser request paths.']
  },
  domains: [
    {
      domain: 'numbers',
      label: 'Numbers',
      requiredScopes: esiRequiredScopes,
      available: true,
      missingScopes: []
    }
  ]
};

export const revokedEsiSyncStatus: EsiSyncStatusResponse = {
  ...activeEsiSyncStatus,
  vault: {
    ...activeEsiSyncStatus.vault,
    status: 'revoked',
    grantedScopes: [],
    revokedAt: '2026-06-02T12:30:00.000Z',
    boundaries: ['Revoked token material cannot prepare sync requests.']
  },
  domains: [
    {
      ...activeEsiSyncStatus.domains[0],
      available: false,
      missingScopes: esiRequiredScopes
    }
  ]
};

export const startEsiSyncConsentResponse: StartEsiSyncConsentResponse = {
  authorizationUrl: 'https://login.eveonline.com/v2/oauth/authorize/?response_type=code&client_id=client-id',
  requestedScopes: esiRequiredScopes,
  stateExpiresAt: '2026-06-02T12:10:00.000Z',
  boundary: 'No token has been stored. Vaulting occurs only after a valid EVE callback.'
};

export const revokeEsiVaultResponse: RevokeEsiVaultResponse = {
  vault: revokedEsiSyncStatus.vault
};

export const prepareEsiSyncResponse: PrepareEsiSyncResponse = {
  syncRequest: {
    id: 'sync-request-1',
    domain: 'numbers',
    status: 'queued',
    requiredScopes: esiRequiredScopes,
    requestedAt: '2026-06-02T12:45:00.000Z',
    boundary: 'Queued for future read-only worker sync. No ESI data was fetched and no worker was dispatched.'
  },
  duplicate: false
};

export const duplicatePrepareEsiSyncResponse: PrepareEsiSyncResponse = {
  syncRequest: {
    ...prepareEsiSyncResponse.syncRequest,
    boundary: 'Existing queued sync request surfaced. No duplicate was created.'
  },
  duplicate: true
};
