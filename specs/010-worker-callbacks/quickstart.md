# Quickstart: Worker Handoff Callbacks

## Local setup

Configure the server-side worker callback secret:

```text
WORKER_CALLBACK_SECRET=local-worker-secret
```

Prepare at least one ready worker handoff through the existing commander flow:

```bash
npm run dev:netlify
```

Use the existing automation queue UI or API to prepare a handoff for an eligible queue item.

## Worker callback flow

List ready handoffs:

```bash
curl -H "x-worker-callback-secret: local-worker-secret" \
  "http://localhost:8888/api/worker-handoffs?status=ready"
```

Claim a handoff:

```bash
curl -X POST \
  -H "content-type: application/json" \
  -H "x-worker-callback-secret: local-worker-secret" \
  -d '{"workerId":"overnightdesk-worker-1"}' \
  "http://localhost:8888/api/worker-handoffs/HANDOFF_ID/claim"
```

Report progress:

```bash
curl -X POST \
  -H "content-type: application/json" \
  -H "x-worker-callback-secret: local-worker-secret" \
  -d '{"workerId":"overnightdesk-worker-1","message":"Fetched source documents","code":"sources_fetched"}' \
  "http://localhost:8888/api/worker-handoffs/HANDOFF_ID/progress"
```

Complete a handoff:

```bash
curl -X POST \
  -H "content-type: application/json" \
  -H "x-worker-callback-secret: local-worker-secret" \
  -d '{"workerId":"overnightdesk-worker-1","summary":"Prepared safe output summary","artifactRefs":["brief:abc123"]}' \
  "http://localhost:8888/api/worker-handoffs/HANDOFF_ID/complete"
```

Fail a handoff:

```bash
curl -X POST \
  -H "content-type: application/json" \
  -H "x-worker-callback-secret: local-worker-secret" \
  -d '{"workerId":"overnightdesk-worker-1","message":"Source data unavailable","code":"source_unavailable"}' \
  "http://localhost:8888/api/worker-handoffs/HANDOFF_ID/fail"
```

Expected result: callbacks update handoff status and safe audit metadata only. They do not dispatch workers, retry work, call EVE APIs, mutate external services, or expose callback secrets.

## Validation

Run these before merging:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Results

- `npm run lint`: passed on 2026-06-02
- `npm run typecheck`: passed on 2026-06-02
- `npm test`: passed on 2026-06-02; 28 suites, 115 tests
- `npm run test:e2e`: passed on 2026-06-02; 17 Chromium browser smoke tests
- `npm run build`: passed on 2026-06-02
