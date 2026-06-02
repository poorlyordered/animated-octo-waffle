# Contract: Retry Execution Worker API

All worker routes require `x-worker-callback-secret`. Responses are safe summaries and must not include access tokens, refresh tokens, sealed token material, OAuth secrets, MongoDB credentials, worker secrets, dispatch targets, raw ESI payloads, or external execution handles.

## GET `/api/retry-worker/ready`

Lists due scheduled retry requests for trusted retry workers.

### Response 200

```json
{
  "retries": [
    {
      "id": "retry-1",
      "targetType": "worker_handoff",
      "targetId": "handoff-1",
      "status": "scheduled",
      "reason": "Source data is now available.",
      "createdAt": "2026-06-02T17:00:00.000Z",
      "notBefore": "2026-06-02T18:00:00.000Z",
      "boundary": "Retry execution is worker-only and uses prior commander approval."
    }
  ]
}
```

## POST `/api/retry-worker/{retryId}/claim`

Atomically claims one scheduled retry request.

### Request

```json
{
  "workerId": "retry-worker-1"
}
```

### Response 200

```json
{
  "retry": {
    "id": "retry-1",
    "targetType": "worker_handoff",
    "targetId": "handoff-1",
    "status": "claimed",
    "claimedBy": "retry-worker-1",
    "claimedAt": "2026-06-02T18:01:00.000Z"
  }
}
```

## POST `/api/retry-worker/{retryId}/execute`

Claims if needed, applies retry policy, and prepares replacement work.

### Request

```json
{
  "workerId": "retry-worker-1"
}
```

### Response 200 - Handoff Retry Completed

```json
{
  "retry": {
    "id": "retry-1",
    "targetType": "worker_handoff",
    "targetId": "handoff-1",
    "status": "completed",
    "completedAt": "2026-06-02T18:02:00.000Z",
    "result": {
      "replacementTargetId": "handoff-2",
      "replacementTargetStatus": "ready",
      "summary": "Prepared replacement worker handoff from commander-approved retry."
    }
  }
}
```

### Response 200 - ESI Sync Retry Completed

```json
{
  "retry": {
    "id": "retry-2",
    "targetType": "esi_sync_request",
    "targetId": "sync-1",
    "status": "completed",
    "completedAt": "2026-06-02T18:02:00.000Z",
    "result": {
      "replacementTargetId": "sync-2",
      "replacementTargetStatus": "queued",
      "summary": "Prepared replacement Numbers ESI sync request from commander-approved retry."
    }
  }
}
```

### Response 200 - Retry Blocked

```json
{
  "retry": {
    "id": "retry-3",
    "targetType": "esi_sync_request",
    "targetId": "sync-3",
    "status": "blocked",
    "blockedReason": "Active ESI consent is required before this sync retry can be queued."
  }
}
```
