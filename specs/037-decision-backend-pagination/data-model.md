# Data Model: M37 Decision Backend Pagination

## DecisionRecordPagination

- `page`: current clamped page
- `pageSize`: bounded page size
- `totalItems`: total filtered records
- `totalPages`: total filtered pages, minimum 1
- `startIndex`: one-based first item index, or 0 for empty sets
- `endIndex`: one-based final item index, or 0 for empty sets

## DecisionRecordListResponse

- `decisions`: current page only
- `pagination`: `DecisionRecordPagination`

