import { createRequire } from 'node:module';
import type { Db } from 'mongodb';
import { readEveSsoLiveConfig } from './eve-sso';
import { refreshEveSsoToken } from './eve-sso-live';
import { findActiveVaultById, updateVaultTokenMaterial } from './esi-token-vault-store';
import { unsealTokenMaterial, type EsiTokenVaultDocument } from './esi-token-vault';

type Fetch = typeof fetch;
type EsiClientPackage = typeof import('@lgriffin/esi.ts');

const requireEsiClient = createRequire(`${process.cwd()}/package.json`);
const {
  ApiClientBuilder,
  isForbidden,
  isNotFound,
  isRateLimited,
  isRetryable,
  isServerError,
  isTimeout,
  isUnauthorized,
  isValidationError
} = requireEsiClient('@lgriffin/esi.ts') as EsiClientPackage;

export type EsiWorkerFailureCategory =
  | 'authentication'
  | 'authorization'
  | 'rate_limited'
  | 'not_found'
  | 'esi_service'
  | 'network'
  | 'timeout'
  | 'invalid_response'
  | 'unknown';

export interface EsiWorkerEndpointRequest {
  label: string;
  sourceId: string;
  path: string;
  paginated?: boolean;
  maxPages?: number;
}

export interface EsiWorkerEndpointResult<T = unknown> {
  label: string;
  sourceId: string;
  url: string;
  ok: boolean;
  data: T | null;
  pageCount: number;
  attemptCount: number;
  retryable: boolean;
  failureCategory?: EsiWorkerFailureCategory;
  failure?: string;
  startedAt: string;
  completedAt: string;
}

export interface EsiWorkerAdapter {
  vault: EsiTokenVaultDocument;
  readEndpoint<T = unknown>(request: EsiWorkerEndpointRequest): Promise<EsiWorkerEndpointResult<T>>;
}

export interface CreateEsiWorkerAdapterOptions {
  db: Db;
  corporationId: string;
  vaultId: string;
  vault?: EsiTokenVaultDocument;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: Fetch;
  now?: Date;
}

const tokenRefreshSafetyWindowMs = 2 * 60 * 1000;
const defaultMaxAttempts = 2;
const defaultMaxPages = 25;

export async function createEsiWorkerAdapter({
  db,
  corporationId,
  vaultId,
  vault: providedVault,
  env = process.env,
  fetchImpl = fetch,
  now = new Date()
}: CreateEsiWorkerAdapterOptions): Promise<EsiWorkerAdapter> {
  const vault = providedVault ?? (await findActiveVaultById(db, corporationId, vaultId));
  if (!vault) {
    throw new Error('Active ESI token vault not found');
  }

  const freshVault = await ensureFreshVaultToken(db, vault, env, fetchImpl, now);
  const accessToken = unsealTokenMaterial(freshVault.sealedAccessToken, env);
  const apiClient = new ApiClientBuilder()
    .setClientId(env.EVE_SSO_CLIENT_ID ?? 'gryyk-47-worker')
    .setLink(trimTrailingSlash(env.EVE_ESI_BASE_URL ?? 'https://esi.evetech.net/latest'))
    .setAccessToken(accessToken)
    .setTimeout(15000)
    .build();
  const authorizationHeader = apiClient.getAuthorizationHeader();

  if (!authorizationHeader) {
    throw new Error('ESI worker adapter could not create authorization header');
  }

  return {
    vault: freshVault,
    readEndpoint: (request) => readEndpoint(request, authorizationHeader, env, fetchImpl)
  };
}

export async function ensureFreshVaultToken(
  db: Db,
  vault: EsiTokenVaultDocument,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: Fetch = fetch,
  now = new Date()
): Promise<EsiTokenVaultDocument> {
  const expiresAt = Date.parse(vault.accessTokenExpiresAt);
  if (Number.isFinite(expiresAt) && expiresAt - now.getTime() > tokenRefreshSafetyWindowMs) {
    return vault;
  }

  const refreshToken = unsealTokenMaterial(vault.sealedRefreshToken, env);
  const refreshed = await refreshEveSsoToken(refreshToken, readEveSsoLiveConfig(env), fetchImpl);
  const updated = await updateVaultTokenMaterial(db, vault, refreshed, env, now);
  if (!updated) {
    throw new Error('ESI token vault refresh could not be persisted');
  }

  return updated;
}

export async function readEndpoint<T = unknown>(
  request: EsiWorkerEndpointRequest,
  authorizationHeader: string,
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: Fetch = fetch
): Promise<EsiWorkerEndpointResult<T>> {
  const startedAt = new Date().toISOString();
  const maxPages = Math.max(1, Math.trunc(request.maxPages ?? defaultMaxPages));
  let attemptCount = 0;
  let lastUrl = buildUrl(env, request.path, undefined);

  for (let attempt = 1; attempt <= defaultMaxAttempts; attempt += 1) {
    attemptCount = attempt;
    try {
      const first = await fetchJsonPage(lastUrl, authorizationHeader, fetchImpl);
      if (!first.ok) {
        if (first.retryable && attempt < defaultMaxAttempts) {
          continue;
        }

        return failureResult(request, lastUrl, first.category, first.failure, first.retryable, attemptCount, startedAt);
      }

      const totalPages = request.paginated ? first.totalPages : 1;
      if (totalPages > maxPages) {
        return failureResult(
          request,
          lastUrl,
          'invalid_response',
          `${request.label} ESI endpoint exceeded the ${maxPages} page worker limit.`,
          false,
          attemptCount,
          startedAt
        );
      }

      const pages = [first.data];
      for (let page = 2; page <= totalPages; page += 1) {
        lastUrl = buildUrl(env, request.path, page);
        const next = await fetchJsonPage(lastUrl, authorizationHeader, fetchImpl);
        if (!next.ok) {
          return failureResult(request, lastUrl, next.category, next.failure, next.retryable, attemptCount, startedAt);
        }
        pages.push(next.data);
      }

      return {
        label: request.label,
        sourceId: request.sourceId,
        url: buildUrl(env, request.path, undefined),
        ok: true,
        data: flattenPages<T>(pages),
        pageCount: totalPages,
        attemptCount,
        retryable: false,
        startedAt,
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      const category = classifyEsiError(error);
      const retryable = isRetryableWorkerFailure(category);
      if (retryable && attempt < defaultMaxAttempts) {
        continue;
      }

      return failureResult(
        request,
        lastUrl,
        category,
        category === 'timeout' ? `${request.label} ESI endpoint timed out.` : `${request.label} ESI endpoint could not be read.`,
        retryable,
        attemptCount,
        startedAt
      );
    }
  }

  return failureResult(request, lastUrl, 'unknown', `${request.label} ESI endpoint could not be read.`, true, attemptCount, startedAt);
}

export function classifyHttpStatus(status: number): EsiWorkerFailureCategory {
  if (status === 401) return 'authentication';
  if (status === 403) return 'authorization';
  if (status === 404) return 'not_found';
  if (status === 420 || status === 429) return 'rate_limited';
  if (status === 408) return 'timeout';
  if (status >= 500) return 'esi_service';
  return 'unknown';
}

export function classifyEsiError(error: unknown): EsiWorkerFailureCategory {
  if (isUnauthorized(error)) return 'authentication';
  if (isForbidden(error)) return 'authorization';
  if (isNotFound(error)) return 'not_found';
  if (isRateLimited(error)) return 'rate_limited';
  if (isServerError(error)) return 'esi_service';
  if (isTimeout(error)) return 'timeout';
  if (isValidationError(error)) return 'invalid_response';
  if (isRetryable(error)) return 'network';
  if (error instanceof DOMException && error.name === 'AbortError') return 'timeout';
  return 'network';
}

export function isRetryableWorkerFailure(category: EsiWorkerFailureCategory): boolean {
  return category === 'rate_limited' || category === 'esi_service' || category === 'network' || category === 'timeout';
}

async function fetchJsonPage(url: string, authorizationHeader: string, fetchImpl: Fetch) {
  const response = await fetchImpl(url, {
    headers: {
      authorization: authorizationHeader
    }
  });

  if (!response.ok) {
    const category = classifyHttpStatus(response.status);
    return {
      ok: false as const,
      category,
      retryable: isRetryableWorkerFailure(category),
      failure: `ESI endpoint returned ${response.status}.`
    };
  }

  try {
    const totalPages = Number.parseInt(response.headers.get('x-pages') ?? '1', 10);
    return {
      ok: true as const,
      data: await response.json(),
      totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1
    };
  } catch {
    return {
      ok: false as const,
      category: 'invalid_response' as const,
      retryable: false,
      failure: 'ESI endpoint returned invalid JSON.'
    };
  }
}

function failureResult<T = unknown>(
  request: EsiWorkerEndpointRequest,
  url: string,
  failureCategory: EsiWorkerFailureCategory,
  failure: string,
  retryable: boolean,
  attemptCount: number,
  startedAt: string
): EsiWorkerEndpointResult<T> {
  return {
    label: request.label,
    sourceId: request.sourceId,
    url,
    ok: false,
    data: null,
    pageCount: 0,
    attemptCount,
    retryable,
    failureCategory,
    failure: `${request.label} ${failure}`,
    startedAt,
    completedAt: new Date().toISOString()
  };
}

function flattenPages<T>(pages: unknown[]): T {
  if (pages.every((page) => Array.isArray(page))) {
    return pages.flat() as T;
  }

  return pages[0] as T;
}

function buildUrl(env: NodeJS.ProcessEnv, path: string, page: number | undefined): string {
  const baseUrl = trimTrailingSlash(env.EVE_ESI_BASE_URL ?? 'https://esi.evetech.net/latest');
  const url = new URL(`${baseUrl}/${path.replace(/^\//, '')}`);
  url.searchParams.set('datasource', 'tranquility');
  if (page) {
    url.searchParams.set('page', String(page));
  }
  return url.toString();
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
