# Worker Policy

Gryyk-47 worker callbacks are server-to-server paths. Browser actions may prepare durable work, prepare handoffs, or create retry records, but they do not dispatch workers, claim work, execute retries, fetch ESI, write to EVE, mutate external services, or bypass commander approval.

## Worker Classes

| Worker class | Endpoint family | Class secret | Fallback |
| --- | --- | --- | --- |
| `worker_handoff` | `/api/worker-handoffs` worker claim/progress/complete/fail | `WORKER_HANDOFF_CALLBACK_SECRET` | `WORKER_CALLBACK_SECRET` |
| `retry_worker` | `/api/retry-worker` | `RETRY_WORKER_CALLBACK_SECRET` | `WORKER_CALLBACK_SECRET` |
| `esi_sync` | `/api/esi-sync-worker` | `ESI_SYNC_WORKER_CALLBACK_SECRET` | `WORKER_CALLBACK_SECRET` |
| `people_ingestion` | `/api/people-ingestion-worker` | `PEOPLE_INGESTION_WORKER_CALLBACK_SECRET` | `WORKER_CALLBACK_SECRET` |
| `opportunity_ingestion` | `/api/opportunity-ingestion-worker` | `OPPORTUNITY_INGESTION_WORKER_CALLBACK_SECRET` | `WORKER_CALLBACK_SECRET` |

Class-specific secrets are preferred. When a class-specific secret is configured, the shared fallback no longer authorizes that worker class. Keep `WORKER_CALLBACK_SECRET` only as a compatibility fallback while migrating worker classes.

## Retry And Backoff Boundaries

- One active scheduled retry is allowed per target.
- Commander policy controls may run when due, defer 1 hour, defer 6 hours, or defer 24 hours.
- Scheduled retries can be rescheduled. Scheduled and blocked retries can be canceled.
- Claimed and completed retries cannot be canceled or rescheduled.
- Retry workers claim and execute due retry records only through worker-authenticated endpoints.

## No-Execution Browser Boundary

Browser and command APIs may create auditable records only. They must not accept browser-controlled worker secrets, worker class selection, dispatch targets, execute-now flags, EVE write payloads, role/access changes, wallet/asset/contract mutations, or external-service mutation payloads.
