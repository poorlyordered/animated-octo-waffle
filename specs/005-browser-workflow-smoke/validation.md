# Validation: Browser Workflow Smoke Tests

Date: 2026-06-01

## Results

- `npm run lint` - passed.
- `npm run typecheck` - passed.
- `npm test` - passed, 16 suites and 50 tests in 18.02s.
- `npm run test:e2e` - passed, 7 browser smoke tests in 11.2s.
- `npm run build` - passed.

## Browser Smoke Coverage

The browser smoke suite runs with Playwright Chromium against a local Vite preview server and deterministic request interception. It covers:

- Command brief rendering with executive summary, recommendation, and operating model coverage.
- Decision records rendering with selected detail and player-impacting approval boundary.
- Automation queue rendering with queued work detail and no-execution language.
- People operating layer rendering with member profile, leadership follow-up, and no role/access/EVE mutation language.

## Setup Notes

`npm run test:e2e` requires Chromium for Playwright. If missing locally, run:

```bash
npx playwright install chromium
```

In the Codex sandbox, the browser test command requires elevated execution because the local Vite preview server binds to `127.0.0.1:4173`.

## Constitution Gates

- Command simulation: browser checks validate command surfaces rather than adding chat-first behavior.
- Three operating legs: command brief, decision, queue, and people surfaces are covered.
- Automation with auditability: queue tests assert queued-work language without dispatch or execution claims.
- Human command authority: player-impacting decision and people follow-up boundaries remain visible.
- Durable architecture: browser validation is separate from Jest Node tests and uses deterministic local fixtures without server secrets.
