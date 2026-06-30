# Research: M39 Roadmap Backlog Refresh

## Decision: Refresh the roadmap before selecting another product slice

Rationale: M38 completed the only concrete near-term candidate left in `docs/roadmap.md`. Continuing directly into product implementation would require guessing. A small roadmap-refresh slice creates an auditable restart point and preserves the feature-by-feature process.

Alternatives considered:

- Treat the roadmap as complete: rejected because the roadmap itself asks for refreshed candidates and production readiness consideration.
- Start a production audit immediately: rejected because it should be one candidate in an ordered backlog, not an implicit default.

## Decision: Prioritize stabilization before new capability expansion

Rationale: The command loop now spans Numbers, Opportunity, People, decisions, queues, worker handoffs, retries, and browser ergonomics. A production-readiness audit is the highest-leverage next candidate before adding broader ingestion or automation behavior.

Alternatives considered:

- Add more UI preferences first: rejected because M38 already covered the immediate Decision Records ergonomics candidate.
- Add live mutation behavior: rejected by constitution boundaries requiring explicit approval and separate design.
