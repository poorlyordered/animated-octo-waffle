# Contract: Commander Chat Interface

## Browser Commander API

### GET `/api/commander-chat`

Returns recent chat sessions for the authorized command scope.

Response:

- `sessions`: bounded list of chat session summaries
- `boundary`: no-execution boundary text

Failure:

- `401` signed session required
- `403` corporation unauthorized

### POST `/api/commander-chat`

Creates or continues a chat session and streams/stores an assistant response.

Request:

- `sessionId` optional existing session id
- `message` safe user text

Response:

- AI SDK UI-compatible message stream when streaming is available
- final stored assistant message metadata includes citations, prompt version, model/provider, missing-data notes, draft decision, and boundary text

Failure:

- `400` unsafe or invalid message
- `401` signed session required
- `403` corporation unauthorized
- `502` provider unavailable or malformed response, with safe error category only

### GET `/api/commander-chat/:sessionId`

Returns a scoped chat session and bounded message transcript.

Response:

- `session`
- `messages`
- `boundary`

Failure:

- `404` session not found in resolved corporation scope

### POST `/api/commander-chat/:sessionId/decisions`

Creates a proposed Decision Record from a stored assistant draft decision.

Request:

- `messageId`
- `draftDecisionId` or stable draft key
- optional commander note

Response:

- `decision`
- `handoff`: proposed/approval-required state
- `boundary`

Failure:

- `400` draft unavailable, unsafe, stale, or invalid
- `401` signed session required
- `403` corporation unauthorized
- `404` session/message not found in resolved corporation scope
- duplicate-safe response if a decision already exists for the same chat draft

## Prompt Configuration

Server-owned settings:

- `COMMANDER_CHAT_PROMPT_VERSION`, default `commander-chat/v1`
- `COMMANDER_CHAT_SYSTEM_PROMPT`, optional override
- `COMMANDER_CHAT_MODEL`, optional override falling back to `OPENROUTER_MODEL`
- `COMMANDER_CHAT_MAX_CONTEXT_CHARS`
- `COMMANDER_CHAT_MAX_HISTORY_MESSAGES`
- `COMMANDER_CHAT_MAX_COMPLETION_TOKENS`

No prompt configuration is browser-controlled.
