# Implementation Plan: M41 Commander Authorization Policy

**Branch**: `041-commander-authorization-policy` | **Date**: 2026-06-30 | **Spec**: `specs/041-commander-authorization-policy/spec.md`

## Summary

Add explicit corporation authorization to command scope resolution. Signed EVE sessions remain preferred when authorized, no-session fallback remains available for development, and signed sessions from another corporation become safe unauthorized states instead of gaining command data access.

## Constitution Check

- Command simulation: protects command surfaces from cross-corporation session confusion.
- Three-leg model: applies shared scope policy across Numbers, Opportunity, People, Decision, and Automation APIs.
- Automation auditability: does not add worker execution or alter queue/retry behavior.
- Human authority: preserves explicit user authority and rejects unauthorized session identity.
- Durable architecture: centralizes policy in auth scope helpers and contracts, with focused tests.

## Technical Context

- Scope helper: `netlify/functions/_shared/auth-scope.ts`.
- Session contracts: `packages/contracts/src/auth-session.ts` and schema.
- Browser status: `apps/web/src/features/session/components/SessionStatus.tsx`.
- Command API error handling: safe 403 responses for auth policy failures.
- Validation: targeted auth/session/API tests plus full local gate.

## Design

- Add an unauthorized session state to the session contract.
- Add an auth-scope error type and helper response for unauthorized command API calls.
- Require signed session corporation id to match `EVEONLINE_CORPORATION_ID`.
- Preserve fallback only when no valid session exists.
- Update command API handlers that resolve command scope to return 403 for mismatched signed sessions.

## Validation

- `npm test -- auth-scope eve-session-api decision-record-api`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `git diff --check`
