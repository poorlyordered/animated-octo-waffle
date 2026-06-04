# Data Model: People Ingestion Provenance

## PeopleIngestionProvenance

- `mode`: `latest_ingestion`, `historical_profiles`, or `unavailable`
- `sourceCount`: non-negative number of safe sources represented by the latest completed history item, or member profile count when history is absent
- `profileCount`: number of returned member profiles
- `sectionStatuses`: aggregate `identity`, `roles`, `activity`, and `delegation` statuses
- `history`: bounded recent `PeopleIngestionHistoryItem[]`
- `message`: browser-safe commander-facing provenance summary
- `boundary`: no-execution language

Validation rules:

- Must not include secrets, tokens, worker credentials, role mutation handles, access mutation handles, or execution handles.
- `latest_ingestion` requires at least one completed history item.
- `historical_profiles` requires one or more member profiles and no completed history item.
- `unavailable` is used when no completed history item and no member profiles exist.

## PeopleIngestionHistoryItem

- `id`: request id or document id
- `status`: `queued`, `claimed`, `completed`, `failed`, or `cancelled`
- `requestedAt`: ISO timestamp from request/create time
- `claimedBy`: optional safe worker label
- `claimedAt`: optional ISO timestamp
- `completedAt`: optional ISO timestamp
- `sourceCount`: optional non-negative source count from safe result metadata
- `failure`: optional browser-safe reason and failed timestamp
- `sectionStatuses`: safe result section statuses, falling back to aggregate member coverage when malformed or missing
- `boundary`: no-execution language

## MemberProfile Coverage Aggregation

For each section key:

- If no member profiles exist, status is `missing`.
- If any member has `missing`, aggregate status is `missing`.
- Else if any member has `stale`, aggregate status is `stale`.
- Else aggregate status is `present`.
