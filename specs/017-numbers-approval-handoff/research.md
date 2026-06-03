# Research: Numbers Approval Handoff

## Decision: Compute handoff state from existing artifacts

**Rationale**: The approval handoff is a view of existing command artifacts: Numbers candidate, decision record, and queue item. Computing it avoids another durable state source that could drift.

**Alternatives considered**: A new `approval_handoffs` collection was rejected because it duplicates decision and queue status.

## Decision: Keep approval mutation out of M17

**Rationale**: The existing decision workflow owns approval. M17 only makes the handoff visible and safer to audit.

**Alternatives considered**: Adding approve-and-queue from the Numbers panel was rejected because it would combine approval mutation and queue creation in one slice.

## Decision: Return metadata in both decision and queue responses

**Rationale**: The browser needs handoff status immediately after both actions, including duplicate responses.

**Alternatives considered**: Loading separate status endpoints was rejected for this slice because action responses already have the needed records.
