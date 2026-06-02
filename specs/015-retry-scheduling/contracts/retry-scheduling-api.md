# Contract: Retry Scheduling API

## POST `/api/worker-handoffs/{handoffId}/retry`

Schedules retry intent for a failed worker handoff.

### Request

```json
{
  "reason": "Source data is now available.",
  "notBefore": "2026-06-02T18:00:00.000Z"
}
```

### Response

```json
{
  "retry": {
    "id": "retry-1",
    "targetType": "worker_handoff",
    "targetId": "handoff-1",
    "status": "scheduled",
    "reason": "Source data is now available.",
    "notBefore": "2026-06-02T18:00:00.000Z",
    "createdAt": "2026-06-02T17:00:00.000Z",
    "boundary": "Retry scheduled only. No worker was dispatched and no execution occurred."
  },
  "duplicate": false
}
```

## POST `/api/esi-sync/{syncRequestId}/retry`

Schedules retry intent for a failed Numbers ESI sync request.

### Rules

- Target must be scoped to the active corporation.
- Target must have status `failed`.
- Existing scheduled retry for the target is returned as duplicate.
- Response must not include token material, worker secrets, dispatch targets, retry execution handles, or raw ESI payloads.
