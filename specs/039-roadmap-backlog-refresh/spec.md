# Feature Specification: M39 Roadmap Backlog Refresh

**Feature Branch**: `039-roadmap-backlog-refresh`
**Created**: 2026-06-30
**Status**: Draft

## User Stories & Testing

### User Story 1 - Select the next command-operating slices (Priority: P1)

As the project commander, I need the roadmap to turn the completed M38 recommendation into concrete next-slice candidates so feature-by-feature development can continue without guessing.

**Independent Test**: Review `docs/roadmap.md` and verify M39 is marked complete and the Near-Term Recommendation names ordered, bounded candidates after M39.

### User Story 2 - Preserve operating boundaries in the refreshed backlog (Priority: P2)

As the project commander, I need each new candidate to preserve the numbers, opportunity, people, automation, and human-approval boundaries already established by the roadmap.

**Independent Test**: Review the refreshed backlog and verify candidates name their domain, purpose, and non-execution boundaries.

## Requirements

- **FR-001**: The roadmap MUST record M39 as a completed roadmap-refresh slice.
- **FR-002**: The roadmap MUST replace the open-ended "refresh backlog" recommendation with concrete next-slice candidates.
- **FR-003**: The next-slice candidates MUST be ordered and scoped enough for the next Spec Kit feature to start without additional roadmap interpretation.
- **FR-004**: The refreshed backlog MUST preserve Gryyk-47 as a command operating system across numbers, opportunity, people, and auditable automation.
- **FR-005**: The refreshed backlog MUST NOT introduce automatic player-impacting execution, EVE writes, wallet/asset/contract/role mutation, or external-service mutation as implicit behavior.
- **FR-006**: Repo-facing restart surfaces MUST point at the active M39 plan while this slice is in review.

## Success Criteria

- **SC-001**: `docs/roadmap.md` includes M39 completion evidence and at least three ordered next-slice candidates.
- **SC-002**: `README.md`, `AGENTS.md`, `.specify/feature.json`, and M39 Spec Kit artifacts agree on the active M39 feature.
- **SC-003**: Documentation validation and diff hygiene pass before PR creation.

## Assumptions

- M38 completed the previous near-term candidate list.
- The next step should be a roadmap/backlog feature because the roadmap no longer names a specific product implementation slice.
- This slice changes documentation and planning artifacts only.
