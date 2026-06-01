# Implementation Plan: Browser Workflow Smoke Tests

**Branch**: `005-browser-workflow-smoke` | **Date**: 2026-06-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-browser-workflow-smoke/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a separate real-browser smoke validation path for the four merged command surfaces: command brief, decision records, automation queue, and people. Keep the default Jest Node suite fast and DOM-free, while adding browser smoke scenarios that run against deterministic local fixtures and fail on blank screens, missing landmarks, console errors, failed local API responses, or command-boundary copy regressions.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Vite React app, Jest Node suite, browser automation runner to be added for smoke validation

**Storage**: N/A for smoke fixtures; browser validation must not require production MongoDB

**Testing**: Jest for contract/unit tests; browser smoke command for real-browser route/workflow validation

**Target Platform**: Local developer machine and future CI Linux runners

**Project Type**: Web application with Netlify functions and local browser validation

**Performance Goals**: Browser smoke suite completes locally in under two minutes after browser dependencies are installed

**Constraints**: No jsdom in default validation; no production secrets; no live EVE, external-service, or production MongoDB calls; deterministic fixtures or request interception only

**Scale/Scope**: Four command surfaces, a small set of smoke scenarios, and documentation for setup/validation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. This feature validates numbers/opportunity/people surfaces without creating or mutating command data. It performs no long-running AI/research work, stores no AI output, and uses deterministic local fixtures instead of server secrets or live external services.

## Project Structure

### Documentation (this feature)

```text
specs/005-browser-workflow-smoke/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
apps/web/src/
├── App.tsx
├── routes/
└── features/

apps/web/e2e/
├── fixtures/
└── command-surfaces.spec.ts

playwright.config.ts
package.json
```

**Structure Decision**: Keep source application code in the existing `apps/web/src` route/feature layout. Add browser smoke tests under `apps/web/e2e` and root-level browser runner configuration so the browser suite can start or target the local Vite app independently from Jest.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
