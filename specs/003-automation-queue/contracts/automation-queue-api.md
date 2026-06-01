# Contract: Automation Queue API

The Automation Queue exposes short server endpoints. MongoDB credentials and corporation scope stay server-side. Responses are sanitized and scoped to `EVEONLINE_CORPORATION_ID`. Queue records are persisted in the MongoDB `automation_queue` collection and linked to approved decision records in `strategic_decisions`.

## GET /api/automation-queue

Returns queue records for the server-owned corporation scope, newest first.

Query parameters:

- `status` optional. Filters records by `queued`, `blocked`, `running`, `failed`, `completed`, or `canceled`.
- `sourceDecisionId` optional. Filters records created from one decision.

Success response:

```json
{
  "queueItems": [
    {
      "id": "queue-1",
      "corporationId": "917701062",
      "sourceDecisionId": "decision-1",
      "taskIntent": "Prepare a scouting summary for the approved opportunity window.",
      "inputSummary": "Use the approved decision, source brief, and recent opportunity notes.",
      "expectedOutput": "A commander-readable scouting plan with risk and timing notes.",
      "status": "queued",
      "requestedBy": "commander",
      "owner": "research-worker",
      "isPlayerImpacting": false,
      "approval": null,
      "provenance": {
        "decisionId": "decision-1",
        "decisionStatus": "approved",
        "decisionApprovedAt": "2026-06-01T12:05:00.000Z",
        "sourceBriefId": "brief-1",
        "sourceRecommendation": "Review member readiness for the affected activity type.",
        "confidence": 0.82,
        "sourceCount": 1,
        "sourceReferences": [
          {
            "title": "Expansion patch notes",
            "url": "https://www.eveonline.com/news/view/example"
          }
        ],
        "coverage": {
          "numbers": "missing",
          "opportunity": "present",
          "people": "missing",
          "missingReasons": [
            "Numbers data is not part of this processed brief.",
            "People data is not part of this processed brief."
          ]
        },
        "createdAt": "2026-06-01T12:10:00.000Z"
      },
      "attempts": 0,
      "createdAt": "2026-06-01T12:10:00.000Z",
      "updatedAt": "2026-06-01T12:10:00.000Z"
    }
  ]
}
```

Empty response:

```json
{
  "queueItems": []
}
```

Failure responses:

- `400` for invalid status filter.
- `500` for safe server errors.

## GET /api/automation-queue/:id

Returns one queue record for the server-owned corporation scope.

Success response:

```json
{
  "queueItem": {
    "id": "queue-1",
    "sourceDecisionId": "decision-1",
    "status": "failed",
    "attempts": 1,
    "lastAttemptedAt": "2026-06-01T13:00:00.000Z",
    "failure": {
      "message": "External worker was unavailable.",
      "code": "worker_unavailable",
      "failedAt": "2026-06-01T13:00:10.000Z"
    },
    "retry": {
      "eligible": true,
      "notBefore": "2026-06-01T13:15:00.000Z"
    }
  }
}
```

Failure responses:

- `404` when the queue record is not found in the server-owned corporation scope.
- `500` for safe server errors.

## POST /api/automation-queue

Creates a queued work item from an approved source decision.

Request body:

```json
{
  "sourceDecisionId": "decision-1",
  "taskIntent": "Prepare a scouting summary for the approved opportunity window.",
  "inputSummary": "Use the approved decision, source brief, and recent opportunity notes.",
  "expectedOutput": "A commander-readable scouting plan with risk and timing notes.",
  "owner": "research-worker"
}
```

Rules:

- Source decision must exist in the server-owned corporation scope.
- Source decision status must be `approved`.
- Player-impacting source decisions must include explicit approval metadata.
- Browser-provided corporation identity is ignored.
- Queue creation does not dispatch a worker, retry failed work, execute EVE actions, or call external services.

Success response: `201 Created`

```json
{
  "queueItem": {
    "id": "queue-1",
    "corporationId": "917701062",
    "sourceDecisionId": "decision-1",
    "taskIntent": "Prepare a scouting summary for the approved opportunity window.",
    "inputSummary": "Use the approved decision, source brief, and recent opportunity notes.",
    "expectedOutput": "A commander-readable scouting plan with risk and timing notes.",
    "status": "queued",
    "requestedBy": "commander",
    "owner": "research-worker",
    "isPlayerImpacting": false,
    "approval": null,
    "attempts": 0,
    "createdAt": "2026-06-01T12:10:00.000Z",
    "updatedAt": "2026-06-01T12:10:00.000Z"
  }
}
```

Failure responses:

- `400` for malformed request, empty task fields, unapproved source decision, or missing approval metadata for player-impacting work.
- `404` when the source decision is not found in the server-owned corporation scope.
- `500` for safe server errors.
