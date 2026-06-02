import {
  esiSyncStatusResponseSchema,
  prepareEsiSyncResponseSchema,
  revokeEsiVaultResponseSchema,
  startEsiSyncConsentResponseSchema,
  type EsiSyncStatusResponse,
  type PrepareEsiSyncRequest,
  type PrepareEsiSyncResponse,
  type RevokeEsiVaultResponse,
  type StartEsiSyncConsentRequest,
  type StartEsiSyncConsentResponse
} from '@gryyk/contracts';

export async function getEsiSyncStatus(): Promise<EsiSyncStatusResponse> {
  const response = await fetch('/api/esi-sync/status');

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return esiSyncStatusResponseSchema.parse(await response.json());
}

export async function startEsiSyncConsent(
  request: StartEsiSyncConsentRequest = {}
): Promise<StartEsiSyncConsentResponse> {
  const response = await fetch('/api/esi-sync/consent/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return startEsiSyncConsentResponseSchema.parse(await response.json());
}

export async function revokeEsiVault(): Promise<RevokeEsiVaultResponse> {
  const response = await fetch('/api/esi-sync/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return revokeEsiVaultResponseSchema.parse(await response.json());
}

export async function prepareEsiSync(request: PrepareEsiSyncRequest): Promise<PrepareEsiSyncResponse> {
  const response = await fetch('/api/esi-sync/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return prepareEsiSyncResponseSchema.parse(await response.json());
}
