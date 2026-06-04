# Implementation Plan: Retry Cancellation and Policy Controls

**Branch**: `020-retry-cancellation-policy` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/020-retry-cancellation-policy/spec.md`

## Summary

Add commander cancellation for scheduled or blocked retry records and expose browser-safe retry policy metadata on retry summaries. Wire cancel controls into worker handoff and ESI sync retry surfaces without changing worker execution behavior.

## Technical Context

**Language/Version**: TypeScript on Node-compatible Netlify Functions with React/TypeScript browser app

**Primary Dependencies**: Existing contracts package, Zod schemas, MongoDB driver, Netlify Functions, React state, Jest, Playwright

**Storage**: Existing MongoDB `retry_requests`

**Testing**: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`

**Target Platform**: Browser command surface and Netlify API functions

**Project Type**: Web application with server-owned command APIs

**Performance Goals**: Cancellation is a single target-scoped atomic update.

**Constraints**: No worker dispatch, retry claim, retry execution, ESI fetch, EVE write, wallet/asset/contract/role mutation, or external-service execution.

**Scale/Scope**: M20 covers cancellation and policy visibility only.

## Constitution Check

- Operating legs: Numbers affected through ESI sync retries; automation affected through worker handoff retries.
- Decision boundary: cancellation is an explicit command-record update.
- Long-running work: no long-running work is added.
- Metadata: retry policy and cancellation metadata are browser-safe.
- Secret protection: no server secrets, tokens, worker credentials, dispatch targets, or execution handles are returned.

## Project Structure

```text
packages/contracts/src/retry.ts
packages/contracts/src/retry.schema.ts
netlify/functions/_shared/retry-request-store.ts
netlify/functions/worker-handoffs.ts
netlify/functions/esi-sync.ts
apps/web/src/features/automation-queue/components/AutomationQueueDetail.tsx
apps/web/src/features/automation-queue/services/workerHandoffClient.ts
apps/web/src/features/automation-queue/state/useAutomationQueue.ts
apps/web/src/features/esi-sync/components/EsiSyncPanel.tsx
apps/web/src/features/esi-sync/services/esiSyncClient.ts
apps/web/src/features/esi-sync/state/useEsiSync.ts
apps/web/tests/fixtures/retry.ts
apps/web/tests/contract/retry-worker-api.test.ts
apps/web/tests/unit/retry-request-store.test.ts
apps/web/e2e/worker-handoff.spec.ts
apps/web/e2e/esi-token-vault-sync.spec.ts
```

**Structure Decision**: Extend existing retry target endpoints with `/retry/cancel` so callers do not need a new global retry route.

## Complexity Tracking

No constitution violations or extra complexity exceptions.
