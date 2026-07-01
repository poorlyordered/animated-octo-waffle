# Research: M52 Production Evidence Filtering

## Decision: browser-local filters only

Rationale: the roadmap explicitly excludes server preference storage and production data export. Local state is enough to organize the bounded production evidence list.

Rejected alternative: server-side filter query parameters. They are unnecessary for the current bounded evidence list and would expand the API contract.

## Decision: check-status filter matches any check on a record

Rationale: evidence records contain multiple fixed checks. Operators looking for blocked or attention items need any record containing that status, not only records where every check has that status.

Rejected alternative: require every check to match. That would hide records with mixed production posture, which is the most useful case to inspect.

## Decision: no saved filter presets

Rationale: M52 is filtering only. Saved views are already a separate roadmap pattern and should not be mixed into this slice.
