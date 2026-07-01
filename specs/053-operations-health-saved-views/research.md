# Research: M53 Operations Health Saved Views

## Decision: browser localStorage only

Rationale: the roadmap explicitly excludes server preference storage and provider calls. The existing Decision Records saved-view feature already uses localStorage for browser-local view preferences, so M53 follows that pattern for Operations Health.

Alternatives considered:

- Server preferences: rejected because M53 must not add server preference storage.
- Query parameters: rejected because Operations Health filters organize already loaded summaries and do not require API filtering.

## Decision: deterministic saved-view ids

Rationale: a saved view is fully described by warning severity, worker status, and worker secret filters. Deterministic ids make de-duplication simple and testable.

## Decision: fail closed on malformed storage

Rationale: localStorage is user-editable and untrusted. Invalid saved views should be ignored rather than surfaced or sent anywhere.
