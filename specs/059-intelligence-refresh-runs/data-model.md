# Data Model: Intelligence Refresh Runs

## IntelligenceRefreshRun

Represents one commander-approved refresh orchestration for a corporation.

### Fields

- `id`: stable string identifier.
- `corporationId`: signed-session command corporation scope.
- `requestedBy`: safe commander/session identity label.
- `requestedDomains`: ordered unique list of `numbers`, `opportunity`, and `people`.
- `status`: `queued`, `running`, `waiting_for_evaluation`, `evaluating`, `completed`, `completed_with_warnings`, `failed`, or `cancelled`.
- `steps`: list of RefreshDomainStep summaries.
- `evaluation`: RefreshEvaluation summary or null.
- `duplicateOf`: optional active run id returned for duplicate-safe requests.
- `policy`: safe policy summary with partial-evaluation and no-execution boundaries.
- `createdAt`, `updatedAt`: lifecycle timestamps.
- `completedAt`, `failedAt`, `cancelledAt`: terminal timestamps when applicable.
- `failure`: safe aggregate failure reason when the run cannot proceed.
- `warnings`: safe non-terminal warnings, including unsupported domain or missing consent reasons.

### Validation Rules

- `requestedDomains` must contain at least one supported domain and no duplicates.
- Browser requests cannot set `status`, `steps`, `evaluation`, worker fields, dispatch targets, token fields, raw payloads, or mutation intents.
- Active duplicate detection compares corporation scope and normalized requested domain set.
- Terminal runs cannot be claimed or evaluated again except through a future explicit retry feature.

## RefreshDomainStep

Represents the state of one operating-domain collection step within a run.

### Fields

- `id`: stable string identifier unique within the run.
- `domain`: `numbers`, `opportunity`, or `people`.
- `status`: `queued`, `prepared`, `running`, `completed`, `failed`, `blocked`, or `skipped`.
- `preparedRequest`: optional link to an existing data-pull request record, including type and id.
- `claimedBy`, `claimedAt`: trusted worker identity and timestamp.
- `completedAt`, `failedAt`, `skippedAt`: terminal step timestamps.
- `sourceCount`: safe count of collected or referenced sources.
- `freshness`: optional safe freshness summary.
- `sectionStatuses`: safe section coverage summaries.
- `failure`: safe failure reason and timestamp.
- `warnings`: safe step-level warning strings.

### Validation Rules

- Worker claim must require queued or prepared step state.
- Worker completion/failure must match the worker that claimed the step.
- Step result summaries must reject token material, raw ESI payloads, raw prompts, worker secrets, dispatch targets, and mutation fields.
- A blocked or skipped step must include a safe reason.

## RefreshEvaluation

Represents Brain evaluation for a refresh run.

### Fields

- `status`: `not_ready`, `ready`, `running`, `completed`, or `failed`.
- `brainRunId`: optional linked Brain run id from `research_requests`.
- `commandBriefId`: optional linked generated brief id from `research_briefs`.
- `model`: optional model identifier.
- `provider`: optional provider identifier.
- `promptVersion`: optional prompt version.
- `confidence`: optional numeric confidence.
- `sourceSummary`: safe summary of domain steps used in evaluation.
- `createdAt`, `completedAt`, `failedAt`: evaluation timestamps.
- `failure`: safe failure reason.

### Validation Rules

- Evaluation can start only when all required steps are terminal and either all completed or partial evaluation is policy-allowed.
- Evaluation output must link to a Brain run or record a safe failed state.
- Browser responses must not include raw prompts, provider secrets, token material, or stack traces.

## State Transitions

### Refresh Run

```text
queued -> running
queued -> failed
running -> waiting_for_evaluation
running -> failed
running -> cancelled
waiting_for_evaluation -> evaluating
waiting_for_evaluation -> failed
evaluating -> completed
evaluating -> completed_with_warnings
evaluating -> failed
```

### Domain Step

```text
queued -> prepared
queued -> blocked
prepared -> running
running -> completed
running -> failed
running -> skipped
```

### Evaluation

```text
not_ready -> ready
ready -> running
running -> completed
running -> failed
```
