# Implementation Plan: M44 Worker Policy Hardening

**Branch**: `044-worker-policy-hardening` | **Date**: 2026-06-30 | **Spec**: `specs/044-worker-policy-hardening/spec.md`

## Summary

Add class-aware worker callback authorization and durable worker policy documentation. Worker endpoints will identify their worker class, class-specific secrets can authorize only that class, and the existing shared worker secret remains a compatibility fallback.

## Constitution Check

- Command simulation: hardens trusted worker pathways that support Numbers, Opportunity, People, and Automation operations.
- Three-leg model: protects worker classes used across Numbers, Opportunity, and People ingestion/retry workflows.
- Automation auditability: preserves worker status and retry flows while tightening callback authorization boundaries.
- Human authority: keeps browser actions limited to preparation/retry records and documents no implicit dispatch or execution.
- Durable architecture: centralizes worker policy in one auth helper and documents runbook expectations.

## Technical Context

- Worker auth helper: `netlify/functions/_shared/worker-callback-auth.ts`.
- Worker endpoints: worker handoffs, retry worker, ESI sync worker, People ingestion worker, Opportunity ingestion worker.
- Tests: `apps/web/tests/unit/worker-callback-auth.test.ts`.
- Docs: README and new `docs/worker-policy.md`.

## Design

- Add a `WorkerCallbackClass` union and a map from worker class to class-specific secret env var.
- Update `assertWorkerCallbackAuthorized` to accept a worker class.
- Authorize with the class-specific secret when configured; otherwise use `WORKER_CALLBACK_SECRET`.
- Update all worker endpoint call sites to pass their class.
- Add unit tests for class-specific acceptance, cross-class rejection, and fallback behavior.
- Add a worker policy runbook that names worker classes, env vars, retry/backoff boundaries, and browser no-dispatch guarantees.

## Validation

- `npm test -- worker-callback-auth`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
