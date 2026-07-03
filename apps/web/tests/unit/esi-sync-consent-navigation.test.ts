import {
  esiConsentStatusMessage,
  navigateToEsiConsentAuthorization
} from '../../src/features/esi-sync/services/esiSyncConsentNavigation';
import { startEsiSyncConsentResponse } from '../fixtures/esiSync';

describe('ESI sync consent navigation', () => {
  it('redirects to the EVE authorization URL returned by consent start', () => {
    const assignedUrls: string[] = [];

    navigateToEsiConsentAuthorization(startEsiSyncConsentResponse, {
      assign: (url) => assignedUrls.push(url)
    });

    expect(assignedUrls).toEqual([startEsiSyncConsentResponse.authorizationUrl]);
  });

  it('builds a commander-visible status message with redirect context and no token material', () => {
    const message = esiConsentStatusMessage(startEsiSyncConsentResponse);

    expect(message).toContain('Redirecting to EVE authorization.');
    expect(message).toContain('Requested scopes:');
    expect(message).not.toContain('accessToken');
    expect(message).not.toContain('refreshToken');
  });
});
