# Research: M38 Decision Saved Views

## Decision: Browser-local only

**Rationale**: M38 is an operator ergonomics slice. Server-side preference storage would need user identity, migration rules, and preference contracts that are larger than the immediate roadmap need.

## Decision: Deterministic labels

**Rationale**: Avoiding free-form names keeps the first saved-view implementation small, typed, and duplicate-safe.

## Decision: Saved views include page size

**Rationale**: Page size materially changes the review cadence and was already persisted with filter settings.

