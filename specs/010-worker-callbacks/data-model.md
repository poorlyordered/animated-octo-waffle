# Data Model: Worker Handoff Callbacks

## Worker Handoff

Existing durable handoff record extended with callback metadata.

- Existing fields: `id`, `corporationId`, `queueItemId`, `sourceDecisionId`, `status`, `payloadSummary`, `createdBy`, `createdAt`, `updatedAt`, `claimedAt`, `completedAt`, `failure`.
- New fields:
  - `claimedBy`: Worker identifier recorded on claim.
  - `progress`: Ordered safe progress events.
  - `result`: Safe completion result summary.

Validation rules:

- `ready` handoffs can become `claimed`.
- `claimed` handoffs can receive progress events.
- `claimed` handoffs can become `completed` or `failed`.
- Only the claiming worker can progress, complete, or fail a claimed handoff.
- Completed, failed, cancelled, and blocked handoffs cannot be claimed.

## Worker Progress Event

Safe event appended by the claiming worker while work is in progress.

- `message`: Short safe progress message.
- `code`: Optional safe status code.
- `createdAt`: Event timestamp.
- `workerId`: Claiming worker identifier.

Validation rules:

- Message is required and bounded.
- Secret-like fields, tokens, credentials, dispatch targets, and raw payloads are not stored.

## Worker Completion Result

Safe summary recorded when work completes.

- `summary`: Short safe output summary.
- `artifactRefs`: Optional safe references to durable artifacts or IDs.
- `completedAt`: Completion timestamp.
- `workerId`: Claiming worker identifier.

Validation rules:

- Summary is required and bounded.
- Raw external output is not stored.

## Worker Failure Result

Safe failure metadata recorded when work fails.

- `message`: Human-readable safe failure message.
- `code`: Optional safe failure code.
- `failedAt`: Failure timestamp.
- `workerId`: Claiming worker identifier.

Validation rules:

- Message is required and bounded.
- Failure metadata is browser-safe and must not include secrets.

## Worker Callback Credential

Server-side shared secret authorizing worker callback requests.

- `WORKER_CALLBACK_SECRET`: Required outside local deterministic tests.
- Header value: worker request must provide the secret through a server-only callback header.

Validation rules:

- Missing or incorrect callback secret is rejected.
- Credential values are never returned in responses or stored on handoff documents.
