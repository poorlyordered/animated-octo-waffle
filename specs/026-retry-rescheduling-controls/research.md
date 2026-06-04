# Research: Retry Rescheduling Controls

## Decision: Reschedule scheduled retries only

Scheduled retries have not been claimed or executed by a worker. Updating their timing is a metadata-only commander action. Blocked, claimed, completed, and canceled retries have stronger audit meaning and should not be mutated by this slice.

## Decision: Preserve retry id

Rescheduling updates the existing retry record instead of creating a new retry. This keeps history readable and avoids bypassing the one-active-scheduled-retry policy.

## Decision: Server-owned eligibility

`canReschedule` lives in `RetryPolicySummary` so the browser renders controls from server-owned policy metadata.
