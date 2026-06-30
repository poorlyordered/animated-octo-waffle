# Implementation Plan: M45 Roadmap Backlog Refresh

**Branch**: `045-roadmap-backlog-refresh` | **Date**: 2026-06-30 | **Spec**: `specs/045-roadmap-backlog-refresh/spec.md`

## Summary

Refresh the roadmap and production-readiness backlog after M41 commander authorization, M42/M43 ingestion expansion, and M44 worker policy hardening. The slice records M45 completion, removes stale open-gap language for repo-completed controls, and selects a concrete M46 production-operations follow-up.

## Constitution Check

- Command simulation: keeps feature selection grounded in operating readiness for the corporation command system.
- Three-leg model: accounts for Numbers, Opportunity, and People ingestion lifecycle coverage before selecting the next shared operations slice.
- Automation auditability: preserves worker policy, retry, ingestion, and provenance boundaries without introducing implicit dispatch or execution.
- Human authority: keeps commander approval and live-provider verification explicit before irreversible or player-impacting actions.
- Durable architecture: updates repo-facing restart surfaces and production-readiness docs so future sessions resume from current evidence.

## Technical Context

- Scope: documentation and Spec Kit artifacts only.
- Primary artifacts: `docs/roadmap.md`, `docs/production-readiness.md`, `README.md`, `AGENTS.md`, `.specify/feature.json`, and `specs/045-roadmap-backlog-refresh/`.
- Validation: roadmap consistency review, production-readiness gap review, code-review-and-quality gate, and diff hygiene.

## Design

- Add an M45 completed milestone summarizing the backlog refresh.
- Update production-readiness environment and known-gap language to include class-specific worker secrets and remove completed worker/commander controls from open gaps.
- Replace the exhausted M44 recommendation with ordered next-slice candidates, led by a bounded production-operations follow-up.
- Update active feature pointers to the M45 plan while the branch is in review.

## Validation

- `git diff --check`
- Targeted documentation review against M45 requirements
- Code-review-and-quality gate
