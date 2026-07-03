# Feature Specification: OpenRouter Brain

**Feature Branch**: `056-openrouter-brain`

**Created**: 2026-07-01

**Status**: Complete

**Input**: User description: "We need to actually build the Brain for this application. lets use openrouter"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Produce Command Intelligence (Priority: P1)

A commander can request a Brain run that turns current corporation context into structured command intelligence covering numbers, opportunity, and people, with model, prompt, confidence, source, and timestamp provenance preserved for inspection.

**Why this priority**: Gryyk-47 needs a real AI reasoning loop rather than only displaying pre-existing processed briefs.

**Independent Test**: Can be tested by invoking a server-side Brain run with deterministic context and a mocked model response, then verifying the stored intelligence appears through the existing command brief flow.

**Acceptance Scenarios**:

1. **Given** valid corporation context and Brain provider configuration, **When** a trusted worker requests a Brain run, **Then** the system stores a structured command brief with recommendations, watchlist, missing data, confidence, model, prompt version, source references, and created timestamp.
2. **Given** an unavailable Brain provider, **When** a trusted worker requests a Brain run, **Then** the system records a failed research request status without exposing provider secrets or internal stack traces.

---

### User Story 2 - Preserve Commander Authority (Priority: P2)

A commander can read Brain recommendations as observations, recommendations, or draft orders without the Brain executing EVE actions, moving assets, changing roles, dispatching workers, or mutating external services.

**Why this priority**: The application is a command operating system, and automated reasoning must not become unauthorized action.

**Independent Test**: Can be tested by supplying model output that suggests player-impacting work and verifying it is stored only as reviewable recommendations or draft orders.

**Acceptance Scenarios**:

1. **Given** model output that proposes wallet, asset, role, standings, or player-impacting work, **When** the output is normalized, **Then** the stored result marks it as recommendation or draft order requiring explicit approval.
2. **Given** model output that includes unsupported executable instructions, **When** the output is normalized, **Then** unsafe execution fields are ignored or rejected and no queue dispatch occurs.

---

### User Story 3 - Inspect Brain Readiness (Priority: P3)

An operator can verify whether the Brain is configured and healthy without seeing API keys, raw prompts containing sensitive values, or provider internals.

**Why this priority**: Production use needs clear operational status before commanders depend on AI output.

**Independent Test**: Can be tested by checking the health/status surface with and without Brain environment variables and with recent success/failure records.

**Acceptance Scenarios**:

1. **Given** missing provider configuration, **When** an operator views operations health, **Then** Brain readiness is shown as blocked with missing variable names only.
2. **Given** recent Brain run records, **When** an operator views operations health, **Then** the surface shows last run status, model, prompt version, and safe error category without secret values.

### Operating Model Alignment

- **Numbers**: Brain output must incorporate measurable corporation health and identify missing or stale numbers inputs.
- **Opportunity**: Brain output must identify strategic opportunities, risks, and timing windows from stored opportunity intelligence.
- **People**: Brain output must account for member, delegation, onboarding, trust, and follow-up context when available.
- **Decision Boundary**: Brain outputs are observations, recommendations, and draft orders only.
- **Automation Boundary**: Trusted worker initiated, stored for review, no direct browser execution, no autonomous player-impacting action.

### Edge Cases

- Provider credentials are missing or invalid.
- Provider response is malformed, empty, unstructured, too large, or contradicts the requested output format.
- Model output attempts prompt injection, secret exfiltration, direct execution, unsupported queue dispatch, or unsafe HTML/script content.
- Available source context is stale, partial, or absent for one or more operating legs.
- Multiple Brain runs are requested close together for the same corporation.
- Provider rate limits, timeouts, or transient failures occur.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST keep OpenRouter credentials server-side only and MUST NOT expose them through browser responses, logs, stored prompt records, or client configuration.
- **FR-002**: System MUST allow a trusted server-side worker pathway to request a Brain run for a corporation.
- **FR-003**: System MUST collect bounded, browser-safe corporation context from existing numbers, opportunity, people, decision, queue, and research status data before requesting model output.
- **FR-004**: System MUST send a prompt that asks for structured command intelligence across numbers, opportunity, and people and explicitly separates observations, recommendations, missing data, and draft orders.
- **FR-005**: System MUST validate model output against a strict structured schema before storing it.
- **FR-006**: System MUST reject or safely mark invalid model output instead of displaying or executing unvalidated output.
- **FR-007**: System MUST store accepted Brain output with model, prompt version, provider, source references, confidence, created timestamp, and safe failure/status metadata.
- **FR-008**: System MUST make accepted Brain output available through the existing command brief surface or a compatible command intelligence read surface.
- **FR-009**: System MUST record Brain request lifecycle status including pending, running, completed, failed, and blocked states.
- **FR-010**: System MUST prevent Brain output from directly creating queued work, dispatching workers, mutating EVE state, changing access/roles/standings, moving assets, or calling external services.
- **FR-011**: System MUST include operations readiness checks for provider configuration and recent Brain run health without revealing secret values.
- **FR-012**: System MUST provide deterministic tests that exercise success, malformed output, missing configuration, and provider failure paths without making live OpenRouter calls.

### Key Entities *(include if feature involves data)*

- **Brain Run**: A lifecycle record for a model reasoning attempt, including corporation scope, status, prompt version, provider/model metadata, source references, timestamps, and safe error category.
- **Brain Prompt Context**: The bounded source material supplied to the model, derived from existing command data and excluding secrets, tokens, raw credentials, and unsafe execution handles.
- **Brain Output**: Validated structured command intelligence containing observations, recommendations, watchlist items, missing data, confidence, and draft orders requiring commander approval.
- **Provider Configuration**: Server-owned OpenRouter settings such as API key, model, base URL, app attribution, timeout, and token budget.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A trusted worker can complete a Brain run and produce commander-visible structured intelligence in under 60 seconds using test fixtures.
- **SC-002**: 100% of accepted Brain outputs include model, prompt version, source reference, confidence, and created timestamp metadata.
- **SC-003**: 100% of malformed or unsafe model outputs are rejected or marked failed before they reach commander-facing recommendations.
- **SC-004**: Operations health identifies missing Brain configuration by variable name only and never shows secret values.
- **SC-005**: Existing command brief tests continue to pass while Brain-generated briefs remain compatible with current command surfaces.

## Assumptions

- Brain execution is a trusted worker/server pathway, not a direct browser action.
- OpenRouter is the first Brain provider, but provider access should be isolated behind an adapter so future providers can be added.
- The first production model can be configured by environment variable with a conservative default documented for local development.
- Existing MongoDB collections remain the source of truth for command data and Brain output persistence.
- Live provider calls are not required in automated tests; provider behavior is mocked or stubbed.
