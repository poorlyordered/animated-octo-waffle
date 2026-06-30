# Research: M33 People Worker Handoff

## Decision: Reuse Automation Queue Handoff API

People queued work will prepare worker handoffs through `POST /api/automation-queue/:queueItemId/handoff`.

**Rationale**: Worker handoff eligibility, idempotency, and non-execution rules already live in the automation queue handoff path. Reuse avoids a People-specific duplicate backend route.

**Alternatives considered**:

- Add a People-specific handoff route: rejected because queue item id is already the canonical handoff target.
- Prepare handoff automatically when queued work is created: rejected because handoff preparation remains a separate commander action.

## Decision: Keep Retry Controls Out Of M33

M33 shows prepared handoff state only.

**Rationale**: Retry controls are a separate policy slice and should follow after handoff preparation is reviewed in browser.

**Alternatives considered**:

- Add retry controls immediately: rejected to keep this PR focused and reviewable.
