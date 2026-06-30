# Data Model: M42 People Ingestion Expansion

## PeopleIngestionRequest

- `id`: browser-safe request id.
- `corporationId`: command corporation scope.
- `status`: `queued`, `claimed`, `completed`, `failed`, or `cancelled`.
- `requestedBy`: display-safe commander/session/source label.
- `requestedAt`: ISO timestamp.
- `source`: safe provenance summary.
- `claimedBy`: worker id when claimed.
- `claimedAt`: ISO timestamp when claimed.
- `completedAt`: ISO timestamp when completed.
- `result.sourceCount`: non-negative count of sources processed by the worker.
- `result.sectionStatuses`: identity, roles, activity, and delegation coverage states.
- `failure.reason`: safe failure reason.
- `failure.failedAt`: ISO timestamp.
- `createdAt` / `updatedAt`: audit timestamps.

## Invariants

- Only one active queued/claimed request is surfaced per corporation by commander prepare.
- Worker claim only succeeds from `queued`.
- Worker completion/failure only succeeds for the claiming worker.
- Browser-safe summaries never include secrets, tokens, raw provider payloads, or role/access mutation payloads.
