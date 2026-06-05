# Implementation Plan: M30 Opportunity Worker Handoff

## Summary

Add queued-work detail and explicit worker handoff preparation to the Opportunity surface after an approved Opportunity decision creates queued work. Reuse existing automation queue and worker handoff APIs so approval, queue creation, handoff preparation, worker dispatch, and execution remain separate.

## Constitution Check

- **Command Simulation**: Improves the command loop from Opportunity recommendation to queued work to worker-ready handoff.
- **Three-Leg Data Stool**: Focuses on Opportunity decisions while preserving queue provenance and operating coverage.
- **Automation With Auditability**: Shows queue item and handoff status, inputs, outputs, timestamps, and boundary copy.
- **Human Authority**: Handoff preparation is a separate commander action.
- **Durable Architecture**: Reuses existing typed automation queue and worker handoff contracts.

## Technical Approach

- Add an Opportunity queued-work handoff view model.
- Store the created queue item in Opportunity panel state.
- Render queue detail and handoff status after queue creation.
- Wire the Opportunity route to the existing automation queue `prepareHandoff` action.
- Update unit and browser smoke tests.

## Validation

- `npm test -- --maxWorkers=2`
- `npm run test:e2e -- command-surfaces.spec.ts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Non-Goals

- No worker dispatch, claim, retry, or execution.
- No new backend route.
- No ESI fetch, EVE write, wallet, asset, contract, role, or external-service mutation.
