# Research: Commander Chat Interface

## Decision: Use AI SDK Core for server-side generation

**Rationale**: The user explicitly selected AI SDK Core. It provides `streamText`, model/provider abstraction, and UI stream compatibility while keeping model calls in Netlify functions.

**Alternatives considered**: Continue the existing hand-rolled fetch OpenRouter adapter. Rejected because the chat UI benefits from the AI SDK stream protocol and typed UI integration.

## Decision: Use AI SDK UI for React chat state

**Rationale**: The user explicitly selected AI SDK UI. `useChat` and `DefaultChatTransport` fit the React command-center surface and support streamed message rendering against a custom API endpoint.

**Alternatives considered**: Build a custom polling/fetch chat state hook. Rejected because it would duplicate transport semantics that AI SDK UI already provides.

## Decision: Use `@openrouter/ai-sdk-provider` for OpenRouter

**Rationale**: Official AI SDK documentation lists OpenRouter as a community provider through `@openrouter/ai-sdk-provider`, giving a provider-native path into AI SDK Core while keeping `OPENROUTER_API_KEY` server-side.

**Alternatives considered**: Use the existing fetch adapter. Rejected for M60 chat because the provider package reduces custom protocol code for streaming chat.

## Decision: Persist durable chat sessions/messages in MongoDB

**Rationale**: Gryyk-47 already uses MongoDB for command records, Brain lifecycle, refresh runs, decisions, and evidence. Durable chat should share server-resolved corporation scoping and inspectable records.

**Alternatives considered**: Browser localStorage or file-backed persistence. Rejected because chat must be durable, scoped, and auditable across sessions.

## Decision: Separate `commander-chat/v1` prompt version

**Rationale**: Chat has a different purpose than Brain evaluation. A separate prompt version allows independent tuning and audit without changing refresh-run Brain output semantics.

**Alternatives considered**: Reuse Brain prompt version. Rejected because chat is conversational, citation-oriented, and draft-decision oriented rather than a command brief generator.

## Decision: Draft Decision Records are review-only until explicit creation

**Rationale**: The constitution requires human command authority and explicit approval for player-impacting actions. Chat can help draft a decision but must not silently create or approve operational artifacts.

**Alternatives considered**: Auto-create proposed decisions from assistant responses. Rejected because it blurs the line between model output and commander intent.
