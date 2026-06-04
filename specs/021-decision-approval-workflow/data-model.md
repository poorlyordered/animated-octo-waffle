# Data Model: Decision Approval Workflow Improvements

## DecisionRecord

Existing entity in `strategic_decisions`.

M21 updates:

- `status`: `approved` or `rejected`
- `approval`: set only when approval text is provided
- `statusHistory`: append transition entry with optional note
- `updatedAt`: current server timestamp

## NumbersFollowUpDecisionStatusRequest

Browser request for a scoped status transition.

- `snapshotId`: Numbers snapshot id containing the candidate
- `sourceDecisionId`: stored decision id to update
- `status`: `approved` or `rejected`
- `approvalText`: required for player-impacting approval
- `note`: optional status history note

## NumbersFollowUpDecisionStatusResponse

Browser-safe response.

- `decision`: updated decision record
- `origin`: server-derived Numbers follow-up origin
- `approvalHandoff`: recomputed handoff metadata
- `message`: no-execution status message

## Derived Handoff State

- Proposed: approval required, queue not ready
- Approved: approval not required, queue ready
- Rejected: approval not required, queue not ready
- Queued: queue item linkage appears only after the separate queue action
