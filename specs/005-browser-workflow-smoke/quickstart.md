# Quickstart: Browser Workflow Smoke Tests

## Prerequisites

- Node dependencies are installed.
- Chromium is installed for Playwright.
- No MongoDB, EVE, Netlify, or production secrets are required for browser smoke validation.

Install the browser binary if needed:

```bash
npx playwright install chromium
```

## Validation Flow

1. Run fast Node validation:

   ```bash
   npm test
   ```

2. Run browser smoke validation:

   ```bash
   npm run test:e2e
   ```

3. Optional: run browser smoke validation with the interactive UI:

   ```bash
   npm run test:e2e:ui
   ```

4. Confirm the browser smoke output includes command brief, decision records, automation queue, and people scenarios.
5. Confirm failures include a scenario name and useful browser diagnostics.
6. Confirm the validation artifact records the commands and results.

## Expected Result

The default Jest suite remains fast and DOM-free. The browser smoke suite validates the assembled command operating surfaces in a real browser using deterministic local data, without requiring production credentials or live external services.
