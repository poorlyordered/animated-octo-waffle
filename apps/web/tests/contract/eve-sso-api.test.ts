import { handler as callbackHandler } from '../../../../netlify/functions/eve-sso-callback';
import { handler as startHandler } from '../../../../netlify/functions/eve-sso-start';
import {
  createSignedCookieValue,
  ssoStateCookieName,
  sessionCookieName
} from '../../../../netlify/functions/_shared/session-cookie';

const originalEnv = process.env;

function setEnv(nextEnv: NodeJS.ProcessEnv) {
  process.env = { ...originalEnv, ...nextEnv };
}

describe('EVE SSO API contract', () => {
  afterEach(() => {
    process.env = originalEnv;
  });

  it('redirects to EVE SSO with a signed state cookie', async () => {
    setEnv({
      EVE_SESSION_SECRET: 'test-secret',
      EVE_SSO_CLIENT_ID: 'client-id',
      EVE_SSO_REDIRECT_URI: 'http://localhost:8888/api/eve-sso-callback'
    });

    const response = await startHandler({
      headers: {},
      httpMethod: 'GET',
      queryStringParameters: { returnTo: '/command' }
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers?.location).toContain('https://login.eveonline.com/v2/oauth/authorize/');
    expect(response.headers?.location).toContain('client_id=client-id');
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

    expect(response.statusCode).toBe(400);
    expect(response.body).not.toContain('test-secret');
  });
});
