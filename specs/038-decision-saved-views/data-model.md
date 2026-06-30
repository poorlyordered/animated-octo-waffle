# Data Model: M38 Decision Saved Views

## DecisionSavedView

- `id`: deterministic `status:source:pageSize`
- `label`: human-readable status/source/page-size summary
- `settings.status`: `DecisionStatus` or `all`
- `settings.source`: `opportunity`, `numbers`, `people`, or `all`
- `settings.pageSize`: bounded decision page size

## Storage

- Browser localStorage key `gryyk47.decisionSavedViews`
- Malformed or unsafe entries are normalized or ignored.

