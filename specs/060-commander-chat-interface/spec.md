# Feature Specification: Commander Chat Interface

**Feature Branch**: `060-commander-chat-interface`

**Created**: 2026-07-03

**Status**: Complete

**Input**: User description: "Build a durable commander chat interface using Vercel AI SDK Core and AI SDK UI. Chat must have configurable prompt settings, a separate commander-chat prompt version, durable chat sessions/messages, command-state citations, and draft Decision Records. It must remain a Gryyk-47 command operating system surface, not a generic chat app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask Command-State Questions (Priority: P1)

As an authorized commander, I can ask a chat question about current Gryyk-47 command state and receive a cited answer grounded in existing command data across Numbers, Opportunity, People, refresh runs, briefs, decisions, and operations posture.

**Why this priority**: Chat is valuable only if it helps inspect the command operating system and does not become an unsupported generic assistant.

**Independent Test**: Ask about the latest intelligence refresh with deterministic command fixtures. The answer cites refresh and command brief sources, identifies missing data, and stores the conversation durably.

**Acceptance Scenarios**:

1. **Given** an authorized signed commander session and command data exists, **When** the commander sends a chat message, **Then** the system stores the user message, returns a browser-safe assistant response, and stores assistant message metadata with citations and prompt version.
2. **Given** command data is partial or missing, **When** the commander asks for an assessment, **Then** the response clearly identifies missing data instead of inventing facts.
3. **Given** an unauthenticated or unauthorized session, **When** chat data is requested or a message is sent, **Then** no command-state data or chat transcript is returned.

---

### User Story 2 - Continue Durable Chat Sessions (Priority: P2)

As an authorized commander, I can return to recent chat sessions, inspect prior messages, and continue a bounded conversation without losing provenance or exposing another corporation's transcript.

**Why this priority**: Chat should support operational continuity and auditability, not ephemeral one-off prompts.

**Independent Test**: Create a chat, reload the app, list recent chats, open the prior chat, and send another message. The transcript remains scoped to the same authorized corporation and retains source metadata.

**Acceptance Scenarios**:

1. **Given** prior chat sessions exist for the commander's authorized corporation, **When** the commander opens chat, **Then** recent sessions and messages are visible without leaking raw provider payloads or secrets.
2. **Given** a chat history exceeds the bounded context window, **When** the commander sends a new message, **Then** only safe bounded history and command summaries are sent for response generation while the durable transcript remains inspectable.
3. **Given** a signed session from another authorized corporation, **When** chat sessions are listed, **Then** only that corporation's sessions are returned.

---

### User Story 3 - Draft Decision Records From Chat (Priority: P3)

As a commander, I can ask chat to draft a Decision Record from cited command evidence, review the draft, and explicitly create the proposed decision through a separate action.

**Why this priority**: Chat should help turn command insight into auditable decisions while preserving human authority and approval boundaries.

**Independent Test**: Ask chat for a decision recommendation from the latest refresh. The response includes a draft Decision Record with citations and approval requirements, but no record is created until the commander explicitly confirms creation.

**Acceptance Scenarios**:

1. **Given** a cited assistant response includes a draft decision, **When** the response is stored, **Then** the draft includes title, rationale, source context, expected result, player-impacting flag, and approval requirement metadata.
2. **Given** the commander explicitly creates the draft decision, **When** the draft is submitted, **Then** a proposed Decision Record is created using existing decision boundaries and provenance.
3. **Given** assistant text suggests player-impacting work, **When** a draft decision is produced, **Then** the draft remains proposed/review-only and does not create queued work, dispatch workers, or execute game/external actions.

### Operating Model Alignment

- **Numbers**: Chat responses can cite wallet, assets, logistics, market, activity, ESI sync, retry, and refresh evidence when available.
- **Opportunity**: Chat responses can cite command briefs, opportunity recommendations, research/ingestion provenance, watchlists, and refresh evidence.
- **People**: Chat responses can cite member profiles, people ingestion provenance, leadership follow-ups, delegation context, and refresh evidence.
- **Decision Boundary**: Chat outputs are observations, recommendations, missing-data explanations, and draft decisions only until the commander explicitly creates a Decision Record.
- **Automation Boundary**: Chat does not dispatch workers, fetch ESI, call providers from the browser, create queued work, execute retries, write to EVE, mutate roles/access/standings, move wallets/assets/contracts, deploy, roll back, or mutate external services.

### Edge Cases

- AI provider configuration is missing, invalid, rate-limited, times out, or returns malformed streamed output.
- A chat message contains token material, raw provider payloads, executable instructions, browser-selected corporation scope, dispatch handles, or player-impacting mutation fields.
- The configured prompt version is missing, malformed, or unsafe.
- Existing durable messages no longer match current message metadata schemas.
- The model produces unsupported tool-call or execution-like output.
- Command context is stale, partial, empty, or contains only safe operational warnings.
- A draft decision references sources that are no longer visible in current scoped data.
- Multiple messages are sent quickly to the same chat session.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a commander chat surface only to authorized signed sessions.
- **FR-002**: System MUST persist durable chat sessions and messages scoped by server-resolved corporation identity and safe commander attribution.
- **FR-003**: System MUST support listing recent chat sessions and loading a bounded transcript for a selected chat session.
- **FR-004**: System MUST assemble bounded command context from existing command briefs, Intelligence Refresh Runs, Numbers, Opportunity, People, Decision Records, Automation Queue, Operations Health, and Production Evidence summaries.
- **FR-005**: System MUST generate assistant responses server-side using configurable commander-chat prompt settings and a distinct commander-chat prompt version.
- **FR-006**: System MUST record prompt version, model/provider metadata, source citations, confidence or uncertainty metadata, missing-data notes, and created timestamps for assistant messages.
- **FR-007**: System MUST validate and sanitize stored messages and assistant metadata before sending any history to the model or returning it to the browser.
- **FR-008**: System MUST reject or omit token material, raw provider payloads, raw ESI payloads, browser-selected corporation scope, worker secrets, dispatch handles, executable instructions, EVE write intents, role/access/standing mutations, wallet/asset/contract mutation fields, deploy/rollback intents, and external-service mutation fields.
- **FR-009**: System MUST let chat produce structured draft Decision Records with citations and approval metadata.
- **FR-010**: System MUST require a separate explicit commander action to create a proposed Decision Record from a chat draft.
- **FR-011**: System MUST prevent chat responses and draft decisions from creating queued work, dispatching workers, executing retries, fetching ESI, writing to EVE, mutating player/corporation state, or mutating external services.
- **FR-012**: System MUST expose safe provider/configuration failures without revealing API keys, prompts containing sensitive values, stack traces, raw payloads, cookies, JWTs, or connection strings.
- **FR-013**: System MUST provide deterministic contract, unit, and browser tests for authorization, persistence, context grounding, prompt versioning, unsafe material rejection, cited responses, draft decisions, and no-execution boundaries.

### Key Entities *(include if feature involves data)*

- **Commander Chat Session**: A durable conversation container scoped to corporation and commander-safe attribution, with status, title, timestamps, message counts, and last activity metadata.
- **Commander Chat Message**: A durable user or assistant message with safe content parts, role, timestamps, prompt/model metadata, citations, missing-data notes, and no-execution boundary metadata.
- **Commander Chat Context Snapshot**: A bounded server-built summary of command state used for one response generation, including source references and freshness indicators.
- **Commander Chat Prompt Configuration**: Server-owned prompt version and model settings used for chat responses, separate from Brain prompt versions.
- **Draft Decision Record**: A structured, review-only decision proposal derived from chat, with title, rationale, expected result, source context, player-impacting flag, and approval requirement metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authorized commander can send a chat question and see a cited, stored assistant response within 15 seconds using deterministic test fixtures.
- **SC-002**: 100% of assistant responses generated from command context include at least one citation or an explicit missing-data explanation.
- **SC-003**: 100% of chat sessions and messages are scoped by server-resolved corporation identity and are unavailable to unauthorized sessions.
- **SC-004**: 100% of detected unsafe token, credential, raw provider payload, execution, dispatch, EVE write, and mutation fields are rejected or omitted before storage and browser return.
- **SC-005**: Draft Decision Records created from chat require an explicit separate create action and are stored as proposed decisions only.
- **SC-006**: Automated tests cover chat persistence, prompt versioning, provider failure, malformed output, draft-decision creation, and no-execution boundaries without live provider calls.

## Assumptions

- Existing EVE SSO signed-session authorization remains the commander access boundary.
- MongoDB remains the durable store for command data and chat records.
- OpenRouter remains the first model provider, accessed server-side through the Vercel AI SDK provider.
- Streaming is desirable for the UI, but durable persistence of the final assistant message and metadata is required.
- The first implementation can support text-only chat messages and structured metadata; attachments and multimodal input are out of scope.
