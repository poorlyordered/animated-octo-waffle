# Research: M32 People Follow-Up Handoff

## Decision: Reuse Decision Records For People Approval

People follow-up decisions will use the existing decision-record model and status update path.

**Rationale**: Decision status, approval metadata, player-impacting approval text, and status history are already decision-record concerns. A separate People approval store would duplicate the command authority model.

**Alternatives considered**:

- Store approval directly on `leadership_followups`: rejected because it would split command decisions from the established decision loop.
- Add a People-only decision collection: rejected because it would duplicate `strategic_decisions` and complicate the decision list.

## Decision: Derive People Handoff Metadata Server-Side

People responses will include handoff metadata derived from the follow-up, linked decision, and linked queue item.

**Rationale**: Browser inputs must not forge approval state, queue state, provenance, or execution readiness. Server-derived handoff metadata matches the Numbers and Opportunity patterns.

**Alternatives considered**:

- Let the client assemble handoff state: rejected because it risks displaying untrusted queue or approval state.
- Persist a separate handoff document: rejected because current state is derivable from existing durable records.

## Decision: Queue Creation Reuses Automation Queue

People approved decisions will create queued planning work through the existing automation queue storage and rules.

**Rationale**: Queue records are already the command system's draft work orders. Reuse keeps retry, handoff, and worker integration future-compatible without adding execution behavior.

**Alternatives considered**:

- Add a People-specific queue: rejected because it would fragment queued work review.
- Create worker handoffs immediately: rejected because handoff preparation remains a separate automation step.
