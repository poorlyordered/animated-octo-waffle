import { jest } from '@jest/globals';
import { handler as callbackHandler } from '../../../../netlify/functions/eve-sso-callback';
import { handler as esiSyncHandler } from '../../../../netlify/functions/esi-sync';
import { handler as startHandler } from '../../../../netlify/functions/eve-sso-start';
import { signEveToken, createEveTokenFixture, type EveTokenClaims } from '../helpers/eve-sso-token';
import {
  createSignedCookieValue,
  readSignedCookieValue,
  sessionCookieName,
  ssoStateCookieName
} from '../../../../netlify/functions/_shared/session-cookie';

const originalEnv = process.env;
const originalFetch = global.fetch;

function setEnv(nextEnv: NodeJS.ProcessEnv) {
  process.env = { ...originalEnv, ...nextEnv };
}

function setLiveEnv(nextEnv: NodeJS.ProcessEnv = {}) {
  setEnv({
    EVE_SESSION_SECRET: 'test-secret',
    EVE_SSO_CLIENT_ID: 'client-id',
    EVE_SSO_CLIENT_SECRET: 'client-secret-value',
    EVE_SSO_REDIRECT_URI: 'http://localhost:8888/api/eve-sso-callback',
    EVE_SSO_METADATA_URL: 'https://sso.test/metadata',
    EVE_SSO_TOKEN_URL: 'https://sso.test/token',
    EVE_ESI_BASE_URL: 'https://esi.test/latest',
    ...nextEnv
  });
}

function signedStateCookie() {
  const statePayload = {
    state: 'state-value-with-enough-length',
    returnTo: '/after-sign-in',
    issuedAt: '2026-06-01T00:00:00.000Z',
    expiresAt: '2099-06-01T00:00:00.000Z'
  };
  const signedState = createSignedCookieValue(statePayload, 'test-secret');

  return {
    cookie: `${ssoStateCookieName}=${encodeURIComponent(signedState)}`,
    state: statePayload.state
  };
}

function signedStateCookieWithPurpose(purpose: 'session' | 'esi-sync-consent' = 'session') {
  const statePayload = {
    state: 'state-value-with-enough-length',
    returnTo: '/esi-sync',
    issuedAt: '2026-06-01T00:00:00.000Z',
    expiresAt: '2099-06-01T00:00:00.000Z',
    purpose
  };
  const signedState = createSignedCookieValue(statePayload, 'test-secret');

  return {
    cookie: `${ssoStateCookieName}=${encodeURIComponent(signedState)}`,
    state: statePayload.state
  };
}

function signedSessionCookie(corporationId = '123456789') {
  const session = createSignedCookieValue(
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

  return `${sessionCookieName}=${encodeURIComponent(session)}`;
}

function createLiveFetchMock(accessToken: string, publicJwk: JsonWebKey) {
  return jest.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url === 'https://sso.test/token') {
      return new Response(
        JSON.stringify({
          access_token: accessToken,
          refresh_token: 'refresh-token-secret-value',
          token_type: 'Bearer'
        }),
        { status: 200 }
      );
    }

    if (url === 'https://sso.test/metadata') {
      return new Response(JSON.stringify({ jwks_uri: 'https://sso.test/jwks' }), { status: 200 });
    }

    if (url === 'https://sso.test/jwks') {
      return new Response(JSON.stringify({ keys: [publicJwk] }), { status: 200 });
    }

    if (url.includes('/characters/2110000001/')) {
      return new Response(JSON.stringify({ corporation_id: 123456789 }), { status: 200 });
    }

    if (url.includes('/corporations/123456789/')) {
      return new Response(JSON.stringify({ name: 'Session Corp' }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
  }) as jest.MockedFunction<typeof fetch>;
}

function createMetadataFetchMock(authorizationEndpoint = 'https://sso.test/oauth/authorize') {
  return jest.fn(async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url === 'https://sso.test/metadata') {
      return new Response(
        JSON.stringify({
          authorization_endpoint: authorizationEndpoint,
          token_endpoint: 'https://sso.test/token',
          jwks_uri: 'https://sso.test/jwks'
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
  }) as jest.MockedFunction<typeof fetch>;
}

function sessionCookieValue(response: Awaited<ReturnType<typeof callbackHandler>>) {
  const sessionCookie = response.multiValueHeaders?.['set-cookie']?.find((cookie) =>
    cookie.startsWith(`${sessionCookieName}=`)
  );
  const match = sessionCookie?.match(new RegExp(`${sessionCookieName}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

describe('EVE SSO API contract', () => {
  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('redirects to EVE SSO with a signed state cookie', async () => {
    global.fetch = createMetadataFetchMock();
    setEnv({
      EVE_SESSION_SECRET: 'test-secret',
      EVE_SSO_CLIENT_ID: 'client-id',
      EVE_SSO_REDIRECT_URI: 'http://localhost:8888/api/eve-sso-callback',
      EVE_SSO_METADATA_URL: 'https://sso.test/metadata'
    });

    const response = await startHandler({
      headers: {},
      httpMethod: 'GET',
      queryStringParameters: { returnTo: '/command' }
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers?.location).toContain('https://sso.test/oauth/authorize');
    expect(response.headers?.location).toContain('client_id=client-id');
    expect(response.multiValueHeaders?.['set-cookie']?.[0]).toContain(`${ssoStateCookieName}=`);
  });

  it('falls back to the default authorization endpoint when metadata lookup fails during sign-in start', async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 })) as jest.MockedFunction<typeof fetch>;
    setEnv({
      EVE_SESSION_SECRET: 'test-secret',
      EVE_SSO_CLIENT_ID: 'client-id',
      EVE_SSO_REDIRECT_URI: 'http://localhost:8888/api/eve-sso-callback',
      EVE_SSO_METADATA_URL: 'https://sso-unavailable.test/metadata'
    });

    const response = await startHandler({
      headers: {},
      httpMethod: 'GET',
      queryStringParameters: { returnTo: '/command' }
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers?.location).toContain('https://login.eveonline.com/v2/oauth/authorize/');
    expect(response.multiValueHeaders?.['set-cookie']?.[0]).toContain(`${ssoStateCookieName}=`);
  });

  it('falls back to the default authorization endpoint when metadata lookup fails during ESI consent start', async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 })) as jest.MockedFunction<typeof fetch>;
    setLiveEnv({
      EVEONLINE_CORPORATION_ID: '123456789',
      EVE_SSO_METADATA_URL: 'https://sso-consent-unavailable.test/metadata'
    });

    const response = await esiSyncHandler({
      headers: { cookie: signedSessionCookie('123456789') },
      httpMethod: 'POST',
      path: '/api/esi-sync/consent/start',
      body: JSON.stringify({ returnTo: '/esi-sync' })
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('https://login.eveonline.com/v2/oauth/authorize/');
    expect(response.multiValueHeaders?.['set-cookie']?.[0]).toContain(`${ssoStateCookieName}=`);
  });

  it('rejects external return paths', async () => {
    setEnv({
      EVE_SESSION_SECRET: 'test-secret',
      EVE_SSO_CLIENT_ID: 'client-id',
      EVE_SSO_REDIRECT_URI: 'http://localhost:8888/api/eve-sso-callback'
    });

    const response = await startHandler({
      headers: {},
      httpMethod: 'GET',
      queryStringParameters: { returnTo: 'https://example.test/' }
    });

    expect(response.statusCode).toBe(400);
  });

  it('creates a session cookie after valid state and deterministic identity', async () => {
    const statePayload = {
      state: 'state-value-with-enough-length',
      returnTo: '/after-sign-in',
      issuedAt: '2026-06-01T00:00:00.000Z',
      expiresAt: '2099-06-01T00:00:00.000Z'
    };
    const signedState = createSignedCookieValue(statePayload, 'test-secret');
    setEnv({
      EVE_SESSION_SECRET: 'test-secret',
      EVE_SSO_TEST_IDENTITY_JSON: JSON.stringify({
        characterId: '2110000001',
        characterName: 'Ari Voss',
        corporationId: '123456789',
        corporationName: 'Session Corp'
      })
    });

    const response = await callbackHandler({
      headers: { cookie: `${ssoStateCookieName}=${encodeURIComponent(signedState)}` },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: statePayload.state
      }
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers?.location).toBe('/after-sign-in');
    expect(response.multiValueHeaders?.['set-cookie']?.join('\n')).toContain(`${sessionCookieName}=`);
    expect(response.multiValueHeaders?.['set-cookie']?.join('\n')).toContain(`${ssoStateCookieName}=`);
  });

  it('creates a session cookie after valid live EVE SSO validation', async () => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture);
    global.fetch = createLiveFetchMock(token, fixture.publicJwk);
    setLiveEnv();
    const state = signedStateCookie();

    const response = await callbackHandler({
      headers: { cookie: state.cookie },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: state.state
      }
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers?.location).toBe('/after-sign-in');
    const session = readSignedCookieValue<Record<string, unknown>>(sessionCookieValue(response), 'test-secret');
    expect(session).toEqual(
      expect.objectContaining({
        characterId: '2110000001',
        characterName: 'Ari Voss',
        corporationId: '123456789',
        corporationName: 'Session Corp',
        source: 'eve-sso'
      })
    );
  });

  it.each([
    ['issuer', { iss: 'https://attacker.test' }],
    ['audience', { aud: ['client-id'] }],
    ['expiry', { exp: 1 }],
    ['subject', { sub: 'USER:2110000001' }]
  ])('rejects live callback tokens with invalid %s', async (_caseName, claims: EveTokenClaims) => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture, claims);
    global.fetch = createLiveFetchMock(token, fixture.publicJwk);
    setLiveEnv();
    const state = signedStateCookie();

    const response = await callbackHandler({
      headers: { cookie: state.cookie },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: state.state
      }
    });

    expect(response.statusCode).toBe(500);
    expect(response.body).not.toContain('client-secret-value');
    expect(response.multiValueHeaders?.['set-cookie']?.join('\n')).not.toContain(`${sessionCookieName}=`);
    expect(response.multiValueHeaders?.['set-cookie']?.join('\n')).toContain(`${ssoStateCookieName}=`);
  });

  it('keeps live token material and raw claims out of browser-visible callback state', async () => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture, { name: 'Sensitive Claim Name' });
    global.fetch = createLiveFetchMock(token, fixture.publicJwk);
    setLiveEnv();
    const state = signedStateCookie();

    const response = await callbackHandler({
      headers: { cookie: state.cookie },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: state.state
      }
    });
    const responseText = JSON.stringify(response);
    const session = readSignedCookieValue<Record<string, unknown>>(sessionCookieValue(response), 'test-secret');

    expect(responseText).not.toContain(token);
    expect(responseText).not.toContain('refresh-token-secret-value');
    expect(responseText).not.toContain('client-secret-value');
    expect(JSON.stringify(session)).not.toContain(token);
    expect(JSON.stringify(session)).not.toContain('refresh-token-secret-value');
    expect(JSON.stringify(session)).not.toContain('client-secret-value');
    expect(session).not.toHaveProperty('aud');
    expect(session).not.toHaveProperty('sub');
  });

  it('returns a safe error when live configuration is incomplete', async () => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture);
    global.fetch = createLiveFetchMock(token, fixture.publicJwk);
    setLiveEnv({ EVE_SSO_CLIENT_SECRET: undefined });
    const state = signedStateCookie();

    const response = await callbackHandler({
      headers: { cookie: state.cookie },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: state.state
      }
    });

    expect(response.statusCode).toBe(500);
    expect(response.body).toContain('Unable to complete EVE SSO sign-in');
    expect(response.body).not.toContain('EVE_SSO_CLIENT_SECRET');
  });

  it('does not require live adapter calls when deterministic identity is configured', async () => {
    const state = signedStateCookie();
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    setEnv({
      EVE_SESSION_SECRET: 'test-secret',
      EVE_SSO_TEST_IDENTITY_JSON: JSON.stringify({
        characterId: '2110000001',
        characterName: 'Ari Voss',
        corporationId: '123456789',
        corporationName: 'Session Corp'
      })
    });

    const response = await callbackHandler({
      headers: { cookie: state.cookie },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: state.state
      }
    });

    expect(response.statusCode).toBe(302);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ignores deterministic identity in production and requires live EVE SSO validation', async () => {
    const state = signedStateCookie();
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    setLiveEnv({
      CONTEXT: 'production',
      EVE_SSO_TEST_IDENTITY_JSON: JSON.stringify({
        characterId: '2110000001',
        characterName: 'Ari Voss',
        corporationId: '123456789',
        corporationName: 'Session Corp'
      })
    });

    const response = await callbackHandler({
      headers: { cookie: state.cookie },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: state.state
      }
    });

    expect(response.statusCode).toBe(500);
    expect(response.multiValueHeaders?.['set-cookie']?.join('\n')).not.toContain(`${sessionCookieName}=`);
    expect(fetchMock).toHaveBeenCalled();
  });

  it('sets Secure on SSO cookies when Netlify CONTEXT is production', async () => {
    global.fetch = createMetadataFetchMock();
    setEnv({
      CONTEXT: 'production',
      EVE_SESSION_SECRET: 'test-secret',
      EVE_SSO_CLIENT_ID: 'client-id',
      EVE_SSO_REDIRECT_URI: 'http://localhost:8888/api/eve-sso-callback',
      EVE_SSO_METADATA_URL: 'https://sso.test/metadata'
    });

    const response = await startHandler({
      headers: {},
      httpMethod: 'GET',
      queryStringParameters: { returnTo: '/command' }
    });

    expect(response.multiValueHeaders?.['set-cookie']?.[0]).toContain('Secure');
  });

  it('sets Secure on SSO cookies for HTTPS forwarded Netlify requests', async () => {
    global.fetch = createMetadataFetchMock();
    setEnv({
      EVE_SESSION_SECRET: 'test-secret',
      EVE_SSO_CLIENT_ID: 'client-id',
      EVE_SSO_REDIRECT_URI: 'https://gryyk-47.netlify.app/api/eve-sso-callback',
      EVE_SSO_METADATA_URL: 'https://sso.test/metadata'
    });

    const response = await startHandler({
      headers: { 'x-forwarded-proto': 'https' },
      httpMethod: 'GET',
      queryStringParameters: { returnTo: '/' }
    });

    expect(response.multiValueHeaders?.['set-cookie']?.[0]).toContain('Secure');
  });

  it('requires an authorized signed session before storing ESI sync consent', async () => {
    const state = signedStateCookieWithPurpose('esi-sync-consent');
    setLiveEnv({
      EVEONLINE_CORPORATION_ID: '123456789'
    });

    const response = await callbackHandler({
      headers: { cookie: state.cookie },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: state.state
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain('Signed EVE session is required');
  });

  it('requires a signed session before starting ESI sync consent', async () => {
    setLiveEnv({
      EVEONLINE_CORPORATION_ID: '123456789'
    });

    const response = await esiSyncHandler({
      headers: {},
      httpMethod: 'POST',
      path: '/api/esi-sync/consent/start',
      body: JSON.stringify({ returnTo: '/esi-sync' })
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toContain('Signed EVE session is required');
  });

  it('rejects ESI sync consent for a mismatched corporation before storing a vault', async () => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture);
    global.fetch = createLiveFetchMock(token, fixture.publicJwk);
    setLiveEnv({
      EVEONLINE_CORPORATION_ID: '917701062'
    });
    const state = signedStateCookieWithPurpose('esi-sync-consent');

    const response = await callbackHandler({
      headers: { cookie: `${state.cookie}; ${signedSessionCookie('917701062')}` },
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: state.state
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.body).toContain('Signed EVE session is not authorized for this corporation');
  });

  it('rejects invalid callback state safely', async () => {
    setEnv({ EVE_SESSION_SECRET: 'test-secret' });

    const response = await callbackHandler({
      headers: {},
      httpMethod: 'GET',
      queryStringParameters: {
        code: 'callback-code',
        state: 'missing-state'
      }
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers?.location).toBe('/?auth_error=invalid_sso_state');
    expect(response.body).not.toContain('test-secret');
  });
});
