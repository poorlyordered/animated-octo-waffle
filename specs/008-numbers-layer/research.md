# Research: Numbers Operating Layer

## Decision: Read Processed Numbers Snapshots Only

**Rationale**: M8 should add command visibility without introducing live ESI sync, token refresh, wallet actions, or asset movement. Reading processed `numbers_snapshots` documents preserves the request/response boundary and keeps ingestion/enrichment as future worker work.

**Alternatives considered**:

- Call ESI from the Netlify function: rejected because it would add live external dependency and drift toward sync work in request paths.
- Derive numbers from unrelated collections at request time: rejected because it would create ad hoc analytics instead of stable processed contracts.

## Decision: Normalize Partial Snapshots With Explicit Missing/Stale Sections

**Rationale**: Numbers data is high-risk if stale or incomplete. The UI should show useful known sections while marking missing/stale sections instead of hiding them or inventing values.

**Alternatives considered**:

- Require all sections before rendering: rejected because partial snapshots are still useful.
- Omit missing sections entirely: rejected because missing data must be explicit under the constitution.

## Decision: Keep Follow-Up Candidates Display-Only

**Rationale**: The command loop should connect numbers recommendations to decisions and queued work, but M8 should not create records automatically or advance player-impacting workflows.

**Alternatives considered**:

- Create decisions directly from the Numbers surface: rejected as a larger workflow slice.
- Queue work directly from metrics: rejected because player-impacting approval boundaries need a separate explicit flow.

## Decision: Use Browser Smoke Fixtures For Numbers UI

**Rationale**: Existing M5 browser coverage uses deterministic API fixtures. Extending those fixtures keeps browser validation local and independent from live MongoDB or EVE credentials.

**Alternatives considered**:

- Use live MongoDB for browser tests: rejected because browser smoke tests should be deterministic and not depend on secrets.
