# Contract: Operations Health Filtering

M50 does not change the HTTP contract for `GET /api/operations-health`.

The browser derives these local filters from the existing response:

```ts
type WarningSeverityFilter = 'all' | 'info' | 'warning' | 'critical';
type WorkerStatusFilter = 'all' | 'ready' | 'degraded' | 'blocked';
type WorkerSecretFilter = 'all' | 'configured' | 'fallback' | 'missing';
```

No request body, query parameter, cookie, local storage value, server preference record, or external provider call is added by this slice.
