import type { RetryRequestSummary } from './retry.js';

export const esiSyncDomains = ['numbers'] as const;
export type EsiSyncDomain = (typeof esiSyncDomains)[number];

export const esiVaultStatuses = ['missing', 'active', 'revoked', 'unavailable'] as const;
export type EsiVaultStatus = (typeof esiVaultStatuses)[number];

export const esiSyncRequestStatuses = ['queued', 'claimed', 'completed', 'failed', 'cancelled'] as const;
export type EsiSyncRequestStatus = (typeof esiSyncRequestStatuses)[number];

export interface EsiIdentitySummary {
  id: string;
  name: string;
}

export interface EsiSyncLastSyncSummary {
  id: string;
  domain: EsiSyncDomain;
  status: EsiSyncRequestStatus;
  requestedAt: string;
}

export interface EsiVaultSummary {
  status: EsiVaultStatus;
  character: EsiIdentitySummary | null;
  corporation: EsiIdentitySummary | null;
  grantedScopes: string[];
  requiredScopes: string[];
  consentedAt: string | null;
  revokedAt: string | null;
  lastSync: EsiSyncLastSyncSummary | null;
  boundaries: string[];
}

export interface EsiSyncDomainSummary {
  domain: EsiSyncDomain;
  label: string;
  requiredScopes: string[];
  available: boolean;
  missingScopes: string[];
}

export interface EsiSyncStatusResponse {
  vault: EsiVaultSummary;
  domains: EsiSyncDomainSummary[];
  history?: EsiSyncHistoryItem[];
}

export interface StartEsiSyncConsentRequest {
  returnTo?: string;
}

export interface StartEsiSyncConsentResponse {
  authorizationUrl: string;
  requestedScopes: string[];
  stateExpiresAt: string;
  boundary: string;
}

export interface RevokeEsiVaultRequest {
  reason?: string;
}

export interface RevokeEsiVaultResponse {
  vault: EsiVaultSummary;
}

export interface PrepareEsiSyncRequest {
  domain: EsiSyncDomain;
}

export interface EsiSyncRequestSummary {
  id: string;
  domain: EsiSyncDomain;
  status: 'queued';
  requiredScopes: string[];
  requestedAt: string;
  boundary: string;
}

export interface EsiSyncWorkerResultSummary {
  snapshotId?: string;
  sourceCount: number;
  summary: string;
  sectionStatuses: Array<{
    key: string;
    status: string;
  }>;
  failures: string[];
}

export interface EsiSyncWorkerFailureSummary {
  reason: string;
  failedAt: string;
}

export interface EsiSyncSectionStatusSummary {
  key: string;
  status: string;
}

export interface EsiSyncHistoryItem {
  id: string;
  domain: EsiSyncDomain;
  status: EsiSyncRequestStatus;
  requestedAt: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  snapshotId?: string;
  sourceCount?: number;
  sectionStatuses: EsiSyncSectionStatusSummary[];
  failure?: EsiSyncWorkerFailureSummary;
  retry?: RetryRequestSummary;
  retryHistory?: RetryRequestSummary[];
  boundary: string;
}

export interface EsiSyncWorkerRequestSummary {
  id: string;
  corporationId: string;
  domain: EsiSyncDomain;
  status: EsiSyncRequestStatus;
  requiredScopes: string[];
  requestedAt: string;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  result?: EsiSyncWorkerResultSummary;
  failure?: EsiSyncWorkerFailureSummary;
}

export interface EsiSyncWorkerListResponse {
  syncRequests: EsiSyncWorkerRequestSummary[];
}

export interface EsiSyncWorkerRequestResponse {
  syncRequest: EsiSyncWorkerRequestSummary;
}

export interface EsiSyncWorkerClaimRequest {
  workerId: string;
}

export interface EsiSyncWorkerRunRequest {
  workerId: string;
}

export interface EsiSyncWorkerFailRequest {
  workerId: string;
  reason: string;
}

export interface PrepareEsiSyncResponse {
  syncRequest: EsiSyncRequestSummary;
  duplicate: boolean;
}

export interface EsiSyncBlockedResponse {
  error: 'missing_consent' | 'missing_scope' | 'revoked_vault' | 'unsafe_request';
  message: string;
  missingScopes?: string[];
  boundary: string;
}
