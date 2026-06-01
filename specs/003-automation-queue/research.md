# Research: Automation Queue

## Decision: Store queue records in a dedicated MongoDB `automation_queue` collection

**Rationale**: Queue records are operational work orders, not decisions. Keeping them in a dedicated collection preserves the separation between approved decisions and queued work while matching the existing MongoDB-backed operational document model. The collection can later be consumed by workers without overloading `strategic_decisions`.

**Alternatives considered**:

- Store queue entries inside `strategic_decisions`: rejected because it would blur decision records with work execution state and make future worker queries harder.
- Store queue entries only in client state: rejected because queue records must be durable and auditable.
- Add a relational job table: rejected because this slice does not need relational constraints and the project already uses MongoDB for operational documents.

## Decision: Create queue records only from approved decision records

**Rationale**: M3 should build directly on M2's approval boundary. A queued item represents a draft work order, so it must originate from a decision that has already moved through command approval. This keeps observations, recommendations, decisions, queue items, and execution distinct.

**Alternatives considered**:

- Allow queue creation from command brief recommendations directly: rejected because it bypasses the decision record loop.
- Allow queue creation from proposed decisions: rejected because proposed decisions have not crossed the command approval threshold.

## Decision: Enforce player-impacting approval at queue creation

**Rationale**: Player-impacting work can affect members, assets, permissions, standings, wallets, contracts, or external services. The queue endpoint must verify approval metadata on the source decision and reject queue creation when approval is missing.

**Alternatives considered**:

- Trust the browser to disable queue buttons: rejected because approval boundaries must be enforced server-side.
- Allow queue creation but mark it blocked: rejected for M3 because queue creation itself could be interpreted as authorized work. A future blocked-draft model can be specified separately.

## Decision: Expose future worker metadata as read-only fields

**Rationale**: M3 does not dispatch workers, but the queue contract should be able to display worker-written status, attempts, failures, retry eligibility, output summaries, and completion timestamps if they are present. This lets the UI remain compatible with later worker integration without introducing execution now.

**Alternatives considered**:

- Hide all worker metadata until worker integration exists: rejected because seeded and future-written records would be opaque.
- Implement retries in M3: rejected because retries are worker behavior and would violate the milestone boundary.

## Decision: Use short Netlify functions for queue create/list/detail only

**Rationale**: Creating and reading queue records are bounded request/response operations. The actual work represented by queue records must remain outside the request path.

**Alternatives considered**:

- Dispatch workers synchronously after queue creation: rejected because long-running processing and external actions must not run inside request/response paths.
- Client-side direct MongoDB writes: rejected because storage credentials and corporation scope must remain server-side.
