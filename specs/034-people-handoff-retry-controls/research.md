# Research: M34 People Handoff Retry Controls

## Decision: Reuse Worker Handoff Retry APIs

People failed handoffs will call existing worker handoff retry schedule, cancel, and reschedule APIs.

**Rationale**: Retry policy and duplicate rules are target-type concerns already owned by retry APIs. Reuse keeps People behavior aligned with Opportunity and Numbers retry surfaces.

**Alternatives considered**:

- Add People retry routes: rejected because worker handoff id is already the retry target.
- Execute retry from the browser: rejected by constitution and existing worker-only retry execution model.

## Decision: Keep People Retry Execution Out Of Browser

M34 creates and manages retry intent only.

**Rationale**: Retry execution is long-running worker work and must stay outside request/response paths.

**Alternatives considered**:

- Add a "run now" browser control: rejected because it would blur approval, queueing, retry intent, and execution.
