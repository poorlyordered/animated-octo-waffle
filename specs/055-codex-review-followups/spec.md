# Feature Specification: Codex Review Followups

**Feature Branch**: `055-codex-review-followups`

**Created**: 2026-07-01

**Status**: Complete

**Input**: User description: "Address Codex PR review follow-ups: make People follow-up handoffs verify People-origin decisions before queue readiness and duplicate queue linkage, reject credentialed/tokenized URLs in production evidence records, and include Opportunity ESI worker completion/failure outcomes in commander-visible read-only ESI status history without dispatching workers or exposing secrets."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep People follow-up queues origin-safe (Priority: P1)

As a commander reviewing People follow-ups, I only want queue-ready People actions when the linked approved decision truly originated from that same People follow-up.

**Why this priority**: This prevents the command UI and queue path from presenting or linking work that belongs to Numbers, Opportunity, or unrelated decisions.

**Independent Test**: Can be fully tested with People follow-ups that reference People-origin and non-People-origin approved decisions, then verifying queue readiness and duplicate queue linkage behavior.

**Acceptance Scenarios**:

1. **Given** a People follow-up linked to an approved non-People decision, **When** the follow-up handoff is presented, **Then** it is not marked queue-ready and does not invite queue creation.
2. **Given** a People follow-up has a pre-existing queue item link that belongs to another decision, **When** the commander creates queued work for the approved People decision, **Then** unrelated queued work is not treated as the duplicate for this People follow-up.
3. **Given** a People follow-up has an approved People-origin decision and matching queue item, **When** the handoff is presented, **Then** existing queue linkage remains visible without implying execution.

---

### User Story 2 - Keep production evidence value-free (Priority: P2)

As an operator recording production evidence, I want tokenized or credentialed URLs rejected before storage so evidence records never persist credentials.

**Why this priority**: Production evidence is explicitly value-free; allowing URL userinfo would violate the no-token/no-secret evidence boundary.

**Independent Test**: Can be fully tested by submitting credentialed URLs and safe URLs to the production evidence validation path.

**Acceptance Scenarios**:

1. **Given** a production evidence request contains a URL with userinfo such as a token before the host, **When** validation runs, **Then** the request is rejected before storage.
2. **Given** a production evidence request contains a normal PR URL and value-free checks, **When** validation runs, **Then** the request is accepted.

---

### User Story 3 - Show Opportunity ESI worker outcomes (Priority: P3)

As a commander inspecting ESI sync status, I want Opportunity worker completion and failure outcomes to appear in read-only sync history after workers update those records.

**Why this priority**: M54 enabled Opportunity worker completion/failure, and commanders need the same audit visibility promised by the ESI sync surface.

**Independent Test**: Can be fully tested with recent Numbers and Opportunity sync records and verifying the status response includes browser-safe summaries for both domains.

**Acceptance Scenarios**:

1. **Given** a completed Opportunity ESI sync request with a safe result summary, **When** the commander reads ESI status, **Then** the history includes the Opportunity result without tokens, worker secrets, raw payloads, or execution handles.
2. **Given** a failed Opportunity ESI sync request, **When** the commander reads ESI status, **Then** the history includes the safe failure summary and retry metadata when present.
3. **Given** the commander reads ESI status, **When** history is assembled, **Then** the read remains visibility-only and does not dispatch, claim, complete, fail, retry, fetch ESI, or write to EVE.

### Operating Model Alignment

- **Numbers**: Preserves existing Numbers ESI history visibility while adding no new Numbers execution behavior.
- **Opportunity**: Adds read-only visibility for Opportunity ESI worker outcomes.
- **People**: Tightens People follow-up decision and queue origin boundaries.
- **Decision Boundary**: Observation and status visibility only; no new approvals or executed actions.
- **Automation Boundary**: Safe read-only validation and history presentation; worker completion/failure remains server/worker-owned and no worker dispatch is introduced.

### Edge Cases

- A People follow-up references a missing, unrelated, or non-People decision.
- A People follow-up references a queue item that exists but belongs to a different decision.
- A production evidence field contains URL userinfo, token-like query material, or a valid value-free URL.
- Opportunity and Numbers ESI histories both contain recent records and must remain bounded.
- Opportunity worker records include retry metadata or failures that must be summarized without secrets.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST mark a People follow-up queue-ready only when the linked decision is an approved People-origin decision for the same follow-up and member.
- **FR-002**: System MUST NOT treat an existing queue item as a duplicate People follow-up queue item unless it belongs to the approved People-origin decision for that follow-up.
- **FR-003**: System MUST continue showing valid People-origin decision and queue handoff state without implying worker dispatch, EVE changes, or external execution.
- **FR-004**: System MUST reject production evidence values that include URL userinfo or tokenized credential material before persistence.
- **FR-005**: System MUST continue accepting normal value-free production evidence URLs and checks.
- **FR-006**: System MUST include recent Opportunity ESI sync completion and failure outcomes in commander-visible read-only ESI sync history.
- **FR-007**: System MUST keep ESI history summaries browser-safe by excluding ESI tokens, worker secrets, raw provider payloads, execution handles, and unsafe retry fields.
- **FR-008**: System MUST NOT add browser worker dispatch, worker claim, worker completion, retry mutation, ESI fetch, EVE write, role/access change, wallet/asset/contract mutation, or external-service mutation.

### Key Entities *(include if feature involves data)*

- **People Follow-Up Handoff**: Browser-visible state for a leadership follow-up, including decision status, queue readiness, queue link, message, and non-execution boundary.
- **Production Evidence Record**: Value-free deployment evidence containing deployment posture, validation checks, operator attribution, and optional safe URLs.
- **ESI Sync History Item**: Browser-safe summary of a read-only ESI sync request, including domain, status, result, failure, retry metadata, and timestamps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Non-People or unrelated decisions never produce queue-ready People follow-up handoffs in regression tests.
- **SC-002**: Existing unrelated queue links are ignored for duplicate People queue detection unless they match the approved People decision.
- **SC-003**: Credentialed URLs with userinfo are rejected by production evidence validation while normal PR URLs remain accepted.
- **SC-004**: Opportunity ESI completion and failure records appear in read-only status history with the same secret-free guarantees as existing Numbers history.
- **SC-005**: The full quality gate passes: targeted tests, typecheck, lint, full unit suite, browser smoke tests, production build, `git diff --check`, and code-review-and-quality review.

## Assumptions

- The Codex review comments on PRs #30, #47, and #52 are treated as required follow-up defects.
- PR #49 requires no code action because it only contained a Codex usage-limit notice.
- This feature is a focused quality slice after M54, not a new roadmap capability.
- ESI history can remain a bounded recent list as long as both Numbers and Opportunity outcomes are represented safely.
