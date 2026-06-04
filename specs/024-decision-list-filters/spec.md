# Feature Specification: Decision List Filters

**Feature Branch**: `024-decision-list-filters`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "M24: Decision approval list/filter improvements now that Numbers-origin approve/reject and Opportunity decision handoff exist."

## User Scenarios & Testing

### User Story 1 - Filter Decisions By Approval State (Priority: P1)

As a commander, I want to filter the decision loop by status so that proposed, approved, rejected, delegated, and done records are easier to review.

**Independent Test**: Load the decision loop, select a proposed-only filter, and verify only proposed decisions remain visible.

### User Story 2 - Distinguish Decision Source Domains (Priority: P2)

As a commander, I want the decision list to show whether a decision came from Opportunity/brief context or Numbers follow-ups so that I can review the right operating-domain queue.

**Independent Test**: Load mixed decision fixtures and verify source labels and source filtering work for Opportunity/brief and Numbers-origin decisions.

### User Story 3 - Surface Approval Workload (Priority: P3)

As a commander, I want lightweight counts for proposed, approved, rejected, player-impacting, and visible decisions so that approval workload is visible without opening each record.

**Independent Test**: Load decision fixtures and verify browser-visible summary counts update when filters change.

### Operating Model Alignment

- **Numbers**: Numbers-origin decisions can be labeled and filtered.
- **Opportunity**: Research-brief and Opportunity-surface decisions can be labeled and filtered.
- **People**: Unchanged.
- **Decision Boundary**: Read-only list organization. Status mutation remains in the existing detail workflow.
- **Automation Boundary**: No queue creation, approval mutation, worker dispatch, retry, ESI fetch, EVE write, or external-service execution.

## Requirements

- **FR-001**: Decision list MUST provide status filtering.
- **FR-002**: Decision list MUST provide source-domain filtering for Opportunity/brief and Numbers-origin decisions.
- **FR-003**: Decision list MUST show source-domain labels for each decision.
- **FR-004**: Decision loop MUST show counts for visible, proposed, approved, rejected, and player-impacting decisions.
- **FR-005**: Filters MUST be browser-local and MUST NOT mutate decision records.
- **FR-006**: Browser UI MUST preserve existing decision status update and queue creation boundaries.
- **FR-007**: Unit and browser smoke tests MUST cover filter derivation, source labels, counts, and no-execution boundary language.

## Success Criteria

- **SC-001**: Browser smoke test verifies status and source filtering.
- **SC-002**: Unit tests verify filter derivation and counts.
- **SC-003**: Existing lint, typecheck, Jest, Playwright, and production build continue to pass.

## Assumptions

- Existing `/api/decision-records` remains the source of decision records.
- M24 does not add a backend route or durable collection.
- Approval/rejection behavior remains in the existing status update workflow.
