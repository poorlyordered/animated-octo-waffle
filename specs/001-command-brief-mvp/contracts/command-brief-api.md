# Contract: Command Brief API

The MVP exposes read-only server endpoints. MongoDB credentials and stored document shapes stay server-side. Responses are sanitized and scoped to the authenticated commander's corporation.

## GET /api/research-status

Returns the latest research request summary for the authenticated corporation and default focus.

Query parameters:

- `focus` optional. Defaults to `grykk-47-eve-official-news`.

Success response:

```json
{
  "request": {
    "id": "6a1c308dc488fc18d5208460",
    "corporationId": "917701062",
    "focus": "grykk-47-eve-official-news",
    "status": "processed",
    "createdAt": "2026-05-31T11:46:12.603Z",
    "updatedAt": "2026-05-31T11:47:01.110Z",
    "requestedBy": "1793798962",
    "errorMessage": null
  }
}
```

Empty response:

```json
{
  "request": null
}
```

Failure response:

```json
{
  "error": "Unable to load research status"
}
```

## GET /api/command-brief

Returns the latest processed command brief for the authenticated corporation and default focus.

Query parameters:

- `focus` optional. Defaults to `grykk-47-eve-official-news`.

Success response:

```json
{
  "brief": {
    "id": "6a1c30acc488fc18d5208461",
    "corporationId": "917701062",
    "focus": "grykk-47-eve-official-news",
    "createdAt": "2026-05-31T11:47:03.120Z",
    "model": "google/gemma-4-31b-it",
    "promptVersion": "official-news-brief-v1",
    "sourceCount": 8,
    "sourceReferences": [
      {
        "title": "Expansion patch notes",
        "url": "https://www.eveonline.com/news/view/example"
      }
    ],
    "confidence": 0.82,
    "executiveSummary": "Official news indicates near-term changes commanders should monitor.",
    "briefMarkdown": "## Official EVE News Brief\n\n...",
    "strategicImpacts": [
      "Expansion changes may shift recruiting and staging priorities."
    ],
    "recommendedActions": [
      "Review member readiness for the affected activity type."
    ],
    "watchlist": [
      "Patch notes follow-up"
    ],
    "memory": [
      "Track official expansion changes as opportunity inputs."
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
  }
}
```

Empty response:

```json
{
  "brief": null
}
```

Failure response:

```json
{
  "error": "Unable to load command brief"
}
```

## Client Composition

The client loads both endpoints and derives `displayState`:

- `empty`: no request and no brief.
- `processing`: latest request is `queued`, `raw_captured`, or `processing`.
- `processed`: latest request is `processed` and a brief is available.
- `failed`: latest request is `failed` and no prior brief is available.
- `stale`: a prior brief exists, but a newer request is processing or failed.
