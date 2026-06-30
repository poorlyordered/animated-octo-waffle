# Research: M41 Commander Authorization Policy

## Decision: Enforce corporation match before using signed session scope

Rationale: The current command data is scoped by a server-owned corporation id. A valid signed EVE session from a different corporation must not become an alternate data scope or silently fall back to the configured corporation. Returning unauthorized is the safest behavior.

Alternatives considered:

- Trust any signed session corporation: rejected because it can expose data for an unconfigured corporation if records exist.
- Fall back when session corporation mismatches: rejected because a signed-in user from another corporation would still see configured command data.

## Decision: Preserve no-session fallback

Rationale: Local development and deterministic tests rely on `EVEONLINE_CORPORATION_ID` when no session exists. That fallback remains safe because it is server-owned and not browser-controlled.

Alternatives considered:

- Require sessions everywhere: rejected because it would break established local/test workflows and should be a later deployment policy choice.
