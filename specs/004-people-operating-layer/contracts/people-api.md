# Contract: People API

The People Operating Layer exposes short server endpoints. MongoDB credentials and corporation scope stay server-side. Responses are sanitized and scoped to `EVEONLINE_CORPORATION_ID`. Member profiles are read from normalized people records, while leadership follow-ups are persisted separately.

## GET /api/people/members

Returns member profiles for the server-owned corporation scope.

Query parameters:

- `activity` optional. Filters profiles by activity label.
- `needsFollowUp` optional boolean. Filters profiles with open or blocked follow-ups.

Success response:

```json
{
  "members": [
    {
      "id": "member-1",
      "corporationId": "917701062",
      "characterId": "123456789",
      "displayName": "Example Pilot",
      "aliases": ["Example"],
      "profileSummary": "Industry-oriented member with recent quiet activity.",
      "roleContext": {
        "roles": ["Industry"],
        "titles": ["Builder"],
        "accessNotes": "Known industry access only.",
        "isStale": false,
        "lastObservedAt": "2026-06-01T10:00:00.000Z",
        "missingReasons": []
      },
      "activitySummary": {
        "lastActiveAt": "2026-05-30T22:00:00.000Z",
        "activityLabel": "quiet",
        "participationCount": 2,
        "staleAfterDays": 14,
        "isStale": false,
        "missingReasons": []
      },
      "followUpSummary": {
        "open": 1,
        "blocked": 0,
        "completed": 2
      },
      "coverage": {
        "identity": "present",
        "roles": "present",
        "activity": "present",
        "delegation": "missing",
        "missingReasons": ["Delegation notes have not been recorded."]
      },
      "sourceRefs": [
        {
          "title": "Seeded member profile"
        }
      ],
      "lastObservedAt": "2026-06-01T10:00:00.000Z",
      "createdAt": "2026-06-01T10:00:00.000Z",
      "updatedAt": "2026-06-01T10:00:00.000Z"
    }
  ]
}
```

Empty response:

```json
{
  "members": []
}
```

## GET /api/people/members/:id

Returns one member profile and its leadership follow-ups for the server-owned corporation scope.

Success response:

```json
{
  "member": {
    "id": "member-1",
    "displayName": "Example Pilot"
  },
  "followUps": [
    {
      "id": "followup-1",
      "memberProfileId": "member-1",
      "reason": "Review industry delegation path.",
      "priority": "medium",
      "status": "open"
    }
  ]
}
```

Failure responses:

- `404` when the member profile is not found in the server-owned corporation scope.
- `500` for safe server errors.

## GET /api/people/follow-ups

Returns leadership follow-ups for the server-owned corporation scope.

Query parameters:

- `status` optional. Filters by `open`, `blocked`, `completed`, or `canceled`.
- `memberProfileId` optional. Filters follow-ups for one member.
- `priority` optional. Filters by `low`, `medium`, `high`, or `urgent`.

Success response:

```json
{
  "followUps": [
    {
      "id": "followup-1",
      "corporationId": "917701062",
      "memberProfileId": "member-1",
      "memberDisplayName": "Example Pilot",
      "reason": "Review industry delegation path.",
      "priority": "medium",
      "status": "open",
      "owner": "commander",
      "dueAt": "2026-06-08T00:00:00.000Z",
      "sourceDecisionId": "decision-1",
      "sourceQueueItemId": "queue-1",
      "isPlayerImpacting": false,
      "approval": null,
      "sourceContext": {
        "memberProfileId": "member-1",
        "memberDisplayName": "Example Pilot",
        "profileUpdatedAt": "2026-06-01T10:00:00.000Z",
        "decisionId": "decision-1",
        "queueItemId": "queue-1",
        "coverage": {
          "identity": "present",
          "roles": "present",
          "activity": "present",
          "delegation": "missing",
          "missingReasons": ["Delegation notes have not been recorded."]
        },
        "createdAt": "2026-06-01T12:00:00.000Z"
      },
      "createdAt": "2026-06-01T12:00:00.000Z",
      "updatedAt": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

## POST /api/people/follow-ups

Creates a leadership follow-up from a member profile.

Request body:

```json
{
  "memberProfileId": "member-1",
  "reason": "Review industry delegation path.",
  "priority": "medium",
  "owner": "commander",
  "dueAt": "2026-06-08T00:00:00.000Z",
  "sourceDecisionId": "decision-1",
  "sourceQueueItemId": "queue-1",
  "isPlayerImpacting": false,
  "approvalText": "Optional explicit approval text for player-impacting follow-up records."
}
```

Rules:

- Source member profile must exist in the server-owned corporation scope.
- Browser-provided corporation identity is ignored.
- Duplicate follow-ups for the same member and reason are rejected or surfaced safely.
- Follow-up creation does not execute role/access changes, queue worker jobs, EVE actions, or external-service calls.
- Player-impacting follow-ups remain records only; approval metadata is not execution.

Success response: `201 Created`

```json
{
  "followUp": {
    "id": "followup-1",
    "corporationId": "917701062",
    "memberProfileId": "member-1",
    "memberDisplayName": "Example Pilot",
    "reason": "Review industry delegation path.",
    "priority": "medium",
    "status": "open",
    "owner": "commander",
    "isPlayerImpacting": false,
    "approval": null,
    "createdAt": "2026-06-01T12:00:00.000Z",
    "updatedAt": "2026-06-01T12:00:00.000Z"
  }
}
```

Failure responses:

- `400` for malformed request, empty reason, invalid status/priority, duplicate follow-up, or missing approval text for player-impacting follow-up records.
- `404` when the source member profile is not found in the server-owned corporation scope.
- `500` for safe server errors.
