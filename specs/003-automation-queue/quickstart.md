# Quickstart: Automation Queue

This quickstart validates the Automation Queue after implementation.

## Prerequisites

- Server-side MongoDB environment variables are configured.
- Server-side `EVEONLINE_CORPORATION_ID` is configured for the corporation under validation.
- For write-flow validation, `MONGODB_DB` points to the isolated test database `gryyk47_greenfield_test`.
- `strategic_decisions` contains at least one approved decision for the configured corporation.
- `automation_queue` exists or can be created in the configured MongoDB database for queue persistence.
- The source decision used for player-impacting validation includes explicit approval metadata.

## Validation Flow

1. Start the app locally with `npm run dev:netlify` so `/api/*` routes to functions.
2. Open the decision records screen.
3. Open an approved decision record.
4. Create an automation queue item from the decision.
5. Enter task intent, input summary, expected output, and optional owner.
6. Confirm the new queue item appears with status `queued`.
7. Open the queue item detail and confirm source decision, provenance, task fields, status, timestamps, and operating-leg coverage are visible when available.
8. Return to the source decision and confirm it shows linked queue work without claiming execution.
9. Attempt to create queue work from a proposed or rejected decision.
10. Confirm the system rejects the request and creates no queue item.
11. Attempt to create queue work from a player-impacting decision without approval metadata.
12. Confirm the system rejects the request and creates no queue item.
13. Create queue work from a player-impacting decision with explicit approval metadata.
14. Confirm the queue item is created with status `queued`, approval provenance is visible, and no worker execution, retry, or external-action fields are emitted.

## Expected Result

The commander can create and inspect auditable queue records from approved decisions while approval boundaries, source provenance, status, failure/output metadata, and the non-execution boundary remain visible.
