import { createSessionScope, readDeterministicIdentity } from './_shared/eve-sso';
import type { FunctionEvent } from './_shared/auth-scope';
import { redirectResponse, safeErrorResponse } from './_shared/http';
import {
  clearCookie,
  createSignedCookieValue,
  isExpired,
  readCookie,
  readSessionSecret,
  readSignedCookieValue,
  serializeCookie,
  sessionCookieName,
  ssoStateCookieName
} from './_shared/session-cookie';
import { eveSsoStateSchema } from '../../packages/contracts/src/index';

export async function handler(event: FunctionEvent) {
  try {
    const code = event.queryStringParameters?.code;
    const state = event.queryStringParameters?.state;

    if (!code || !state) {
      return safeErrorResponse('Missing EVE SSO callback values', 400);
    }

    const secret = readSessionSecret();
    const stateCookie = readCookie(event.headers, ssoStateCookieName);
    const parsedState = eveSsoStateSchema.safeParse(readSignedCookieValue<unknown>(stateCookie, secret));

    if (!parsedState.success || parsedState.data.state !== state || isExpired(parsedState.data.expiresAt)) {
      return {
        ...safeErrorResponse('Invalid EVE SSO state', 400),
        multiValueHeaders: { 'set-cookie': [clearCookie(ssoStateCookieName)] }
      };
    }

    const identity = readDeterministicIdentity();
    if (!identity) {
      return {
        ...safeErrorResponse('EVE SSO identity validation is not configured', 500),
        multiValueHeaders: { 'set-cookie': [clearCookie(ssoStateCookieName)] }
      };
    }

    const session = createSessionScope(identity);
    const sessionCookie = serializeCookie(
      sessionCookieName,
      createSignedCookieValue(session, secret),
      { maxAge: 12 * 60 * 60, secure: process.env.NODE_ENV === 'production' }
    );

    return redirectResponse(parsedState.data.returnTo, [sessionCookie, clearCookie(ssoStateCookieName)]);
  } catch {
    return {
      ...safeErrorResponse('Unable to complete EVE SSO sign-in'),
      multiValueHeaders: { 'set-cookie': [clearCookie(ssoStateCookieName)] }
    };
  }
}
