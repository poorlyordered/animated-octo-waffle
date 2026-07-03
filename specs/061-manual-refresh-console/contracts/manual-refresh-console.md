# Contracts: Manual Refresh Console

## Shared Contract Additions

### Refresh Mode

```ts
type IntelligenceRefreshMode = 'evaluate_existing' | 'prepare_sources' | 'full_refresh';
```

### Readiness Response

```ts
interface IntelligenceRefreshReadinessItem {
  key: string;
  label: string;
  status: 'ready' | 'blocked' | 'warning' | 'unknown';
  reason: string;
  requiredAction?: string;
  safeDetails: string[];
}

interface IntelligenceRefreshReadinessResponse {
  overallStatus: 'ready' | 'blocked' | 'degraded';
  items: IntelligenceRefreshReadinessItem[];
  boundary: string;
  createdAt: string;
}
```

### Create Run Request

```ts
interface CreateIntelligenceRefreshRunRequest {
  domains: IntelligenceRefreshDomain[];
  mode?: IntelligenceRefreshMode;
  reason?: string;
}
```

`mode` defaults to `full_refresh` for backward compatibility.

### Run Detail Response

```ts
interface IntelligenceRefreshRunDetailResponse {
  run: IntelligenceRefreshRunSummary;
  timeline: IntelligenceRefreshTimelineItem[];
  events: IntelligenceRefreshRunEvent[];
  boundary: string;
}
```

### Retry Step Request

```ts
interface IntelligenceRefreshStepRetryRequest {
  reason: string;
}

interface IntelligenceRefreshStepRetryResponse {
  run: IntelligenceRefreshRunSummary;
  event: IntelligenceRefreshRunEvent;
  boundary: string;
}
```

### Skip Step Request

```ts
interface IntelligenceRefreshStepSkipRequest {
  reason: string;
}

interface IntelligenceRefreshStepSkipResponse {
  run: IntelligenceRefreshRunSummary;
  event: IntelligenceRefreshRunEvent;
  boundary: string;
}
```

## Commander API

### `GET /api/intelligence-refresh/readiness`

Returns `IntelligenceRefreshReadinessResponse` for the signed command scope.

Authorization:

- Requires signed EVE session.
- Response is scoped to server-resolved corporation only.

No-execution boundary:

- Does not fetch ESI, dispatch workers, call model providers, or mutate external services.

### `GET /api/intelligence-refresh/:runId`

Returns `IntelligenceRefreshRunDetailResponse`.

Authorization:

- Requires signed EVE session.
- Run id must belong to the signed corporation.

### `POST /api/intelligence-refresh`

Accepts `CreateIntelligenceRefreshRunRequest` with domains, mode, and optional reason. Returns existing `CreateIntelligenceRefreshRunResponse`.

Authorization:

- Requires signed EVE session.

No-execution boundary:

- Creates durable run and linked prepared requests only.
- Does not run workers or long-running collection.

### `POST /api/intelligence-refresh/:runId/steps/:stepId/retry`

Records retry intent for an eligible failed or blocked step. Returns `IntelligenceRefreshStepRetryResponse`.

No-execution boundary:

- Does not dispatch worker, claim step, fetch ESI, call provider, or execute retry.

### `POST /api/intelligence-refresh/:runId/steps/:stepId/skip`

Records skip intent for an eligible step. Returns `IntelligenceRefreshStepSkipResponse`.

No-execution boundary:

- Does not execute downstream evaluation automatically.

## Browser Client

Client methods:

- `getIntelligenceRefreshReadiness()`
- `listIntelligenceRefreshRuns()`
- `getIntelligenceRefreshRun(runId)`
- `createIntelligenceRefreshRun(request)`
- `retryIntelligenceRefreshStep(runId, stepId, request)`
- `skipIntelligenceRefreshStep(runId, stepId, request)`

All responses must parse through shared Zod schemas.

## Unsafe Field Rejection

All commander-originating payloads reject:

- token material
- raw ESI payloads
- raw provider payloads
- dispatch handles
- browser-selected corporation scope
- worker secrets
- EVE write intents
- wallet, asset, contract, role, access, or standing mutation fields
- deploy, rollback, or external-service mutation fields
