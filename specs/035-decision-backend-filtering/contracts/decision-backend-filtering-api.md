# Decision Backend Filtering API

## GET /api/decision-records

Optional query parameters:

- `status`: one of `proposed`, `approved`, `delegated`, `done`, `rejected`
- `source`: one of `opportunity`, `numbers`, `people`
- `sourceBriefId`: existing brief/snapshot filter

Response remains:

```json
{
  "decisions": []
}
```

Filtering is read-only. The endpoint does not approve decisions, create queued work, dispatch workers, schedule retries, execute work, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

