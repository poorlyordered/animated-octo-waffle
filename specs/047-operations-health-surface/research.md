# Research: M47 Operations Health Surface

## Decision: Add a dedicated operations health endpoint

Rationale: The browser should not infer production posture by calling multiple operational APIs or inspecting environment state. A single server-owned endpoint can summarize safe counts, timestamps, and secret-state categories while keeping secrets server-side.

Alternatives considered:

- Aggregate existing APIs in the browser: rejected because secret/env readiness belongs server-side and browser aggregation would duplicate operational rules.
- Add live provider checks: rejected because M47 is a read-only surface and live provider verification remains an operator workflow from M46.

## Decision: Return degraded section summaries instead of failing the whole endpoint for partial query failures

Rationale: Operations health is most useful when it can show which area is degraded. Per-section degradation preserves visibility without exposing internal errors or secret details.

Alternatives considered:

- Fail the entire endpoint on any collection query error: rejected because it hides unaffected operational areas.
- Return raw error messages: rejected because error text may expose implementation details.

## Decision: Use safe secret states for worker readiness

Rationale: Operators need to know whether class-specific worker secrets are configured, falling back, or missing, but never need secret values in browser responses.

Alternatives considered:

- Hide all worker secret state: rejected because M44 and M46 made class-specific migration posture operationally important.
- Return environment variable values or hashes: rejected because the health surface must not expose secret material or fingerprints.
