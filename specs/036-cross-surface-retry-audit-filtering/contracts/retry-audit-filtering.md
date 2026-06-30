# Retry Audit Filtering Contract

Retry history filtering is browser-local and uses existing `RetryRequestSummary` records.

Status filter values:

- `all`
- `scheduled`
- `claimed`
- `completed`
- `blocked`
- `canceled`

The rendered retry attempt summary must preserve:

- status and reason
- claimed worker
- completion time
- cancellation time and reason
- replacement target id/status
- blocked reason
- retry policy boundary

Filtering does not call retry schedule, cancel, reschedule, worker ready, worker execute, ESI, EVE, wallet, asset, contract, role, or external-service APIs.

