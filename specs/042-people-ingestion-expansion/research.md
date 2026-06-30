# Research: M42 People Ingestion Expansion

## Decision: Reuse existing worker callback auth

Use `WORKER_CALLBACK_SECRET` and `assertWorkerCallbackAuthorized` for People ingestion workers.

Rationale: the repo already uses this for worker handoffs, retry workers, and ESI sync workers. Reusing it avoids a parallel auth scheme and keeps worker-only routes server-side.

## Decision: Prepare does not dispatch

Commander prepare creates or surfaces a durable queued request. It does not call ESI, dispatch a worker, retry, or mutate external services.

Rationale: the constitution requires long-running work outside request/response paths and explicit human authority for player-impacting changes.

## Decision: Store lifecycle in `people_ingestion_requests`

Extend the existing provenance collection instead of creating a second queue.

Rationale: People provenance already reads from this collection; using one lifecycle store keeps browser history and worker state consistent.
