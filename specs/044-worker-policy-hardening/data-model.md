# Data Model: M44 Worker Policy Hardening

## WorkerCallbackClass

- `worker_handoff`: prepared automation queue handoff callbacks.
- `retry_worker`: scheduled retry execution callbacks.
- `esi_sync`: Numbers ESI sync worker callbacks.
- `people_ingestion`: People ingestion worker callbacks.
- `opportunity_ingestion`: Opportunity ingestion worker callbacks.

## Worker Secret Policy

- `WORKER_HANDOFF_CALLBACK_SECRET`: class-specific secret for `worker_handoff`.
- `RETRY_WORKER_CALLBACK_SECRET`: class-specific secret for `retry_worker`.
- `ESI_SYNC_WORKER_CALLBACK_SECRET`: class-specific secret for `esi_sync`.
- `PEOPLE_INGESTION_WORKER_CALLBACK_SECRET`: class-specific secret for `people_ingestion`.
- `OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET`: class-specific secret for `opportunity_ingestion`.
- `WORKER_CALLBACK_SECRET`: compatibility fallback only when a class-specific secret is not configured.

## Invariants

- Class-specific secrets never authorize another worker class.
- The shared fallback authorizes a worker class only when that class-specific secret is absent.
- Browser/client code never receives or chooses worker class secrets.
