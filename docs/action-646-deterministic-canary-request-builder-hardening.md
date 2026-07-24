# Action 646: Deterministic Canary Request Builder Hardening

## Contract

`scripts/action-643-scheduled-dry-run-request-builder.mjs` is the version-controlled, pure request constructor for the one Action 643 scheduled dry-run shape. The caller supplies both the current deployment commit and the expected deployment commit; the builder accepts only matching lowercase 40-character Git SHAs.

The builder accepts only the exact Action 643 market contract: UTC date `2026-07-24`, AAPL, `5min`, the `13:30:00.000Z` to `14:00:00.000Z` window, cadence `regular_session_30m_1400Z`, policy `377 / 57 / 320`, and `dry_run` execution mode. It requires an explicit canonical UTC cutoff observation at or after the window end.

## Identity Model

The canonical payload is deterministic. Its occurrence identifier follows the scheduled admission occurrence derivation, while the request fingerprint is a SHA-256 digest of the complete canonical payload. The same normalized input always has the same payload, occurrence identifier, and fingerprint. A stale commit, changed window, or changed cadence is rejected rather than normalized into a different request.

## Safety Boundaries

The builder has no transport, route, credential, environment, persistence, provider, claim, audit, ledger, or Netlify integration. It never sends a request. It cannot select a live or mutation-capable mode.

## Action 645 Handoff

Action 645 now constructs and validates this local contract as its builder inspection step. It does not execute the payload and no longer relies on the temporary `/tmp/ture-action-643-build-request.cjs` file. A `preflight_ready` result remains only a prerequisite for separately authorized Action 643 execution.
