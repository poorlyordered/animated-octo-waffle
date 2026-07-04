# Contract: ESI Worker Adapter Hardening

## Scope

The adapter is an internal server-side contract used by Netlify worker functions. It is not a browser API and must not be imported by frontend modules.

## Adapter Construction

```ts
interface CreateEsiWorkerAdapterOptions {
  db: Db;
  corporationId: string;
  vaultId: string;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
  now?: Date;
}
```

Constructing the adapter:

- Loads the active vault for the corporation and vault id.
- Checks required scopes in the caller before protected domain reads.
- Refreshes access token material when expiry is inside the safety window.
- Builds ESI access without returning token values to the caller.

## Endpoint Read Result

```ts
type EsiWorkerFailureCategory =
  | 'authentication'
  | 'authorization'
  | 'rate_limited'
  | 'not_found'
  | 'esi_service'
  | 'network'
  | 'timeout'
  | 'invalid_response'
  | 'unknown';

interface EsiWorkerEndpointResult<T = unknown> {
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
```

Rules:

- `data` is server-internal and is never returned directly to browser APIs.
- Failure messages are safe to include in sync history and Numbers risks.
- `attemptCount` includes the first attempt and retry attempts.
- `pageCount` is `1` for non-paginated success, `0` for failures before a response body is accepted.

## Numbers Endpoint Set

M62 adapter consumers must cover:

- Wallet divisions: `/corporations/{corporationId}/wallets/`
- Corporation assets: `/corporations/{corporationId}/assets/`
- Industry jobs: `/corporations/{corporationId}/industry/jobs/`
- Market orders: `/corporations/{corporationId}/orders/`

The caller receives four endpoint results and may complete with partial success.

## Safety Contract

The adapter and all callers must not expose:

- Access tokens
- Refresh tokens
- Sealed token material
- OAuth client secrets
- MongoDB credentials
- Raw ESI provider error bodies
- Browser-executable ESI request details
- EVE write or mutation handles

M62 must not persist raw ESI response caches. Persisted data is limited to derived Numbers snapshots, sync request status, and safe failure/provenance metadata.
