# Contract: M43 Opportunity Ingestion Expansion

## Commander Prepare

`POST /api/command-brief/opportunity/prepare?focus=grykk-47-eve-official-news`

Request:

```json
{
  "reason": "Refresh official news and strategic Opportunity context."
}
```

Response `201` for a new request, `200` for an existing active request:

```json
{
  "request": {
    "id": "opportunity-ingestion-1",
    "status": "queued",
    "requestedAt": "2026-06-30T00:00:00.000Z",
    "updatedAt": "2026-06-30T00:00:00.000Z",
    "requestedBy": "Commander",
    "sectionStatuses": [
      { "key": "sources", "status": "missing" },
      { "key": "impacts", "status": "missing" },
      { "key": "recommendations", "status": "missing" },
      { "key": "watchlist", "status": "missing" }
    ],
    "boundary": "Prepared for future Opportunity ingestion. No research pull was scheduled, no worker was dispatched, no ESI data was fetched, no EVE write occurred, and no external service was executed."
  },
  "provenance": {},
  "duplicate": false,
  "message": "Opportunity ingestion prepared for worker pickup. No research pull was scheduled, no worker was dispatched, no ESI data was fetched, no EVE write occurred, and no external service was executed."
}
```

## Worker List

`GET /api/opportunity-ingestion-worker?focus=grykk-47-eve-official-news`

Requires `x-worker-callback-secret`.

Response:

```json
{
  "requests": [
    {
      "id": "opportunity-ingestion-1",
      "corporationId": "917701062",
      "focus": "grykk-47-eve-official-news",
      "status": "queued",
      "requestedAt": "2026-06-30T00:00:00.000Z",
      "updatedAt": "2026-06-30T00:00:00.000Z",
      "requestedBy": "Commander",
      "sectionStatuses": []
    }
  ]
}
```

## Worker Claim

`POST /api/opportunity-ingestion-worker/:id/claim`

```json
{ "workerId": "opportunity-worker-1" }
```

## Worker Complete

`POST /api/opportunity-ingestion-worker/:id/complete`

```json
{
  "workerId": "opportunity-worker-1",
  "sourceCount": 4,
  "sectionStatuses": [
    { "key": "sources", "status": "present" },
    { "key": "impacts", "status": "present" },
    { "key": "recommendations", "status": "present" },
    { "key": "watchlist", "status": "missing" }
  ]
}
```

## Worker Fail

`POST /api/opportunity-ingestion-worker/:id/fail`

```json
{ "workerId": "opportunity-worker-1", "reason": "Official news feed unavailable." }
```
