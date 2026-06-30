# Implementation Plan: M40 Production Readiness Audit

**Branch**: `040-production-readiness-audit` | **Date**: 2026-06-30 | **Spec**: `specs/040-production-readiness-audit/spec.md`

## Summary

Add a production readiness audit and runbook for the current command loop, then update roadmap/restart surfaces so the next slice can proceed from a clear deployability verdict.

## Constitution Check

- Command simulation: verifies the command operating loop can be deployed responsibly.
- Three-leg model: audit covers Numbers, Opportunity, People, and shared Decision/Automation surfaces.
- Automation auditability: validation requires no-execution boundaries and worker/retry status visibility.
- Human authority: audit keeps player-impacting and external actions gated by explicit approval.
- Durable architecture: records required env, validation commands, and known gaps in repo-facing documentation.

## Technical Context

- Deployment target: Netlify static web build with Netlify Functions under `netlify/functions`.
- Runtime: Node 22 per `package.json`.
- Validation: full local command gate and code-review-and-quality gate.
- Output artifacts: `docs/production-readiness.md`, roadmap update, README pointer, and Spec Kit artifacts.

## Design

- Document build/deploy shape from `package.json`, `netlify.toml`, and Playwright config.
- Document environment variables from shared env/config helpers and README.
- Document validation commands and current readiness verdict.
- Document known gaps as next-slice inputs rather than hiding them.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
