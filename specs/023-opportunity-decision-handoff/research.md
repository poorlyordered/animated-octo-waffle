# Research: Opportunity Decision Handoff

## Decision: Reuse Existing Decision API

M23 uses `POST /api/decision-records` via the existing decision-record client.

**Rationale**: Opportunity recommendations already originate from command briefs, and the existing decision-record API persists decisions from source briefs. A new endpoint would duplicate the same persistence and normalization rules.

## Decision: Client-Derived Handoff Metadata

The Opportunity surface derives handoff metadata from the created decision and existing provenance.

**Rationale**: M23 does not need a new durable entity. The handoff is browser-visible explanation of the transition from recommendation to proposed decision.

## Decision: No Approval Or Queueing In M23

M23 stops at proposed decision state.

**Rationale**: Approval and queueing are separate commander actions and need their own Opportunity-specific boundary design.
