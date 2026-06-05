# Implementation Plan: M31 Opportunity Handoff Retry Controls

## Summary

Add retry management controls to Opportunity queued-work detail when a prepared worker handoff has failed. Reuse existing worker handoff retry APIs for schedule, cancel, reschedule, and policy delay actions.

## Constitution Check

- **Command Simulation**: Keeps Opportunity queued-work recovery in the command workflow.
- **Three-Leg Data Stool**: Extends Opportunity worker handoff visibility while preserving provenance.
- **Automation With Auditability**: Shows failure, retry status, retry history, and policy boundaries.
- **Human Authority**: Every retry action is commander-triggered.
- **Durable Architecture**: Reuses shared retry contracts and worker handoff APIs.

## Technical Approach

- Extend Opportunity queued-work detail rendering with failure, retry, history, and policy controls.
- Wire Opportunity route to existing automation queue retry actions.
- Update browser fixtures to expose a failed Opportunity handoff.
- Add unit and browser coverage for failed-handoff retry controls.

## Validation

- `npm test -- --maxWorkers=2`
- `npm run test:e2e -- command-surfaces.spec.ts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Non-Goals

- No new backend routes.
- No retry execution worker changes.
- No worker dispatch, claim, ESI fetch, EVE write, wallet, asset, contract, role, or external-service mutation.
