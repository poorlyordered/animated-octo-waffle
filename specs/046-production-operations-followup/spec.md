# Feature Specification: M46 Production Operations Follow-up

**Feature Branch**: `046-production-operations-followup`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Verify production configuration without exposing secrets (Priority: P1)

As an operator, I need a runbook that says exactly which Netlify, EVE SSO, MongoDB, worker, and monitoring facts must be verified before production promotion without storing secret values in the repo.

**Independent Test**: Review `docs/production-operations.md` and verify it lists provider/environment facts by variable or setting name only and explicitly forbids secret/token capture.

### User Story 2 - Preserve rollback and evidence requirements (Priority: P1)

As the project commander, I need deployment and rollback evidence requirements so a controlled production pass can prove what was promoted, how it was validated, and how to recover without destroying data.

**Independent Test**: Review `docs/production-operations.md` and verify it includes pre-deploy evidence, deploy smoke checks, rollback procedure, and go/no-go record fields.

### User Story 3 - Keep command authority boundaries intact (Priority: P2)

As a future maintainer, I need production operations guidance to preserve no-execution boundaries and explicit commander approval while the app moves toward live use.

**Independent Test**: Review `docs/production-operations.md`, `docs/production-readiness.md`, and `docs/roadmap.md` to verify M46 does not authorize worker dispatch, EVE writes, role/access changes, wallet/asset/contract mutation, or external-service mutation.

## Requirements

- **FR-001**: A production operations runbook MUST document Netlify environment verification for required, production-required, optional worker, live EVE SSO, and test-only variables without exposing values.
- **FR-002**: The runbook MUST document live EVE SSO provider verification, including callback URL matching, scope review, authorized corporation session behavior, and unauthorized corporation behavior.
- **FR-003**: The runbook MUST document MongoDB backup, restore, index, retention, database target, and least-privilege access verification expectations.
- **FR-004**: The runbook MUST document monitoring/alerting ownership for Netlify deploys, functions, browser errors, MongoDB failures, EVE SSO callbacks, worker auth failures, retries, ingestion, and handoffs.
- **FR-005**: The runbook MUST document worker secret rotation posture for class-specific worker callback secrets and shared fallback migration.
- **FR-006**: The runbook MUST document deploy smoke checks, rollback triggers, rollback steps, and go/no-go record fields.
- **FR-007**: `docs/production-readiness.md` MUST point operators at the M46 operations runbook while keeping its readiness verdict bounded by unverified live state.
- **FR-008**: The roadmap MUST record M46 completion and recommend M47 as the next feature slice.
- **FR-009**: This slice MUST NOT add product behavior, live deployment, browser/request-path deployment, ESI fetch, EVE write, wallet/asset/contract/role mutation, worker dispatch, or external-service mutation.

## Success Criteria

- **SC-001**: `docs/production-operations.md` includes Netlify, EVE SSO, MongoDB, monitoring, worker-secret rotation, deploy smoke, rollback, and go/no-go sections.
- **SC-002**: `docs/production-readiness.md`, `README.md`, `AGENTS.md`, `.specify/feature.json`, and M46 Spec Kit artifacts agree on the active M46 feature while this branch is in review.
- **SC-003**: `docs/roadmap.md` includes M46 completion evidence and names M47 as the next recommended slice.
- **SC-004**: Documentation validation, full local validation, diff hygiene, and code-review-and-quality gate pass before PR creation.

## Assumptions

- M46 is an operations documentation and evidence slice, not a production deployment.
- Live provider verification happens through operator/provider consoles and must not be simulated by adding request-path side effects.
- Secrets, tokens, connection strings, cookies, JWTs, and production record exports must stay out of repo artifacts.
