import { sessionStateResponseSchema } from '@gryyk/contracts';
import { handler } from '../../../../netlify/functions/eve-session';
import { createSignedCookieValue, sessionCookieName } from '../../../../netlify/functions/_shared/session-cookie';

const originalEnv = process.env;

function setEnv(nextEnv: NodeJS.ProcessEnv) {
  process.env = { ...originalEnv, ...nextEnv };
}

function activeSessionCookie(corporationId = '917701062') {
  const signed = createSignedCookieValue(
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

  return `${sessionCookieName}=${encodeURIComponent(signed)}`;
}

describe('EVE session API contract', () => {
  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns signed-in display-safe state for a valid session', async () => {
    setEnv({ EVEONLINE_CORPORATION_ID: '917701062', EVE_SESSION_SECRET: 'test-secret' });

    const response = await handler({
      headers: { cookie: activeSessionCookie() },
      httpMethod: 'GET'
    });
    const parsed = sessionStateResponseSchema.parse(JSON.parse(response.body));

    expect(parsed).toMatchObject({
      signedIn: true,
      scopeSource: 'session',
      characterName: 'Ari Voss',
      corporationId: '917701062'
    });
    expect(response.body).not.toContain('secret');
    expect(response.body).not.toContain('token');
  });

  it('returns fallback state when no session exists', async () => {
    setEnv({ EVEONLINE_CORPORATION_ID: '917701062', EVE_SESSION_SECRET: 'test-secret' });

    const response = await handler({ headers: {}, httpMethod: 'GET' });
    expect(sessionStateResponseSchema.parse(JSON.parse(response.body))).toEqual({
      signedIn: false,
      scopeSource: 'fallback',
      corporationId: '917701062'
    });
  });

  it('returns missing state when no session or fallback exists', async () => {
    setEnv({ EVEONLINE_CORPORATION_ID: undefined, EVE_SESSION_SECRET: 'test-secret' });
    delete process.env.EVEONLINE_CORPORATION_ID;

    const response = await handler({ headers: {}, httpMethod: 'GET' });
    expect(sessionStateResponseSchema.parse(JSON.parse(response.body))).toEqual({
      signedIn: false,
      scopeSource: 'missing'
    });
  });

  it('returns unauthorized state for a signed session outside the configured corporation', async () => {
    setEnv({ EVEONLINE_CORPORATION_ID: '917701062', EVE_SESSION_SECRET: 'test-secret' });

    const response = await handler({
      headers: { cookie: activeSessionCookie('123456789') },
      httpMethod: 'GET'
    });

    expect(sessionStateResponseSchema.parse(JSON.parse(response.body))).toEqual({
      signedIn: false,
      scopeSource: 'unauthorized',
      characterId: '2110000001',
      characterName: 'Ari Voss',
      corporationId: '123456789',
      corporationName: 'Session Corp',
      reason: 'Signed EVE session is not authorized for this corporation'
    });
    expect(response.body).not.toContain('secret');
    expect(response.body).not.toContain('token');
  });

  it('clears session cookie on idempotent sign-out', async () => {
    setEnv({ EVEONLINE_CORPORATION_ID: '917701062', EVE_SESSION_SECRET: 'test-secret' });

    const response = await handler({
      headers: { cookie: activeSessionCookie() },
      httpMethod: 'POST',
      path: '/api/eve-session/sign-out'
    });

    expect(response.multiValueHeaders?.['set-cookie']?.[0]).toContain(`${sessionCookieName}=`);
    expect(response.multiValueHeaders?.['set-cookie']?.[0]).toContain('Max-Age=0');
    expect(sessionStateResponseSchema.parse(JSON.parse(response.body))).toEqual({
      signedIn: false,
      scopeSource: 'fallback',
      corporationId: '917701062'
    });
  });
});
