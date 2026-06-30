# Contract: M44 Worker Policy Hardening

## Worker Callback Authorization

Worker-only endpoints continue to use:

```http
x-worker-callback-secret: <server-configured-secret>
```

Each endpoint passes its server-owned worker class to the shared auth helper:

- `worker_handoff`
- `retry_worker`
- `esi_sync`
- `people_ingestion`
- `opportunity_ingestion`

Authorization order:

1. If the worker class has a class-specific secret configured, the request secret must match that value.
2. If no class-specific secret is configured, the request secret may match `WORKER_CALLBACK_SECRET`.
3. Requests with no configured matching secret are rejected with `401`.

Browser APIs do not accept worker class, worker secret, dispatch target, or execute-now fields.
