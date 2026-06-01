# Research: Browser Workflow Smoke Tests

## Decision: Use real browser smoke tests outside the Jest Node suite

**Rationale**: M4 moved default validation to Jest in Node to avoid jsdom cost. A separate real-browser command restores UI workflow confidence without making `npm test` slow or dependent on DOM emulation.

**Alternatives considered**:

- Reintroduce jsdom component tests: rejected because it recreates the performance problem that M5 is intended to avoid.
- Use only unit/contract tests: rejected because route composition and browser runtime errors would remain unvalidated.
- Use manual QA only: rejected because command-surface regressions should be reproducible.

## Decision: Use deterministic browser fixtures and request interception

**Rationale**: Browser smoke tests should not need production MongoDB, EVE credentials, or Netlify server secrets. Deterministic local responses make failures repeatable and keep tests safe for CI.

**Alternatives considered**:

- Live MongoDB-backed Netlify Dev: rejected for smoke tests because live data and secrets make the suite harder to run locally and in CI.
- Static screenshot-only checks: rejected because API and runtime error boundaries need assertions, not only images.

## Decision: Cover route-level surfaces rather than exhaustive component states

**Rationale**: The goal is smoke confidence for the command operating surfaces. Contract/unit tests already cover schema, normalizer, and rule behavior. Browser tests should validate that the assembled app renders and preserves visible command boundaries.

**Alternatives considered**:

- Full component-by-component browser coverage: rejected as too broad for this feature and likely to slow local validation.
- Single home-page smoke check: rejected because it would not prove all four merged command surfaces render.

## Decision: Keep default `npm test` as Jest in Node

**Rationale**: Fast validation is valuable for every code change. Browser smoke tests are a separate validation layer and should be opt-in or CI job-specific.

**Alternatives considered**:

- Make browser smoke tests part of `npm test`: rejected because it would require browser binaries and local servers for the default test path.
