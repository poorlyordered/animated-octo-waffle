# Contract: M54 Opportunity ESI Worker Planning

## `GET /api/esi-sync-worker?domain=opportunity`

Lists queued Opportunity ESI sync requests for authorized `esi_sync` workers.

## `POST /api/esi-sync-worker/:id/claim`

Claims a queued Opportunity ESI sync request for the supplied `workerId`.

## `POST /api/esi-sync-worker/:id/complete`

Completes a claimed Opportunity ESI sync request with a safe result summary.

Request body:

```json
{
  "workerId": "opportunity-esi-worker-1",
  "result": {
    "snapshotId": "opportunity-sync-1",
    "sourceCount": 3,
    "summary": "Opportunity ESI structures read completed.",
    "sectionStatuses": [
      {
        "key": "structures",
        "status": "processed"
      }
    ],
    "failures": []
  }
}
```

Response body:

```json
{
  "syncRequest": {
    "id": "sync-opportunity-1",
    "corporationId": "123456789",
    "domain": "opportunity",
    "status": "completed",
    "requiredScopes": ["esi-corporations.read_structures.v1"],
    "requestedAt": "2026-07-01T10:00:00.000Z",
    "claimedBy": "opportunity-esi-worker-1",
    "completedAt": "2026-07-01T10:05:00.000Z",
    "result": {
      "snapshotId": "opportunity-sync-1",
      "sourceCount": 3,
      "summary": "Opportunity ESI structures read completed.",
      "sectionStatuses": [
        {
          "key": "structures",
          "status": "processed"
        }
      ],
      "failures": []
    }
  }
}
```

Boundaries:

- `/run` remains Numbers-only.
- Opportunity completion stores safe summaries only.
- No access token, refresh token, sealed token material, OAuth secret, dispatch target, retry scheduling handle, raw ESI payload, role/access mutation payload, or external execution handle is returned.
