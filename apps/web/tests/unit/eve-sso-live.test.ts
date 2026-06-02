import { jest } from '@jest/globals';
import { signEveToken, createEveTokenFixture } from '../helpers/eve-sso-token';
import {
  exchangeAuthorizationCode,
  resolveCorporationIdentity,
  validateEveAccessToken
} from '../../../../netlify/functions/_shared/eve-sso-live';
import type { EveSsoLiveConfig } from '../../../../netlify/functions/_shared/eve-sso';

const config: EveSsoLiveConfig = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  redirectUri: 'http://localhost:8888/api/eve-sso-callback',
  scopes: 'publicData',
  metadataUrl: 'https://sso.test/metadata',
  tokenUrl: 'https://sso.test/token',
  esiBaseUrl: 'https://esi.test/latest'
};

describe('live EVE SSO adapter', () => {
  it('validates a signed EVE access token and extracts character identity', async () => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture);

    await expect(validateEveAccessToken(token, { keys: [fixture.publicJwk] }, config)).resolves.toEqual({
      characterId: '2110000001',
      characterName: 'Ari Voss',
      expiresAt: expect.any(String)
    });
  });

  it.each([
    ['issuer', { iss: 'https://attacker.test' }],
    ['audience', { aud: ['client-id'] }],
    ['expiry', { exp: 1 }],
    ['subject', { sub: 'USER:2110000001' }]
  ])('rejects invalid %s claims', async (_caseName, claims) => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture, claims);

    await expect(validateEveAccessToken(token, { keys: [fixture.publicJwk] }, config)).rejects.toThrow(
      'EVE SSO access token is invalid'
    );
  });

  it('rejects tokens signed by an unknown key', async () => {
    const trustedFixture = createEveTokenFixture('trusted-key');
    const untrustedFixture = createEveTokenFixture('untrusted-key');
    const token = signEveToken(untrustedFixture);

    await expect(validateEveAccessToken(token, { keys: [trustedFixture.publicJwk] }, config)).rejects.toThrow(
      'EVE SSO access token is invalid'
    );
  });

  it('exchanges authorization codes with server-side basic authentication', async () => {
    const fetchMock = jest.fn(async () => {
      return new Response(JSON.stringify({ access_token: 'jwt-token', refresh_token: 'refresh-token' }), {
        status: 200
      });
    });

    await expect(exchangeAuthorizationCode('callback-code', config, fetchMock)).resolves.toEqual({
      accessToken: 'jwt-token'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      config.tokenUrl,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: `Basic ${Buffer.from('client-id:client-secret').toString('base64')}`,
          'content-type': 'application/x-www-form-urlencoded'
        })
      })
    );
  });

  it('resolves corporation identity from read-only ESI lookups', async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.includes('/characters/2110000001/')) {
        return new Response(JSON.stringify({ corporation_id: 123456789 }), { status: 200 });
      }

      return new Response(JSON.stringify({ name: 'Session Corp' }), { status: 200 });
    });

    await expect(resolveCorporationIdentity('2110000001', 'access-token', config, fetchMock)).resolves.toEqual({
      corporationId: '123456789',
      corporationName: 'Session Corp'
    });
  });

  it('fails safely when ESI identity lookup cannot resolve corporation data', async () => {
    const fetchMock = jest.fn(async () => new Response(JSON.stringify({}), { status: 200 }));

    await expect(resolveCorporationIdentity('2110000001', 'access-token', config, fetchMock)).rejects.toThrow(
      'EVE ESI identity lookup failed'
    );
  });
});
