# Action 667M.2C — Nanosecond-Safe Trade Preparation Remediation

Implementation date: `2026-07-27`

This Action adds a separately versioned v2 preparation contract. The five
frozen M.2A artifacts remain byte-identical and continue to describe v1.

## Versions

| Concern | Version |
| --- | --- |
| Preparation contract | `market_context_historical_trade_to_candle_preparation_v2` |
| Preparation policy | `market_context_historical_trade_to_candle_policy_2026_07_27_v2` |
| Timestamp representation | `market_context_historical_trade_nanosecond_timestamp_v1` |
| Watermark | `market_context_historical_trade_watermark_2s_nanosecond_v2` |
| Tie-break | `market_context_historical_trade_global_unique_tiebreak_v2` |
| Eligibility | `market_context_historical_trade_eligibility_provider_bounds_v2` |
| Session/calendar | `market_context_xnys_immutable_calendar_artifact_v2` |
| Canonical JSON | `market_context_historical_trade_canonical_json_v2` |
| Sector breadth | `market_context_sector_etf_breadth_v2` |
| M.1 adapter | `market_context_historical_trade_m1_binding_adapter_v2` |
| M.1 receiver extension | `market_context_historical_dataset_nanosecond_extension_v1` |
| Fixtures | `market_context_historical_trade_to_candle_synthetic_fixtures_v2` |

## Nanosecond representation

`ts_event`, `ts_recv`, preparation-as-of, session boundaries and watermark
instants are canonical unsigned decimal strings containing UNIX nanoseconds.
They have no timezone ambiguity and are parsed with `BigInt`; no `Date` or
JavaScript number participates in ordering, bucketing, eligibility or
watermark comparisons.

Human-readable ISO strings are derived only for display after all decisions.
They retain nine fractional decimal places. The exact integer nanoseconds
remain the authoritative value in candles and lineage.

The contract rejects non-canonical integers, values outside the provider
`uint64` domain and the maximum-`uint64` undefined timestamp sentinel.

## Price, size and sequence

- fixed prices are canonical signed-`int64` strings scaled by `1e9`;
- trade preparation requires a positive price for the declared US ETF
  universe;
- `INT64_MAX`/`UNDEF_PRICE` is rejected rather than interpreted as a price;
- size is a positive `uint32`;
- sequence is a `uint32`, including zero;
- aggregate volume is accumulated as an integer and emitted as a decimal
  string.

Only action `T`, mapped safe flags and an empty condition set are accepted.
Corrections, cancels, modifies, unsafe receive/book flags, publisher-specific
semantics and unknown conditions fail the dataset closed.

Official public schema evidence:

- <https://databento.com/docs/schemas-and-data-formats/trades>
- <https://databento.com/docs/standards-and-conventions/common-fields-enums-types>
- <https://databento.com/docs/venues-and-datasets/equs-mini>

No authenticated documentation, API, quote, metadata, entitlement or download
endpoint was used.

## Stable ordering and tie-break

Open and close use:

1. exact event nanoseconds;
2. provider `uint32` sequence;
3. globally unique caller-supplied tie-break identity;
4. raw record identity as a comparator invariant after uniqueness validation.

Every tie-break must be non-empty and unique across the declared dataset.
Missing, reused or conflicting identities reject before aggregation. All
runtime validation is guarded so malformed untyped input returns a
deterministic rejected result instead of throwing.

## Watermark and point-in-time gaps

The finalization watermark remains minute-end plus exactly
`2,000,000,000` nanoseconds. It is versioned and permanently marked
`empirically_unvalidated` until separately approved real evidence exists.

- receive time at watermark is eligible;
- receive time one nanosecond later is late;
- late records are excluded and retain an explicit disposition;
- a late-only finalized bucket receives
  `late_only_bucket_no_eligible_trade`;
- an observed but unfinalized bucket is placed in `pending_buckets`, never
  historical gaps;
- ordinary gaps are emitted only when their watermark is at or before
  preparation-as-of;
- future session minutes are omitted as not yet observable;
- forward-fill is prohibited.

## Immutable XNYS calendar

Sessions are supplied in a versioned XNYS calendar artifact. The artifact
identity, version, explicit nanosecond boundaries and session list are bound to
SHA-256. Any session mutation without a matching artifact digest rejects.
DST and half-days are explicit; no host timezone or implicit calendar lookup
is used.

## Lossless M.1 adapter

`market_context_historical_trade_m1_binding_adapter_v2` requires, rather than
infers:

- dataset/provider product, build and revision;
- decision, ticker, domain and context identities;
- documented provenance, usage rights and acquisition metadata;
- immutable raw-file digest and exact raw-record-to-file/line lineage;
- target normalizer, candle and nanosecond timestamp policies;
- provider source, observation and receive nanoseconds;
- expected rows, coverage minima and quality/missingness policies;
- complete corporate-action, split, dividend and adjustment policy;
- immutable XNYS calendar identity;
- point-in-time and sensitive-identifier attestations;
- supplemental breadth rows and their lineage digest.

Missing or inconsistent metadata returns `not_bindable`. Prepared-result and
candle-lineage digests are reverified by the adapter. The output carries exact
scaled prices and nanoseconds and declares the required additive receiver
extension:

`market_context_historical_dataset_nanosecond_extension_v1`

This is a lossless bridge artifact, not an active canonical binding. The
current M.1 receiver must implement that additive extension in a separate
Action before ingestion.

## Test matrix

The v2 suite covers:

- nanosecond ordering inside one millisecond;
- equal event time, zero sequence and unique tie-break ordering;
- tie-break collision rejection;
- watermark minus/equal/plus one nanosecond;
- malformed runtime input without uncaught exceptions;
- mid-session as-of and observable-only gaps;
- explicit pending and late-only buckets;
- immutable calendar mismatch, DST and half-day boundaries;
- provider numeric boundaries and undefined sentinels;
- input order, duplicate, future and digest-tampering behavior;
- exact eleven-sector breadth with `not_full_market_breadth: true`;
- complete and missing M.1 metadata;
- prepared-output tampering and coverage failure;
- UTC/Stockholm/New York byte determinism;
- forbidden import boundaries.

## Security and activity

- `.env.local` contents were not read; Git reports the path ignored and not
  tracked.
- `DATABENTO_API_KEY` was not read, printed, validated or used.
- Netlify environment variables were not inspected.
- provider/API/quote/entitlement/download calls: `0`
- real data rows: `0`
- real normalization/replay/database/persistence/canonical binding: `0`
- commits/pushes/PR updates/deploys/live effects: `0`

`canonical_binding_ready: false`

`action_667m3_dataset_acquisition_ready: false`
