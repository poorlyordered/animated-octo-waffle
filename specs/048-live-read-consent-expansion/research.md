# Research: M48 Live Read Consent Expansion

## Decision: Expand consent domains before execution workers

Rationale: The roadmap asks for read-consent planning after production operations posture is documented. Adding domain summaries and queued request preparation lets commanders see future read paths while preserving no-execution boundaries.

Alternatives considered:

- Add People/Opportunity ESI workers immediately: rejected because worker execution needs separate contracts, ingestion normalization, and tests.
- Keep Numbers-only consent until workers exist: rejected because future worker features need consent/domain contracts first.

## Decision: Restrict worker execution to Numbers

Rationale: The existing ESI sync worker runs Numbers ingestion. Once additional domains are valid, leaving the worker unbounded would risk accidental execution against unsupported domains.

Alternatives considered:

- Let worker run all domains through the Numbers ingestion path: rejected as incorrect and unsafe.
- Hide non-Numbers queued requests from all APIs: rejected because browser planning should still surface prepared records.
