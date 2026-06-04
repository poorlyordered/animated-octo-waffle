# Feature Specification: Opportunity Approval Handoff

**Feature Branch**: `027-opportunity-approval-handoff`
**Created**: 2026-06-04
**Status**: Draft

## User Stories

### Story 1 - Approve or reject an Opportunity decision

As a commander reviewing an Opportunity recommendation that has been recorded as a proposed decision, I need to approve or reject it directly from the Opportunity surface so the decision loop does not require switching context before queue readiness is clear.

### Story 2 - Create queued work from an approved Opportunity decision

As a commander with an approved Opportunity decision, I need to create queued planning work as a separate explicit action so approval does not silently queue or dispatch work.

### Story 3 - Preserve execution boundaries

As a commander, I need the Opportunity surface to explain that approval and queue creation are handoffs only and never schedule research, dispatch workers, fetch ESI, write to EVE, mutate wallet/asset/contract/role state, or execute external services.

## Functional Requirements

- FR-001: After recording an Opportunity decision, the Opportunity surface MUST display approval controls when the decision is proposed.
- FR-002: Approving an Opportunity decision MUST update only the decision status through the existing decision status workflow.
- FR-003: Rejecting an Opportunity decision MUST update only the decision status through the existing decision status workflow.
- FR-004: Queue creation MUST appear only after the Opportunity decision is approved.
- FR-005: Queue creation MUST use the existing automation queue creation workflow and remain separate from approval.
- FR-006: The Opportunity handoff summary MUST show decision id, decision status, queue readiness, queued work id/status when present, source brief, source count, focus, provenance mode, and boundary language.
- FR-007: Browser copy MUST state that approval and queue handoff do not dispatch workers, schedule research, fetch ESI, write to EVE, mutate wallet/asset/contract/role state, or execute external services.

## Success Criteria

- SC-001: Browser workflow records an Opportunity decision, approves it, and shows queue readiness without creating queued work during approval.
- SC-002: Browser workflow creates queued work only after the approved Opportunity decision is visible.
- SC-003: Browser workflow rejects an Opportunity decision without showing queue creation.
- SC-004: Local validation covers the Opportunity handoff derivation and browser workflow.

## Out Of Scope

- New backend route for Opportunity-specific approvals.
- Automatic queue creation during approval.
- Worker handoff preparation.
- Research scheduling, worker dispatch, retry scheduling, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.
