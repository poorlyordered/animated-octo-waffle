# Contract: People Follow-Up Handoff API

## POST `/api/people/follow-ups/:followUpId/decision`

Records or returns a proposed People-origin decision for the follow-up.

### Request

```json
{
  "rationale": "Member activity has gone stale and needs commander review.",
  "expectedResult": "Leadership has an approved follow-up plan."
}
```

### Response `200` or `201`

```json
{
  "followUp": {},
  "decision": {},
  "handoff": {
    "followUpId": "followup-1",
    "memberProfileId": "member-1",
    "memberDisplayName": "Pilot One",
    "decisionId": "decision-1",
    "decisionStatus": "proposed",
    "approvalRequired": true,
    "queueReady": false,
    "message": "Decision recorded and awaiting approval.",
    "boundary": "This handoff does not change roles, access, EVE state, worker state, or external services.",
    "missingLinkReasons": []
  },
  "message": "People follow-up decision recorded."
}
```

## PATCH `/api/people/follow-ups/:followUpId/decision/status`

Approves or rejects the linked People-origin decision.

### Request

```json
{
  "status": "approved",
  "approvalText": "Commander approves queued planning for this leadership follow-up."
}
```

### Response `200`

```json
{
  "followUp": {},
  "decision": {},
  "handoff": {
    "followUpId": "followup-1",
    "decisionId": "decision-1",
    "decisionStatus": "approved",
    "approvalRequired": false,
    "queueReady": true,
    "message": "Decision approved and ready for separate queued work.",
    "boundary": "Approval does not create queued work or execute changes.",
    "missingLinkReasons": []
  },
  "message": "People follow-up decision approved."
}
```

## POST `/api/people/follow-ups/:followUpId/queue`

Creates or returns queued planning work for an approved People-origin decision.

### Request

```json
{
  "title": "Prepare leadership follow-up plan",
  "inputSummary": "Use approved People decision decision-1.",
  "expectedOutput": "Draft commander review options for the leadership follow-up."
}
```

### Response `200` or `201`

```json
{
  "followUp": {},
  "queueItem": {},
  "handoff": {
    "followUpId": "followup-1",
    "decisionId": "decision-1",
    "decisionStatus": "approved",
    "approvalRequired": false,
    "queueReady": true,
    "queueItemId": "queue-1",
    "queueStatus": "queued",
    "message": "Queued work is linked for planning only.",
    "boundary": "Queued work does not dispatch workers, mutate EVE roles/access, or execute external services.",
    "missingLinkReasons": []
  },
  "message": "People follow-up queued work created."
}
```
