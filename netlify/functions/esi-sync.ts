import {
  prepareEsiSyncRequestSchema,
  revokeEsiVaultRequestSchema,
  cancelRetryRequestSchema,
  rescheduleRetryRequestSchema,
  scheduleRetryRequestSchema,
  startEsiSyncConsentRequestSchema
} from '../../packages/contracts/src/index';
import { getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { syncHistoryItems } from './_shared/esi-sync-history';
import { getMongoDb } from './_shared/mongo';
import {
  allRequiredReadOnlyScopes,
  assertNoUnsafeEsiSyncFields,
  domainSummaries,
  missingScopes,
  requiredScopesForDomain,
  vaultSummary
} from './_shared/esi-token-vault';
import { createOrFindQueuedSyncRequest, findSyncRequest, listRecentSyncRequests, syncRequestSummary } from './_shared/esi-sync-request-store';
import {
  assertNoUnsafeRetryFields,
  cancelLatestRetryRequestForTarget,
  createOrFindScheduledRetryRequest,
  listRetryRequestsForTarget,
  rescheduleLatestRetryRequestForTarget,
  retryRequestSummary
} from './_shared/retry-request-store';
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
      const history = await listRecentSyncRequests(db, corporationId, 'numbers');
      for (const item of history) {
        const retries = await listRetryRequestsForTarget(
          db,
          corporationId,
          'esi_sync_request',
          item.id ?? item._id?.toString() ?? ''
        );
        if (retries.length > 0) {
          item.retryHistory = retries;
          item.retry = retries[0];
        }
      }

      return jsonResponse(200, {
        vault: vaultSummary(vault),
        domains: domainSummaries(vault),
        history: syncHistoryItems(history)
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

    const retryMatch = path.match(/\/esi-sync\/([^/]+)\/retry$/);
    if (retryMatch) {
      assertNoUnsafeRetryFields(body);
      const request = scheduleRetryRequestSchema.parse(body);
      const syncRequest = await findSyncRequest(db, decodeURIComponent(retryMatch[1]));
      if (!syncRequest || syncRequest.corporationId !== corporationId) {
        return safeErrorResponse('ESI sync request not found', 404);
      }
      if (syncRequest.status !== 'failed') {
        return safeErrorResponse('Only failed ESI sync requests are retry-eligible', 409);
      }
      const { retry, duplicate } = await createOrFindScheduledRetryRequest(
        db,
        corporationId,
        'esi_sync_request',
        syncRequest.id ?? syncRequest._id?.toString() ?? '',
        request
      );
      return jsonResponse(duplicate ? 200 : 201, { retry: retryRequestSummary(retry), duplicate });
    }

    const cancelRetryMatch = path.match(/\/esi-sync\/([^/]+)\/retry\/cancel$/);
    if (cancelRetryMatch) {
      assertNoUnsafeRetryFields(body);
      const request = cancelRetryRequestSchema.parse(body);
      const syncRequest = await findSyncRequest(db, decodeURIComponent(cancelRetryMatch[1]));
      if (!syncRequest || syncRequest.corporationId !== corporationId) {
        return safeErrorResponse('ESI sync request not found', 404);
      }
      const retry = await cancelLatestRetryRequestForTarget(
        db,
        corporationId,
        'esi_sync_request',
        syncRequest.id ?? syncRequest._id?.toString() ?? '',
        request
      );
      return retry
        ? jsonResponse(200, { retry: retryRequestSummary(retry) })
        : safeErrorResponse('Only scheduled or blocked ESI sync retries can be canceled', 409);
    }

    const rescheduleRetryMatch = path.match(/\/esi-sync\/([^/]+)\/retry\/reschedule$/);
    if (rescheduleRetryMatch) {
      assertNoUnsafeRetryFields(body);
      const request = rescheduleRetryRequestSchema.parse(body);
      const syncRequest = await findSyncRequest(db, decodeURIComponent(rescheduleRetryMatch[1]));
      if (!syncRequest || syncRequest.corporationId !== corporationId) {
        return safeErrorResponse('ESI sync request not found', 404);
      }
      const retry = await rescheduleLatestRetryRequestForTarget(
        db,
        corporationId,
        'esi_sync_request',
        syncRequest.id ?? syncRequest._id?.toString() ?? '',
        request
      );
      return retry
        ? jsonResponse(200, { retry: retryRequestSummary(retry) })
        : safeErrorResponse('Only scheduled ESI sync retries can be rescheduled', 409);
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

    if (error instanceof Error && error.message.startsWith('Unsafe retry field rejected')) {
      return safeErrorResponse(error.message, 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('ESI sync request is invalid', 400);
    }

    return safeErrorResponse('Unable to load ESI sync state');
  }
}
