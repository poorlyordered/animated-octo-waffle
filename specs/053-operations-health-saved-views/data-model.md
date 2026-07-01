# Data Model: M53 Operations Health Saved Views

M53 does not add backend storage or change the operations-health response model.

## OperationsHealthSavedView

- `id`: deterministic string derived from warning severity, worker status, and worker secret filters
- `label`: human-readable summary of the saved filter combination
- `filters`: `OperationsHealthFilters`

## Storage

- Browser localStorage key: `gryyk47.operationsHealthSavedViews`
- Value: JSON array of saved views
- Malformed JSON, invalid filter values, or stale entries parse to an empty saved-view list or are dropped from the list.

## Deduplication

Saving the same filter combination moves or keeps one deterministic saved view instead of creating duplicates.
