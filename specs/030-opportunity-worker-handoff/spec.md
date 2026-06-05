# Feature Specification: M30 Opportunity Worker Handoff

**Feature Branch**: `030-opportunity-worker-handoff`
**Created**: 2026-06-05
**Status**: Draft
**Input**: User description: "Proceed with the next recommended feature after M29 review: Opportunity queued-work detail handoff or worker preparation once Opportunity queue creation has been reviewed."

## User Stories & Testing

### User Story 1 - Review Opportunity Queued Work Detail (Priority: P1)

As a commander who has created queued work from an approved Opportunity decision, I need to see the queue item detail in the Opportunity surface so I can verify the task intent, expected output, queue status, and attempts before preparing work for a worker.

**Independent Test**: Record an Opportunity decision, approve it, create queued work, and verify the Opportunity surface shows queued-work detail without leaving the surface.

### User Story 2 - Prepare Opportunity Worker Handoff (Priority: P1)

As a commander, I need to explicitly prepare a worker handoff from the Opportunity queued work so worker readiness is auditable and separate from queue creation.

**Independent Test**: After Opportunity queued work is visible, select Prepare worker handoff and verify a ready handoff is shown while no dispatch, claim, retry, execution, ESI fetch, EVE write, wallet, asset, contract, role, or external-service action occurs.

## Requirements

- **FR-001**: The Opportunity surface MUST show queued-work detail after Opportunity queue creation.
- **FR-002**: Queued-work detail MUST include queue item id, queue status, task intent, expected output, attempts, and worker handoff state.
- **FR-003**: The Opportunity surface MUST expose worker handoff preparation only after queued work exists.
- **FR-004**: Worker handoff preparation MUST use the existing automation queue handoff workflow.
- **FR-005**: Worker handoff preparation MUST remain a separate commander action from approval and queue creation.
- **FR-006**: Browser copy MUST state that handoff preparation creates a durable record only and does not dispatch, claim, retry, execute, fetch ESI, write to EVE, mutate wallets/assets/contracts/roles, or call external services.
- **FR-007**: The feature MUST NOT add Opportunity-specific backend routes when existing automation queue handoff contracts are sufficient.

## Success Criteria

- **SC-001**: Browser workflow records, approves, queues, reviews queued work, and prepares a worker handoff from the Opportunity surface.
- **SC-002**: Unit coverage verifies queued-work handoff view-model states before and after worker handoff preparation.
- **SC-003**: Existing automation queue handoff contracts remain unchanged and are reused.

## Out of Scope

- Worker dispatch or handoff claim.
- Retry scheduling from the Opportunity surface.
- Worker execution, ESI fetches, EVE writes, wallet/asset/contract/role mutation, or external-service execution.
- Opportunity-specific backend queue or worker routes.
- Automatic queue creation during approval.
