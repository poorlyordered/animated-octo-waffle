# Contract: People Worker Handoff API

M33 does not introduce a new backend endpoint.

The browser calls the existing automation queue handoff contract:

## POST `/api/automation-queue/:queueItemId/handoff`

### Request

```json
{}
```

### Response `200` or `201`

```json
{
  "handoff": {
    "id": "handoff-1",
    "queueItemId": "queue-1",
    "status": "ready",
    "createdAt": "2026-06-30T00:00:00.000Z",
    "updatedAt": "2026-06-30T00:00:00.000Z"
  }
}
```

People UI must render this as People queued-work handoff state and must not expose dispatch, claim, retry, execution, EVE role/access, or external-service controls in this slice.
