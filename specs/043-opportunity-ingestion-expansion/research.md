# Research: M43 Opportunity Ingestion Expansion

## Decision: Reuse existing worker callback auth

Use `WORKER_CALLBACK_SECRET` and `assertWorkerCallbackAuthorized` for Opportunity ingestion workers.

Rationale: the repo already uses this for worker handoffs, retry workers, ESI sync workers, and People ingestion workers. Reusing it avoids another auth scheme and keeps worker-only routes server-side.

## Decision: Prepare does not schedule research

Commander prepare creates or surfaces a durable queued request. It does not pull official news, call AI/research processors, dispatch a worker, retry, or mutate external services.

Rationale: the constitution requires long-running work outside request/response paths and the roadmap explicitly says M43 must not schedule research from browser display paths.

## Decision: Store lifecycle in `research_requests`

Extend the existing Opportunity provenance collection instead of creating a second queue.

Rationale: Opportunity provenance already reads from `research_requests`; using one lifecycle store keeps browser history and worker state consistent.
