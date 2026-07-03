import type { StartEsiSyncConsentResponse } from '@gryyk/contracts';

export interface ConsentLocationTarget {
  assign(url: string): void;
}

export function esiConsentStatusMessage(response: StartEsiSyncConsentResponse): string {
  return `${response.boundary} Requested scopes: ${response.requestedScopes.join(', ')}. Redirecting to EVE authorization.`;
}

export function navigateToEsiConsentAuthorization(
  response: StartEsiSyncConsentResponse,
  target: ConsentLocationTarget = window.location
): void {
  target.assign(response.authorizationUrl);
}
