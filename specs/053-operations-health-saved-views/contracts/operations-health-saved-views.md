# Contract: M53 Operations Health Saved Views

M53 does not change the HTTP contract for `GET /api/operations-health`.

Browser-local storage key:

```text
gryyk47.operationsHealthSavedViews
```

Stored value:

```json
[
  {
    "id": "warning:blocked:missing",
    "label": "Warnings: warning / Workers: blocked / Secrets: missing",
    "filters": {
      "warningSeverity": "warning",
      "workerStatus": "blocked",
      "workerSecret": "missing"
    }
  }
]
```

No request body, query parameter, cookie, server preference record, provider call, worker dispatch, retry execution, ESI fetch, EVE write, or external mutation is added by this slice.
