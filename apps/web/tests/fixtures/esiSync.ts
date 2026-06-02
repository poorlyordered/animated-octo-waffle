import type { EsiSyncHistoryItem, EsiSyncStatusResponse, PrepareEsiSyncResponse, RevokeEsiVaultResponse, StartEsiSyncConsentResponse } from '@gryyk/contracts';

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
  ],
  history: []
};

export const completedEsiSyncHistoryItem: EsiSyncHistoryItem = {
  id: 'sync-request-completed',
  domain: 'numbers',
  status: 'completed',
  requestedAt: '2026-06-02T12:45:00.000Z',
  claimedBy: 'worker-a',
  claimedAt: '2026-06-02T12:46:00.000Z',
  completedAt: '2026-06-02T12:48:00.000Z',
  snapshotId: 'numbers-1',
  sourceCount: 4,
  sectionStatuses: [
    { key: 'wallet', status: 'healthy' },
    { key: 'assets', status: 'watch' },
    { key: 'logistics', status: 'critical' },
    { key: 'market', status: 'stale' },
    { key: 'activity', status: 'missing' }
  ],
  boundary: 'Read-only sync history. No worker was dispatched and no retry was scheduled.'
};

export const failedEsiSyncHistoryItem: EsiSyncHistoryItem = {
  id: 'sync-request-failed',
  domain: 'numbers',
  status: 'failed',
  requestedAt: '2026-06-02T12:35:00.000Z',
  claimedBy: 'worker-a',
  claimedAt: '2026-06-02T12:36:00.000Z',
  failure: {
    reason: 'ESI market endpoint returned a safe fixture failure.',
    failedAt: '2026-06-02T12:37:00.000Z'
  },
  sectionStatuses: [],
  boundary: 'Read-only sync history. No worker was dispatched and no retry was scheduled.'
};

export const activeEsiSyncStatusWithHistory: EsiSyncStatusResponse = {
  ...activeEsiSyncStatus,
  history: [completedEsiSyncHistoryItem, failedEsiSyncHistoryItem]
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
