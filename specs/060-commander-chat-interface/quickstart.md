# Quickstart: Commander Chat Interface

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Configure server-side provider variables for local Netlify functions:

   ```sh
   OPENROUTER_API_KEY=...
   COMMANDER_CHAT_PROMPT_VERSION=commander-chat/v1
   ```

3. Start Netlify Dev:

   ```sh
   npm run dev:netlify
   ```

## Validation scenarios

### Scenario 1: Ask about latest refresh

1. Sign in with an authorized EVE session or use controlled local fallback.
2. Open Commander Chat.
3. Ask: "What changed after the latest intelligence refresh?"
4. Verify the response cites the latest refresh run and command brief when available.
5. Verify missing data is explicit when fixtures omit a domain.

### Scenario 2: Durable transcript

1. Send a chat message.
2. Reload the app.
3. Reopen the recent chat session.
4. Verify prior user and assistant messages remain visible with citations and prompt version metadata.

### Scenario 3: Draft decision

1. Ask: "Draft a decision from the latest refresh recommendation."
2. Verify the assistant response includes a draft Decision Record.
3. Click the explicit create action.
4. Verify a proposed Decision Record is created and no queue/work execution happens.

## Quality gate

```sh
npm test -- commander-chat
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
git diff --check
```
