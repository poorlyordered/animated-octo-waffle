# Validation: People Operating Layer

Date: 2026-06-01

## Results

- `npm run lint` - passed.
- `npm run typecheck` - passed.
- `npm test` - passed, 15 suites and 47 tests in 22.78s with Jest capped at two workers.
- `npm run build` - passed.

## Test Runner Note

The default test runner was moved from Vitest/jsdom to Jest in Node during M4 validation. The suite now covers contracts, normalizers, rules, and boundary logic without a DOM emulator. UI workflow coverage should be added later through browser-level smoke tests rather than reintroducing jsdom as the default path.

## Quickstart

Quickstart flow was validated through contracts, normalizers, route build, and production build. Live MongoDB write-flow validation against `gryyk47_greenfield_test` remains the next validation step when a seeded `member_profiles` record is available in the isolated database.

## Constitution Gates

- Corporation command OS: M4 adds people operating data as a first-class command surface, not a generic chat shell.
- Numbers/opportunity/people model: M4 completes the first people-specific layer while preserving decision and queue links.
- Server-side secrets: MongoDB access remains in Netlify functions and shared server helpers.
- Long-running work: M4 performs request/response reads and follow-up writes only; no sync or AI processing runs in request paths.
- Explicit approval: player-impacting follow-ups require approval text and remain records, not executed actions.
