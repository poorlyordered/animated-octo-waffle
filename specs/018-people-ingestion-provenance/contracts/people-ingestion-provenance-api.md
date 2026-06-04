# Contract: People Ingestion Provenance API

## GET /api/people/members

Returns existing member profiles plus optional browser-safe ingestion provenance.

```json
{
  "members": [],
  "ingestionProvenance": {
    "mode": "latest_ingestion",
    "sourceCount": 3,
    "profileCount": 3,
    "sectionStatuses": [
      { "key": "identity", "status": "present" },
      { "key": "roles", "status": "missing" },
      { "key": "activity", "status": "stale" },
      { "key": "delegation", "status": "missing" }
    ],
    "history": [
      {
        "id": "people-sync-1",
        "status": "completed",
        "requestedAt": "2026-06-02T09:00:00.000Z",
        "claimedBy": "people-worker",
        "claimedAt": "2026-06-02T09:05:00.000Z",
        "completedAt": "2026-06-02T09:20:00.000Z",
        "sourceCount": 3,
        "sectionStatuses": [
          { "key": "identity", "status": "present" }
        ],
        "boundary": "People ingestion history is read-only. This view does not retry, dispatch, fetch ESI, change roles, change access, or execute external services."
      }
    ],
    "message": "Latest People profiles are linked to completed ingestion history.",
    "boundary": "People ingestion history is read-only. This view does not retry, dispatch, fetch ESI, change roles, change access, or execute external services."
  }
}
```

Filters remain unchanged:

- `activity=active|stale|missing`
- `needsFollowUp=true|false`

Boundary:

- The response is observation-only.
- It does not schedule retries, dispatch workers, claim work, fetch ESI, write to EVE, change roles, change access, or execute external services.
- It must not include token material, secrets, worker credentials, dispatch targets, role mutation handles, access mutation handles, or execution handles.
