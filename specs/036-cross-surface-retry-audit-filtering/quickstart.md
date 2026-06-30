# Quickstart: M36 Cross-Surface Retry Audit Filtering

1. Run targeted unit tests:
   - `npm test -- retry-audit-filters`
2. Run browser smoke:
   - `npm run test:e2e -- worker-handoff.spec.ts esi-token-vault-sync.spec.ts command-surfaces.spec.ts`
3. Run the full local gate:
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`

