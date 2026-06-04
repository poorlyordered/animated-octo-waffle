# Data Model: Retry History Management

## RetryRequestSummary

Existing browser-safe retry attempt summary. Reused without adding secret, dispatch, or worker-only fields.

## WorkerHandoff.retryHistory

Optional array of recent `RetryRequestSummary` values for `targetType = worker_handoff` and `targetId = handoff.id`.

## WorkerHandoffSummary.retryHistory

Optional array mirroring the full handoff history so automation queue detail can show the same audit context.

## EsiSyncHistoryItem.retryHistory

Optional array of recent `RetryRequestSummary` values for `targetType = esi_sync_request` and `targetId = sync request id`.

## Boundaries

History entries are read-only summaries. They do not schedule, cancel, dispatch, claim, execute, fetch ESI, write to EVE, or mutate wallet, asset, contract, role, or external-service state.
