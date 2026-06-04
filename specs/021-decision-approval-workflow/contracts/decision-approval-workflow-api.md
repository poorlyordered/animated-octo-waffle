# API Contract: Decision Approval Workflow

## PATCH `/api/numbers/follow-ups/:candidateId/decision/status`

Updates approval status for a stored decision that originated from the given Numbers follow-up candidate.

### Request

```json
{
  "snapshotId": "numbers-snapshot-1",
  "sourceDecisionId": "decision-numbers-follow-up-1",
  "status": "approved",
  "approvalText": "I approve this Numbers follow-up for queued planning.",
  "note": "Commander approved planning handoff."
}
```

Allowed statuses: `approved`, `rejected`.

### Response `200`

```json
{
  "decision": {
    "id": "decision-numbers-follow-up-1",
    "status": "approved",
    "approval": {
      "approvedAt": "2026-06-04T00:00:00.000Z",
      "approvalText": "I approve this Numbers follow-up for queued planning."
    }
  },
  "origin": {
    "sourceType": "numbers_follow_up",
    "snapshotId": "numbers-snapshot-1",
    "candidateId": "numbers-follow-up-1",
    "relatedSection": "logistics",
    "suggestedPath": "decision"
  },
  "approvalHandoff": {
    "candidateId": "numbers-follow-up-1",
    "snapshotId": "numbers-snapshot-1",
    "decisionId": "decision-numbers-follow-up-1",
    "decisionStatus": "approved",
    "approvalRequired": false,
    "queueReady": true,
    "message": "Decision decision-numbers-follow-up-1 is approved and ready for queued work.",
    "boundary": "Approval handoff only. No worker was dispatched and no execution occurred."
  },
  "message": "Decision approved. Queue creation remains a separate commander action; no queued work, worker dispatch, EVE action, wallet action, asset action, or external execution was performed."
}
```

### Errors

- `400`: invalid request, unsafe field, invalid status transition, decision/candidate mismatch
- `404`: snapshot/candidate/decision not found
- `409`: player-impacting approval lacks explicit approval text
- `500`: missing corporation scope or storage failure
