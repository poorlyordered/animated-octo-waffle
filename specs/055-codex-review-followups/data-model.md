# Data Model: Codex Review Followups

## People Follow-Up Handoff

- Existing browser-visible summary for a `LeadershipFollowUp`.
- Queue readiness is true only when the linked decision is an approved People-origin decision for the same follow-up and member.
- Existing queue links are displayed only when they are returned as valid handoff state or match the relevant People decision.
- No new persistent fields.

## Production Evidence Record

- Existing value-free evidence record.
- Validation rejects unsafe keys and unsafe values before storage.
- URL userinfo and credential-bearing URL material are unsafe values.
- No new persistent fields.

## ESI Sync History Item

- Existing browser-safe summary of an ESI sync request.
- Status history includes recent records from selected read-only domains: Numbers and Opportunity.
- Records can include safe result summaries, safe failure summaries, and retry metadata.
- No token, worker secret, raw provider payload, dispatch target, execution handle, or external mutation payload is exposed.

## State Transitions

- No new state transitions.
- Opportunity completion and failure transitions remain owned by trusted worker callbacks from M54.
- This slice only changes validation and read-only presentation of existing state.
