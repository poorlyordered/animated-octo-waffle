# Data Model: M32 People Follow-Up Handoff

## LeadershipFollowUp

Existing People follow-up record.

- `sourceDecisionId`: linked decision id after decision recording
- `sourceQueueItemId`: linked queue item id after queued-work creation
- `sourceContext`: server-derived member, decision, queue, coverage, and missing-link context

## PeopleFollowUpHandoff

Browser-safe state summary derived from existing records.

- `followUpId`
- `memberProfileId`
- `memberDisplayName`
- `decisionId`
- `decisionStatus`
- `approvalRequired`
- `queueReady`
- `queueItemId`
- `queueStatus`
- `message`
- `boundary`
- `missingLinkReasons`

## PeopleFollowUpDecisionRequest

Request to record a decision from a follow-up.

- `rationale`
- `expectedResult`

Unsafe browser-provided status, approval, queue, dispatch, retry, EVE, role/access, or execution fields are rejected.

## PeopleFollowUpDecisionResponse

- `followUp`
- `decision`
- `handoff`
- `message`

## PeopleFollowUpDecisionStatusRequest

Request to approve or reject a People-origin decision.

- `status`: `approved` or `rejected`
- `approvalText`: required when approval is player-impacting
- `rejectionReason`: optional rejection note

## PeopleFollowUpQueueRequest

Request to create queued planning work after approval.

- `title`
- `inputSummary`
- `expectedOutput`

Queue creation is allowed only when the linked People-origin decision is approved.

## State Transitions

- No decision: record decision -> proposed, approval required, queue blocked
- Proposed: approve -> approved, queue ready
- Proposed: reject -> rejected, queue blocked
- Approved: create queued work -> queued linkage visible
- Queued: duplicate queue creation -> existing queue linkage returned

No transition dispatches workers, prepares handoffs, runs retries, writes EVE state, changes roles/access, or executes external services.
