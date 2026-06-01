import { createSignedCookieValue, sessionCookieName } from '../../../../netlify/functions/_shared/session-cookie';
import { getAuthScope } from '../../../../netlify/functions/_shared/auth-scope';

describe('command API session scope contract', () => {
  it('resolves authenticated session corporation before fallback corporation', () => {
    const signed = createSignedCookieValue(
      {
        characterId: '2110000001',
        characterName: 'Ari Voss',
        corporationId: '123456789',
        corporationName: 'Session Corp',
        issuedAt: '2026-06-01T00:00:00.000Z',
        expiresAt: '2099-06-01T00:00:00.000Z',
        source: 'eve-sso'
      },
      'test-secret'
    );

    const scope = getAuthScope(
      {
        headers: {
          cookie: `${sessionCookieName}=${encodeURIComponent(signed)}`,
          'x-corporation-id': 'browser-header'
        },
        queryStringParameters: { corporationId: 'browser-query' },
        body: JSON.stringify({ corporationId: 'browser-body' })
      },
      {
        EVEONLINE_CORPORATION_ID: '917701062',
        EVE_SESSION_SECRET: 'test-secret'
      }
    );

    expect(scope.corporationId).toBe('123456789');
    expect(scope.source).toBe('session');
  });
});
