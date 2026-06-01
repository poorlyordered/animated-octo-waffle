# Feature Specification: People Operating Layer

**Feature Branch**: `004-people-operating-layer`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "M4 People Operating Layer: make member profiles, roles, activity, delegation, onboarding, and leadership follow-up context visible as first-class command data while preserving approval boundaries for role/access/player-impacting actions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect Member Command Profiles (Priority: P1)

As the commander, I want to inspect member profiles with role, activity, and context summaries so that people become visible alongside numbers and opportunity in the command operating system.

**Why this priority**: The first useful people layer is visibility. Before the system can recommend recruiting, onboarding, delegation, or follow-up work, the commander needs a grounded view of who exists, what is known, and what is missing.

**Independent Test**: Can be fully tested by loading seeded member profile records and confirming each profile shows identity, roles, activity recency, trust/delegation context, missing data, and source timestamps without requiring external sync.

**Acceptance Scenarios**:

1. **Given** member profile data exists for the configured corporation, **When** the commander opens the people screen, **Then** the system lists members with role, activity, and follow-up signals.
2. **Given** the commander selects one member, **When** the member detail opens, **Then** the system shows profile summary, role context, activity recency, delegation notes, source timestamps, and missing-data reasons.
3. **Given** people data is missing or stale, **When** the people screen loads, **Then** the system clearly marks missing or stale fields instead of inventing profile details.

---

### User Story 2 - Track Leadership Follow-Ups (Priority: P2)

As the commander, I want to identify and create leadership follow-ups for members so that onboarding, retention, delegation, and role-review work can be tracked.

**Why this priority**: People operations become actionable when leadership follow-ups are visible and durable, but they must remain separate from automatic role/access changes.

**Independent Test**: Can be tested by creating a follow-up from a member profile and confirming it is persisted with source member, reason, priority, owner, due date, status, and no automatic role/access mutation.

**Acceptance Scenarios**:

1. **Given** a member profile, **When** the commander creates a follow-up, **Then** the system saves a follow-up linked to that member with reason, priority, owner, due date, and status.
2. **Given** follow-ups exist, **When** the commander opens the follow-up list, **Then** the system shows open, completed, and blocked follow-ups by member and leadership priority.
3. **Given** a follow-up concerns role, access, permissions, standings, or player-impacting work, **When** it is created, **Then** the system records it as a follow-up only and does not execute the change.

---

### User Story 3 - Connect People Work To Decisions And Queue Items (Priority: P3)

As the commander, I want people follow-ups to connect to decisions and queued work so that leadership actions remain auditable across the command loop.

**Why this priority**: M4 should integrate with the existing command loop without turning people operations into silent automation.

**Independent Test**: Can be tested by linking a follow-up to a decision record or automation queue item and confirming the relationship is visible from the people view without changing decision or queue status.

**Acceptance Scenarios**:

1. **Given** a leadership follow-up relates to an approved decision, **When** the commander links it to the decision, **Then** the follow-up shows the decision reference and the decision remains unchanged.
2. **Given** a leadership follow-up relates to queued work, **When** the commander links it to a queue item, **Then** the follow-up shows the queue reference and the queue item remains non-executing.
3. **Given** a linked decision or queue item is unavailable, **When** the follow-up is shown, **Then** the system preserves the follow-up and marks the missing link clearly.

---

### Operating Model Alignment

- **Numbers**: People records may expose measurable activity recency, participation counts, follow-up age, onboarding progress, and stale-data age.
- **Opportunity**: People data can identify recruiting openings, leadership delegation opportunities, onboarding gaps, retention risk, and readiness windows.
- **People**: This feature is the first-class people operating layer for member profiles, roles, activity, trust, delegation, onboarding, retention, and leadership workload.
- **Decision Boundary**: People profiles and follow-ups are observations and draft leadership work. They do not execute role, access, permission, standing, wallet, contract, or external-service changes.
- **Automation Boundary**: Manual and queued only. M4 may create or link follow-up records, but it must not perform player-impacting actions automatically.

### Edge Cases

- No people records exist for the configured corporation.
- Member identity exists but profile, role, or activity data is partial.
- Activity or role data is stale and should be marked as such.
- A member has multiple names, aliases, or ambiguous identity records.
- A follow-up is duplicated for the same member and reason.
- A linked decision record or queue item is missing, deleted, or outside corporation scope.
- A follow-up concerns role/access/player-impacting action but lacks explicit approval.
- Future sync or worker data writes malformed or partial people records.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST list member profiles for the server-owned corporation scope.
- **FR-002**: System MUST allow the commander to inspect one member profile with identity, role context, activity recency, delegation notes, source timestamps, and missing-data reasons.
- **FR-003**: System MUST mark missing or stale people data explicitly instead of presenting guessed profile details.
- **FR-004**: System MUST allow the commander to create leadership follow-ups linked to a member profile.
- **FR-005**: Follow-ups MUST persist member ID, reason, priority, owner, due date, status, source context, created timestamp, and updated timestamp.
- **FR-006**: System MUST list and inspect follow-ups by status, member, priority, and owner where available.
- **FR-007**: System MUST allow follow-ups to reference decision records or automation queue items without mutating those records.
- **FR-008**: System MUST reject or clearly surface duplicate follow-up creation attempts for the same member and reason.
- **FR-009**: System MUST preserve approval boundaries for role, access, permission, standing, wallet, contract, or other player-impacting follow-ups.
- **FR-010**: System MUST distinguish people observations, leadership follow-ups, queued work, and executed actions in user-facing labels.
- **FR-011**: System MUST keep browser-provided corporation identity ignored; the server-owned corporation scope remains authoritative.
- **FR-012**: System MUST keep storage credentials and server secrets server-side only.
- **FR-013**: System MUST NOT run long-running sync, enrichment, EVE writes, role changes, permission changes, or external-service mutations inside interactive web request paths.
- **FR-014**: System MUST provide validation evidence using an isolated write target before any real people-sync or access-change integration is enabled.

### Key Entities *(include if feature involves data)*

- **MemberProfile**: Corporation member command profile with identity, role context, activity summary, delegation context, source timestamps, stale flags, and missing-data reasons.
- **MemberActivitySummary**: Measurable activity recency and participation context used to support leadership judgment.
- **MemberRoleContext**: Known roles, access context, title/group data, and missing or stale role-source reasons.
- **LeadershipFollowUp**: Durable leadership task linked to a member, with reason, priority, owner, due date, status, source context, optional decision or queue links, and approval boundary metadata.
- **PeopleDataCoverage**: Numbers/opportunity/people coverage and missing-data notes specific to people operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can open the people screen and inspect a seeded member profile in under one minute.
- **SC-002**: 100% of displayed member profiles identify missing or stale critical data fields when those fields are absent or old.
- **SC-003**: A commander can create a leadership follow-up from a member profile in under one minute without causing role, access, or external-service changes.
- **SC-004**: 100% of role/access/player-impacting follow-ups remain observations or draft work unless explicit approval is present.
- **SC-005**: Follow-ups linked to decisions or queue items display their source relationship without mutating decision or queue status.

## Assumptions

- M1 Command Brief MVP, M2 Decision Record Loop, and M3 Automation Queue are complete and merged.
- Existing MongoDB data may include people-related collections such as `corporation_context`, `session_context`, `active_context`, `operational_details`, or future member-specific records, but exact collection mapping belongs in the plan.
- The commander is the only user persona for this milestone.
- M4 reads and writes people operating records but does not perform EVE role, title, access, permission, wallet, contract, standing, or external-service mutations.
- Future people sync or ESI enrichment should run outside request paths and can be specified after the read/write people layer is established.
