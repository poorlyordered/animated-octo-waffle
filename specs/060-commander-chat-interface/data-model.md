# Data Model: Commander Chat Interface

## Commander Chat Session

- `id`: stable chat session id
- `corporationId`: server-resolved corporation scope
- `commander`: safe signed-session attribution, if present
- `title`: short safe title derived from first user message or server default
- `status`: `active` or `archived`
- `messageCount`: bounded summary count
- `lastMessageAt`: latest message timestamp
- `createdAt`: session creation timestamp
- `updatedAt`: latest update timestamp

Validation:

- `corporationId` is never accepted from browser input.
- `title` is sanitized and bounded.
- Sessions are listed only for the resolved command scope.

## Commander Chat Message

- `id`: stable message id
- `sessionId`: parent chat session id
- `corporationId`: server-resolved corporation scope
- `role`: `user`, `assistant`, or `system_notice`
- `content`: safe text content
- `parts`: optional AI SDK-compatible browser-safe parts
- `metadata`: role-specific safe metadata
- `createdAt`: message timestamp

Assistant metadata:

- `promptVersion`
- `provider`
- `model`
- `citations`
- `confidence`
- `missingData`
- `draftDecision`
- `boundary`
- `finishReason`
- `warnings`

Validation:

- Messages reject unsafe material patterns before storage and browser response.
- Stored message history is revalidated before model submission.
- Raw provider payloads, token values, cookies, JWTs, connection strings, and raw prompts with sensitive values are not stored.

## Commander Chat Citation

- `sourceType`: `command_brief`, `intelligence_refresh_run`, `numbers_snapshot`, `opportunity`, `people`, `decision_record`, `automation_queue`, `operations_health`, `production_evidence`, or `missing_data`
- `sourceId`: safe source identifier when available
- `label`: browser-safe source label
- `summary`: bounded source summary
- `createdAt`: source timestamp when available
- `freshness`: `current`, `stale`, `missing`, or `unknown`

Validation:

- Citations are derived from server-read command context, not browser-provided ids alone.
- Missing-data citations are explicit when no source can support a claim.

## Commander Chat Context Snapshot

- `corporationId`
- `generatedAt`
- `sources`
- `summary`
- `warnings`
- `limits`

Validation:

- Context is bounded by source count, text length, and recent-record limits.
- Context excludes secrets, raw ESI payloads, raw provider payloads, and execution handles.

## Draft Decision Record

- `title`
- `rationale`
- `expectedResult`
- `sourceContext`
- `playerImpacting`
- `approvalRequired`
- `sourceMessageId`
- `status`: always proposed before explicit creation

Validation:

- Drafts cannot include queue creation, dispatch, execution, EVE write, role/access/standing mutation, wallet/asset/contract mutation, deploy, rollback, or external-service mutation fields.
- Creating a Decision Record from a draft requires a separate explicit POST and revalidates the source message and scope.
