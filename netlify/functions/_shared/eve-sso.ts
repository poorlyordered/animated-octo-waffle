import type { EveSessionScope, EveSsoState } from '../../../packages/contracts/src/index';
import { eveSessionScopeSchema, eveSsoStateSchema } from '../../../packages/contracts/src/index';
import { randomState } from './session-cookie';

const defaultScopes = 'publicData';

export interface EveSsoConfig {
  clientId: string;
  redirectUri: string;
  scopes: string;
}

export interface EveSsoLiveConfig extends EveSsoConfig {
  clientSecret: string;
  metadataUrl: string;
  tokenUrl: string;
  esiBaseUrl: string;
}

export interface EveSsoIdentity {
  characterId: string;
  characterName: string;
  corporationId: string;
  corporationName: string;
}

export function readEveSsoConfig(env: NodeJS.ProcessEnv = process.env): EveSsoConfig {
  const clientId = env.EVE_SSO_CLIENT_ID;
  const redirectUri = env.EVE_SSO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('EVE SSO configuration is required');
  }

  return {
    clientId,
    redirectUri,
    scopes: env.EVE_SSO_SCOPES ?? defaultScopes
  };
}

export function readEveSsoLiveConfig(env: NodeJS.ProcessEnv = process.env): EveSsoLiveConfig {
  const config = readEveSsoConfig(env);
  const clientSecret = env.EVE_SSO_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error('EVE SSO live configuration is required');
  }

  return {
    ...config,
    clientSecret,
    metadataUrl: env.EVE_SSO_METADATA_URL ?? 'https://login.eveonline.com/.well-known/oauth-authorization-server',
    tokenUrl: env.EVE_SSO_TOKEN_URL ?? 'https://login.eveonline.com/v2/oauth/token',
    esiBaseUrl: env.EVE_ESI_BASE_URL ?? 'https://esi.evetech.net/latest'
  };
}

export function isLocalReturnPath(returnTo: string | undefined): returnTo is string {
  return Boolean(returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') && !returnTo.includes('://'));
}

export function createEveSsoState(
  returnTo: string | undefined,
  now = new Date(),
  purpose: EveSsoState['purpose'] = 'session'
): EveSsoState {
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  return eveSsoStateSchema.parse({
    state: randomState(),
    returnTo: isLocalReturnPath(returnTo) ? returnTo : '/',
    issuedAt,
    expiresAt,
    purpose
  });
}

export function buildEveSsoAuthorizationUrl(config: EveSsoConfig, state: string): string {
  const url = new URL('https://login.eveonline.com/v2/oauth/authorize/');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('scope', config.scopes);
  url.searchParams.set('state', state);
  return url.toString();
}

export function readDeterministicIdentity(env: NodeJS.ProcessEnv = process.env): EveSsoIdentity | null {
  const raw = env.EVE_SSO_TEST_IDENTITY_JSON;
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as EveSsoIdentity;
  if (!parsed.characterId || !parsed.characterName || !parsed.corporationId || !parsed.corporationName) {
    throw new Error('EVE_SSO_TEST_IDENTITY_JSON is invalid');
  }

  return parsed;
}

export function createSessionScope(identity: EveSsoIdentity, now = new Date()): EveSessionScope {
  const issuedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();

  return eveSessionScopeSchema.parse({
    ...identity,
    issuedAt,
    expiresAt,
    source: 'eve-sso'
  });
}
