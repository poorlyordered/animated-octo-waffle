# Research: M29 Retry Policy Controls

## Decision: policy options live in RetryPolicySummary

`RetryPolicySummary` is already the server-owned browser-safe place for can-schedule, can-cancel, and can-reschedule eligibility. Adding delay options here keeps the UI from inventing local policy and lets future backend policy changes flow through the same contract.

## Decision: reuse reschedule APIs

Selecting a policy delay updates the scheduled retry through the existing reschedule endpoint. This avoids adding another mutation path and preserves the existing scheduled-only guard.

## Rejected Alternatives

- **Automatic backoff engine**: Rejected because it changes worker execution semantics and would exceed this browser-safe policy-control slice.
- **Multiple active scheduled retries**: Rejected because it weakens the current one-active-retry invariant and requires deeper queue policy design.
- **Browser-local delay constants only**: Rejected because policy choices should remain server-owned and auditable through contracts.
