import type { EveSessionScope, ScopeResolutionResult, SessionStateResponse } from '../../../packages/contracts/src/index';
import { eveSessionScopeSchema } from '../../../packages/contracts/src/index';
import { readScopeEnv } from './env';
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

export function authScopeErrorResponse(error: unknown): FunctionResponse | null {
  if (error instanceof AuthScopeError) {
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
    if (session.corporationId !== fallback.corporationId) {
      throw new AuthScopeError();
    }

    return {
      corporationId: session.corporationId,
      source: 'session',
      session
    };
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
      if (session.corporationId !== fallback.corporationId) {
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
  const unsigned = readSignedCookieValue<unknown>(cookieValue, readSessionSecret(env));
  const parsed = eveSessionScopeSchema.safeParse(unsigned);

  if (!parsed.success || isExpired(parsed.data.expiresAt)) {
    return null;
  }

  return parsed.data;
}
