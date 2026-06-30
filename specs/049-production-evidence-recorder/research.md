# Research: M49 Production Evidence Recorder

## Decision: fixed structured evidence instead of raw notes/log uploads

Rationale: M49 exists to make production readiness evidence durable without expanding the app into a log vault. Fixed check keys and bounded text reduce the chance of storing secrets or production data values.

Rejected alternative: arbitrary JSON evidence payloads. This would make no-secret enforcement brittle and could capture production exports.

## Decision: reuse command auth scope

Rationale: the current product has a server-owned corporation scope plus signed EVE command sessions. M49 can safely scope evidence to that model without adding a new role subsystem mid-slice.

Rejected alternative: browser-supplied operator or corporation identifiers. This would weaken the command boundary and conflict with the existing session model.

## Decision: record posture only

Rationale: production deploy, rollback, provider verification, and live monitoring checks remain operator-run procedures from M46. M49 records their value-free outcome metadata after the fact.

Rejected alternative: app-triggered Netlify, MongoDB, EVE SSO, or monitoring checks. That would introduce external side effects and secret handling beyond this slice.
