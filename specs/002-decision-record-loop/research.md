# Research: Decision Record Loop

## Decision: Store decision records in MongoDB as first-class operational documents in `strategic_decisions`

**Rationale**: The project already uses MongoDB for operational documents, research briefs, and request status. The `gryyk47` database already contains a `strategic_decisions` collection with corporation-scoped decision-like documents, including `corporationId`, `researchBriefId`, `decisionContext`, `finalDecision`, agent recommendations, and synthesis fields. M2 should normalize and extend this existing decision store rather than creating a parallel `decision_records` collection.

**Alternatives considered**:

- Store decisions only in client state: rejected because decision records must be durable and auditable.
- Add a relational database: rejected because this slice does not need relational joins and would add unnecessary operational complexity.
- Create a new `decision_records` collection immediately: rejected because `strategic_decisions` already exists and should be the canonical decision collection unless implementation analysis proves it cannot support the contract.

## Decision: Use short Netlify functions for create, list, detail, and status update operations

**Rationale**: Decision recording is a bounded request/response operation. It fits the existing Netlify function boundary and does not require background processing.

**Alternatives considered**:

- Worker-first decision creation: rejected because no long-running processing is needed.
- Client-side direct MongoDB writes: rejected because secrets and corporation scope must remain server-side.

## Decision: Snapshot source provenance at decision creation time

**Rationale**: A decision should remain understandable even if the source brief later changes, is superseded, or becomes unavailable. Snapshotting source recommendation text, source references, model/prompt metadata, confidence, createdAt, and coverage preserves the decision-time context.

**Alternatives considered**:

- Link only to source brief ID: rejected because old context could become unavailable or drift from the decision's original basis.
- Duplicate the full source brief: rejected because the decision needs enough provenance for audit, not a full brief clone.

## Decision: Model status changes as append-only history

**Rationale**: The commander needs to distinguish proposed, approved, delegated, done, and rejected decisions. Append-only status history preserves auditability and supports future actor identity once EVE SSO lands.

**Alternatives considered**:

- Store only current status: rejected because it loses decision progression history.
- Store free-form status strings: rejected because allowed statuses are part of the user-facing command workflow.

## Decision: Treat explicit approval as metadata, not execution

**Rationale**: The constitution requires explicit approval before player-impacting actions. M2 records approval intent and keeps it visibly separate from execution or automation queue handoff. Later M3 automation can consume approved decisions through a separate queue contract.

**Alternatives considered**:

- Create queue entries directly from approvals: rejected because Automation Queue is a later milestone.
- Mark approved decisions as executed: rejected because approval and execution are constitutionally distinct.
