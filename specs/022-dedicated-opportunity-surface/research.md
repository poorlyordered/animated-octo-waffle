# Research: Dedicated Opportunity Surface

## Decision: Reuse Command Brief APIs

M22 uses existing `/api/command-brief` and `/api/research-status`.

**Rationale**: M19 already made Opportunity provenance browser-safe on command brief responses. A new backend route would duplicate the same data and add maintenance without changing the data source.

**Alternatives considered**:

- Add `/api/opportunity`: rejected for M22 because there is no new data contract or persistence need.
- Add research scheduling controls: rejected because long-running research must stay outside request/response paths.

## Decision: Read-Only Opportunity Surface

The surface does not create decisions or queued work.

**Rationale**: The first dedicated surface should establish domain clarity. Decision and queue workflows already exist elsewhere and can be linked later once Opportunity-specific decision provenance is designed.
