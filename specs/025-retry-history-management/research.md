# Research: Retry History Management

## Decision: Reuse `retry_requests`

Retry attempts are already persisted as independent target-scoped records. A separate history collection would duplicate existing status and result data without adding audit value.

## Decision: Preserve latest `retry`

Current UI and contracts rely on a single latest retry. M25 keeps that field and adds `retryHistory` as optional additive data.

## Decision: Bound history at the store helper

The API only needs recent audit context. Bounding the query prevents large browser payloads and keeps route behavior predictable.

## Decision: No new mutations

Retry history management for M25 means inspection and audit visibility only. Rescheduling and policy controls remain future candidates.
