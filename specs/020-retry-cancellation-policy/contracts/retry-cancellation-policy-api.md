# Contract: Retry Cancellation and Policy Controls API

## POST /api/worker-handoffs/:handoffId/retry/cancel

Cancels the latest scheduled or blocked retry for a worker handoff target.

Request:

```json
{
  "reason": "Commander canceled retry after policy review."
}
```

Response:

```json
{
  "retry": {
    "id": "retry-handoff-canceled",
    "targetType": "worker_handoff",
    "targetId": "handoff-1",
    "status": "canceled",
    "reason": "Commander approved retry scheduling for failed worker handoff.",
    "createdAt": "2026-06-02T17:30:00.000Z",
    "canceledAt": "2026-06-02T17:36:00.000Z",
    "canceledBy": "commander",
    "cancelReason": "Commander canceled retry after policy review.",
    "policy": {
      "canSchedule": true,
      "canCancel": false,
      "activeScheduledLimit": 1,
      "cancelableStatuses": ["scheduled", "blocked"],
      "boundary": "Retry policy: one active scheduled retry is allowed per target. Scheduled and blocked retries can be canceled; claimed and completed retries cannot."
    },
    "boundary": "Retry canceled by commander. No worker was dispatched and no execution occurred."
  }
}
```

## POST /api/esi-sync/:syncRequestId/retry/cancel

Same request and response shape, with `targetType: "esi_sync_request"`.

Boundary:

- The response is record-only.
- It does not dispatch workers, claim retries, execute retries, fetch ESI, write to EVE, or execute external services.
- It must not include token material, secrets, worker credentials, dispatch targets, or execution handles.
