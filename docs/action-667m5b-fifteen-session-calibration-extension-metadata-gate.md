# Action 667M.5B — Fifteen-session calibration extension metadata gate

This Action completed a metadata-only Databento gate for the fixed candidate
scope `[2026-06-26T00:00:00Z, 2026-07-20T00:00:00Z)`. It created no batch,
made no timeseries-record request, downloaded no file, and incurred no
provider data purchase.

## Decision

- `action_667m5b_metadata_gate_completed: true`
- `action_667m5b_entitlement_verified: true`
- `action_667m5b_exactly_fifteen_sessions_verified: true`
- `action_667m5b_all_sessions_available: true`
- `action_667m5b_exact_quote_available: true`
- `action_667m5c_calibration_batch_submission_ready: true`
- `batch_submission_authorized: false`
- `download_authorized: false`
- `normalization_authorized: false`
- `replay_authorized: false`
- `canonical_binding_ready: false`

Here, M.5C readiness means only that the fixed package is eligible for a
separate operator submission decision. A future M.5C must refresh quote and
entitlement no more than 900 seconds before submission. It must not reuse this
snapshot as a submission-time quote.

## Authoritative XNYS inventory

NYSE's 2026 calendar and official holidays/hours page establish exactly these
fifteen core sessions:

`2026-06-26`, `2026-06-29`, `2026-06-30`, `2026-07-01`, `2026-07-02`,
`2026-07-06`, `2026-07-07`, `2026-07-08`, `2026-07-09`, `2026-07-10`,
`2026-07-13`, `2026-07-14`, `2026-07-15`, `2026-07-16`, and `2026-07-17`.

The exchange is closed on `2026-07-03` for Independence Day observed. All
fifteen included sessions are regular 09:30–16:00 ET sessions, represented
as 13:30–20:00 UTC. The immutable calendar artifact records source URLs,
retrieval date, downloaded-source SHA-256 values, explicit UTC instants, and
its canonical digest.

Databento's condition endpoint returned `available` for `2026-07-03`. That
condition is dataset-service metadata, not an exchange-session authority.
The day is therefore retained as a transparent non-session discrepancy and
is not counted among the fifteen XNYS sessions.

## Provider metadata result

The range-less catalog contained exact ASCII `EQUS.MINI`. Dataset entitlement
covered the complete candidate range. Exact `trades` schema membership,
publisher `95`, and all thirteen requested raw symbols were verified. There
were no partial or unresolved symbols. All fifteen calendar-authoritative
sessions returned condition `available`; none was degraded, partial, missing,
or unknown.

The authenticated snapshot used 54 calls:

- one range-less dataset catalog;
- one schema catalog;
- one publisher catalog;
- one dataset range;
- one condition request;
- one symbology resolution;
- sixteen each of record-count, billable-size, and cost estimates (one
  aggregate plus fifteen daily).

No automatic retry was requested. Full catalogs, provider instrument IDs,
credential material, account/billing/request/job identifiers, and raw records
were not persisted.

## Quote and hard caps

| Measure | Provider estimate | Future hard stop | Result |
| --- | ---: | ---: | --- |
| Records | 1,903,887 | informational | available |
| Billable DBN | 91,386,576 bytes (87.153 MiB) | 128 MiB | pass |
| Cost | USD 0.510662287474 | USD 0.75 | pass |
| Compressed transfer | not exposed before batch | 64 MiB | deferred post-submission |
| Local total | not calculable before file manifest | 2 GiB | deferred post-submission |

The fifteen daily estimates reconcile exactly to aggregate records and
billable bytes. Daily cost differs from the aggregate by approximately
USD `0.000000000002`, consistent with endpoint-level decimal rounding.

## Five-session comparison

The verified five-session pilot had 516,162 records, 24,775,776 billable
bytes, and actual cost USD 0.1384454369545. Its averages were 103,232.4
records, 4,955,155.2 billable bytes, and USD 0.0276890873909 per session.

The candidate averages are 126,925.8 records, 6,092,438.4 billable bytes, and
USD 0.0340441524984 per session—approximately 1.2295 times the pilot averages.
The highest candidate estimate is June 26 at 151,216 records; July 2 is close
at 150,760. The lowest is July 10 at 98,971. None approaches the fixed cost or
billable-size cap.

Symbol, publisher, schema, encoding, and raw-unadjusted policy are identical
to the pilot. Corporate actions remain excluded.

## License and next boundary

The M.3D frozen decision remains sufficient for internal non-display use,
indefinite raw and derived-evidence retention, encrypted backup, organization
scope, and offline replay. Redistribution remains prohibited. No new legal
inference was made.

The exact inactive M.5C authorization phrase is stored in the machine-readable
evidence. Even if later activated, it authorizes one batch submission only;
market-data download remains a separate decision after manifest, transfer, and
local-size admission.

## Evidence

- Calendar:
  `docs/evidence/market-context-xnys-calibration-calendar-2026-v1.json`
- Metadata gate:
  `docs/evidence/action-667m5b-calibration-extension-metadata-gate.json`
- Scope digest:
  `a06af7191b00fc024f0b11757894764995f1e76d8aa82a31bc9cf9b2a06b1c20`
- Quote digest:
  `7afc4ee2400f2448996ba623fc4805cf210ff9a03c17dfacb77fca49e4ca4eab`
- Evidence digest:
  `7e6a22ba285bb48c02f4de300137b8651ea791d56fd11ac7d3965a396f6faf6b`
