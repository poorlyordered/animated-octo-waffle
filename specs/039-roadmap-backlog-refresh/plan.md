# Implementation Plan: M39 Roadmap Backlog Refresh

**Branch**: `039-roadmap-backlog-refresh` | **Date**: 2026-06-30 | **Spec**: `specs/039-roadmap-backlog-refresh/spec.md`

## Summary

Refresh the completed roadmap tail after M38 by adding M39 completion evidence and replacing the open-ended near-term recommendation with ordered, scoped candidates for the next feature slices.

## Constitution Check

- Command simulation: keeps feature selection grounded in commander workflows instead of generic backlog churn.
- Three-leg model: next candidates must identify impact across numbers, opportunity, people, or the shared decision/automation loop.
- Automation auditability: refreshed candidates must preserve explicit no-execution boundaries.
- Human authority: candidates must keep approval boundaries explicit for player-impacting or external actions.
- Durable architecture: updates repo-facing restart surfaces so future sessions can resume from current roadmap truth.

## Technical Context

- Scope: documentation and Spec Kit artifacts only.
- Primary artifacts: `docs/roadmap.md`, `README.md`, `AGENTS.md`, `.specify/feature.json`, and `specs/039-roadmap-backlog-refresh/`.
- Validation: roadmap consistency review, code-review-and-quality gate, and diff hygiene.

## Design

- Add an M39 completed milestone summarizing the roadmap refresh.
- Replace the exhausted M38 candidate list with ordered next-slice candidates.
- Keep each candidate bounded with purpose, domain, and no-execution constraints.
- Update active feature pointers to the M39 plan while the branch is in review.

## Validation

- `git diff --check`
- Targeted documentation review against M39 requirements
- Code-review-and-quality gate
