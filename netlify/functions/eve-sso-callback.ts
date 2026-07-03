import { createSessionScope, readDeterministicIdentity } from './_shared/eve-sso';
import { resolveLiveEveSsoIdentity, resolveLiveEveSsoVaultConsent } from './_shared/eve-sso-live';
import { AuthScopeError, SignedSessionRequiredError, authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { redirectResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';
import {
  clearCookie,
  createSignedCookieValue,
  isExpired,
  readCookie,
  readSessionSecret,
  readSignedCookieValue,
  serializeCookie,
  shouldUseSecureCookies,
  sessionCookieName,
  ssoStateCookieName
} from './_shared/session-cookie';
import { eveSsoStateSchema } from '../../packages/contracts/src/index';
import { upsertActiveVault } from './_shared/esi-token-vault-store';

export async function handler(event: FunctionEvent) {
  try {
    const code = event.queryStringParameters?.code;
    const state = event.queryStringParameters?.state;

    if (!code || !state) {
      return {
        ...safeErrorResponse('Missing EVE SSO callback values', 400),
        multiValueHeaders: { 'set-cookie': [clearCookie(ssoStateCookieName)] }
      };
    }

    const secret = readSessionSecret();
    const stateCookie = readCookie(event.headers, ssoStateCookieName);
    const parsedState = eveSsoStateSchema.safeParse(readSignedCookieValue<unknown>(stateCookie, secret));

    if (!parsedState.success || parsedState.data.state !== state || isExpired(parsedState.data.expiresAt)) {
      return redirectResponse('/?auth_error=invalid_sso_state', [clearCookie(ssoStateCookieName)]);
    }

    if (parsedState.data.purpose === 'esi-sync-consent') {
      const authScope = getAuthScope(event);
      if (authScope.source !== 'session') {
        throw new SignedSessionRequiredError();
      }

      const deterministicIdentity = readDeterministicIdentity();
      const resolved = deterministicIdentity
        ? {
            identity: deterministicIdentity,
            token: {
              accessToken: 'deterministic-access-token',
              refreshToken: 'deterministic-refresh-token',
              accessTokenExpiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
              grantedScopes: (process.env.EVE_SSO_SCOPES ?? 'publicData').split(/\s+/).filter(Boolean)
            }
          }
        : await resolveLiveEveSsoVaultConsent(code);

      if (resolved.identity.corporationId !== authScope.corporationId) {
        throw new AuthScopeError();
      }

      const db = await getMongoDb();
      await upsertActiveVault(db, resolved.identity.corporationId, resolved.identity, resolved.token);

      return redirectResponse(parsedState.data.returnTo, [clearCookie(ssoStateCookieName)]);
    }

    const identity = readDeterministicIdentity() ?? await resolveLiveEveSsoIdentity(code);

    const session = createSessionScope(identity);
    const sessionCookie = serializeCookie(
      sessionCookieName,
      createSignedCookieValue(session, secret),
      { maxAge: 12 * 60 * 60, secure: shouldUseSecureCookies(event) }
    );

    return redirectResponse(parsedState.data.returnTo, [sessionCookie, clearCookie(ssoStateCookieName)]);
  } catch (error) {
    const authError = authScopeErrorResponse(error);
    if (authError) {
      return {
        ...authError,
        multiValueHeaders: { 'set-cookie': [clearCookie(ssoStateCookieName)] }
      };
    }

    return {
      ...safeErrorResponse('Unable to complete EVE SSO sign-in'),
      multiValueHeaders: { 'set-cookie': [clearCookie(ssoStateCookieName)] }
    };
  }
}
