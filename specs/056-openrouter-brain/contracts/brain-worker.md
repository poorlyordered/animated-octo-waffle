# Brain Worker Contract

## Endpoint

`POST /api/brain-worker/run`

This endpoint is called only by a trusted worker or operator process. It is not a browser command surface.

## Authentication

Header:

- `x-worker-callback-secret`: must match `BRAIN_WORKER_CALLBACK_SECRET` or fallback `WORKER_CALLBACK_SECRET`.

## Request

```json
{
  "corporationId": "98123456",
  "focus": "gryyk-47-brain",
  "workerId": "brain-worker-prod",
  "reason": "scheduled command intelligence refresh"
}
```

Fields:

- `corporationId`: required string.
- `focus`: optional string, defaults to `gryyk-47-brain`.
- `workerId`: required string.
- `reason`: optional bounded string.

## Success Response

Status: `201`

```json
{
  "run": {
    "id": "brain-run-id",
    "corporationId": "98123456",
    "focus": "gryyk-47-brain",
    "status": "processed",
    "provider": "openrouter",
    "model": "openai/gpt-5.2",
    "promptVersion": "brain-command-v1",
    "createdAt": "2026-07-01T00:00:00.000Z",
    "updatedAt": "2026-07-01T00:00:10.000Z"
  },
  "brief": {
    "id": "brief-id",
    "focus": "gryyk-47-brain",
    "model": "openai/gpt-5.2",
    "promptVersion": "brain-command-v1"
  },
  "message": "Brain run completed and stored as command intelligence. No EVE action, queue dispatch, worker dispatch, or external mutation was executed."
}
```

## Error Responses

- `400`: invalid request body.
- `401`: worker callback is not authorized.
- `405`: method not allowed.
- `500`: missing server configuration or provider failure.

Error responses must contain a safe message only:

```json
{
  "error": "Brain provider is not configured"
}
```
