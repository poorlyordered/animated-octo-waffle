# Data Model: M34 People Handoff Retry Controls

## PeopleHandoffRetryView

Browser-local view of existing worker handoff retry metadata.

- `handoffId`
- `handoffStatus`
- `retry`
- `retryHistory`
- `policy`
- `message`
- `boundary`

## State Transitions

- Failed handoff: retry can be scheduled
- Scheduled retry: retry can be canceled or rescheduled when policy permits
- Canceled retry: no execution occurs

All transitions update retry metadata only. They do not dispatch, claim, execute, mutate EVE role/access state, or call external services.
