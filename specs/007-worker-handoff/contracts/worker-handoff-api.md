# Contract: Worker Handoff API

## POST `/api/automation-queue/:queueItemId/handoff`

Prepares a queue item for future worker processing.

Request body:

```json
{}
```

Behavior:

- Resolves corporation scope from the active session/fallback server boundary.
- Looks up the source queue item in the active corporation scope.
- Validates queue eligibility and player-impacting approval metadata.
- Returns an existing active handoff for the queue item when present.
- Creates a durable handoff record when no active handoff exists.
- Does not accept browser-controlled corporation ID, status, worker owner, execution flag, dispatch target, or full worker payload.
- Does not call external workers or EVE APIs.

Success response:

```json
{
  "handoff": {
    "id": "handoff-1",
    "corporationId": "917701062",
    "queueItemId": "queue-1",
    "sourceDecisionId": "decision-1",
    "status": "ready",
    "payloadSummary": {
      "taskIntent": "Prepare logistics summary.",
      "inputSummary": "Use approved decision context.",
      "expectedOutput": "Commander-readable summary.",
      "sourceDecisionId": "decision-1",
      "sourceReferences": []
    },
    "createdBy": "commander",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
}
```

Error behavior:

- Missing or cross-scope queue item returns a safe not-found response.
- Ineligible queue item returns a safe validation response.
- Player-impacting work without approval returns a safe approval-boundary response.
- Responses never include secrets, tokens, credentials, cookie signatures, or external dispatch targets.

## GET `/api/worker-handoffs`

Lists scoped handoff records.

Query parameters:

- `status`: Optional handoff status filter.
- `queueItemId`: Optional source queue item filter.

Behavior:

- Returns handoff records only for the active corporation scope.
- Sorts recent records first.
- Does not expose raw worker credentials or secrets.

Success response:

```json
{
  "handoffs": []
}
```

## GET `/api/worker-handoffs/:handoffId`

Returns one scoped handoff record.

Behavior:

- Resolves corporation scope from the active session/fallback server boundary.
- Returns only records in the active corporation scope.
- Returns safe not-found behavior for missing or cross-scope records.

Success response:

```json
{
  "handoff": {
    "id": "handoff-1",
    "corporationId": "917701062",
    "queueItemId": "queue-1",
    "sourceDecisionId": "decision-1",
    "status": "ready",
    "payloadSummary": {
      "taskIntent": "Prepare logistics summary.",
      "inputSummary": "Use approved decision context.",
      "expectedOutput": "Commander-readable summary.",
      "sourceDecisionId": "decision-1",
      "sourceReferences": []
    },
    "createdBy": "commander",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
}
```

## Queue Detail Response Extension

`GET /api/automation-queue/:queueItemId` MAY include the most recent handoff summary:

```json
{
  "queueItem": {},
  "handoff": {
    "id": "handoff-1",
    "status": "ready",
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
}
```
