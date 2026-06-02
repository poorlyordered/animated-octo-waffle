# Contract: Worker Numbers ESI Ingestion API

All worker routes require `x-worker-callback-secret`. Responses are safe summaries and must not include access tokens, refresh tokens, sealed token material, OAuth secrets, MongoDB credentials, worker secrets, dispatch targets, retry schedules, or external execution handles.

## GET /api/esi-sync-worker/ready?domain=numbers

Lists queued sync requests for trusted workers.

### Response 200

```json
{
  "syncRequests": [
    {
      "id": "sync_01",
      "domain": "numbers",
      "status": "queued",
      "corporationId": "987654321",
      "requestedAt": "2026-06-02T12:45:00.000Z",
      "requiredScopes": ["esi-wallet.read_corporation_wallets.v1"]
    }
  ]
}
```

## POST /api/esi-sync-worker/:id/claim

Claims one queued sync request.

### Request

```json
{
  "workerId": "numbers-worker-1"
}
```

### Response 200

```json
{
  "syncRequest": {
    "id": "sync_01",
    "domain": "numbers",
    "status": "claimed",
    "claimedBy": "numbers-worker-1",
    "claimedAt": "2026-06-02T13:00:00.000Z"
  }
}
```

## POST /api/esi-sync-worker/:id/run

Claims if needed, fetches read-only ESI Numbers data, writes a processed Numbers snapshot, and completes or fails the request.

### Request

```json
{
  "workerId": "numbers-worker-1"
}
```

### Response 200

```json
{
  "syncRequest": {
    "id": "sync_01",
    "domain": "numbers",
    "status": "completed",
    "result": {
      "snapshotId": "numbers_snapshot_01",
      "sourceCount": 4,
      "summary": "Numbers ESI sync completed with 5 sections."
    }
  }
}
```

## POST /api/esi-sync-worker/:id/fail

Stores a safe failure summary for a claimed sync request.

### Request

```json
{
  "workerId": "numbers-worker-1",
  "reason": "ESI wallet endpoint returned 403"
}
```
