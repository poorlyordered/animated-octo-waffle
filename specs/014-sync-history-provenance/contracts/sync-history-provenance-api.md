# Contract: Sync History Provenance API

## GET `/api/esi-sync/status`

Extends the existing browser-safe ESI sync status response with recent sync history.

### Response

```json
{
  "vault": {},
  "domains": [],
  "history": [
    {
      "id": "sync-1",
      "domain": "numbers",
      "status": "completed",
      "requestedAt": "2026-06-02T16:00:00.000Z",
      "claimedBy": "worker-a",
      "claimedAt": "2026-06-02T16:01:00.000Z",
      "completedAt": "2026-06-02T16:03:00.000Z",
      "snapshotId": "snapshot-1",
      "sourceCount": 4,
      "sectionStatuses": [
        { "key": "wallet", "status": "healthy" }
      ],
      "boundary": "Read-only sync history. No worker was dispatched and no retry was scheduled."
    }
  ]
}
```

### Rules

- History is scoped to the active corporation.
- History is bounded and ordered newest first.
- Response must not include access tokens, refresh tokens, sealed token material, OAuth secrets, MongoDB credentials, worker secrets, dispatch targets, retry schedules, raw ESI payloads, or external execution handles.

## GET `/api/numbers`

Extends the existing Numbers response with latest live provenance.

### Response

```json
{
  "snapshot": {},
  "liveProvenance": {
    "mode": "live_sync",
    "syncRequestId": "sync-1",
    "snapshotId": "snapshot-1",
    "status": "completed",
    "requestedAt": "2026-06-02T16:00:00.000Z",
    "completedAt": "2026-06-02T16:03:00.000Z",
    "snapshotCreatedAt": "2026-06-02T16:03:00.000Z",
    "sourceCount": 4,
    "sectionStatuses": [
      { "key": "wallet", "status": "healthy" }
    ],
    "message": "Latest Numbers snapshot was produced by a completed read-only ESI sync.",
    "boundary": "Read-only provenance. No ESI write, worker dispatch, retry, wallet, asset, contract, role, or external-service action was performed."
  }
}
```

### Modes

- `live_sync`: Latest snapshot is linked to a completed ESI sync request.
- `historical_snapshot`: Snapshot exists but no completed sync linkage is available.
- `unavailable`: No snapshot exists for the active scope.

### Rules

- The active corporation scope is server-resolved.
- Browser-provided corporation overrides, token material, retry flags, dispatch fields, wallet/asset/contract/role actions, and external mutation fields are rejected or ignored.
- Response must remain browser-safe and read-only.
