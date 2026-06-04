# Data Model: Decision List Pagination and Persisted Filters

## DecisionListFilters

Existing filter object:

- `status`: `all` or decision status
- `source`: `all`, `opportunity`, or `numbers`

## PersistedDecisionListSettings

Browser-local settings:

- `status`
- `source`
- `pageSize`

Invalid values are ignored and replaced by defaults.

## DecisionListPagination

Derived page state:

- `page`
- `pageSize`
- `totalItems`
- `totalPages`
- `startIndex`
- `endIndex`
- `items`

Pagination is derived from already-loaded browser data and does not affect API requests.
