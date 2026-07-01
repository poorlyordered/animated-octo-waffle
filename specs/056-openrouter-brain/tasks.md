# Tasks: OpenRouter Brain

**Input**: Design documents from `specs/056-openrouter-brain/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/brain-worker.md`, `quickstart.md`

## Phase 1: Setup

- [X] T001 Add Brain contract exports in `packages/contracts/src/brain.ts`, `packages/contracts/src/brain.schema.ts`, and `packages/contracts/src/index.ts`
- [X] T002 Add Brain worker callback class and provider env readers in `netlify/functions/_shared/worker-callback-auth.ts` and `netlify/functions/_shared/env.ts`

## Phase 2: Foundational

- [X] T003 [P] Add Brain output validation tests in `apps/web/tests/unit/brain-output.test.ts`
- [X] T004 [P] Add OpenRouter adapter tests in `apps/web/tests/unit/brain-openrouter.test.ts`
- [X] T005 [P] Add Brain store/context tests in `apps/web/tests/unit/brain-store.test.ts`
- [X] T006 [P] Add Brain worker contract tests in `apps/web/tests/contract/brain-worker-api.test.ts`
- [X] T007 Implement Brain output schemas and conversion helpers in `netlify/functions/_shared/brain-output.ts`
- [X] T008 Implement bounded Brain context collection in `netlify/functions/_shared/brain-context.ts`
- [X] T009 Implement Brain lifecycle persistence in `netlify/functions/_shared/brain-store.ts`
- [X] T010 Implement OpenRouter provider adapter in `netlify/functions/_shared/brain-openrouter.ts`

## Phase 3: User Story 1 - Produce Command Intelligence

**Goal**: Trusted worker can run the Brain and store validated command intelligence.

**Independent Test**: `npm test -- brain` verifies deterministic provider success and compatible stored command brief output.

- [X] T011 [US1] Implement `POST /api/brain-worker/run` in `netlify/functions/brain-worker.ts`
- [X] T012 [US1] Add Netlify/API routing coverage through existing `/api/*` redirect assumptions and contract tests in `apps/web/tests/contract/brain-worker-api.test.ts`
- [X] T013 [US1] Verify command brief compatibility for Brain-generated briefs in `apps/web/tests/unit/command-brief-normalizer.test.ts`

## Phase 4: User Story 2 - Preserve Commander Authority

**Goal**: Brain output remains recommendations/draft orders only and never executes work.

**Independent Test**: `npm test -- brain-output` rejects unsafe model output and strips unsupported execution fields.

- [X] T014 [US2] Add unsafe output rejection and draft-order boundaries in `netlify/functions/_shared/brain-output.ts`
- [X] T015 [US2] Add regression tests for player-impacting and execution-like model output in `apps/web/tests/unit/brain-output.test.ts`

## Phase 5: User Story 3 - Inspect Brain Readiness

**Goal**: Operators can see Brain readiness and recent health without secrets.

**Independent Test**: `npm test -- operations-health` verifies Brain readiness with configured/missing provider env.

- [X] T016 [US3] Add Brain readiness summary to `netlify/functions/_shared/operations-health.ts`
- [X] T017 [US3] Add operations health fixture/test coverage in `apps/web/tests/unit/operations-health.test.ts`
- [X] T018 [US3] Document Brain Netlify environment variables in `README.md`, `docs/production-readiness.md`, and `docs/production-operations.md`

## Phase 6: Polish & Quality Gate

- [X] T019 Update `docs/roadmap.md` with M56 OpenRouter Brain status
- [X] T020 Run targeted validation `npm test -- brain`
- [X] T021 Run quality gate `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `git diff --check`
- [X] T022 Perform code-review-and-quality gate before commit

## Dependencies

- T001-T002 before implementation helpers.
- T003-T006 before T007-T011.
- T007-T010 before T011.
- US1 before US2 and US3 polish.

## Implementation Strategy

Deliver the MVP through US1 first: contracts, provider adapter, bounded context, lifecycle store, worker endpoint, and command brief compatibility. Then harden unsafe output handling and operations readiness before final documentation and quality gate.
