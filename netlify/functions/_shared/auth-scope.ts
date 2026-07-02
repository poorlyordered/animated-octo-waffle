import type { EveSessionScope, ScopeResolutionResult, SessionStateResponse } from '../../../packages/contracts/src/index';
import { eveSessionScopeSchema } from '../../../packages/contracts/src/index';
import { isProductionRuntime, readScopeEnv } from './env';
import { safeErrorResponse, type FunctionResponse } from './http';
import { isExpired, readCookie, readSessionSecret, readSignedCookieValue, sessionCookieName } from './session-cookie';

export interface FunctionEvent {
  headers?: Record<string, string | undefined>;
  httpMethod?: string;
  path?: string;
  body?: string | null;
  queryStringParameters?: Record<string, string | undefined> | null;
}

export interface AuthScope {
  corporationId: string;
  source: 'session' | 'fallback';
  session?: EveSessionScope;
}

export class AuthScopeError extends Error {
  code = 'COMMANDER_CORPORATION_UNAUTHORIZED' as const;
  statusCode = 403;
  publicMessage = 'Signed EVE session is not authorized for this corporation';

  constructor() {
    super('Signed EVE session corporation does not match configured command corporation');
  }
}

export class SignedSessionRequiredError extends Error {
  code = 'COMMANDER_SESSION_REQUIRED' as const;
  statusCode = 401;
  publicMessage = 'Signed EVE session is required';

  constructor() {
    super('Signed EVE session is required for command API access');
  }
}

export function authScopeErrorResponse(error: unknown): FunctionResponse | null {
  if (error instanceof AuthScopeError || error instanceof SignedSessionRequiredError) {
    return safeErrorResponse(error.publicMessage, error.statusCode);
  }

  return null;
}

export function getAuthScope(event?: FunctionEvent, env: NodeJS.ProcessEnv = process.env): AuthScope {
  const resolved = resolveAuthScope(event, env);
  return resolved;
}

export function resolveAuthScope(
  event?: FunctionEvent,
  env: NodeJS.ProcessEnv = process.env
): ScopeResolutionResult {
  const session = readSessionScope(event, env);
  const fallback = readScopeEnv(env);

  if (session) {
    if (!fallback.authorizedCorporationIds.includes(session.corporationId)) {
      throw new AuthScopeError();
    }

    return {
      corporationId: session.corporationId,
      source: 'session',
      session
    };
  }

  if (requiresSignedSession(env)) {
    throw new SignedSessionRequiredError();
  }

  return {
    corporationId: fallback.corporationId,
    source: 'fallback'
  };
}

export function getSessionState(event?: FunctionEvent, env: NodeJS.ProcessEnv = process.env): SessionStateResponse {
  const session = readSessionScope(event, env);

  if (session) {
    try {
      const fallback = readScopeEnv(env);
      if (!fallback.authorizedCorporationIds.includes(session.corporationId)) {
        return {
          signedIn: false,
          scopeSource: 'unauthorized',
          characterId: session.characterId,
          characterName: session.characterName,
          corporationId: session.corporationId,
          corporationName: session.corporationName,
          reason: 'Signed EVE session is not authorized for this corporation'
        };
      }
    } catch {
      return {
        signedIn: false,
        scopeSource: 'missing'
      };
    }

    return {
      signedIn: true,
      scopeSource: 'session',
      characterId: session.characterId,
      characterName: session.characterName,
      corporationId: session.corporationId,
      corporationName: session.corporationName,
      expiresAt: session.expiresAt
    };
  }

  try {
    return {
      signedIn: false,
      scopeSource: 'fallback',
      corporationId: readScopeEnv(env).corporationId
    };
  } catch {
    return {
      signedIn: false,
      scopeSource: 'missing'
    };
  }
}

export function readSessionScope(event?: FunctionEvent, env: NodeJS.ProcessEnv = process.env): EveSessionScope | null {
  const cookieValue = readCookie(event?.headers, sessionCookieName);
  if (!cookieValue) {
    return null;
  }

  const unsigned = readSignedCookieValue<unknown>(cookieValue, readSessionSecret(env));
  const parsed = eveSessionScopeSchema.safeParse(unsigned);

  if (!parsed.success || isExpired(parsed.data.expiresAt)) {
    return null;
  }

  return parsed.data;
}

function requiresSignedSession(env: NodeJS.ProcessEnv): boolean {
  // Emergency/local override only: in production this re-enables fallback command scope.
  if (env.GRYYK_ALLOW_FALLBACK_SCOPE === 'true') {
    return false;
  }

  return env.GRYYK_REQUIRE_SIGNED_SESSION === 'true' || isProductionRuntime(env);
}
