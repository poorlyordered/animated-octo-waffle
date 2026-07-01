# Research: OpenRouter Brain

## Decision: Use OpenRouter Chat Completions Via Fetch

Use direct `fetch` against `https://openrouter.ai/api/v1/chat/completions` instead of adding an SDK dependency.

**Rationale**: OpenRouter documents the direct API as a standard HTTP POST to `/api/v1/chat/completions`, authenticated with an Authorization bearer token. The repo already runs on Node 22 where `fetch` is available, and avoiding a new dependency keeps the first provider adapter small and auditable.

**Source**: OpenRouter chat completion reference, `https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request`

**Alternatives considered**:

- `@openrouter/sdk`: useful but adds supply-chain and install surface for a thin HTTP call.
- OpenAI SDK pointed at OpenRouter: helpful for migrations, but this repo has no existing OpenAI SDK dependency to reuse.

## Decision: Require Structured JSON Output And Validate Again Locally

Send `response_format` with `type: json_schema`, `strict: true`, and a Brain output schema. Parse and validate the returned message content again with local Zod schemas before storage.

**Rationale**: OpenRouter documents structured outputs as a way to enforce JSON Schema responses and recommends strict mode. Security guidance still requires treating all model output as untrusted input, so local validation remains mandatory.

**Source**: OpenRouter structured outputs guide, `https://openrouter.ai/docs/guides/features/structured-outputs`

**Alternatives considered**:

- Free-form Markdown output: easier to prompt but unsafe for automated command surfaces.
- Provider-only schema enforcement: useful but insufficient as a trust boundary because provider responses can fail, be malformed, or change.

## Decision: Store Brain Output As Compatible Research Briefs

Persist validated Brain output into `research_briefs` using the existing command brief document shape and record lifecycle state in `research_requests` with focus `gryyk-47-brain`.

**Rationale**: The current UI, contracts, and command brief normalizer already display model, prompt version, source references, confidence, recommendations, watchlist, and coverage. Reusing that shape gives immediate commander value without a parallel UI.

**Alternatives considered**:

- New `brain_outputs` collection only: cleaner separation but no immediate command-surface integration.
- Direct UI-only response: violates durable AI provenance and long-running boundaries.

## Decision: Brain Worker Is A Trusted Callback Class

Add `brain_worker` as a class-specific worker callback secret with fallback to `WORKER_CALLBACK_SECRET`.

**Rationale**: Existing worker endpoints use class-specific callback secrets to isolate worker types. Brain execution carries provider cost and prompt/context risk, so it should be explicitly scoped.

**Alternatives considered**:

- Commander-triggered browser POST: would risk long request/response LLM calls and accidental cost exposure.
- Reusing another worker class: obscures operations readiness and secret rotation.

## Decision: First Prompt Context Is Bounded And Derived

Collect compact snapshots from existing command data rather than passing raw database records or secrets into the model.

**Rationale**: The constitution requires source data, prompt metadata, confidence, and timestamps while keeping secrets out of prompts. Bounded derived context reduces prompt-injection impact and token/cost exposure.

**Alternatives considered**:

- Full raw document prompts: higher fidelity but increased leakage and token risk.
- No context beyond latest brief: insufficient to be the application Brain across numbers, opportunity, and people.
