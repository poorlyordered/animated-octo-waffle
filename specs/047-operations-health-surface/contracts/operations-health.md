# Contract: Operations Health API

## `GET /api/operations-health`

Returns a browser-safe health summary for the current command corporation scope.

### Response

```json
{
  "generatedAt": "2026-06-30T22:00:00.000Z",
  "corporationId": "917701062",
  "overallStatus": "degraded",
  "commandApis": [],
  "ingestion": [],
  "retryPosture": {},
  "workerReadiness": [],
  "warnings": [],
  "boundary": "Operations health is read-only..."
}
```

### Safety Rules

- Response must not include MongoDB credentials, OAuth secrets, worker secrets, sealing keys, access tokens, refresh tokens, token hashes, cookies, raw ESI payloads, dispatch targets, or production record exports.
- Worker readiness may expose only `configured`, `fallback`, or `missing` secret state.
- Collection-derived fields must be counts, timestamps, status labels, and value-free evidence text only.
- The endpoint must not dispatch workers, run retries, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or mutate external services.
