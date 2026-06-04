# Contract: Opportunity Ingestion Provenance API

## GET /api/command-brief

Returns the existing command brief plus optional browser-safe Opportunity ingestion provenance.

```json
{
  "brief": null,
  "opportunityProvenance": {
    "mode": "latest_research",
    "focus": "grykk-47-eve-official-news",
    "sourceCount": 4,
    "briefCount": 1,
    "sectionStatuses": [
      { "key": "sources", "status": "present" },
      { "key": "impacts", "status": "present" },
      { "key": "recommendations", "status": "present" },
      { "key": "watchlist", "status": "present" }
    ],
    "history": [
      {
        "id": "research-request-1",
        "status": "processed",
        "requestedAt": "2026-06-04T09:00:00.000Z",
        "updatedAt": "2026-06-04T09:20:00.000Z",
        "requestedBy": "1793798962",
        "sourceCount": 4,
        "sectionStatuses": [
          { "key": "sources", "status": "present" }
        ],
        "boundary": "Opportunity ingestion history is read-only. This view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, or execute external services."
      }
    ],
    "message": "Latest Opportunity context is linked to processed research history.",
    "boundary": "Opportunity ingestion history is read-only. This view does not schedule research pulls, dispatch workers, fetch ESI, write to EVE, or execute external services."
  }
}
```

Filters remain unchanged:

- `focus=<research-focus>`

Boundary:

- The response is observation-only.
- It does not schedule research pulls, dispatch workers, claim work, fetch ESI, write to EVE, or execute external services.
- It must not include token material, secrets, worker credentials, dispatch targets, EVE write handles, or execution handles.
