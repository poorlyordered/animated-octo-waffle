# Quickstart: People Operating Layer

This quickstart validates the People Operating Layer after implementation.

## Prerequisites

- Server-side MongoDB environment variables are configured.
- Server-side `EVEONLINE_CORPORATION_ID` is configured for the corporation under validation.
- For write-flow validation, `MONGODB_DB` points to the isolated test database `gryyk47_greenfield_test`.
- `member_profiles` contains at least one member profile for the configured corporation.
- `leadership_followups` exists or can be created in the configured MongoDB database for follow-up persistence.
- Optional linked decision and queue item records exist when validating source links.

## Validation Flow

1. Start the app locally with `npm run dev:netlify` so `/api/*` routes to functions.
2. Open the people screen.
3. Confirm member profiles load for the configured corporation.
4. Select a member profile.
5. Confirm identity, role context, activity summary, delegation notes, source timestamps, and missing/stale data reasons are visible.
6. Create a leadership follow-up with reason, priority, owner, and optional due date.
7. Confirm the follow-up appears with status `open`.
8. Create or inspect a follow-up linked to a decision record or automation queue item.
9. Confirm the link is visible and neither the decision nor queue item status changes.
10. Attempt to create a duplicate follow-up for the same member and reason.
11. Confirm the system rejects or safely surfaces the duplicate without creating ambiguous duplicate work.
12. Attempt to create a player-impacting follow-up without approval text.
13. Confirm the system rejects the request and performs no role, access, EVE, or external-service action.
14. Create a player-impacting follow-up with explicit approval text.
15. Confirm approval metadata is recorded and the follow-up remains a record only, not executed work.

## Expected Result

The commander can inspect grounded people context, create durable leadership follow-ups, see missing or stale people data, and preserve approval boundaries for role/access/player-impacting work without running sync jobs or executing EVE actions in the web request path.
