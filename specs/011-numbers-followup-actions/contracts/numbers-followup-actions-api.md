# Contract: Numbers Follow-Up Actions API

## Create Decision From Numbers Follow-Up

### Request

`POST /api/numbers/follow-ups/:candidateId/decision`

Allowed request body:

```json
{
  "snapshotId": "numbers-snapshot-123",
  "expectedResult": "A scoped decision on whether to rebalance market inventory."
}
```

Rules:

- `snapshotId` identifies the stored snapshot to inspect.
- `expectedResult` is optional commander framing; if omitted, the server uses a safe default from stored candidate context.
- Browser-provided corporation scope, provenance, approval metadata, execution flags, dispatch fields, retry fields, wallet actions, asset actions, and external mutation fields are ignored or rejected.

### Success Response

`201 Created`

```json
{
  "decision": {
    "id": "decision-123",
    "corporationId": "98154024",
    "sourceBriefId": "numbers-snapshot-123",
    "sourceRecommendation": "Review market sell orders with stale movement",
    "status": "proposed",
    "isPlayerImpacting": false,
    "approval": null,
    "createdAt": "2026-06-02T12:00:00.000Z",
    "updatedAt": "2026-06-02T12:00:00.000Z"
  },
  "origin": {
    "sourceType": "numbers_follow_up",
    "snapshotId": "numbers-snapshot-123",
    "candidateId": "market-follow-up-1"
  },
  "message": "Decision recorded. No EVE action, wallet action, asset action, worker dispatch, or external execution was performed."
}
```

### Duplicate Response

`200 OK`

```json
{
  "decision": {
    "id": "decision-123",
    "status": "proposed"
  },
  "origin": {
    "sourceType": "numbers_follow_up",
    "snapshotId": "numbers-snapshot-123",
    "candidateId": "market-follow-up-1"
  },
  "duplicate": true,
  "message": "Existing decision surfaced. No duplicate was created."
}
```

### Failure Responses

- `400 Bad Request`: malformed snapshot or candidate identifier, unsafe fields, or insufficient candidate data.
- `403 Forbidden`: candidate belongs to a different corporation scope.
- `404 Not Found`: snapshot or candidate not found.
- `405 Method Not Allowed`: unsupported method.

## Create Queued Work From Numbers Follow-Up Decision

### Request

`POST /api/numbers/follow-ups/:candidateId/queue`

Allowed request body:

```json
{
  "snapshotId": "numbers-snapshot-123",
  "sourceDecisionId": "decision-123",
  "taskIntent": "Prepare market inventory rebalance options",
  "inputSummary": "Use the approved Numbers follow-up decision and latest market section context.",
  "expectedOutput": "A summary of options for commander review.",
  "owner": "market-ops"
}
```

Rules:

- `sourceDecisionId` must identify an approved decision created from the same Numbers follow-up.
- Queue creation does not dispatch a worker or prepare a handoff.
- Browser-provided corporation scope, approval metadata, execution flags, dispatch fields, retry fields, wallet actions, asset actions, and external mutation fields are ignored or rejected.

### Success Response

`201 Created`

```json
{
  "queueItem": {
    "id": "queue-123",
    "sourceDecisionId": "decision-123",
    "status": "queued",
    "attempts": 0,
    "createdAt": "2026-06-02T12:05:00.000Z",
    "updatedAt": "2026-06-02T12:05:00.000Z"
  },
  "origin": {
    "sourceType": "numbers_follow_up",
    "snapshotId": "numbers-snapshot-123",
    "candidateId": "market-follow-up-1"
  },
  "message": "Queued work created. No worker dispatch, handoff claim, retry scheduling, EVE action, wallet action, asset action, or external execution was performed."
}
```

### Blocked Response

`409 Conflict`

```json
{
  "error": "Numbers follow-up queued work requires an approved source decision."
}
```

### Duplicate Response

`200 OK`

```json
{
  "queueItem": {
    "id": "queue-123",
    "sourceDecisionId": "decision-123",
    "status": "queued"
  },
  "origin": {
    "sourceType": "numbers_follow_up",
    "snapshotId": "numbers-snapshot-123",
    "candidateId": "market-follow-up-1"
  },
  "duplicate": true,
  "message": "Existing queued work surfaced. No duplicate was created."
}
```

### Failure Responses

- `400 Bad Request`: malformed request, unsafe fields, mismatched snapshot/candidate/decision, or missing required queue fields.
- `403 Forbidden`: decision or candidate belongs to a different corporation scope.
- `404 Not Found`: snapshot, candidate, or decision not found.
- `405 Method Not Allowed`: unsupported method.
