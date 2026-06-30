# Implementation Plan: M46 Production Operations Follow-up

**Branch**: `046-production-operations-followup` | **Date**: 2026-06-30 | **Spec**: `specs/046-production-operations-followup/spec.md`

## Summary

Add a production operations runbook that converts the remaining production-readiness gaps into concrete repo-side verification, evidence, monitoring, worker-secret rotation, deployment smoke, and rollback requirements. Update readiness and restart surfaces so M47 can proceed from a clear operational baseline.

## Constitution Check

- Command simulation: prepares the command operating system for controlled operation without expanding it into generic deployment notes.
- Three-leg model: deploy smoke and monitoring expectations cover Numbers, Opportunity, People, Decision Records, Automation Queue, ingestion, retry, and worker handoff surfaces.
- Automation auditability: documents worker callback, retry, ingestion, and handoff monitoring plus secret rotation evidence.
- Human authority: keeps production operations from authorizing EVE writes, player-impacting mutation, worker dispatch, or external-service mutation.
- Durable architecture: records provider verification, rollback, and evidence requirements as repo-facing documentation.

## Technical Context

- Deployment target: Netlify static web build with Netlify Functions under `netlify/functions`.
- Runtime: Node 22 per `package.json`.
- Existing readiness artifact: `docs/production-readiness.md`.
- New runbook artifact: `docs/production-operations.md`.
- Validation: full local command gate, documentation review, code-review-and-quality gate, and diff hygiene.

## Design

- Create `docs/production-operations.md` with operational checklists for:
  - pre-deploy evidence
  - Netlify environment verification
  - live EVE SSO provider verification
  - MongoDB backup/index/access/retention posture
  - monitoring and alerting ownership
  - worker secret rotation posture
  - deploy smoke checks
  - rollback procedure
  - go/no-go record
- Link production-readiness to the M46 runbook while preserving its conditional readiness verdict.
- Update README, AGENTS, `.specify/feature.json`, and roadmap restart surfaces.
- Add M46 Spec Kit artifacts for future auditability.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
- Code-review-and-quality gate
