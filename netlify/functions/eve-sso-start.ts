import { createEveSsoState, buildEveSsoAuthorizationUrl, isLocalReturnPath, readEveSsoConfig } from './_shared/eve-sso';
import { resolveEveSsoAuthorizationEndpoint } from './_shared/eve-sso-live';
import type { FunctionEvent } from './_shared/auth-scope';
import { isProductionRuntime } from './_shared/env';
import { redirectResponse, safeErrorResponse } from './_shared/http';
import {
  createSignedCookieValue,
  readSessionSecret,
  serializeCookie,
  ssoStateCookieName
} from './_shared/session-cookie';

export async function handler(event: FunctionEvent) {
  try {
    const returnTo = event.queryStringParameters?.returnTo;
    if (returnTo && !isLocalReturnPath(returnTo)) {
      return safeErrorResponse('Invalid return path', 400);
    }

    const config = readEveSsoConfig();
    const authorizationEndpoint = await resolveEveSsoAuthorizationEndpoint(config);
    const state = createEveSsoState(returnTo);
    const stateCookie = serializeCookie(
      ssoStateCookieName,
      createSignedCookieValue(state, readSessionSecret()),
      { maxAge: 10 * 60, secure: isProductionRuntime() }
    );

    return redirectResponse(buildEveSsoAuthorizationUrl(config, state.state, authorizationEndpoint), [stateCookie]);
  } catch (error) {
    if (error instanceof Error && error.message === 'EVE SSO configuration is required') {
      return safeErrorResponse('EVE SSO is not configured', 500);
    }

    return safeErrorResponse('Unable to start EVE SSO sign-in');
  }
}
