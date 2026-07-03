import {
  createIntelligenceRefreshRunRequestSchema,
  intelligenceRefreshStepRetryRequestSchema,
  intelligenceRefreshStepSkipRequestSchema,
  type IntelligenceRefreshReadinessItem,
  type IntelligenceRefreshReadinessResponse
} from '../../packages/contracts/src/index';
import { authScopeErrorResponse, getAuthScope, type FunctionEvent } from './_shared/auth-scope';
import { missingScopes, requiredScopesForDomain } from './_shared/esi-token-vault';
import { findActiveOrLatestVault } from './_shared/esi-token-vault-store';
import { assertNoUnsafeRefreshFields } from './_shared/intelligence-refresh-rules';
import {
  createOrFindActiveRefreshRun,
  findRefreshRunDetail,
  listRecentRefreshRuns,
  recordRefreshStepRetryIntent,
  recordRefreshStepSkipIntent
} from './_shared/intelligence-refresh-store';
import { jsonResponse, safeErrorResponse } from './_shared/http';
import { getMongoDb } from './_shared/mongo';

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
    const authScope = getAuthScope(event);
    if (authScope.source !== 'session') {
      return safeErrorResponse('Signed EVE session is required', 401);
    }

    const requestedBy = `session:${authScope.session?.characterName ?? authScope.session?.characterId ?? 'commander'}`;
    const db = await getMongoDb();
    const retryMatch = path.match(/\/intelligence-refresh\/([^/]+)\/steps\/([^/]+)\/retry$/);
    const skipMatch = path.match(/\/intelligence-refresh\/([^/]+)\/steps\/([^/]+)\/skip$/);
    const detailMatch = path.match(/\/intelligence-refresh\/([^/]+)$/);

    if (method === 'GET' && path.endsWith('/intelligence-refresh/readiness')) {
      return jsonResponse(200, await buildRefreshReadiness(db, authScope.corporationId));
    }

    if (method === 'GET' && detailMatch) {
      const detail = await findRefreshRunDetail(db, decodeURIComponent(detailMatch[1]), authScope.corporationId);
      return detail ? jsonResponse(200, detail) : safeErrorResponse('Intelligence refresh run not found', 404);
    }

    if (method === 'GET') {
      const runs = await listRecentRefreshRuns(db, authScope.corporationId);
      return jsonResponse(200, { runs });
    }

    if (method === 'POST' && retryMatch) {
      const body = parseJsonBody(event);
      assertNoUnsafeRefreshFields(body);
      const request = intelligenceRefreshStepRetryRequestSchema.parse(body);
      const result = await recordRefreshStepRetryIntent(
        db,
        decodeURIComponent(retryMatch[1]),
        decodeURIComponent(retryMatch[2]),
        requestedBy,
        request.reason,
        authScope.corporationId
      );
      return result
        ? jsonResponse(200, { ...result, boundary: result.run.boundary })
        : safeErrorResponse('Refresh step is not eligible for retry intent', 409);
    }

    if (method === 'POST' && skipMatch) {
      const body = parseJsonBody(event);
      assertNoUnsafeRefreshFields(body);
      const request = intelligenceRefreshStepSkipRequestSchema.parse(body);
      const result = await recordRefreshStepSkipIntent(
        db,
        decodeURIComponent(skipMatch[1]),
        decodeURIComponent(skipMatch[2]),
        requestedBy,
        request.reason,
        authScope.corporationId
      );
      return result
        ? jsonResponse(200, { ...result, boundary: result.run.boundary })
        : safeErrorResponse('Refresh step is not eligible to skip', 409);
    }

    if (method !== 'POST') {
      return safeErrorResponse('Method not allowed', 405);
    }

    const body = parseJsonBody(event);
    assertNoUnsafeRefreshFields(body);
    const request = createIntelligenceRefreshRunRequestSchema.parse(body);
    const result = await createOrFindActiveRefreshRun(db, {
      corporationId: authScope.corporationId,
      requestedBy,
      domains: request.domains,
      mode: request.mode,
      reason: request.reason
    });

    return jsonResponse(result.duplicate ? 200 : 201, result);
  } catch (error) {
    const authResponse = authScopeErrorResponse(error);
    if (authResponse) {
      return authResponse;
    }

    if (error instanceof SyntaxError) {
      return safeErrorResponse('Request body must be valid JSON', 400);
    }

    if (error instanceof Error && error.message === 'Unsafe intelligence refresh field rejected') {
      return safeErrorResponse('Unsafe intelligence refresh field rejected', 400);
    }

    if (error && typeof error === 'object' && 'issues' in error) {
      return safeErrorResponse('Intelligence refresh request is invalid', 400);
    }

    return safeErrorResponse('Unable to process intelligence refresh request');
  }
}

async function buildRefreshReadiness(db: Awaited<ReturnType<typeof getMongoDb>>, corporationId: string): Promise<IntelligenceRefreshReadinessResponse> {
  const items: IntelligenceRefreshReadinessItem[] = [
    {
      key: 'session',
      label: 'Signed session',
      status: 'ready',
      reason: 'Signed EVE session is active.',
      safeDetails: ['Command scope is resolved server-side.']
    },
    {
      key: 'corporation',
      label: 'Corporation authorization',
      status: 'ready',
      reason: 'Corporation is authorized for command refresh preparation.',
      safeDetails: [`Corporation ${corporationId}`]
    },
    {
      key: 'storage',
      label: 'Command storage',
      status: 'ready',
      reason: 'MongoDB command storage is reachable for refresh records.',
      safeDetails: ['Refresh runs and events can be persisted.']
    }
  ];

  const vault = await findActiveOrLatestVault(db, corporationId);
  if (!vault || vault.status !== 'active') {
    items.push({
      key: 'esi_vault',
      label: 'ESI consent',
      status: 'blocked',
      reason: 'Active read-only ESI consent is required for fresh Numbers source preparation.',
      requiredAction: 'Start ESI read-sync consent before requesting fresh Numbers data.',
      safeDetails: ['Numbers refresh can evaluate existing data, but fresh source pulls are blocked.']
    });
  } else {
    const requiredScopes = requiredScopesForDomain('numbers');
    const missing = missingScopes(vault.grantedScopes, requiredScopes);
    items.push({
      key: 'esi_vault',
      label: 'ESI consent',
      status: missing.length > 0 ? 'blocked' : 'ready',
      reason:
        missing.length > 0
          ? 'Active ESI consent is missing required read scopes for Numbers.'
          : 'Active read-only ESI consent is available for Numbers preparation.',
      requiredAction: missing.length > 0 ? 'Re-authorize ESI consent with the required read scopes.' : undefined,
      safeDetails: missing.length > 0 ? [`Missing scopes: ${missing.join(', ')}`] : ['Numbers scopes available.']
    });
  }

  const workerSecrets = [
    'INTELLIGENCE_REFRESH_WORKER_CALLBACK_SECRET',
    'ESI_SYNC_WORKER_CALLBACK_SECRET',
    'PEOPLE_INGESTION_WORKER_CALLBACK_SECRET',
    'OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET',
    'BRAIN_WORKER_CALLBACK_SECRET',
    'WORKER_CALLBACK_SECRET'
  ];
  const hasWorkerSecret = workerSecrets.some((key) => Boolean(process.env[key]));
  items.push({
    key: 'worker_callbacks',
    label: 'Worker callbacks',
    status: hasWorkerSecret ? 'ready' : 'warning',
    reason: hasWorkerSecret
      ? 'Worker callback configuration is present for trusted worker progress.'
      : 'No worker callback secret is configured in this runtime.',
    requiredAction: hasWorkerSecret ? undefined : 'Configure worker callback secrets before expecting workers to claim or complete steps.',
    safeDetails: hasWorkerSecret ? ['Worker callbacks can authenticate.'] : ['Refresh run creation remains available.']
  });

  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  items.push({
    key: 'model_provider',
    label: 'Brain provider',
    status: hasOpenRouter ? 'ready' : 'warning',
    reason: hasOpenRouter
      ? 'Brain provider configuration is present for evaluation workers.'
      : 'OpenRouter configuration is missing in this runtime.',
    requiredAction: hasOpenRouter ? undefined : 'Configure OPENROUTER_API_KEY before expecting Brain evaluation to complete.',
    safeDetails: hasOpenRouter ? ['Model provider key is configured server-side.'] : ['Provider key value is not exposed.']
  });

  return {
    overallStatus: items.some((item) => item.status === 'blocked')
      ? 'blocked'
      : items.some((item) => item.status === 'warning' || item.status === 'unknown')
        ? 'degraded'
        : 'ready',
    items,
    boundary: 'Readiness checks inspect server-side configuration only. They do not fetch ESI, dispatch workers, call model providers, or mutate external services.',
    createdAt: new Date().toISOString()
  };
}
