import { jest } from '@jest/globals';
import { signEveToken, createEveTokenFixture } from '../helpers/eve-sso-token';
import {
  exchangeAuthorizationCode,
  fetchEveSsoMetadata,
  refreshEveSsoToken,
  resolveCorporationIdentity,
  resolveLiveEveSsoVaultConsent,
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
    const token = signEveToken(fixture, { scp: ['publicData', 'esi-wallet.read_corporation_wallets.v1'] });

    await expect(validateEveAccessToken(token, { keys: [fixture.publicJwk] }, config)).resolves.toEqual({
      characterId: '2110000001',
      characterName: 'Ari Voss',
      expiresAt: expect.any(String),
      grantedScopes: ['publicData', 'esi-wallet.read_corporation_wallets.v1']
    });
  });

  it('normalizes a single string scp claim as one granted scope', async () => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture, { scp: 'esi-wallet.read_corporation_wallets.v1' });

    await expect(validateEveAccessToken(token, { keys: [fixture.publicJwk] }, config)).resolves.toMatchObject({
      grantedScopes: ['esi-wallet.read_corporation_wallets.v1']
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
      accessToken: 'jwt-token',
      refreshToken: 'refresh-token',
      accessTokenExpiresAt: expect.any(String),
      grantedScopes: ['publicData']
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

  it('refreshes access tokens with server-side basic authentication', async () => {
    const fetchMock = jest.fn(async () => {
      return new Response(
        JSON.stringify({
          access_token: 'new-jwt-token',
          refresh_token: 'new-refresh-token',
          expires_in: 900,
          scope: 'esi-wallet.read_corporation_wallets.v1'
        }),
        {
          status: 200
        }
      );
    });

    await expect(refreshEveSsoToken('old-refresh-token', config, fetchMock)).resolves.toEqual({
      accessToken: 'new-jwt-token',
      refreshToken: 'new-refresh-token',
      accessTokenExpiresAt: expect.any(String),
      grantedScopes: ['esi-wallet.read_corporation_wallets.v1']
    });

    const call = fetchMock.mock.calls[0] as unknown as [RequestInfo | URL, RequestInit];
    const [, options] = call;
    expect(options).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: `Basic ${Buffer.from('client-id:client-secret').toString('base64')}`,
          'content-type': 'application/x-www-form-urlencoded'
        })
      })
    );
    expect(String(options.body)).toContain('grant_type=refresh_token');
    expect(String(options.body)).toContain('refresh_token=old-refresh-token');
  });

  it('discovers SSO endpoints from metadata', async () => {
    const fetchMock = jest.fn(async () => {
      return new Response(
        JSON.stringify({
          authorization_endpoint: 'https://sso.test/oauth/authorize',
          token_endpoint: 'https://sso.test/oauth/token',
          jwks_uri: 'https://sso.test/oauth/jwks'
        }),
        { status: 200 }
      );
    });

    await expect(
      fetchEveSsoMetadata(
        {
          metadataUrl: config.metadataUrl
        },
        fetchMock,
        { forceRefresh: true }
      )
    ).resolves.toEqual({
      authorizationEndpoint: 'https://sso.test/oauth/authorize',
      tokenEndpoint: 'https://sso.test/oauth/token',
      jwksUri: 'https://sso.test/oauth/jwks'
    });
  });

  it('keeps metadata cache entries isolated by endpoint overrides', async () => {
    const fetchMock = jest.fn(async () => {
      return new Response(
        JSON.stringify({
          authorization_endpoint: 'https://sso.test/oauth/authorize',
          token_endpoint: 'https://sso.test/oauth/token',
          jwks_uri: 'https://sso.test/oauth/jwks'
        }),
        { status: 200 }
      );
    });

    await expect(
      fetchEveSsoMetadata({ metadataUrl: 'https://sso-cache.test/metadata' }, fetchMock, { forceRefresh: true })
    ).resolves.toMatchObject({
      tokenEndpoint: 'https://sso.test/oauth/token'
    });

    await expect(
      fetchEveSsoMetadata(
        {
          metadataUrl: 'https://sso-cache.test/metadata',
          tokenUrl: 'https://sso-cache.test/token-override'
        },
        fetchMock
      )
    ).resolves.toMatchObject({
      tokenEndpoint: 'https://sso-cache.test/token-override'
    });
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

  it('uses validated JWT scp claim as vault consent granted scopes', async () => {
    const fixture = createEveTokenFixture();
    const token = signEveToken(fixture, {
      scp: 'esi-wallet.read_corporation_wallets.v1'
    });
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url === 'https://sso-vault.test/token') {
        return new Response(
          JSON.stringify({
            access_token: token,
            refresh_token: 'refresh-token-secret-value',
            scope: 'esi-wallet.read_corporation_wallets.v1 esi-assets.read_corporation_assets.v1'
          }),
          { status: 200 }
        );
      }

      if (url === 'https://sso-vault.test/metadata') {
        return new Response(JSON.stringify({ jwks_uri: 'https://sso-vault.test/jwks' }), { status: 200 });
      }

      if (url === 'https://sso-vault.test/jwks') {
        return new Response(JSON.stringify({ keys: [fixture.publicJwk] }), { status: 200 });
      }

      if (url.includes('/characters/2110000001/')) {
        return new Response(JSON.stringify({ corporation_id: 123456789 }), { status: 200 });
      }

      return new Response(JSON.stringify({ name: 'Session Corp' }), { status: 200 });
    });

    await expect(
      resolveLiveEveSsoVaultConsent(
        'callback-code',
        {
          EVE_SSO_CLIENT_ID: config.clientId,
          EVE_SSO_CLIENT_SECRET: config.clientSecret,
          EVE_SSO_REDIRECT_URI: config.redirectUri,
          EVE_SSO_METADATA_URL: 'https://sso-vault.test/metadata',
          EVE_SSO_TOKEN_URL: 'https://sso-vault.test/token',
          EVE_ESI_BASE_URL: config.esiBaseUrl
        },
        fetchMock
      )
    ).resolves.toMatchObject({
      token: {
        grantedScopes: ['esi-wallet.read_corporation_wallets.v1']
      }
    });
  });

  it('fails safely when ESI identity lookup cannot resolve corporation data', async () => {
    const fetchMock = jest.fn(async () => new Response(JSON.stringify({}), { status: 200 }));

    await expect(resolveCorporationIdentity('2110000001', 'access-token', config, fetchMock)).rejects.toThrow(
      'EVE ESI identity lookup failed'
    );
  });
});
