# Data Model: Retry Execution Worker

## RetryRequest

Auditable commander-approved retry request, extended from M15 scheduling into worker execution.

### Fields

- `id`: Retry request id.
- `corporationId`: Active command scope.
- `targetType`: `worker_handoff` or `esi_sync_request`.
- `targetId`: Failed target id.
- `status`: `scheduled`, `claimed`, `completed`, or `blocked`.
- `reason`: Commander-visible scheduling reason.
- `notBefore`: Optional timestamp gating worker readiness.
- `createdBy`: Scheduling actor.
- `createdAt`: Creation timestamp.
- `claimedBy`: Worker id that claimed the retry.
- `claimedAt`: Claim timestamp.
- `completedAt`: Completion timestamp for successful execution.
- `blockedAt`: Block timestamp for policy failures.
- `blockedReason`: Browser-safe reason when execution cannot proceed.
- `result`: Browser-safe retry execution result.
- `boundary`: Browser-safe boundary language.

### State Transitions

```text
scheduled -> claimed -> completed
scheduled -> claimed -> blocked
```

Workers can claim only due scheduled retry requests. Completed and blocked requests are terminal for M16.

## RetryExecutionResult

Safe outcome summary stored on a retry request.

### Fields

- `targetType`: Original retry target type.
- `targetId`: Original failed target id.
- `replacementTargetId`: New ready handoff id or queued sync request id when completed.
- `replacementTargetStatus`: `ready` for handoffs or `queued` for sync requests.
- `workerId`: Worker id supplied by the trusted retry worker.
- `summary`: Browser-safe outcome summary.
- `executedAt`: Completion timestamp.

## WorkerHandoff

Existing failed worker handoff target and replacement ready handoff.

### Relationship

- A completed handoff retry links original failed handoff -> retry request -> replacement ready handoff.

## EsiSyncRequest

Existing failed Numbers ESI sync request target and replacement queued request.

### Relationship

- A completed ESI sync retry links original failed sync request -> retry request -> replacement queued sync request.
