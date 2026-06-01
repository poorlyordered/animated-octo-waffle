# Quickstart: Command Brief MVP

This quickstart validates the Command Brief MVP after implementation.

## Prerequisites

- Server-side MongoDB environment variables are configured.
- A commander can authenticate and provide a corporation ID.
- `research_requests` contains at least one record for corporation `917701062` and focus `grykk-47-eve-official-news`.
- `research_briefs` contains at least one processed brief for the same corporation and focus.

## Validation Flow

1. Start the application locally.
2. Authenticate as a commander in corporation `917701062`.
3. Open the command brief screen.
4. Confirm the screen shows the latest processed brief.
5. Confirm metadata is visible: createdAt, model, prompt version, source count, source references, and confidence.
6. Confirm strategic impacts, recommended actions, watchlist, and memory are visible when present.
7. Confirm numbers, opportunity, and people coverage is visible.
8. Change the latest request status to `processing` and reload.
9. Confirm the screen says research is processing.
10. Change the latest request status to `failed` with a safe error message and reload.
11. Confirm the failure or stale state is visible without opening developer tools.

## Expected Result

The commander can understand the latest brief, whether research is fresh or blocked, and which operating legs are missing without starting a new AI research job from the web app.
