# Quickstart: OpenRouter Brain

## Environment

Configure server-side variables only:

```sh
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=openai/gpt-5.2
BRAIN_WORKER_CALLBACK_SECRET=...
```

Optional:

```sh
OPENROUTER_APP_URL=https://your-netlify-site.example
OPENROUTER_APP_TITLE=Gryyk-47
OPENROUTER_TIMEOUT_MS=45000
OPENROUTER_MAX_COMPLETION_TOKENS=1800
```

Do not prefix any Brain provider secret with `VITE_`.

## Local Validation

Run deterministic tests without live OpenRouter calls:

```sh
npm test -- brain
npm run typecheck
npm run lint
npm run build
git diff --check
```

## Manual Smoke

1. Start Netlify Dev:

```sh
npm run dev:netlify
```

2. Call the trusted worker endpoint with a local worker secret:

```sh
curl -X POST http://localhost:8888/api/brain-worker/run \
  -H "content-type: application/json" \
  -H "x-worker-callback-secret: $BRAIN_WORKER_CALLBACK_SECRET" \
  -d '{"corporationId":"98123456","workerId":"local-brain","reason":"manual smoke"}'
```

3. Open the command center and verify the latest command brief can show the Brain focus when requested.

## Safety Checks

- Provider key is absent from browser responses and logs.
- Malformed model output fails before storage.
- Recommendations are review-only and do not create queued work or mutate EVE/player state.
