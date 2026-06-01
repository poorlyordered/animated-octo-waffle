import type { FunctionEvent } from './_shared/auth-scope';
import { getSessionState } from './_shared/auth-scope';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { clearCookie, sessionCookieName } from './_shared/session-cookie';

export async function handler(event: FunctionEvent) {
  if (event.httpMethod === 'POST' && event.path?.endsWith('/sign-out')) {
    return jsonResponseWithCookies(200, getSessionState(undefined), [clearCookie(sessionCookieName)]);
  }

  if (event.httpMethod && event.httpMethod !== 'GET') {
    return safeErrorResponse('Method not allowed', 405);
  }

  return jsonResponse(200, getSessionState(event));
}

function jsonResponseWithCookies(statusCode: number, payload: unknown, cookies: string[]) {
  return {
    ...jsonResponse(statusCode, payload),
    multiValueHeaders: { 'set-cookie': cookies }
  };
}
