# Data Model: M47 Operations Health Surface

## OperationsHealthResponse

- `generatedAt`: ISO datetime when the summary was generated.
- `corporationId`: Current command corporation scope.
- `overallStatus`: `ready`, `degraded`, or `blocked`.
- `commandApis`: Browser-safe command API status summaries.
- `ingestion`: Browser-safe ingestion status summaries.
- `retryPosture`: Counts by retry status and target type.
- `workerReadiness`: Callback class readiness summaries.
- `warnings`: Operator-facing warnings without secret values.
- `boundary`: No-execution boundary text.

## CommandApiHealthSummary

- `key`: Stable command API key.
- `label`: Display label.
- `status`: `ready`, `degraded`, or `blocked`.
- `evidence`: Value-free evidence such as collection count or latest timestamp.
- `lastUpdatedAt`: Optional ISO datetime for latest known safe record.

## IngestionHealthSummary

- `key`: `numbers_esi_sync`, `people_ingestion`, or `opportunity_ingestion`.
- `label`: Display label.
- `status`: `ready`, `degraded`, or `blocked`.
- `queued`, `processing`, `completed`, `failed`: Nonnegative counts.
- `latestAt`: Optional ISO datetime.
- `evidence`: Value-free summary.

## RetryPostureSummary

- `scheduled`, `claimed`, `completed`, `blocked`, `canceled`: Nonnegative counts.
- `workerHandoffTargets`: Retry count targeting worker handoffs.
- `esiSyncTargets`: Retry count targeting ESI sync requests.
- `evidence`: Value-free summary.

## WorkerReadinessSummary

- `workerClass`: Worker callback class.
- `label`: Display label.
- `secretState`: `configured`, `fallback`, or `missing`.
- `status`: `ready`, `degraded`, or `blocked`.
- `evidence`: Value-free summary.

## OperationsHealthWarning

- `key`: Stable warning id.
- `severity`: `info`, `warning`, or `critical`.
- `message`: Browser-safe warning text.
