# Research: Retry Scheduling

## Decision: Separate RetryRequest Records

**Rationale**: Retry scheduling should be inspectable without mutating failed handoffs or failed sync requests back to active states.

**Alternatives considered**: Add retry fields directly to failed records. Rejected because handoffs and sync requests have different lifecycle owners and future retry execution may need a common queue.

## Decision: Scheduling Only

**Rationale**: The constitution requires player-impacting and automation actions to stay explicit and inspectable. M15 should capture approved retry intent without starting work.

**Alternatives considered**: Immediately create a ready handoff or queued sync request. Rejected because that crosses into execution/dispatch semantics.

## Decision: Existing Surface Entry Points

**Rationale**: Failed handoffs and failed ESI syncs are already visible in automation queue and ESI sync settings, so retry controls belong next to those failures.

**Alternatives considered**: Add a separate retry dashboard. Rejected for M15 because it would add navigation complexity before retry execution exists.
