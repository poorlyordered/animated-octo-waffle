import { createSignedCookieValue, sessionCookieName } from '../../../../netlify/functions/_shared/session-cookie';
import { AuthScopeError, getAuthScope } from '../../../../netlify/functions/_shared/auth-scope';

function signedSession(corporationId: string) {
  return createSignedCookieValue(
    {
      characterId: '2110000001',
      characterName: 'Ari Voss',
      corporationId,
      corporationName: 'Session Corp',
      issuedAt: '2026-06-01T00:00:00.000Z',
      expiresAt: '2099-06-01T00:00:00.000Z',
      source: 'eve-sso'
    },
    'test-secret'
  );
}

describe('command API session scope contract', () => {
  it('resolves authenticated session corporation only when it matches fallback corporation', () => {
    const scope = getAuthScope(
      {
        headers: {
          cookie: `${sessionCookieName}=${encodeURIComponent(signedSession('917701062'))}`,
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

    expect(scope.corporationId).toBe('917701062');
    expect(scope.source).toBe('session');
  });

  it('rejects authenticated session corporation mismatch without falling back', () => {
    expect(() =>
      getAuthScope(
        {
          headers: {
            cookie: `${sessionCookieName}=${encodeURIComponent(signedSession('123456789'))}`
          }
        },
        {
          EVEONLINE_CORPORATION_ID: '917701062',
          EVE_SESSION_SECRET: 'test-secret'
        }
      )
    ).toThrow(AuthScopeError);
  });
});
