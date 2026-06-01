# Contract: Browser Smoke Validation

## Commands

### `npm test`

Purpose: Run fast Node-safe contract and unit tests.

Expected behavior:

- Runs Jest in Node.
- Does not require browser binaries.
- Does not require jsdom.
- Does not require MongoDB, EVE, or Netlify secrets.

### `npm run test:e2e`

Purpose: Run browser smoke validation for command operating surfaces.

Expected behavior:

- Starts or targets the local web app.
- Runs in a real browser.
- Uses deterministic fixtures or request interception for `/api/*` routes.
- Fails on browser console errors, page errors, failed fixture-backed API requests, missing landmarks, blank command surfaces, and forbidden execution language.

## Required Smoke Coverage

Each browser smoke run must validate:

- Command brief surface:
  - Gryyk-47 command brief heading
  - status or summary section
  - operating leg coverage
- Decision records surface:
  - decision record heading/list
  - decision status detail
  - player-impacting approval boundary when relevant
- Automation queue surface:
  - queue heading/list
  - queued work detail
  - no dispatch/execution success language
- People surface:
  - member profile heading/list
  - leadership follow-up detail/list
  - no role/access/EVE mutation success language

## Failure Diagnostics

Browser smoke failures should report:

- Scenario name
- Page URL
- Missing expected landmark or forbidden visible text
- Browser console errors
- Failed network request URL and status
- Screenshot or trace reference when available
