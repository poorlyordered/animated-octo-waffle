# Contracts: Codex Review Followups

## People Follow-Up Handoff

- Existing People follow-up list and action responses continue returning `PeopleFollowUpHandoff`.
- `queueReady` is true only for an approved People-origin decision matching the follow-up and member.
- `queueItemId` and duplicate queue responses must refer to queue work for the matching People-origin decision.
- Browser responses must continue to include no-execution boundary language.

## Production Evidence Create

- Existing production evidence create request shape is unchanged.
- Requests containing URL userinfo or credential-bearing URL material must be rejected before storage.
- Normal PR URLs, deploy identifiers, rollback targets, and value-free check evidence remain accepted.

## ESI Sync Status

- Existing ESI status response shape is unchanged.
- `history` includes recent browser-safe sync summaries for Numbers and Opportunity.
- History items must not expose ESI tokens, worker secrets, raw provider payloads, execution handles, or unsafe retry material.
- GET status remains read-only and must not claim, complete, fail, retry, dispatch, fetch ESI, write to EVE, or mutate external services.
