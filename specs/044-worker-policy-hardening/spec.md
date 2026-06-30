# Feature Specification: M44 Worker Policy Hardening

**Feature Branch**: `044-worker-policy-hardening`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Separate worker callback secrets by worker class (Priority: P1)

As an operator, I need worker callback endpoints to support class-specific secrets so a credential for one worker class does not have to authorize every other worker class.

**Independent Test**: Unit tests verify a worker class accepts its configured class-specific secret, rejects another class secret, and still accepts the shared fallback secret when a class-specific secret is not configured.

### User Story 2 - Preserve existing deployments during rollout (Priority: P1)

As an operator, I need the current `WORKER_CALLBACK_SECRET` fallback to remain valid until class-specific secrets are configured.

**Independent Test**: Existing worker callback auth tests continue to pass with only `WORKER_CALLBACK_SECRET`.

### User Story 3 - Document worker runbook and retry policy boundaries (Priority: P2)

As a future maintainer, I need a concise worker policy runbook that names worker classes, secret env vars, retry/backoff boundaries, and no-dispatch browser guarantees.

**Independent Test**: Documentation and README list the supported worker classes, environment variables, and no-execution boundaries without exposing secret values.

## Requirements

- **FR-001**: Worker callback authorization MUST accept a worker class parameter for worker handoffs, retry workers, ESI sync workers, People ingestion workers, and Opportunity ingestion workers.
- **FR-002**: Each worker class MUST support a dedicated server-side secret environment variable.
- **FR-003**: A class-specific secret MUST authorize only its matching worker class.
- **FR-004**: If no class-specific secret is configured, the legacy `WORKER_CALLBACK_SECRET` fallback MUST continue to authorize the worker class.
- **FR-005**: Browser APIs and responses MUST NOT expose worker secrets, expected secret names as values, token material, or dispatch targets.
- **FR-006**: Worker policy documentation MUST state that browser actions may prepare durable work or retry records only; they MUST NOT dispatch, claim, execute, fetch ESI, write to EVE, mutate external services, or bypass commander approval.

## Success Criteria

- **SC-001**: Unit tests cover class-specific secret acceptance and cross-class rejection.
- **SC-002**: Unit tests cover fallback compatibility for existing `WORKER_CALLBACK_SECRET` deployments.
- **SC-003**: All worker endpoint call sites pass an explicit worker class.
- **SC-004**: Full local validation passes before PR creation.

## Assumptions

- Deployments can add class-specific secrets gradually.
- The shared `WORKER_CALLBACK_SECRET` remains supported as a compatibility fallback for this slice.
