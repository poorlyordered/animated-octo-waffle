# Data Model: M31 Opportunity Handoff Retry Controls

## Existing Contracts Reused

- `WorkerHandoffSummary.retry`
- `WorkerHandoffSummary.retryHistory`
- `RetryRequestSummary`
- `RetryPolicySummary`
- `ScheduleRetryResponse`
- `CancelRetryResponse`
- `RescheduleRetryResponse`

## Opportunity Queued Work Detail

No new persistent model is required. The browser-held Opportunity queued-work detail now includes retry state through the existing `WorkerHandoffSummary` fields.
