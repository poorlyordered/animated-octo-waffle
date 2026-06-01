import { createSignedCookieValue, sessionCookieName } from '../../../../netlify/functions/_shared/session-cookie';
import { getAuthScope, getSessionState } from '../../../../netlify/functions/_shared/auth-scope';
import { readScopeEnv } from '../../../../netlify/functions/_shared/env';

const env = {
  EVEONLINE_CORPORATION_ID: '917701062',
  EVE_SESSION_SECRET: 'test-secret'
};

function cookieHeader(value: string) {
  return { cookie: `${sessionCookieName}=${encodeURIComponent(value)}` };
}

function sessionCookie(corporationId = '123456789') {
  return createSignedCookieValue(
    {
      characterId: '2110000001',
      characterName: 'Ari Voss',
      corporationId,
      corporationName: 'Session Corp',
      issuedAt: new Date('2026-06-01T00:00:00.000Z').toISOString(),
      expiresAt: new Date('2026-06-02T00:00:00.000Z').toISOString(),
      source: 'eve-sso'
    },
    env.EVE_SESSION_SECRET
  );
}

describe('readScopeEnv', () => {
  it('reads corporation scope from server-owned environment', () => {
    expect(readScopeEnv({ EVEONLINE_CORPORATION_ID: '917701062' }).corporationId).toBe('917701062');
  });

  it('rejects missing server-owned corporation scope', () => {
    expect(() => readScopeEnv({})).toThrow('EVEONLINE_CORPORATION_ID is required');
  });
});

describe('getAuthScope', () => {
  it('uses signed session scope before fallback scope', () => {
    const scope = getAuthScope({ headers: cookieHeader(sessionCookie()) }, env);

    expect(scope).toMatchObject({
      corporationId: '123456789',
      source: 'session'
    });
  });

  it('falls back to server-owned environment when no session exists', () => {
    const scope = getAuthScope({ headers: {} }, env);

    expect(scope).toEqual({
      corporationId: '917701062',
      source: 'fallback'
    });
  });

  it('ignores browser-controlled corporation identity in headers, query values, and body', () => {
    const scope = getAuthScope(
      {
        headers: {
          'x-corporation-id': 'browser-header'
        },
        queryStringParameters: {
          corporationId: 'browser-query'
        },
        body: JSON.stringify({ corporationId: 'browser-body' })
      },
      env
    );

    expect(scope.corporationId).toBe('917701062');
  });

  it('ignores tampered session cookies and uses fallback scope', () => {
    const tampered = `${sessionCookie()}tampered`;
    const scope = getAuthScope({ headers: cookieHeader(tampered) }, env);

    expect(scope).toEqual({
      corporationId: '917701062',
      source: 'fallback'
    });
  });

  it('reports missing state when session and fallback are unavailable', () => {
    expect(getSessionState({ headers: {} }, { EVE_SESSION_SECRET: 'test-secret' })).toEqual({
      signedIn: false,
      scopeSource: 'missing'
    });
  });
});
