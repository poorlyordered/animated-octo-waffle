# Research: Retry Cancellation and Policy Controls

## Decision: Add `canceled` retry status

Rationale: Cancellation is a terminal commander action distinct from worker `blocked` and worker `completed` outcomes.

Alternatives considered:

- Reuse `blocked`: rejected because blocked is a worker outcome.
- Delete retry records: rejected because cancellation should remain auditable.

## Decision: Cancel by target route

Rationale: Existing browser surfaces know worker handoff ids and ESI sync request ids. `/retry/cancel` on those target routes avoids a new global retry management surface for M20.

Alternatives considered:

- Add `/api/retries/:id/cancel`: deferred until a dedicated retry management surface exists.

## Decision: Add policy metadata to retry summaries

Rationale: Browser surfaces already display retry summaries. Policy metadata keeps the current state and allowed commander actions together.

Alternatives considered:

- Hard-code policy in browser only: rejected because policy should be server-owned and contract-tested.

## Decision: Cancellation remains record-only

Rationale: M20 must not dispatch workers, claim retries, run retries, fetch ESI, write to EVE, or mutate external systems.
