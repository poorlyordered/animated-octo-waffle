# Implementation Plan: Commander Chat Interface

**Branch**: `060-commander-chat-interface` | **Date**: 2026-07-03 | **Spec**: `specs/060-commander-chat-interface/spec.md`

**Input**: Feature specification from `specs/060-commander-chat-interface/spec.md`

## Summary

Add a durable commander chat interface that uses AI SDK UI in the React command center and AI SDK Core with the OpenRouter provider in Netlify functions. Chat persists scoped sessions/messages in MongoDB, assembles bounded command context from existing Gryyk-47 surfaces, returns cited assistant responses with a separate commander-chat prompt version, and can produce review-only draft Decision Records that require explicit commander creation.

## Technical Context

**Language/Version**: TypeScript on Node `22.x`

**Primary Dependencies**: React `19.x`, Vite, Netlify Functions, MongoDB driver, Zod, `@gryyk/contracts`, AI SDK Core `ai`, AI SDK UI `@ai-sdk/react`, OpenRouter provider `@openrouter/ai-sdk-provider`

**Storage**: MongoDB collections `commander_chat_sessions` and `commander_chat_messages`, plus existing command collections read for bounded context

**Testing**: Jest unit/contract tests, Playwright browser smoke tests, TypeScript build, ESLint

**Target Platform**: Netlify web app with serverless functions and authorized EVE SSO command sessions

**Project Type**: Web application with React frontend, shared contracts, and Netlify function backend

**Performance Goals**: Chat session list/load under 2 seconds; deterministic mocked assistant response under 15 seconds; bounded context avoids unbounded transcript/model payload growth

**Constraints**: Signed EVE session required for production command chat; provider calls are server-side only; chat does not execute workers, ESI fetches, EVE writes, queued work, retries, deploys, rollbacks, or external mutations; assistant output is untrusted until validated

**Scale/Scope**: One corporation command scope per signed session; recent session list and model context are bounded; v1 supports text-only chat plus structured metadata and draft Decision Records

## Constitution Check

- Operating legs: Chat context and citations cover Numbers, Opportunity, and People when available, and missing-data notes when unavailable.
- Decision separation: Chat produces observations, recommendations, missing-data notes, and draft decisions only; actual Decision Record creation is a separate explicit action.
- Long-running boundary: Browser chat posts to a short request path that may stream a bounded model response; data pulls, worker execution, ESI fetches, and Brain refreshes remain outside chat request paths.
- AI provenance: Assistant messages store prompt version, model/provider metadata, citations, confidence/uncertainty, source freshness, and created timestamps.
- Secret and approval boundaries: OpenRouter keys, worker secrets, ESI tokens, Mongo credentials, raw provider payloads, and player-impacting actions stay server-side and approval-gated.

## Project Structure

### Documentation (this feature)

```text
specs/060-commander-chat-interface/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── commander-chat.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/contracts/src/
├── commander-chat.ts
├── commander-chat.schema.ts
└── index.ts

netlify/functions/
├── commander-chat.ts
└── _shared/
    ├── commander-chat-context.ts
    ├── commander-chat-openrouter.ts
    ├── commander-chat-output.ts
    ├── commander-chat-store.ts
    ├── command-scope.ts
    ├── decision-record-store.ts
    └── env.ts

apps/web/src/
├── App.tsx
├── routes/CommanderChatRoute.tsx
└── features/commander-chat/
    ├── components/CommanderChatPanel.tsx
    ├── services/commanderChatClient.ts
    └── state/useCommanderChat.ts

apps/web/tests/
├── contract/
└── unit/

apps/web/e2e/
└── commander-chat.spec.ts
```

**Structure Decision**: Add a bounded `commander-chat` feature. Shared response/message contracts live in `packages/contracts`, durable persistence/context/model adapters live under Netlify `_shared`, route handling stays in `netlify/functions`, and React chat UI lives under `apps/web/src/features/commander-chat`.

## Complexity Tracking

No constitution violations or exceptional complexity are required. The chat layer is an interface over existing command state and does not become a separate action/execution authority.

## Phase 0 Research

See `research.md`.

## Phase 1 Design

See `data-model.md`, `contracts/commander-chat.md`, and `quickstart.md`.

## Post-Design Constitution Check

- Numbers, Opportunity, and People are represented as cited context sources or explicit missing-data notes.
- Chat draft decisions remain proposed/review-only until separate commander creation through existing decision APIs/store helpers.
- AI SDK usage is isolated to server generation and UI transport; Gryyk-47 owns authorization, persistence, context, validation, and approval boundaries.
- Browser-safe contracts reject unsafe material and omit secrets/raw payloads.
- No worker dispatch, ESI fetch, EVE write, queued work, retry execution, deploy/rollback, or external-service mutation is introduced.
