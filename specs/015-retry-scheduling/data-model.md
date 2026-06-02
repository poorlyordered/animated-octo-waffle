# Data Model: Retry Scheduling

## RetryRequest

Auditable commander-approved retry scheduling record.

### Fields

- `id`: Retry request id.
- `corporationId`: Active command scope.
- `targetType`: `worker_handoff` or `esi_sync_request`.
- `targetId`: Failed target id.
- `status`: Initially `scheduled`.
- `reason`: Commander-visible reason.
- `notBefore`: Optional timestamp for future execution policy.
- `createdBy`: Scheduling actor, initially `commander`.
- `createdAt`: Creation timestamp.
- `boundary`: Browser-safe no-execution boundary language.

### State Transitions

```text
scheduled
```

M15 does not execute, cancel, claim, or dispatch retries.
