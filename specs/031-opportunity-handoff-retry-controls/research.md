# Research: M31 Opportunity Handoff Retry Controls

## Decision: reuse worker handoff retry APIs

Opportunity worker handoffs are ordinary automation queue handoffs. The existing worker handoff retry APIs already enforce scheduled-only, cancelable, reschedulable, and policy-delay boundaries.

## Decision: local browser state update after retry mutations

The Opportunity surface keeps the newly created queue detail in local state. Retry responses update that local handoff summary immediately so the commander can see the resulting retry state without adding a new Opportunity detail route.

## Rejected Alternatives

- **Opportunity-specific retry endpoints**: Rejected as duplicate backend surface.
- **Automatic retry scheduling after failed handoff**: Rejected because retry scheduling is a commander action.
- **Dispatching retry workers from the browser**: Rejected by the constitution and existing no-execution boundaries.
