# Contract: M42 People Ingestion Expansion

## Commander Prepare

`POST /api/people/ingestion/prepare`

Request:

```json
{
  "reason": "Refresh member role, activity, and delegation context."
}
```

Response `201` for a new request, `200` for an existing active request:

```json
{
  "request": {
    "id": "people-ingestion-1",
    "status": "queued",
    "requestedAt": "2026-06-30T00:00:00.000Z",
    "sectionStatuses": [
      { "key": "identity", "status": "missing" },
      { "key": "roles", "status": "missing" },
      { "key": "activity", "status": "missing" },
      { "key": "delegation", "status": "missing" }
    ],
    "boundary": "Prepared for future People ingestion. No worker was dispatched, no ESI data was fetched, and no EVE role/access or external-service change occurred."
  },
  "provenance": {},
  "duplicate": false,
  "message": "People ingestion prepared for worker pickup. No worker was dispatched, no ESI data was fetched, and no EVE role/access or external-service change occurred."
}
```

## Worker List

`GET /api/people-ingestion-worker`

Requires `x-worker-callback-secret`.

Response:

```json
{
  "requests": [
    {
      "id": "people-ingestion-1",
      "corporationId": "917701062",
      "status": "queued",
      "requestedAt": "2026-06-30T00:00:00.000Z",
      "sectionStatuses": []
    }
  ]
}
```

## Worker Claim

`POST /api/people-ingestion-worker/:id/claim`

```json
{ "workerId": "people-worker-1" }
```

## Worker Complete

`POST /api/people-ingestion-worker/:id/complete`

```json
{
  "workerId": "people-worker-1",
  "sourceCount": 4,
  "sectionStatuses": [
    { "key": "identity", "status": "present" },
    { "key": "roles", "status": "stale" },
    { "key": "activity", "status": "present" },
    { "key": "delegation", "status": "missing" }
  ]
}
```

## Worker Fail

`POST /api/people-ingestion-worker/:id/fail`

```json
{ "workerId": "people-worker-1", "reason": "ESI member endpoint unavailable." }
```
