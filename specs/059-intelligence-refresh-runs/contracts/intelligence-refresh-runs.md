# Contract: Intelligence Refresh Runs

All commander endpoints require signed-session command scope. All worker endpoints require the appropriate server-side worker callback secret. Responses must be browser-safe and must not include EVE SSO secrets, ESI token material, MongoDB credentials, OpenRouter credentials, worker secrets, raw ESI payloads, raw prompts, dispatch targets, or player-impacting mutation payloads.

## Commander API

### `GET /api/intelligence-refresh`

Lists recent refresh runs for the signed-in corporation.

Query parameters:

- `limit`: optional bounded count, default 5, maximum 25.

Response:

```json
{
  "runs": [
    {
      "id": "refresh-1",
      "corporationId": "917701062",
      "requestedDomains": ["numbers", "opportunity", "people"],
      "status": "completed_with_warnings",
      "createdAt": "2026-07-03T00:00:00.000Z",
      "updatedAt": "2026-07-03T00:04:00.000Z",
      "completedAt": "2026-07-03T00:04:00.000Z",
      "steps": [],
      "evaluation": {
        "status": "completed",
        "brainRunId": "brain-1",
        "commandBriefId": "brief-1",
        "model": "openai/gpt-5.2",
        "promptVersion": "brain-command-v1",
        "confidence": 0.78
      },
      "warnings": ["People refresh completed from external summary only."],
      "boundary": "Refresh runs prepare and evaluate intelligence only. They do not execute EVE or player-impacting actions."
    }
  ]
}
```

### `POST /api/intelligence-refresh`

Creates or returns a duplicate-safe active refresh run.

Request:

```json
{
  "domains": ["numbers", "opportunity", "people"],
  "reason": "Commander requested current intelligence before planning."
}
```

Response:

```json
{
  "run": {
    "id": "refresh-1",
    "corporationId": "917701062",
    "requestedDomains": ["numbers", "opportunity", "people"],
    "status": "queued",
    "createdAt": "2026-07-03T00:00:00.000Z",
    "updatedAt": "2026-07-03T00:00:00.000Z",
    "steps": [
      {
        "id": "step-numbers",
        "domain": "numbers",
        "status": "prepared",
        "preparedRequest": { "type": "esi_sync_request", "id": "sync-1" }
      }
    ],
    "evaluation": { "status": "not_ready" },
    "boundary": "Refresh runs prepare and evaluate intelligence only. They do not execute EVE or player-impacting actions."
  },
  "duplicate": false
}
```

Unsafe request fields such as `accessToken`, `refreshToken`, `dispatchTarget`, `executeNow`, `walletAction`, `assetAction`, `contractAction`, `roleMutation`, `accessMutation`, `standingMutation`, `rawEsi`, and `rawPayload` must be rejected or ignored.

### `GET /api/intelligence-refresh/:id`

Returns one refresh run detail for the signed-in corporation.

Response:

```json
{
  "run": {
    "id": "refresh-1",
    "status": "running",
    "requestedDomains": ["numbers", "people"],
    "steps": [
      {
        "id": "step-numbers",
        "domain": "numbers",
        "status": "completed",
        "sourceCount": 12,
        "sectionStatuses": [
          { "key": "wallet", "status": "complete" }
        ],
        "completedAt": "2026-07-03T00:02:00.000Z"
      },
      {
        "id": "step-people",
        "domain": "people",
        "status": "running",
        "claimedBy": "people-worker-1",
        "claimedAt": "2026-07-03T00:01:00.000Z"
      }
    ],
    "evaluation": { "status": "not_ready" }
  }
}
```

## Worker API

### `GET /api/intelligence-refresh-worker`

Lists queued/prepared refresh domain steps claimable by trusted workers.

Query parameters:

- `domain`: optional `numbers`, `opportunity`, or `people`.

### `POST /api/intelligence-refresh-worker/:runId/steps/:stepId/claim`

Claims a prepared refresh step.

Request:

```json
{
  "workerId": "numbers-refresh-worker"
}
```

### `POST /api/intelligence-refresh-worker/:runId/steps/:stepId/complete`

Completes a claimed refresh step with a safe result summary.

Request:

```json
{
  "workerId": "numbers-refresh-worker",
  "result": {
    "sourceCount": 12,
    "summary": "Numbers data refreshed from read-only ESI sync.",
    "sectionStatuses": [
      { "key": "wallet", "status": "complete" }
    ],
    "linkedRequest": { "type": "esi_sync_request", "id": "sync-1" },
    "warnings": []
  }
}
```

### `POST /api/intelligence-refresh-worker/:runId/steps/:stepId/fail`

Fails a claimed refresh step with a safe reason.

Request:

```json
{
  "workerId": "numbers-refresh-worker",
  "reason": "Required ESI scope is missing."
}
```

### `POST /api/intelligence-refresh-worker/:runId/steps/:stepId/skip`

Skips a claimed refresh step with a safe reason when the worker determines no useful source delta is available.

Request:

```json
{
  "workerId": "numbers-refresh-worker",
  "reason": "No eligible source delta is available."
}
```

### `POST /api/intelligence-refresh-worker/:runId/evaluate`

Starts Brain evaluation for a refresh run that is completed or partial-evaluation ready.

Request:

```json
{
  "workerId": "brain-refresh-worker",
  "allowPartial": true,
  "reason": "Evaluate latest available refresh data."
}
```

Response:

```json
{
  "run": {
    "id": "refresh-1",
    "status": "completed",
    "evaluation": {
      "status": "completed",
      "brainRunId": "brain-1",
      "commandBriefId": "brief-1",
      "model": "openai/gpt-5.2",
      "promptVersion": "brain-command-v1",
      "confidence": 0.82
    }
  }
}
```
