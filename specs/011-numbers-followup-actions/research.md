# Research: Numbers Follow-Up Actions

## Decision: Reuse Decision Records As The First Mutation

**Rationale**: A Numbers follow-up is a recommendation, not an action. Creating a proposed decision record preserves commander authority, status history, rationale, expected result, and approval boundaries before any queue item can exist.

**Alternatives considered**:

- Create queue items directly from Numbers candidates: rejected because queue creation requires approved decision intent and would weaken the approval gateway.
- Add a separate follow-up action collection: rejected because it duplicates decision records and adds another audit surface before the existing decision loop is exhausted.

## Decision: Resolve Candidate Provenance Server-Side From Stored Numbers Snapshots

**Rationale**: The browser can identify a snapshot and candidate, but it must not provide corporation scope, raw source references, confidence, approval metadata, or processing provenance. Server-side lookup keeps provenance tied to stored processed data and protects against forged action context.

**Alternatives considered**:

- Let browser submit candidate details for convenience: rejected because it allows raw provenance overrides and stale or forged candidate state.
- Copy only candidate title into the decision: rejected because source references, confidence, and created timestamps are required for durable decision audit.

## Decision: Prevent Duplicates With Origin Links

**Rationale**: A follow-up candidate should map to at most one active decision for a corporation scope, and a decision/task intent should map to at most one queue item. Explicit origin metadata makes duplicate detection inspectable and avoids repeated command artifacts.

**Alternatives considered**:

- Allow duplicates and rely on user cleanup: rejected because audit trails become noisy and confusing.
- Merge duplicates by title only: rejected because titles can change or collide across snapshots and sections.

## Decision: Keep Queue Creation Behind Existing Approved Decision Rules

**Rationale**: M3 already defines queue eligibility and approval boundaries. M11 should integrate with those rules rather than introduce a parallel queue path. Player-impacting follow-ups remain proposed until the commander explicitly approves them through the decision workflow.

**Alternatives considered**:

- Add a one-click "approve and queue" path: rejected for M11 because approval must be explicit and inspectable.
- Let non-player-impacting decisions queue from proposed status: rejected because queue records represent delegated work and should follow the same approved-intent rule.

## Decision: Browser UX Shows Existing Artifacts For Duplicates

**Rationale**: If a decision or queue item already exists, surfacing the existing artifact helps the commander continue the workflow without creating duplicate state.

**Alternatives considered**:

- Return only an error message: rejected because it hides useful audit context.
- Always create a new record with a suffix: rejected because it undermines duplicate prevention.
