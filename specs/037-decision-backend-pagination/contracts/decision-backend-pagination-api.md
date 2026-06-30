# Decision Backend Pagination API

## GET /api/decision-records

Optional query parameters:

- `status`: existing bounded decision status filter
- `source`: existing bounded decision source filter
- `sourceBriefId`: existing source brief/snapshot filter
- `page`: positive integer, defaults to 1
- `pageSize`: one of `3`, `5`, or `10`, defaults to 5

Response:

```json
{
  "decisions": [],
  "pagination": {
    "page": 1,
    "pageSize": 5,
    "totalItems": 0,
    "totalPages": 1,
    "startIndex": 0,
    "endIndex": 0
  }
}
```

Pagination is read-only. It does not approve decisions, create queued work, dispatch workers, schedule retries, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.

