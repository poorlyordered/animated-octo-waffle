import {
  prepareEsiSyncRequestSchema,
  revokeEsiVaultRequestSchema,
  startEsiSyncConsentRequestSchema
} from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { getMongoDb } from './_shared/mongo';
import {
  allRequiredReadOnlyScopes,
  assertNoUnsafeEsiSyncFields,
  domainSummaries,
  missingScopes,
  requiredScopesForDomain,
  vaultSummary
} from './_shared/esi-token-vault';
import { createOrFindQueuedSyncRequest, syncRequestSummary } from './_shared/esi-sync-request-store';
import { findActiveOrLatestVault, revokeActiveVault } from './_shared/esi-token-vault-store';
import {
  buildEveSsoAuthorizationUrl,
  createEveSsoState,
  isLocalReturnPath,
  readEveSsoConfig
} from './_shared/eve-sso';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import {
  createSignedCookieValue,
  readSessionSecret,
  serializeCookie,
  ssoStateCookieName
} from './_shared/session-cookie';

function parseJsonBody(event: FunctionEvent): unknown {
  if (!event.body) {
    return {};
  }

  return JSON.parse(event.body);
}

export async function handler(event: FunctionEvent) {
  try {
    const method = event.httpMethod ?? 'GET';
    const path = event.path ?? '';

    if (method === 'GET') {
      const { corporationId } = getAuthScope(event);
      const db = await getMongoDb();
      const vault = await findActiveOrLatestVault(db, corporationId);

      return jsonResponse(200, {
        vault: vaultSummary(vault),
        domains: domainSummaries(vault)
      });
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const body = parseJsonBody(event);
    assertNoUnsafeEsiSyncFields(body);

    if (path.endsWith('/consent/start')) {
      const request = startEsiSyncConsentRequestSchema.parse(body);
      if (request.returnTo && !isLocalReturnPath(request.returnTo)) {
        return safeErrorResponse('Invalid return path', 400);
      }

      const config = {
        ...readEveSsoConfig(),
        scopes: allRequiredReadOnlyScopes().join(' ')
      };
      const state = createEveSsoState(request.returnTo ?? '/', new Date(), 'esi-sync-consent');
      const stateCookie = serializeCookie(
        ssoStateCookieName,
        createSignedCookieValue(state, readSessionSecret()),
        { maxAge: 10 * 60, secure: process.env.NODE_ENV === 'production' }
      );

      return {
        ...jsonResponse(200, {
          authorizationUrl: buildEveSsoAuthorizationUrl(config, state.state),
          requestedScopes: allRequiredReadOnlyScopes(),
          stateExpiresAt: state.expiresAt,
          boundary: 'No token has been stored. Vaulting occurs only after a valid EVE callback.'
        }),
        multiValueHeaders: { 'set-cookie': [stateCookie] }
      };
    }

    const { corporationId } = getAuthScope(event);
    const db = await getMongoDb();

    if (path.endsWith('/revoke')) {
      revokeEsiVaultRequestSchema.parse(body);
      const revoked = await revokeActiveVault(db, corporationId);

      return jsonResponse(200, {
        vault: vaultSummary(revoked)
      });
    }

    if (path.endsWith('/prepare')) {
      const request = prepareEsiSyncRequestSchema.parse(body);
      const vault = await findActiveOrLatestVault(db, corporationId);
      if (!vault) {
        return jsonResponse(409, {
          error: 'missing_consent',
          message: 'Explicit ESI read-sync consent is required.',
          boundary: 'No sync request was created.'
        });
      }

      if (vault.status === 'revoked') {
        return jsonResponse(409, {
          error: 'revoked_vault',
          message: 'Vaulted ESI consent has been revoked.',
          boundary: 'No sync request was created.'
        });
      }

      const requiredScopes = requiredScopesForDomain(request.domain);
      const missing = missingScopes(vault.grantedScopes, requiredScopes);
      if (missing.length > 0) {
        return jsonResponse(409, {
          error: 'missing_scope',
          message: 'Read sync requires additional ESI consent.',
          missingScopes: missing,
          boundary: 'No sync request was created.'
        });
      }

      const { syncRequest, duplicate } = await createOrFindQueuedSyncRequest(db, vault, request.domain, requiredScopes);

      return jsonResponse(duplicate ? 200 : 201, {
        syncRequest: syncRequestSummary(syncRequest, duplicate),
        duplicate
      });
    }

    return safeErrorResponse('ESI sync path is invalid', 404);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'EVEONLINE_CORPORATION_ID is required') {
      return safeErrorResponse('Corporation scope is not configured', 500);
    }

    if (error instanceof Error && error.message === 'EVE SSO configuration is required') {
      return safeErrorResponse('EVE SSO is not configured', 500);
    }

    if (error instanceof Error && error.message.startsWith('Unsafe ESI sync field rejected')) {
      return safeErrorResponse(error.message, 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('ESI sync request is invalid', 400);
    }

    return safeErrorResponse('Unable to load ESI sync state');
  }
}
