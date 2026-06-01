# Research: People Operating Layer

## Decision: Use `member_profiles` as the normalized read model for M4

**Rationale**: M4 needs a stable people contract independent of whatever raw or broad context collections exist today. A normalized `member_profiles` collection can store member identity, role context, activity summaries, stale flags, missing-data reasons, and source timestamps in one command-facing shape.

**Alternatives considered**:

- Read only from broad context collections: rejected because those documents are not guaranteed to be member-shaped and would make UI contracts unstable.
- Perform live ESI/member sync in the web app: rejected because sync is long-running integration work and belongs in a worker slice.
- Store people data only in client fixtures: rejected because people operations must become durable command data.

## Decision: Store leadership follow-ups in `leadership_followups`

**Rationale**: Follow-ups are durable leadership work records, not member profile fields. Keeping them in a dedicated collection preserves auditability and supports later links to decisions, queue items, owners, due dates, and status.

**Alternatives considered**:

- Embed follow-ups inside member profiles: rejected because follow-ups have lifecycle, ownership, and links that should be independently listable.
- Reuse `automation_queue` for all follow-ups: rejected because leadership follow-ups may remain manual observations and should not imply queued automation.

## Decision: Treat role/access work as follow-up only in M4

**Rationale**: Role, permission, access, standings, wallet, contract, and other player-impacting changes require explicit approval and should not be performed by the people UI. M4 may record the need for such work, but execution belongs to later approved automation or manual command action.

**Alternatives considered**:

- Allow immediate role/access changes from the profile view: rejected by constitution and out of scope.
- Queue access changes automatically: rejected because queued automation is separate and still requires explicit approval boundaries.

## Decision: Surface missing and stale people data as first-class state

**Rationale**: People data is often incomplete or stale. The command system must show missing profile, role, activity, and source data instead of implying certainty.

**Alternatives considered**:

- Hide missing fields: rejected because the commander needs to know operational blind spots.
- Infer missing member data from free text: rejected because M4 should not create ungrounded people claims.

## Decision: Keep Aegis as a future worker runtime, not part of M4 web request handling

**Rationale**: Aegis is a good fit for future people sync, enrichment, research, and queue processing containers. M4 itself should only define and use the durable people/follow-up read/write layer through short web requests.

**Alternatives considered**:

- Move the web shell to Aegis now: rejected because the current web app is Netlify-shaped and the immediate need is people data modeling, not hosting migration.
- Start with an Aegis sync worker before the people UI: rejected because the commander-facing contract should be established first.
