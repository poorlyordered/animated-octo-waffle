# Data Model: M52 Production Evidence Filtering

M52 does not add backend storage or change the production-evidence response model.

## ProductionEvidenceFilters

- `environment`: `all`, `production`, `staging`, or `controlled_staging`
- `decision`: `all`, `go`, `no_go`, or `controlled_staging`
- `checkStatus`: `all`, `verified`, `attention`, `blocked`, or `not_applicable`

## ProductionEvidenceFilterCounts

- `visibleRecords`
- `totalRecords`

Counts are derived in the browser from the current production-evidence response.
