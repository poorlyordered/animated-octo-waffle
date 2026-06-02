# Implementation Plan: Numbers Follow-Up Actions

**Branch**: `011-numbers-followup-actions` | **Date**: 2026-06-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-numbers-followup-actions/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Extend the read-only Numbers operating layer so a commander can convert eligible follow-up candidates into auditable command artifacts: proposed decision records first, then queued work only from approved decisions. The implementation will use server-side scoped lookup of the originating Numbers snapshot and candidate, preserve provenance, prevent duplicates, and keep execution, worker dispatch, retry scheduling, live ESI sync, and player-impacting actions outside this slice.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 22 target

**Primary Dependencies**: Existing Netlify functions, MongoDB adapters, Jest Node tests, Playwright browser smoke tests, Zod contracts

**Storage**: Existing MongoDB `numbers_snapshots`, `strategic_decisions`, and `automation_queue` collections with minimal link metadata for Numbers follow-up origins

**Testing**: Jest contract/unit tests and Playwright browser smoke tests

**Target Platform**: Netlify functions plus local developer environment

**Project Type**: Web application with serverless API functions

**Performance Goals**: Candidate-to-decision and decision-to-queue operations perform bounded scoped lookups and single-record writes; no long-running processing occurs in request paths.

**Constraints**: Active corporation scope is server-resolved; browser-controlled corporation IDs, approval metadata, raw provenance overrides, execution flags, worker dispatch fields, retry scheduling, wallet actions, asset actions, and external mutation fields are rejected or ignored. Server secrets and tokens never appear in responses.

**Scale/Scope**: M11 covers creating decisions from Numbers follow-up candidates, creating queued work from approved Numbers follow-up decisions, duplicate prevention, UI controls, and validation. ESI token vaulting, live data ingestion, worker handoff preparation, callback processing, retry policy, and external execution remain future slices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Does this feature identify which operating legs it affects: numbers, opportunity, people?
- Does it separate observations, recommendations, draft orders, and executed actions?
- Are long-running AI, research, sync, or enrichment jobs outside request/response paths?
- Are source data, model/prompt metadata, confidence, timestamps, and failure states captured where AI output is stored?
- Are server-side secrets, EVE SSO tokens, MongoDB credentials, and player-impacting actions protected by server boundaries and explicit approval?

Gate status: PASS. M11 starts from the Numbers leg and may surface opportunity/people context through candidate coverage. It creates proposed decisions and queued work only after explicit commander action, performs no execution or long-running work in request paths, preserves existing provenance, and keeps secrets plus player-impacting approval behind server-side boundaries.

Post-design gate status: PASS. The contracts require server-resolved scope, provenance from stored snapshots, duplicate checks, approval-gated queue creation, and response schemas that omit secrets, execution handles, token material, and worker credentials.

## Project Structure

### Documentation (this feature)

```text
specs/011-numbers-followup-actions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
packages/contracts/src/
├── numbers.ts
├── numbers.schema.ts
├── decision-record.ts
├── decision-record.schema.ts
├── automation-queue.ts
└── automation-queue.schema.ts

netlify/functions/
├── numbers.ts
├── decision-records.ts
├── automation-queue.ts
└── _shared/
    ├── numbers-store.ts
    ├── numbers-normalizer.ts
    ├── decision-record-store.ts
    ├── decision-record-normalizer.ts
    ├── automation-queue-store.ts
    └── automation-queue-rules.ts

apps/web/src/features/
├── numbers/
├── decision-records/
└── automation-queue/

apps/web/tests/
├── unit/
├── contract/
└── e2e/
```

**Structure Decision**: Extend existing Numbers, decision-record, and automation-queue contracts/functions/stores. Numbers owns candidate lookup and decision creation entry points; decision records remain the approval gateway; automation queue continues to accept only approved decision records.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
