# Research: Decision List Pagination and Persisted Filters

## Decision: Browser-local persistence only

The current decision list is browser-local filtering over the loaded decision set. Persisting status/source/page-size filters in `localStorage` preserves review context without adding server preference storage or backend filtering semantics.

## Decision: Reset page on filter changes

Changing filters can shrink the result set. Resetting to page 1 avoids empty pages and keeps behavior predictable.

## Decision: Fixed bounded page sizes

Use a small fixed set of page sizes so pagination remains predictable and cannot create oversized DOM lists.
