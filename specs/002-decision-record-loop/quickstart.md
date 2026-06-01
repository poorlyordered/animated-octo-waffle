# Quickstart: Decision Record Loop

This quickstart validates the Decision Record Loop after implementation.

## Prerequisites

- Server-side MongoDB environment variables are configured.
- Server-side `EVEONLINE_CORPORATION_ID` is configured for the corporation under validation.
- `research_briefs` contains at least one processed brief for the configured corporation and focus `grykk-47-eve-official-news`.
- The source brief includes at least one recommendation.

## Validation Flow

1. Start the app locally with `npm run dev:netlify` so `/api/*` routes to functions.
2. Open the command brief screen.
3. Choose a recommendation and create a decision record.
4. Enter rationale and expected result.
5. Confirm the new decision appears with status `proposed`.
6. Open the decision detail and confirm source brief, recommendation, confidence, sources, created timestamp, and operating-leg coverage are visible.
7. Change the decision status to `approved`.
8. Confirm the status history shows the transition from `proposed` to `approved`.
9. Create or mark a decision as player-impacting.
10. Attempt to move it toward action-like progression without approval text.
11. Confirm the system rejects the update and shows that no action has been executed or queued.
12. Provide explicit approval text and repeat the status update.
13. Confirm approval metadata is recorded and the decision still remains separate from executed actions or automation queue entries.

## Expected Result

The commander can create and track auditable decision records from command brief recommendations while source provenance, missing operating data, and player-impacting approval boundaries remain visible.
