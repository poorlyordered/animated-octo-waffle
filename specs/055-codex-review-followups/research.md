# Research: Codex Review Followups

## Decision: Gate People queue readiness by verified People-origin decision state

**Rationale**: The canonical server rule already defines People decision origin as `sourceType: people_follow_up` plus matching follow-up and member identifiers. Reusing that invariant keeps UI and queue behavior aligned with the server boundary.

**Alternatives considered**:

- Trust `followUp.sourceContext.decisionStatus` alone. Rejected because source context can describe a pre-existing non-People decision link.
- Add a new handoff contract field. Rejected because the current handoff shape already carries enough state once derivation is corrected.

## Decision: Ignore mismatched linked queue items during People queue duplicate detection

**Rationale**: A linked queue item is only a duplicate of the requested People queue work if it belongs to the approved People decision. Mismatched queue links should not prevent creation or discovery of queue work for the correct decision.

**Alternatives considered**:

- Throw when a mismatched queue item is found. Rejected because existing imported or historical follow-ups can contain stale links; continuing to find/create the correct People queue item is safer.
- Clear the stale queue link immediately. Rejected because this slice should not mutate unrelated historical linkage beyond the intended People queue result.

## Decision: Reject URL userinfo as unsafe production evidence value material

**Rationale**: URL userinfo can carry personal access tokens, passwords, or API credentials while still looking like a valid URL. Production evidence records are value-free and must reject such values before persistence.

**Alternatives considered**:

- Restrict only `pullRequestUrl`. Rejected because evidence checks and other optional URL-like fields can also carry credentials.
- Strip userinfo and store the sanitized URL. Rejected because silently modifying evidence can hide operator mistakes; explicit rejection is safer.

## Decision: Include Numbers and Opportunity in read-only ESI status history

**Rationale**: M54 allows worker-owned Opportunity completion and failure. The commander-visible ESI status surface must show those outcomes while retaining existing Numbers history and retry visibility.

**Alternatives considered**:

- Add a separate Opportunity status endpoint. Rejected because the existing ESI status surface already presents domain summaries and recent history.
- Include every ESI domain by default. Rejected for this slice because People worker status visibility was not part of the Codex finding.
