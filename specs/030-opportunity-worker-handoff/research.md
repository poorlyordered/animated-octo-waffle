# Research: M30 Opportunity Worker Handoff

## Decision: reuse automation queue handoff preparation

The automation queue already owns worker handoff contracts, eligibility rules, and no-execution safeguards. Opportunity queued work should call that existing workflow instead of creating an Opportunity-specific route.

## Decision: show detail in the Opportunity surface

After a commander creates queued work from an Opportunity decision, staying in context is more ergonomic than forcing a switch to the automation queue surface just to prepare the first handoff.

## Rejected Alternatives

- **Automatic handoff preparation during queue creation**: Rejected because queue creation and handoff preparation are separate commander actions.
- **Opportunity-specific worker endpoint**: Rejected because it duplicates existing automation queue boundaries.
- **Dispatching a worker after handoff preparation**: Rejected because worker dispatch remains out of scope and must stay separate from request/response actions.
