import type { EveSessionScope, ScopeResolutionResult, SessionStateResponse } from '../../../packages/contracts/src/index';
import { eveSessionScopeSchema } from '../../../packages/contracts/src/index';
import { readScopeEnv } from './env';
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

export function getAuthScope(event?: FunctionEvent, env: NodeJS.ProcessEnv = process.env): AuthScope {
  const resolved = resolveAuthScope(event, env);
  return resolved;
}

export function resolveAuthScope(
  event?: FunctionEvent,
  env: NodeJS.ProcessEnv = process.env
): ScopeResolutionResult {
  const session = readSessionScope(event, env);

  if (session) {
    return {
      corporationId: session.corporationId,
      source: 'session',
      session
    };
  }

  return {
    corporationId: readScopeEnv(env).corporationId,
    source: 'fallback'
  };
}

export function getSessionState(event?: FunctionEvent, env: NodeJS.ProcessEnv = process.env): SessionStateResponse {
  const session = readSessionScope(event, env);

  if (session) {
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
