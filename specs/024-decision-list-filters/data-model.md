# Data Model: Decision List Filters

## DecisionListFilters

- `status`: `all` or one existing decision status
- `source`: `all`, `opportunity`, or `numbers`

## DecisionListCounts

- `total`
- `visible`
- `proposed`
- `approved`
- `rejected`
- `playerImpacting`

## Derived Source Domain

- `numbers`: decision source context is `numbers_follow_up`
- `opportunity`: all other decision records for M24

No durable data model changes are required.
