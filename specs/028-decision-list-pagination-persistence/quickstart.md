# Quickstart: Decision List Pagination and Persisted Filters

1. Open the decision loop with more decisions than the selected page size.
2. Confirm the first page shows a bounded set of decisions and a range summary.
3. Move to the next page and back.
4. Change status/source filters and confirm the page resets to 1.
5. Change page size and reload the page.
6. Confirm status/source/page-size selections persist from browser local storage.
7. Run validation:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test -- decision-list-filters decision-record-api`
   - `npm test -- --maxWorkers=2`
   - `npm run test:e2e`
   - `npm run build`
