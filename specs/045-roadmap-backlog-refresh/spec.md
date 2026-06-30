# Feature Specification: M45 Roadmap Backlog Refresh

**Feature Branch**: `045-roadmap-backlog-refresh`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Refresh the post-ingestion backlog (Priority: P1)

As the project commander, I need the roadmap to convert the completed M44 recommendation into a concrete next slice after Numbers, People, Opportunity, and worker policy hardening have landed.

**Independent Test**: Review `docs/roadmap.md` and verify M45 is marked complete and the Near-Term Recommendation names an ordered next slice after M45.

### User Story 2 - Keep production readiness gaps current (Priority: P1)

As an operator, I need production-readiness documentation to stop listing gaps already closed by commander authorization and worker secret separation, while preserving live-provider gaps that still need verification.

**Independent Test**: Review `docs/production-readiness.md` and verify known gaps distinguish repo-completed controls from still-unverified live Netlify, EVE SSO, MongoDB, and monitoring work.

### User Story 3 - Preserve command-system boundaries in the refreshed backlog (Priority: P2)

As a future agent, I need the refreshed backlog to preserve the Numbers, Opportunity, People, worker, and commander-approval boundaries already established by the roadmap.

**Independent Test**: Review M45 Spec Kit artifacts and `docs/roadmap.md` to verify follow-on candidates name their operating domain and no-execution boundaries.

## Requirements

- **FR-001**: The roadmap MUST record M45 as a completed roadmap-refresh slice.
- **FR-002**: The roadmap MUST replace the open-ended M45 recommendation with a concrete M46 recommendation.
- **FR-003**: The refreshed next-slice candidates MUST be ordered and scoped enough for the next Spec Kit feature to start without additional roadmap interpretation.
- **FR-004**: Production-readiness known gaps MUST reflect that commander authorization and worker secret separation are repo-complete controls.
- **FR-005**: Production-readiness known gaps MUST continue to call out unverified live Netlify environment, EVE SSO application, MongoDB backup/index/access policy, and external monitoring posture.
- **FR-006**: The refreshed backlog MUST NOT introduce automatic player-impacting execution, EVE writes, wallet/asset/contract/role mutation, or external-service mutation as implicit behavior.
- **FR-007**: Repo-facing restart surfaces MUST point at the active M45 plan while this slice is in review.

## Success Criteria

- **SC-001**: `docs/roadmap.md` includes M45 completion evidence and names M46 as the next recommended slice.
- **SC-002**: `docs/production-readiness.md` no longer lists M41/M44-completed repo controls as open roadmap gaps.
- **SC-003**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M45 Spec Kit artifacts agree on the active M45 feature.
- **SC-004**: Documentation validation and diff hygiene pass before PR creation.

## Assumptions

- M41 completed repo-side commander authorization policy.
- M44 completed repo-side worker secret separation and worker policy documentation.
- Live provider state is still unverified by repo evidence and should remain a production-operations follow-up.
- This slice changes documentation and planning artifacts only.
