# Tasks: Commander Chat Interface

**Input**: Design documents from `specs/060-commander-chat-interface/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/commander-chat.md, quickstart.md

**Tests**: Required. This feature adds durable AI chat, authorization, command-context grounding, draft decisions, and browser-visible no-execution boundaries.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add dependencies, contracts, and fixtures shared by every story.

- [X] T001 Add AI SDK dependencies to `package.json` and lockfile
- [X] T002 Create commander chat TypeScript contracts in `packages/contracts/src/commander-chat.ts`
- [X] T003 Create commander chat Zod schemas in `packages/contracts/src/commander-chat.schema.ts`
- [X] T004 Export commander chat contracts and schemas from `packages/contracts/src/index.ts`
- [X] T005 [P] Add commander chat fixtures in `apps/web/tests/fixtures/commanderChat.ts`
- [X] T006 [P] Add unsafe chat material fixtures in `apps/web/tests/fixtures/unsafeMaterial.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared store, context, output validation, and provider adapter before user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Add commander chat environment helpers in `netlify/functions/_shared/env.ts`
- [X] T008 Add safe chat rules and output normalization in `netlify/functions/_shared/commander-chat-output.ts`
- [X] T009 Add MongoDB chat session/message store in `netlify/functions/_shared/commander-chat-store.ts`
- [X] T010 Add bounded command context collector in `netlify/functions/_shared/commander-chat-context.ts`
- [X] T011 Add AI SDK OpenRouter chat adapter in `netlify/functions/_shared/commander-chat-openrouter.ts`
- [X] T012 [P] Add unit tests for chat output/rules in `apps/web/tests/unit/commander-chat-output.test.ts`
- [X] T013 [P] Add unit tests for chat store/context in `apps/web/tests/unit/commander-chat-store.test.ts`
- [X] T014 [P] Add unit tests for AI SDK adapter behavior in `apps/web/tests/unit/commander-chat-openrouter.test.ts`

**Checkpoint**: Chat sessions, messages, bounded context, unsafe rejection, prompt config, and mocked provider behavior are testable without UI.

---

## Phase 3: User Story 1 - Ask Command-State Questions (Priority: P1) MVP

**Goal**: Authorized commanders can ask command-state questions and receive cited durable assistant responses.

**Independent Test**: Ask about the latest refresh through the API with deterministic fixtures; verify stored messages, citations, missing-data notes, prompt version, and no-execution boundary.

### Tests for User Story 1

- [X] T015 [P] [US1] Add commander chat API contract tests in `apps/web/tests/contract/commander-chat-api.test.ts`
- [X] T016 [P] [US1] Add chat view-model tests in `apps/web/tests/unit/commander-chat-surface.test.ts`

### Implementation for User Story 1

- [X] T017 [US1] Implement list/load/send routing in `netlify/functions/commander-chat.ts`
- [X] T018 [US1] Add commander chat API client in `apps/web/src/features/commander-chat/services/commanderChatClient.ts`
- [X] T019 [US1] Add commander chat React state hook in `apps/web/src/features/commander-chat/state/useCommanderChat.ts`
- [X] T020 [US1] Add commander chat panel component in `apps/web/src/features/commander-chat/components/CommanderChatPanel.tsx`
- [X] T021 [US1] Add commander chat route wrapper in `apps/web/src/routes/CommanderChatRoute.tsx`
- [X] T022 [US1] Mount commander chat surface in `apps/web/src/App.tsx`
- [X] T023 [US1] Add commander chat styles in `apps/web/src/styles/app.css`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Continue Durable Chat Sessions (Priority: P2)

**Goal**: Commanders can list, reload, and continue durable chat sessions.

**Independent Test**: Create a chat, reload the app, open the prior session, and continue the conversation with scoped persisted messages.

### Tests for User Story 2

- [X] T024 [P] [US2] Add durable session continuation tests in `apps/web/tests/contract/commander-chat-api.test.ts`
- [X] T025 [P] [US2] Add browser smoke coverage for session reload in `apps/web/e2e/commander-chat.spec.ts`

### Implementation for User Story 2

- [X] T026 [US2] Add recent-session and transcript continuation behavior in `netlify/functions/commander-chat.ts`
- [X] T027 [US2] Add session list and reload controls in `apps/web/src/features/commander-chat/components/CommanderChatPanel.tsx`
- [X] T028 [US2] Enforce bounded history/context behavior in `netlify/functions/_shared/commander-chat-context.ts`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Draft Decision Records From Chat (Priority: P3)

**Goal**: Chat can propose review-only Decision Record drafts and commanders can explicitly create proposed decisions.

**Independent Test**: Ask for a decision draft, verify no decision is created automatically, then explicitly create the proposed decision from the stored draft.

### Tests for User Story 3

- [X] T029 [P] [US3] Add draft decision contract tests in `apps/web/tests/contract/commander-chat-api.test.ts`
- [X] T030 [P] [US3] Add draft decision browser smoke coverage in `apps/web/e2e/commander-chat.spec.ts`

### Implementation for User Story 3

- [X] T031 [US3] Add draft decision validation and duplicate-safe creation in `netlify/functions/commander-chat.ts`
- [X] T032 [US3] Link chat draft decisions to existing decision-record store helpers in `netlify/functions/_shared/decision-record-store.ts`
- [X] T033 [US3] Add draft decision review/create controls in `apps/web/src/features/commander-chat/components/CommanderChatPanel.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, roadmap sync, and full validation.

- [X] T034 [P] Update application usage notes in `README.md`
- [X] T035 [P] Update production operation notes in `docs/production-operations.md`
- [X] T036 [P] Update M60 implementation details in `docs/roadmap.md`
- [X] T037 Run focused validation from `specs/060-commander-chat-interface/quickstart.md`
- [X] T038 Run full quality gate: `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:e2e`, `npm run build`, `git diff --check`
- [X] T039 Mark completed tasks in `specs/060-commander-chat-interface/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on setup completion and blocks all user stories.
- **User Story 1 (P1)**: Depends on foundational chat store/context/provider/rules.
- **User Story 2 (P2)**: Depends on User Story 1 API and UI.
- **User Story 3 (P3)**: Depends on User Story 1 stored assistant messages.
- **Polish**: Depends on selected user stories being complete.

### Parallel Opportunities

- T005 and T006 can run in parallel.
- T012, T013, and T014 can run in parallel.
- T015 and T016 can run in parallel.
- T024 and T025 can run in parallel.
- T029 and T030 can run in parallel.
- T034, T035, and T036 can run in parallel.

## Implementation Strategy

### MVP First

1. Complete setup and foundational chat contracts/store/context/provider/rules.
2. Complete US1 so commanders can ask cited command-state questions safely.
3. Validate authorization, persistence, unsafe rejection, prompt versioning, and no-execution boundaries.

### Incremental Delivery

1. Add durable session continuation.
2. Add draft Decision Record review/create flow.
3. Update docs and run the full quality gate.
