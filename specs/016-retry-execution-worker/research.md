# Research: Retry Execution Worker

## Decision: Worker-only execution endpoints

**Rationale**: Retry execution changes operational state by preparing replacement work. The constitution requires long-running or automated work to stay outside browser/request paths and requires explicit commander approval. M15 retry records are the approval artifact; M16 consumes them only through trusted worker endpoints protected by the existing worker callback secret.

**Alternatives considered**: Browser run-now controls were rejected because they would blur command surfaces with execution. Cron-only execution was deferred because the immediate slice needs deterministic contract and unit validation first.

## Decision: Claim before execution

**Rationale**: Scheduled retries must not create duplicate replacement handoffs or sync requests. A `claimed` state with worker id and claimed timestamp gives duplicate workers an observable lock before policy checks and replacement creation.

**Alternatives considered**: Updating directly from `scheduled` to `completed` was rejected because replacement target creation can take multiple steps. A separate lock collection was rejected because the retry request itself is the natural audit record.

## Decision: Replacement targets, not target resurrection

**Rationale**: Failed handoffs and sync requests remain historical evidence. Retry execution should create linked replacement records so commanders can inspect original failure, retry intent, and new prepared work independently.

**Alternatives considered**: Mutating failed records back to ready/queued was rejected because it would erase failure provenance and make history harder to audit.

## Decision: ESI sync retry queues only

**Rationale**: M16 re-prepares read-sync work but does not fetch ESI, refresh tokens, or process raw ESI payloads. Existing Numbers ingestion workers remain responsible for ESI fetch and snapshot writes.

**Alternatives considered**: Running the Numbers ingestion immediately inside retry execution was rejected because it would combine retry policy with ESI ingestion and weaken the long-running work boundary.
