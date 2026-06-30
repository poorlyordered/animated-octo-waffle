# Contract: Production Evidence

## `GET /api/production-evidence`

Returns recent scoped production evidence records.

Response:

```json
{
  "records": [
    {
      "id": "evidence-1",
      "corporationId": "917701062",
      "environment": "production",
      "decision": "controlled_staging",
      "commitSha": "abcdef1",
      "pullRequestUrl": "https://github.com/example/repo/pull/49",
      "deployId": "netlify-deploy-id",
      "rollbackTarget": "previous-deploy-id",
      "checks": [
        {
          "key": "validation",
          "status": "verified",
          "evidence": "Validation passed without storing logs."
        }
      ],
      "recordedBy": "session:Ari Voss",
      "recordedAt": "2026-06-30T23:00:00.000Z",
      "boundary": "Production evidence records are value-free..."
    }
  ],
  "boundary": "Production evidence records are value-free..."
}
```

## `POST /api/production-evidence`

Creates one scoped value-free evidence record.

Request:

```json
{
  "environment": "production",
  "decision": "controlled_staging",
  "commitSha": "abcdef1",
  "pullRequestUrl": "https://github.com/example/repo/pull/49",
  "deployId": "netlify-deploy-id",
  "rollbackTarget": "previous-deploy-id",
  "checks": [
    {
      "key": "validation",
      "status": "verified",
      "evidence": "Validation passed without storing logs."
    }
  ]
}
```

Errors:

- `400` for invalid schema or unsafe evidence material.
- `403` for signed sessions outside the configured command corporation.
- `500` for missing command corporation scope or storage failure.
