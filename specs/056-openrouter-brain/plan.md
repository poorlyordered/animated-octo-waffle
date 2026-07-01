# Implementation Plan: OpenRouter Brain

**Branch**: `056-openrouter-brain` | **Date**: 2026-07-01 | **Spec**: `specs/056-openrouter-brain/spec.md`

## Summary

Add a server-side Brain worker path that calls OpenRouter, validates structured model output, stores accepted command intelligence as a compatible `research_briefs` record, and records Brain run lifecycle status in `research_requests`. The first slice exposes Brain-generated output through the existing command brief surface and adds operations readiness checks without introducing browser-side LLM calls, autonomous EVE action, or direct worker dispatch from the UI.

## Technical Context

**Language/Version**: TypeScript on Node `22.x`

**Primary Dependencies**: Netlify Functions, MongoDB driver, Zod, built-in `fetch`

**Storage**: MongoDB collections `research_requests`, `research_briefs`, and existing command-loop collections used as bounded context

**Testing**: Jest unit/contract tests, TypeScript build, ESLint, Playwright smoke retained

**Target Platform**: Netlify web app with serverless functions and trusted external/background workers

**Project Type**: Web application with React frontend, shared contracts, and Netlify function backend

**Performance Goals**: Trusted Brain worker execution completes within 60 seconds for bounded test context; read surfaces remain unchanged

**Constraints**: OpenRouter API key stays server-side; model output is untrusted until schema-validated; Brain recommendations never execute player-impacting actions; long-running/retry behavior stays outside browser request paths

**Scale/Scope**: One corporation command scope at a time; first provider is OpenRouter through an adapter; first output target is current command brief shape

## Constitution Check

- Operating legs: Brain prompt context and output cover numbers, opportunity, and people, with missing/stale reasons when context is incomplete.
- Decision separation: stored output distinguishes observations, recommendations, missing data, and draft orders; no executed actions are represented as completed by the Brain.
- Long-running boundary: Brain execution is a trusted worker/server pathway, not a browser request that loops or executes model/tool chains.
- AI provenance: stored Brain output includes provider, model, prompt version, source references, confidence, createdAt, and lifecycle status/failure metadata.
- Secret and approval boundaries: OpenRouter key remains server-side; no EVE writes, player-impacting mutation, queue dispatch, token exposure, or external-service mutation is introduced.

## Phase 0 Research

See `research.md`.

## Phase 1 Design

See `data-model.md`, `contracts/brain-worker.md`, and `quickstart.md`.

## Project Structure

```text
packages/contracts/src/
├── command-brief.ts
├── command-brief.schema.ts
├── brain.ts
└── brain.schema.ts

netlify/functions/
├── brain-worker.ts
├── operations-health.ts
└── _shared/
    ├── brain-context.ts
    ├── brain-openrouter.ts
    ├── brain-output.ts
    ├── brain-store.ts
    ├── env.ts
    ├── operations-health.ts
    └── worker-callback-auth.ts

apps/web/tests/
├── contract/
└── unit/

specs/056-openrouter-brain/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

**Structure Decision**: Keep Brain in the existing contracts/functions/test layout. Add provider-specific code only behind `_shared/brain-openrouter.ts`; keep source collection, validation, persistence, and route handling in separate bounded helpers.

## Complexity Tracking

No constitution violations or added complexity requiring justification.

## Post-Design Constitution Check

- The design uses worker callback authentication and adds a dedicated Brain worker class, preserving human authority and server-side secret boundaries.
- The OpenRouter adapter does not expose tool execution or browser access; model output is parsed and validated as data before storage.
- Command brief compatibility keeps the first Brain slice useful without adding a parallel UI or new decision authority model.
