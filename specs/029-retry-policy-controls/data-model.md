# Data Model: M29 Retry Policy Controls

## RetryPolicyDelayOption

- `key`: Stable policy option id: `immediate`, `one_hour`, `six_hours`, or `next_day`.
- `label`: Browser-visible action label.
- `delayHours`: Non-negative bounded delay in hours. `0` clears `notBefore`.

## RetryPolicySummary

Adds:

- `delayOptions`: Ordered server-owned retry timing policy choices.

Existing fields remain unchanged:

- `canSchedule`
- `canCancel`
- `canReschedule`
- `activeScheduledLimit`
- `cancelableStatuses`
- `boundary`

## RetryRequestSummary

No new retry request persistence field is required. The selected policy option is applied through existing `reason` and `notBefore` metadata on scheduled retries.
