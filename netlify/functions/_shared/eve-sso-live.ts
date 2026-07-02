import { webcrypto } from 'node:crypto';
import type { EveSsoIdentity, EveSsoLiveConfig } from './eve-sso';
import { readEveSsoLiveConfig } from './eve-sso';

type Fetch = typeof fetch;

interface EveSsoMetadata {
  authorization_endpoint?: string;
  jwks_uri?: string;
  token_endpoint?: string;
}

export interface ResolvedEveSsoMetadata {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
}

export interface Jwk extends JsonWebKey {
  alg?: string;
  kid?: string;
  kty?: string;
  use?: string;
}

interface Jwks {
  keys?: Jwk[];
}

interface JwtHeader {
  alg?: string;
  kid?: string;
}

interface EveJwtClaims {
  aud?: string | string[];
  exp?: number;
  iss?: string;
  name?: string;
  scp?: string[];
  sub?: string;
}

interface TokenExchangeResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

interface CharacterResponse {
  corporation_id?: number;
}

interface CorporationResponse {
  name?: string;
}

export interface ValidatedEveJwt {
  characterId: string;
  characterName: string;
  expiresAt: string;
  grantedScopes: string[];
}

const acceptedIssuers = new Set(['login.eveonline.com', 'https://login.eveonline.com', 'https://login.eveonline.com/']);
const metadataCacheTtlMs = 5 * 60 * 1000;
const defaultAuthorizationEndpoint = 'https://login.eveonline.com/v2/oauth/authorize/';
const defaultTokenEndpoint = 'https://login.eveonline.com/v2/oauth/token';

const metadataCache = new Map<string, { expiresAt: number; metadata: ResolvedEveSsoMetadata }>();

export async function resolveLiveEveSsoIdentity(
  code: string,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: Fetch = fetch
): Promise<EveSsoIdentity> {
  const config = readEveSsoLiveConfig(env);
  const metadata = await fetchEveSsoMetadata(config, fetchImpl);
  const token = await exchangeAuthorizationCode(code, config, fetchImpl, metadata);
  const jwks = await fetchJwks(config, fetchImpl);
  const claims = await validateEveAccessToken(token.accessToken, jwks, config);
  const corporation = await resolveCorporationIdentity(claims.characterId, token.accessToken, config, fetchImpl);

  return {
    characterId: claims.characterId,
    characterName: claims.characterName,
    corporationId: corporation.corporationId,
    corporationName: corporation.corporationName
  };
}

export interface ResolvedLiveEveSsoVaultConsent {
  identity: EveSsoIdentity;
  token: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    grantedScopes: string[];
  };
}

export async function resolveLiveEveSsoVaultConsent(
  code: string,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: Fetch = fetch
): Promise<ResolvedLiveEveSsoVaultConsent> {
  const config = readEveSsoLiveConfig(env);
  const metadata = await fetchEveSsoMetadata(config, fetchImpl);
  const token = await exchangeAuthorizationCode(code, config, fetchImpl, metadata);
  const jwks = await fetchJwks(config, fetchImpl);
  const claims = await validateEveAccessToken(token.accessToken, jwks, config);
  const corporation = await resolveCorporationIdentity(claims.characterId, token.accessToken, config, fetchImpl);

  if (!token.refreshToken) {
    throw new Error('EVE SSO refresh token is required for vault consent');
  }

  return {
    identity: {
      characterId: claims.characterId,
      characterName: claims.characterName,
      corporationId: corporation.corporationId,
      corporationName: corporation.corporationName
    },
    token: {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      grantedScopes: claims.grantedScopes
    }
  };
}

export async function exchangeAuthorizationCode(
  code: string,
  config: EveSsoLiveConfig,
  fetchImpl: Fetch = fetch,
  metadata?: ResolvedEveSsoMetadata
): Promise<{ accessToken: string; refreshToken?: string; accessTokenExpiresAt: string; grantedScopes: string[] }> {
  const tokenUrl = config.tokenUrl ?? metadata?.tokenEndpoint ?? (await fetchEveSsoMetadata(config, fetchImpl)).tokenEndpoint;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri
  });
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`, 'utf8').toString('base64');
  const response = await fetchImpl(tokenUrl, {
    method: 'POST',
    headers: {
      authorization: `Basic ${credentials}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    throw new Error('EVE SSO token exchange failed');
  }

  const payload = (await response.json()) as TokenExchangeResponse;
  if (!payload.access_token) {
    throw new Error('EVE SSO token exchange failed');
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    accessTokenExpiresAt: new Date(Date.now() + (payload.expires_in ?? 1200) * 1000).toISOString(),
    grantedScopes: payload.scope?.split(/\s+/).filter(Boolean) ?? config.scopes.split(/\s+/).filter(Boolean)
  };
}

export async function fetchEveSsoMetadata(
  config: Pick<EveSsoLiveConfig, 'metadataUrl' | 'authorizationUrl' | 'tokenUrl'>,
  fetchImpl: Fetch = fetch,
  options: { forceRefresh?: boolean; now?: Date } = {}
): Promise<ResolvedEveSsoMetadata> {
  const now = options.now?.getTime() ?? Date.now();
  const cached = metadataCache.get(config.metadataUrl);
  if (!options.forceRefresh && cached && cached.expiresAt > now) {
    return cached.metadata;
  }

  const metadataResponse = await fetchImpl(config.metadataUrl);
  if (!metadataResponse.ok) {
    throw new Error('EVE SSO metadata lookup failed');
  }

  const metadata = (await metadataResponse.json()) as EveSsoMetadata;
  if (!metadata.jwks_uri) {
    throw new Error('EVE SSO metadata lookup failed');
  }

  const resolved = {
    authorizationEndpoint: config.authorizationUrl ?? metadata.authorization_endpoint ?? defaultAuthorizationEndpoint,
    tokenEndpoint: config.tokenUrl ?? metadata.token_endpoint ?? defaultTokenEndpoint,
    jwksUri: metadata.jwks_uri
  };

  metadataCache.set(config.metadataUrl, {
    expiresAt: now + metadataCacheTtlMs,
    metadata: resolved
  });

  return resolved;
}

export async function fetchJwks(config: EveSsoLiveConfig, fetchImpl: Fetch = fetch): Promise<Jwks> {
  const metadata = await fetchEveSsoMetadata(config, fetchImpl);
  const jwksResponse = await fetchImpl(metadata.jwksUri);
  if (!jwksResponse.ok) {
    throw new Error('EVE SSO JWKS lookup failed');
  }

  const jwks = (await jwksResponse.json()) as Jwks;
  if (!Array.isArray(jwks.keys)) {
    throw new Error('EVE SSO JWKS lookup failed');
  }

  return jwks;
}

export async function validateEveAccessToken(
  token: string,
  jwks: Jwks,
  config: Pick<EveSsoLiveConfig, 'clientId'>,
  now = new Date()
): Promise<ValidatedEveJwt> {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new Error('EVE SSO access token is invalid');
  }

  const header = decodeJwtPart<JwtHeader>(parts[0]);
  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('EVE SSO access token is invalid');
  }

  const key = jwks.keys?.find((candidate) => candidate.kid === header.kid && candidate.alg === header.alg);
  if (!key) {
    throw new Error('EVE SSO access token is invalid');
  }

  const verified = await verifyRs256(`${parts[0]}.${parts[1]}`, parts[2], key);
  if (!verified) {
    throw new Error('EVE SSO access token is invalid');
  }

  const claims = decodeJwtPart<EveJwtClaims>(parts[1]);
  validateClaims(claims, config.clientId, now);

  return {
    characterId: extractCharacterId(claims.sub),
    characterName: claims.name ?? '',
    expiresAt: new Date((claims.exp ?? 0) * 1000).toISOString(),
    grantedScopes: normalizeGrantedScopes(claims.scp)
  };
}

export async function resolveCorporationIdentity(
  characterId: string,
  accessToken: string,
  config: Pick<EveSsoLiveConfig, 'esiBaseUrl'>,
  fetchImpl: Fetch = fetch
): Promise<{ corporationId: string; corporationName: string }> {
  const characterUrl = `${trimTrailingSlash(config.esiBaseUrl)}/characters/${encodeURIComponent(characterId)}/?datasource=tranquility`;
  const characterResponse = await fetchImpl(characterUrl, {
    headers: { authorization: `Bearer ${accessToken}` }
  });

  if (!characterResponse.ok) {
    throw new Error('EVE ESI identity lookup failed');
  }

  const character = (await characterResponse.json()) as CharacterResponse;
  if (!character.corporation_id) {
    throw new Error('EVE ESI identity lookup failed');
  }

  const corporationId = String(character.corporation_id);
  const corporationUrl = `${trimTrailingSlash(config.esiBaseUrl)}/corporations/${encodeURIComponent(corporationId)}/?datasource=tranquility`;
  const corporationResponse = await fetchImpl(corporationUrl, {
    headers: { authorization: `Bearer ${accessToken}` }
  });

  if (!corporationResponse.ok) {
    throw new Error('EVE ESI identity lookup failed');
  }

  const corporation = (await corporationResponse.json()) as CorporationResponse;
  if (!corporation.name) {
    throw new Error('EVE ESI identity lookup failed');
  }

  return { corporationId, corporationName: corporation.name };
}

function validateClaims(claims: EveJwtClaims, clientId: string, now: Date) {
  if (!claims.iss || !acceptedIssuers.has(claims.iss)) {
    throw new Error('EVE SSO access token is invalid');
  }

  const audience = Array.isArray(claims.aud) ? claims.aud : claims.aud ? [claims.aud] : [];
  if (!audience.includes(clientId) || !audience.includes('EVE Online')) {
    throw new Error('EVE SSO access token is invalid');
  }

  if (!claims.exp || claims.exp * 1000 <= now.getTime()) {
    throw new Error('EVE SSO access token is invalid');
  }

  if (!claims.name || !claims.sub || !extractCharacterId(claims.sub)) {
    throw new Error('EVE SSO access token is invalid');
  }
}

function normalizeGrantedScopes(scopes: string[] | undefined): string[] {
  return Array.isArray(scopes) ? scopes.filter((scope) => typeof scope === 'string' && scope.length > 0) : [];
}

function extractCharacterId(subject: string | undefined): string {
  const match = subject?.match(/^CHARACTER:EVE:(\d+)$/);
  return match?.[1] ?? '';
}

function decodeJwtPart<T>(part: string): T {
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as T;
  } catch {
    throw new Error('EVE SSO access token is invalid');
  }
}

async function verifyRs256(data: string, signature: string, key: Jwk): Promise<boolean> {
  try {
    const cryptoKey = await webcrypto.subtle.importKey(
      'jwk',
      key,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    return webcrypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      Buffer.from(signature, 'base64url'),
      Buffer.from(data, 'utf8')
    );
  } catch {
    throw new Error('EVE SSO access token is invalid');
  }
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
