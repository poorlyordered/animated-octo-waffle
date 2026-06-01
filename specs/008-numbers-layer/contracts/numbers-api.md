# Contract: Numbers API

## GET `/api/numbers`

Returns the latest processed numbers snapshot for the active corporation scope.

Query parameters:

- `focus`: Optional focus value. Defaults to `corporation`.

Behavior:

- Resolves corporation scope from the active session/fallback server boundary.
- Queries only processed numbers snapshots for the active corporation scope.
- Ignores browser-provided corporation IDs, wallet/asset actions, dispatch targets, execution flags, and raw metric overrides.
- Returns explicit missing section states when no section data is available.
- Does not call EVE APIs, external services, worker dispatch, retry loops, or long-running processors.

Success response with snapshot:

```json
{
  "snapshot": {
    "id": "numbers-1",
    "corporationId": "917701062",
    "focus": "corporation",
    "sections": [
      {
        "key": "wallet",
        "label": "Wallet",
        "status": "healthy",
        "summary": "Wallet runway is stable.",
        "metrics": [
          {
            "label": "Liquid ISK",
            "value": "12.4B",
            "unit": "ISK",
            "trend": "up",
            "severity": "info"
          }
        ],
        "updatedAt": "2026-06-01T00:00:00.000Z"
      }
    ],
    "observations": ["Wallet runway is stable."],
    "risks": [],
    "opportunities": ["Market gap detected."],
    "followUps": [
      {
        "id": "follow-up-1",
        "title": "Review logistics stockout risk",
        "rationale": "Doctrine stock is below threshold.",
        "suggestedPath": "decision",
        "isPlayerImpacting": false,
        "relatedSection": "logistics"
      }
    ],
    "provenance": {
      "sourceCount": 2,
      "sourceReferences": [],
      "confidence": 0.82,
      "model": "processed-numbers-v1",
      "promptVersion": "numbers-snapshot-v1",
      "createdAt": "2026-06-01T00:00:00.000Z"
    },
    "createdAt": "2026-06-01T00:00:00.000Z",
    "updatedAt": "2026-06-01T00:00:00.000Z"
  }
}
```

No snapshot response:

```json
{
  "snapshot": null
}
```

Error behavior:

- Missing corporation scope returns a safe scope-not-configured response.
- Invalid query values return a safe validation response.
- Responses never include secrets, tokens, credentials, cookie signatures, or external dispatch targets.
