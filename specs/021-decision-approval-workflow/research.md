# Research: Decision Approval Workflow Improvements

## Decision: Use Existing Decision Status Store

M21 reuses `updateDecisionStatus` rather than introducing a Numbers-only status persistence path.

**Rationale**: The store already enforces status transitions and approval boundaries. Reusing it keeps the generic decision model consistent while the Numbers endpoint adds origin validation and handoff metadata.

**Alternatives considered**:

- Add a separate Numbers approval collection: rejected because approval is already a decision-record concern.
- Mutate queue readiness directly: rejected because queue readiness is derived from decision status and queue creation must stay separate.

## Decision: Add Numbers-Scoped Status Endpoint

Use `PATCH /api/numbers/follow-ups/:candidateId/decision/status`.

**Rationale**: The generic decision endpoint returns only a decision. The Numbers surface needs snapshot/candidate validation plus an updated `NumbersApprovalHandoff` response. A scoped endpoint avoids browser-provided origin state.

## Decision: Approval Does Not Queue

Approval only updates the decision. The existing `POST /api/numbers/follow-ups/:candidateId/queue` remains the deliberate queued-work action.

**Rationale**: This preserves the constitution's distinction between recommendations, decisions, queued work, and execution.
