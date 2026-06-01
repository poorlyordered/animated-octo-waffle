# Contract: Decision Record API

The Decision Record Loop exposes short server endpoints. MongoDB credentials and corporation scope stay server-side. Responses are sanitized and scoped to `EVEONLINE_CORPORATION_ID`. Decision records are persisted in the MongoDB `strategic_decisions` collection and normalized into the API shapes below.

## GET /api/decision-records

Returns decision records for the server-owned corporation scope, newest first.

Query parameters:

- `sourceBriefId` optional. Filters decisions for one source command brief.
- `status` optional. Filters decisions by `proposed`, `approved`, `delegated`, `done`, or `rejected`.

Success response:

```json
{
  "decisions": [
    {
      "id": "decision-1",
      "corporationId": "917701062",
      "sourceBriefId": "brief-1",
      "sourceRecommendation": "Review member readiness for the affected activity type.",
      "status": "proposed",
      "rationale": "Patch timing may affect staging priorities.",
      "expectedResult": "Leadership has a clear readiness follow-up.",
      "isPlayerImpacting": false,
      "sourceProvenance": {
        "briefId": "brief-1",
        "briefCreatedAt": "2026-05-31T11:47:03.120Z",
        "focus": "grykk-47-eve-official-news",
        "model": "google/gemma-4-31b-it",
        "promptVersion": "official-news-brief-v1",
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
        }
      },
      "statusHistory": [
        {
          "toStatus": "proposed",
          "changedAt": "2026-06-01T12:00:00.000Z"
        }
      ],
      "createdAt": "2026-06-01T12:00:00.000Z",
      "updatedAt": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

Empty response:

```json
{
  "decisions": []
}
```

## POST /api/decision-records

Creates a decision record from a source command brief recommendation.

Request body:

```json
{
  "sourceBriefId": "brief-1",
  "sourceRecommendation": "Review member readiness for the affected activity type.",
  "rationale": "Patch timing may affect staging priorities.",
  "expectedResult": "Leadership has a clear readiness follow-up.",
  "isPlayerImpacting": false
}
```

Success response: `201 Created`

```json
{
  "decision": {
    "id": "decision-1",
    "corporationId": "917701062",
    "sourceBriefId": "brief-1",
    "sourceRecommendation": "Review member readiness for the affected activity type.",
    "status": "proposed",
    "rationale": "Patch timing may affect staging priorities.",
    "expectedResult": "Leadership has a clear readiness follow-up.",
    "isPlayerImpacting": false,
    "approval": null,
    "sourceProvenance": {
      "briefId": "brief-1",
      "briefCreatedAt": "2026-05-31T11:47:03.120Z",
      "focus": "grykk-47-eve-official-news",
      "model": "google/gemma-4-31b-it",
      "promptVersion": "official-news-brief-v1",
      "confidence": 0.82,
      "sourceCount": 1,
      "sourceReferences": [],
      "coverage": {
        "numbers": "missing",
        "opportunity": "present",
        "people": "missing",
        "missingReasons": []
      }
    },
    "statusHistory": [
      {
        "toStatus": "proposed",
        "changedAt": "2026-06-01T12:00:00.000Z"
      }
    ],
    "createdAt": "2026-06-01T12:00:00.000Z",
    "updatedAt": "2026-06-01T12:00:00.000Z"
  }
}
```

Validation failures return `400` with a safe error message. If the source brief is not found in the server-owned corporation scope, return `404`.

## PATCH /api/decision-records/:id/status

Updates a decision status and appends status history.

Request body:

```json
{
  "status": "approved",
  "note": "Approved for leadership follow-up.",
  "approvalText": "I approve this player-impacting follow-up."
}
```

Rules:

- `status` must be one of the allowed decision statuses.
- `approvalText` is required when a player-impacting decision is moved toward action-like progression.
- Status updates do not execute game actions and do not create automation queue entries.

Success response:

```json
{
  "decision": {
    "id": "decision-1",
    "status": "approved",
    "approval": {
      "approvedAt": "2026-06-01T12:05:00.000Z",
      "approvalText": "I approve this player-impacting follow-up."
    },
    "updatedAt": "2026-06-01T12:05:00.000Z"
  }
}
```

Failure responses:

- `400` for invalid status, invalid transition, missing approval text, or malformed request.
- `404` when the decision is not found in the server-owned corporation scope.
- `500` for safe server errors.
