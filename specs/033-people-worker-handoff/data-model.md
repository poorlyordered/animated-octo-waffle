# Data Model: M33 People Worker Handoff

## PeopleQueuedWorkDetail

Browser-local view of queued work linked to a People follow-up.

- `queueItemId`
- `queueStatus`
- `handoffId`
- `handoffStatus`
- `handoffCreatedAt`
- `message`
- `boundary`

## State Transitions

- Queued work linked: handoff not prepared
- Commander prepares handoff: handoff id/status visible
- Existing handoff returned: handoff id/status visible without duplicate

No transition dispatches, claims, retries, executes, mutates EVE role/access state, or calls external services.
