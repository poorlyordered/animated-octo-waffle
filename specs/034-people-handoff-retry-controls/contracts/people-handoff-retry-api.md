# Contract: People Handoff Retry API

M34 does not introduce People-specific retry endpoints.

The browser uses existing worker handoff retry contracts:

- `POST /api/worker-handoffs/:handoffId/retry`
- `POST /api/worker-handoffs/:handoffId/retry/reschedule`
- `POST /api/worker-handoffs/:handoffId/retry/cancel`

People UI must render returned retry metadata as People failed-handoff recovery state and must not expose dispatch, claim, retry execution, EVE role/access, or external-service controls.
