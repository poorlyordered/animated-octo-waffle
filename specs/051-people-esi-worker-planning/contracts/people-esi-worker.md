# Contract: People ESI Worker Planning

## `GET /api/esi-sync-worker?domain=people`

Lists queued People ESI sync requests for authorized `esi_sync` workers.

## `POST /api/esi-sync-worker/:id/claim`

Claims a queued Numbers or People ESI sync request.

## `POST /api/esi-sync-worker/:id/complete`

Completes a claimed People ESI sync request with a safe result summary.

Request:

```json
{
  "workerId": "people-esi-worker-1",
  "result": {
    "sourceCount": 25,
    "summary": "People ESI membership read completed.",
    "sectionStatuses": [
      { "key": "membership", "status": "processed" }
    ],
    "failures": []
  }
}
```

Response:

```json
{
  "syncRequest": {
    "id": "sync-people-1",
    "corporationId": "917701062",
    "domain": "people",
    "status": "completed",
    "requiredScopes": ["esi-corporations.read_corporation_membership.v1"],
    "requestedAt": "2026-06-30T23:00:00.000Z",
    "claimedBy": "people-esi-worker-1",
    "completedAt": "2026-06-30T23:05:00.000Z",
    "result": {
      "sourceCount": 25,
      "summary": "People ESI membership read completed.",
      "sectionStatuses": [{ "key": "membership", "status": "processed" }],
      "failures": []
    }
  }
}
```

## Boundaries

- `/run` remains Numbers-only.
- Opportunity ESI sync remains planning-only.
- Worker responses must not include token material, raw ESI payloads, role/access mutation payloads, or execution handles.
