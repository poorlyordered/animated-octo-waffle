import {
  esiSyncStatusResponseSchema,
  cancelRetryRequestSchema,
  cancelRetryResponseSchema,
  prepareEsiSyncResponseSchema,
  rescheduleRetryRequestSchema,
  rescheduleRetryResponseSchema,
  revokeEsiVaultResponseSchema,
  scheduleRetryRequestSchema,
  scheduleRetryResponseSchema,
  startEsiSyncConsentResponseSchema,
  type CancelRetryRequest,
  type CancelRetryResponse,
  type EsiSyncStatusResponse,
  type PrepareEsiSyncRequest,
  type PrepareEsiSyncResponse,
  type RescheduleRetryRequest,
  type RescheduleRetryResponse,
  type RevokeEsiVaultResponse,
  type ScheduleRetryRequest,
  type ScheduleRetryResponse,
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

export async function scheduleEsiSyncRetry(
  syncRequestId: string,
  request: ScheduleRetryRequest
): Promise<ScheduleRetryResponse> {
  const response = await fetch(`/api/esi-sync/${encodeURIComponent(syncRequestId)}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleRetryRequestSchema.parse(request))
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return scheduleRetryResponseSchema.parse(await response.json());
}

export async function cancelEsiSyncRetry(
  syncRequestId: string,
  request: CancelRetryRequest
): Promise<CancelRetryResponse> {
  const response = await fetch(`/api/esi-sync/${encodeURIComponent(syncRequestId)}/retry/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cancelRetryRequestSchema.parse(request))
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return cancelRetryResponseSchema.parse(await response.json());
}

export async function rescheduleEsiSyncRetry(
  syncRequestId: string,
  request: RescheduleRetryRequest
): Promise<RescheduleRetryResponse> {
  const response = await fetch(`/api/esi-sync/${encodeURIComponent(syncRequestId)}/retry/reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rescheduleRetryRequestSchema.parse(request))
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body && typeof body === 'object' && 'message' in body ? String(body.message) : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return rescheduleRetryResponseSchema.parse(await response.json());
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
