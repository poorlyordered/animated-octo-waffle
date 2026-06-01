# Feature Specification: Automation Queue

**Feature Branch**: `003-automation-queue`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "M3 Automation Queue: create and inspect auditable queue records from approved decision records without executing player-impacting actions automatically."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Queue Work From An Approved Decision (Priority: P1)

As the commander, I want to turn an approved decision record into a queued work item so that delegated automation work is durable, auditable, and separate from execution.

**Why this priority**: This is the smallest useful automation milestone. It gives the commander hands-and-feet tracking without allowing the system to act on EVE or external services.

**Independent Test**: Can be fully tested by opening an approved decision record, creating a queue item from it, and confirming the queue item is persisted with source decision, provenance, status, and no execution result.

**Acceptance Scenarios**:

1. **Given** an approved decision record, **When** the commander creates a queue item with task intent and expected output, **Then** the system saves a queue item linked to that decision with status `queued`.
2. **Given** a queued item created from a decision, **When** the commander views its details, **Then** the system shows the source decision, requested work, input summary, expected output, status, timestamps, and provenance.
3. **Given** a queued item exists, **When** the commander returns to the decision record, **Then** the decision shows that queued work exists without claiming the work has executed.

---

### User Story 2 - Inspect Queue State And Failures (Priority: P2)

As the commander, I want to inspect automation queue state so that I can see what work is waiting, blocked, failed, or completed by future workers.

**Why this priority**: The queue must be inspectable before worker execution is introduced; otherwise automation becomes opaque.

**Independent Test**: Can be tested by loading the queue list with seeded queue records in multiple statuses and confirming each item exposes status, owner, attempts, failure, retry, and output metadata where present.

**Acceptance Scenarios**:

1. **Given** queue records with different statuses, **When** the commander opens the automation queue, **Then** the system groups or filters records by status and clearly distinguishes waiting work from failed or completed work.
2. **Given** a failed queue record, **When** the commander opens its detail, **Then** the system shows failure message, attempt count, last attempted timestamp, and retry eligibility without retrying automatically.
3. **Given** a completed queue record written by a future worker, **When** the commander opens its detail, **Then** the system shows output summary, completion timestamp, and source provenance.

---

### User Story 3 - Preserve Approval Boundaries (Priority: P3)

As the commander, I want player-impacting work to remain blocked unless explicit approval exists so that queued automation cannot bypass command authority.

**Why this priority**: This enforces the constitution and keeps M3 from becoming silent execution or an approval bypass.

**Independent Test**: Can be tested by attempting to queue work from proposed, rejected, or player-impacting decisions without approval and confirming the system refuses to create queue records.

**Acceptance Scenarios**:

1. **Given** a proposed decision record, **When** the commander attempts to create queue work from it, **Then** the system rejects the request and explains that only approved decisions can queue work.
2. **Given** a player-impacting decision without approval metadata, **When** queue creation is attempted, **Then** the system rejects the request and creates no queue record.
3. **Given** a player-impacting decision with explicit approval metadata, **When** queue creation is attempted, **Then** the system allows a queue record but marks it as queued, not executed.

---

### Operating Model Alignment

- **Numbers**: Queue records may reference measurable operational inputs such as assets, wallets, market opportunities, job counts, attempt counts, retry times, and output metrics.
- **Opportunity**: Queue work may originate from command brief opportunities and approved decisions about news, patch changes, recruiting, markets, diplomacy, or timing windows.
- **People**: Queue records expose owner, requester, approval metadata, and delegation status so leadership work remains inspectable.
- **Decision Boundary**: This feature moves approved decisions into draft work orders and queued work items; it does not represent executed actions.
- **Automation Boundary**: Queued only. No worker execution, retries, EVE writes, permission changes, wallet actions, contract actions, standings changes, or external service mutations are performed in this milestone.

### Edge Cases

- A source decision is missing, deleted, or belongs to a different corporation scope.
- A decision is proposed, rejected, done, or otherwise not eligible for queue creation.
- A player-impacting decision lacks explicit approval metadata.
- A duplicate queue request is submitted for the same decision and task intent.
- Required queue fields such as task intent, expected output, or input summary are empty.
- Existing queue records contain legacy or worker-written fields that are partial, stale, or malformed.
- The queue list has no records for the configured corporation.
- A future worker writes failure or completion metadata before the web app has full worker integration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the commander to create an automation queue record from an approved decision record.
- **FR-002**: System MUST reject queue creation when the source decision is missing, outside the server-owned corporation scope, or not approved.
- **FR-003**: System MUST reject queue creation for player-impacting decisions unless explicit approval metadata is present on the source decision.
- **FR-004**: System MUST persist queue records with source decision ID, corporation ID, task intent, input summary, expected output, status, requester, timestamps, and source provenance.
- **FR-005**: New queue records MUST start with status `queued` and MUST NOT include execution result, worker completion, or external action metadata at creation time.
- **FR-006**: System MUST list queue records for the configured corporation and allow commanders to inspect individual queue details.
- **FR-007**: System MUST expose queue status, owner or requested worker target when present, attempt count, failure message, retry eligibility, output summary, and timestamps when those fields exist.
- **FR-008**: System MUST distinguish queued work from executed work in all user-facing copy and state labels.
- **FR-009**: System MUST preserve provenance linking each queue record back to the decision record and, when available, the source command brief or recommendation.
- **FR-010**: System MUST keep browser-provided corporation identity ignored; the server-owned corporation scope remains authoritative.
- **FR-011**: System MUST keep storage credentials and server secrets server-side only.
- **FR-012**: System MUST NOT run long-running work, external AI processing, EVE writes, retries, or worker execution inside interactive web request paths.
- **FR-013**: System MUST provide validation evidence using an isolated write target before any real worker integration is enabled.

### Key Entities *(include if feature involves data)*

- **AutomationQueueItem**: A durable work-order record created from an approved decision. Key attributes include ID, corporation ID, source decision ID, task intent, input summary, expected output, status, requester, owner or worker target, attempt metadata, failure metadata, output metadata, provenance, created timestamp, and updated timestamp.
- **QueueStatus**: The lifecycle state of queued work. Initial MVP statuses include queued, blocked, running, failed, completed, and canceled, with creation limited to queued records.
- **QueueProvenance**: The source context that explains why the item exists, including decision record reference, source brief reference when available, recommendation text when available, approval metadata when relevant, source count, confidence, and created timestamp.
- **DecisionQueueLink**: The relationship between a decision record and one or more queue items created from it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A commander can create a queue item from an approved decision in under one minute using existing decision context.
- **SC-002**: 100% of queue items created through the app include source decision linkage, task intent, expected output, status, timestamps, and provenance.
- **SC-003**: 100% of attempts to queue unapproved or approval-missing player-impacting decisions are rejected without creating a queue record.
- **SC-004**: Queue list and detail views make waiting, failed, completed, and blocked work distinguishable without requiring logs or database inspection.
- **SC-005**: Validation demonstrates that queue creation does not create worker execution metadata or external action side effects.

## Assumptions

- M1 Command Brief MVP and M2 Decision Record Loop are complete and merged.
- Decision records remain stored in `strategic_decisions` and are available through the existing normalized decision contract.
- Queue records require durable persistence dedicated to automation queue data, but this spec does not require worker execution.
- The first M3 implementation targets local/server-owned validation and an isolated write target before production worker integration.
- The commander is the only user persona for this milestone; broader multi-user assignment and permissions can be expanded later.
- Retry, execution, and worker ownership fields may be displayed if present, but the MVP does not perform retries or dispatch work.
