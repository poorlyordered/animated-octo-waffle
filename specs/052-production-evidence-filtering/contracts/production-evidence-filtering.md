# Contract: Production Evidence Filtering

M52 does not change the HTTP contract for `GET /api/production-evidence`.

The browser derives these local filters from the existing response:

```ts
type EnvironmentFilter = 'all' | 'production' | 'staging' | 'controlled_staging';
type DecisionFilter = 'all' | 'go' | 'no_go' | 'controlled_staging';
type CheckStatusFilter = 'all' | 'verified' | 'attention' | 'blocked' | 'not_applicable';
```

No request body, query parameter, cookie, local storage value, server preference record, production export endpoint, or external provider call is added by this slice.
