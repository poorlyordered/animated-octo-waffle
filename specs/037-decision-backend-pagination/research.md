# Research: M37 Decision Backend Pagination

## Decision: Keep page sizes bounded to existing options

**Rationale**: The browser already exposes 3, 5, and 10 as safe review sizes. Reusing them avoids unbounded API reads.

## Decision: Clamp page requests

**Rationale**: Clamping keeps stale browser page values recoverable after filters reduce result counts.

## Decision: Keep count metadata in the list response

**Rationale**: The browser needs total items/pages to render navigation without loading the full result set.

