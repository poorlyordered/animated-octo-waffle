# Data Model: Numbers Approval Handoff

## NumbersApprovalHandoff

Browser-safe computed summary for a Numbers follow-up candidate's path into decision and queue artifacts.

### Fields

- `candidateId`: Numbers follow-up candidate id.
- `snapshotId`: Source Numbers snapshot id.
- `decisionId`: Source decision id when available.
- `decisionStatus`: Current decision status when available.
- `approvalRequired`: Whether approval is still required before queue creation.
- `queueReady`: Whether the decision is approved and eligible for queue creation.
- `queueItemId`: Queue item id when queued work exists or was created.
- `queueStatus`: Queue item status when available.
- `duplicate`: Whether the response surfaced an existing artifact.
- `message`: Commander-visible handoff state.
- `boundary`: No-execution boundary language.

### State Interpretation

```text
no_decision -> decision_proposed -> queue_ready -> queued
```

The state is derived from existing artifacts and does not mutate approval status.
