# Data Model: M50 Operations Health Filtering

M50 does not add backend storage or change the operations-health response model.

## OperationsHealthFilters

- `warningSeverity`: `all`, `info`, `warning`, or `critical`
- `workerStatus`: `all`, `ready`, `degraded`, or `blocked`
- `workerSecret`: `all`, `configured`, `fallback`, or `missing`

## OperationsHealthFilterCounts

- `visibleWarnings`
- `totalWarnings`
- `visibleWorkers`
- `totalWorkers`

Counts are derived in the browser from the current operations-health response.
