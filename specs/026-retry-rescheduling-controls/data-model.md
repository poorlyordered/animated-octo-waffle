# Data Model: Retry Rescheduling Controls

## RetryPolicySummary.canReschedule

Boolean browser-safe policy flag. True only for `scheduled` retry summaries.

## RescheduleRetryRequest

- `reason`: commander rationale for changing retry timing.
- `notBefore`: optional ISO datetime. When omitted, the retry remains scheduled without a future delay.

## RescheduleRetryResponse

- `retry`: updated `RetryRequestSummary` for the same retry id and target.

## RetryRequestDocument

Existing `retry_requests` document. Rescheduling updates `reason`, `notBefore`, and `updatedAt`; it does not change `createdAt`, target, status, claimed/completed/block/cancel fields, or execution result fields.
