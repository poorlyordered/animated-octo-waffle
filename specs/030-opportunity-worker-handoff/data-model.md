# Data Model: M30 Opportunity Worker Handoff

## OpportunityQueuedWorkHandoff

- `queueItemId`: Created automation queue item id.
- `queueStatus`: Current queue status.
- `taskIntent`: Commander-visible work intent.
- `expectedOutput`: Commander-visible expected worker output.
- `attempts`: Queue attempt count.
- `handoffId`: Optional worker handoff id after preparation.
- `handoffStatus`: Optional worker handoff status after preparation.
- `handoffCreatedAt`: Optional worker handoff creation timestamp.
- `message`: Browser-safe summary.
- `boundary`: Browser-safe no-execution boundary.

## Existing Contracts Reused

- `AutomationQueueItem`
- `WorkerHandoffSummary`
- `PrepareWorkerHandoffRequest`
- `WorkerHandoffResponse`
