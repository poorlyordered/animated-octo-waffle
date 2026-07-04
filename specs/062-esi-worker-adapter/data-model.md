# Data Model: ESI Worker Adapter Hardening

## EsiWorkerAdapterRequest

Represents one protected or public ESI read requested by a worker.

- `label`: Human-readable endpoint group label for safe sync history.
- `sourceId`: Stable safe source identifier such as `esi:corporation-assets`.
- `path`: ESI path relative to the configured ESI base URL.
- `requiresAuth`: Whether a bearer token is required.
- `paginated`: Whether the adapter must collect pages.
- `maxPages`: Safe upper bound for paginated reads.
- `responseKind`: Expected response shape for validation and summary generation.

Validation rules:

- Must not contain token values.
- Must identify only read-only ESI paths.
- `maxPages` must be finite and positive when `paginated` is true.

## EsiWorkerEndpointResult

Normalized result for a single ESI endpoint.

- `label`
- `sourceId`
- `url`
- `ok`
- `data`: Present only for successful reads and consumed by server-side ingestion.
- `pageCount`
- `attemptCount`
- `retryable`
- `failureCategory`: `authentication`, `authorization`, `rate_limited`, `not_found`, `esi_service`, `network`, `timeout`, `invalid_response`, or `unknown`.
- `failure`: Safe human-readable failure message.
- `startedAt`
- `completedAt`

Validation rules:

- Browser-visible summaries may include labels, categories, retryability, timestamps, and safe messages.
- Raw tokens, sealed token material, OAuth secrets, and raw provider error bodies must not be exposed.

## VaultTokenRefreshResult

Safe outcome of checking or refreshing an active ESI token vault.

- `status`: `fresh`, `refreshed`, or `failed`.
- `vaultId`
- `accessTokenExpiresAt`
- `failureCategory`
- `failure`
- `updatedAt`

Validation rules:

- Successful refresh persists new sealed access token, sealed refresh token when returned, granted scopes, and expiry.
- Returned safe result never includes token values or ciphertext.

## NumbersSyncResult

Existing worker result extended by consuming normalized endpoint results.

- `snapshotId`
- `sourceCount`
- `summary`
- `sectionStatuses`
- `failures`
- `endpointResults`: Internal-only endpoint metadata for determining snapshot sections and provenance.

Validation rules:

- Successful endpoint data may be transformed into derived Numbers sections.
- Failed endpoints produce missing/watch section states and safe risks/follow-ups.
- Partial success is valid when at least one endpoint succeeds.
