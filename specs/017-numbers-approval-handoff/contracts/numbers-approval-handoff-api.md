# Contract: Numbers Approval Handoff API

M17 extends existing Numbers follow-up action responses. It does not add new endpoints.

## POST `/api/numbers/follow-ups/{candidateId}/decision`

### Response

```json
{
  "decision": {
    "id": "decision-1",
    "status": "proposed"
  },
  "origin": {
    "sourceType": "numbers_follow_up",
    "snapshotId": "numbers-1",
    "candidateId": "numbers-follow-up-1",
    "suggestedPath": "decision"
  },
  "approvalHandoff": {
    "candidateId": "numbers-follow-up-1",
    "snapshotId": "numbers-1",
    "decisionId": "decision-1",
    "decisionStatus": "proposed",
    "approvalRequired": true,
    "queueReady": false,
    "message": "Decision is proposed. Approval is required before queued work can be created.",
    "boundary": "Approval handoff only. No worker was dispatched and no execution occurred."
  },
  "message": "Decision recorded. No EVE action, wallet action, asset action, worker dispatch, or external execution was performed."
}
```

## POST `/api/numbers/follow-ups/{candidateId}/queue`

### Response

```json
{
  "queueItem": {
    "id": "queue-1",
    "status": "queued"
  },
  "origin": {
    "sourceType": "numbers_follow_up",
    "snapshotId": "numbers-1",
    "candidateId": "numbers-follow-up-1",
    "suggestedPath": "queue"
  },
  "approvalHandoff": {
    "candidateId": "numbers-follow-up-1",
    "snapshotId": "numbers-1",
    "decisionId": "decision-1",
    "decisionStatus": "approved",
    "approvalRequired": false,
    "queueReady": true,
    "queueItemId": "queue-1",
    "queueStatus": "queued",
    "message": "Approved Numbers decision is linked to queued work.",
    "boundary": "Queued work handoff only. No worker was dispatched and no execution occurred."
  },
  "message": "Queued work created. No worker dispatch, handoff claim, retry scheduling, EVE action, wallet action, asset action, or external execution was performed."
}
```
