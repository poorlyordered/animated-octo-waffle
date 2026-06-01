# Research: Worker Handoff For Automation Queue

## Decision: Store Handoff Records Separately From Queue Items

**Rationale**: The automation queue remains the commander's work order source of truth, while `worker_handoffs` records model the boundary where a task becomes worker-ready. Keeping these records separate preserves queue history and allows multiple terminal handoffs over time without overloading queue status.

**Alternatives considered**:

- Add handoff fields directly to `automation_queue`: rejected because duplicate prevention and future worker lifecycle history would become harder to audit.
- Reuse queue `running` status as handoff: rejected because handoff is not execution and should not imply work has started.

## Decision: Make Handoff Preparation Idempotent For Active Records

**Rationale**: Commanders and clients may retry a request. Returning the existing active handoff prevents duplicate worker-ready tasks while preserving a simple user flow.

**Alternatives considered**:

- Reject duplicate handoff attempts: rejected because a safe idempotent response is easier to recover from in browser workflows.
- Always create a new handoff: rejected because duplicate active worker payloads create ambiguity for future workers.

## Decision: Keep Request Handlers Local And Non-Dispatching

**Rationale**: The constitution requires long-running and external work outside request/response paths. M7 should only validate queue eligibility and create/read durable records. Future worker polling or callback slices can handle claim, completion, retry, and external execution.

**Alternatives considered**:

- Call an external worker webhook from the Netlify function: rejected because webhook latency/failures would blur the handoff boundary.
- Run worker processing inline after creating the handoff: rejected because it violates the request/response boundary.

## Decision: Derive Payload Summaries From Existing Queue Items

**Rationale**: Queue records already contain task intent, input summary, expected output, approval snapshot, and provenance. M7 should transform those fields into a browser-safe payload summary instead of accepting arbitrary executable browser instructions.

**Alternatives considered**:

- Accept full worker payload from browser request: rejected because it would allow scope and execution boundary bypass.
- Store raw internal queue documents in handoff responses: rejected because browser-visible responses must stay stable and secret-free.
