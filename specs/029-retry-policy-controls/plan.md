# Implementation Plan: M29 Retry Policy Controls

## Summary

Expose bounded server-owned retry delay options in retry policy summaries and render them on scheduled worker handoff and Numbers ESI sync retry surfaces. The browser uses the existing reschedule APIs to apply selected timing policy while preserving retry approval and execution boundaries.

## Constitution Check

- **Command Simulation**: Improves commander inspection and timing control for automation retries.
- **Three-Leg Data Stool**: Applies to Numbers ESI sync retries and automation handoffs created from command decisions.
- **Automation With Auditability**: Updates retry metadata only; worker dispatch and execution remain separate.
- **Human Authority**: Commander explicitly selects delay policy.
- **Durable Architecture**: Adds typed contract/schema metadata and keeps secrets server-side.

## Technical Approach

- Extend retry contracts and schemas with `RetryPolicyDelayOption`.
- Add server-owned delay options to shared retry policy summaries.
- Render delay policy buttons in automation queue and ESI sync surfaces only for reschedulable retries.
- Reuse existing reschedule APIs and no-execution response boundaries.
- Update fixtures and tests for contract, store, and browser behavior.

## Validation

- `npm test -- --maxWorkers=2`
- Targeted Playwright smoke tests for worker handoff and ESI sync retry controls.
- Production build if validation time allows before PR.

## Non-Goals

- No new worker scheduler behavior.
- No automatic backoff engine.
- No new durable preference store.
- No execution, ESI fetch, EVE write, wallet, asset, contract, role, or external-service mutation.
