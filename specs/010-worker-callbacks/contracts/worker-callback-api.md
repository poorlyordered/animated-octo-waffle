# Contract: Worker Callback API

All worker callback endpoints require a valid server-side worker callback secret. They return browser-safe handoff records and never return the callback credential.

## GET `/api/worker-handoffs?status=ready`

Lists ready handoff records scoped to the active corporation.

### Success

- `200` with `handoffs`.
- Records include safe payload summaries and current status metadata.

### Failure

- `401` when worker callback authorization is required and missing/invalid.
- `400` for invalid status filters.

## POST `/api/worker-handoffs/:handoffId/claim`

Atomically claims a ready handoff.

### Request

```json
{
  "workerId": "overnightdesk-worker-1"
}
```

### Success

- `200` with `handoff`.
- Handoff status is `claimed`.
- Handoff has `claimedBy`, `claimedAt`, and updated timestamp.

### Failure

- `401` for missing/invalid callback secret.
- `404` when the handoff does not exist in scope.
- `409` when the handoff is not claimable.

## POST `/api/worker-handoffs/:handoffId/progress`

Appends a safe progress event for the claiming worker.

### Request

```json
{
  "workerId": "overnightdesk-worker-1",
  "message": "Fetched source documents",
  "code": "sources_fetched"
}
```

### Success

- `200` with `handoff`.
- Handoff remains `claimed`.
- Safe progress event is visible in handoff detail.

### Failure

- `401` for missing/invalid callback secret.
- `404` when the handoff does not exist in scope.
- `409` when the handoff is not claimed by the request worker.

## POST `/api/worker-handoffs/:handoffId/complete`

Marks a claimed handoff completed with a safe output summary.

### Request

```json
{
  "workerId": "overnightdesk-worker-1",
  "summary": "Prepared recruitment follow-up brief",
  "artifactRefs": ["research-brief:abc123"]
}
```

### Success

- `200` with `handoff`.
- Handoff status is `completed`.
- Handoff has `completedAt`, result summary, and updated timestamp.

### Failure

- `401` for missing/invalid callback secret.
- `404` when the handoff does not exist in scope.
- `409` when the handoff is not claimed by the request worker.

## POST `/api/worker-handoffs/:handoffId/fail`

Marks a claimed handoff failed with safe failure metadata.

### Request

```json
{
  "workerId": "overnightdesk-worker-1",
  "message": "Source data unavailable",
  "code": "source_unavailable"
}
```

### Success

- `200` with `handoff`.
- Handoff status is `failed`.
- Failure metadata appears in browser-safe handoff reads.

### Failure

- `401` for missing/invalid callback secret.
- `404` when the handoff does not exist in scope.
- `409` when the handoff is not claimed by the request worker.

## Safety Rules

- Callback bodies cannot set corporation scope, arbitrary status, dispatch target, retry flag, execution flag, token, secret, credential, or raw external payload fields.
- Responses expose safe handoff metadata only.
- Request handlers do not dispatch workers, retry work, call EVE APIs, or mutate external services.
