# Data Model: Retry Cancellation and Policy Controls

## RetryRequestSummary

New fields:

- `canceledAt`: optional ISO timestamp
- `canceledBy`: optional actor label
- `cancelReason`: optional commander-provided reason
- `policy`: `RetryPolicySummary`

Status values:

- `scheduled`
- `claimed`
- `completed`
- `blocked`
- `canceled`

## RetryPolicySummary

- `canSchedule`: whether policy allows scheduling another active retry for this target state
- `canCancel`: whether this retry can be canceled now
- `activeScheduledLimit`: currently `1`
- `cancelableStatuses`: `scheduled`, `blocked`
- `boundary`: browser-safe policy language

## CancelRetryRequest

- `reason`: 1-500 character commander reason

Validation rules:

- Strict schema.
- Unsafe retry fields remain rejected by existing unsafe-field checks.
- Cancellation only applies to latest scheduled or blocked retry for the target.
