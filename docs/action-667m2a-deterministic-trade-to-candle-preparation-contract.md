# Action 667M.2A — Deterministic Trade-to-Candle Preparation Contract

Implementation date: `2026-07-27`

`action_667m2a_trade_to_candle_contract_implemented: true`

This Action implements a synthetic-only, offline preparation boundary. It
does not authorize or perform provider traffic, data acquisition, downloads,
normalization of real data, replay, persistence, database access, performance
measurement, canonical binding, or live integration.

## Versions

| Concern | Version |
| --- | --- |
| Contract | `market_context_historical_trade_to_candle_preparation_v1` |
| Preparation policy | `market_context_historical_trade_to_candle_policy_2026_07_27_v1` |
| Watermark | `market_context_historical_trade_watermark_2s_v1` |
| Eligibility | `market_context_historical_trade_eligibility_strict_v1` |
| Session policy | `market_context_xnys_explicit_session_calendar_v1` |
| Canonical JSON | `market_context_historical_trade_canonical_json_v1` |
| Separate breadth | `market_context_sector_etf_breadth_v1` |
| Fixtures | `market_context_historical_trade_to_candle_synthetic_fixtures_v1` |

The two-second watermark is a versioned lab policy, not a provider latency
claim or SLA. Changing it requires a new policy version and separate review.

## Official schema evidence

Only public provider documentation was consulted:

- Databento Trades schema:
  <https://databento.com/docs/schemas-and-data-formats/trades>
- Common fields, actions, flags, and timestamps:
  <https://databento.com/docs/standards-and-conventions/common-fields-enums-types>
- EQUS.MINI dataset semantics:
  <https://databento.com/docs/venues-and-datasets/equs-mini>

The reviewed schema documents:

- `ts_event` as matching-engine/event time;
- `ts_recv` as Databento capture receive time;
- scaled `int64` price, `uint32` size, and `uint32` sequence;
- action `T` for records in the Trades schema;
- flags including `F_BAD_TS_RECV`, `F_MAYBE_BAD_BOOK`, and
  `F_PUBLISHER_SPECIFIC`;
- EQUS.MINI sequence as always zero.

Because EQUS.MINI sequence cannot resolve equal-time records, this contract
requires a caller-supplied stable `tie_break_id` bound into the raw record
digest. The reviewed Trades schema does not expose a general sale-condition
field, so v1 permits no inferred condition mapping.

No authenticated provider endpoint, catalog query, quote endpoint, API key, or
token was used.

## Input schema

The manifest binds:

- provider, dataset, dataset version, schema, and schema version;
- exact symbol universe;
- explicit preparation-as-of instant;
- watermark and eligibility policy versions;
- explicit XNYS session records and calendar version;
- corporate-action policy and adjustment state;
- immutable digest of all declared raw record descriptors.

Each trade requires:

- matching provider/dataset/schema identity;
- symbol;
- explicit event and receive instants;
- finite positive price;
- positive safe-integer size;
- `uint32` sequence;
- stable `tie_break_id`;
- stable raw source position;
- action and flags;
- an explicitly empty conditions array under v1;
- raw record identity and canonical SHA-256.

Naive timestamps, mixed datasets, undeclared symbols, non-finite numbers,
tampered digests, duplicate identities, and future event/receive instants fail
closed before any candle is emitted.

## Deterministic aggregation

1. The event timestamp selects the explicit session and UTC minute bucket.
2. Eligible records sort by event time, sequence, tie-break identity, then raw
   record identity.
3. Open and close use the first and last record in that stable order.
4. High, low, and volume use eligible records only.
5. The candle preserves first/last event time, chronological first/last receive
   time, trade count, bucket-local excluded count/reasons, provider-source time,
   receive time, and adjustment state.
6. Each candle carries ordered raw-record lineage and a source-record digest.
7. Every input record also receives an immutable disposition:
   `included_in_candle` with candle identity, or `excluded` with reason codes.
8. The aggregate normalized digest binds candles, explicit gaps, dispositions,
   calendar version, corporate-action policy, and preparation policies.
9. Input arrays are treated as unordered transport. Provider stream ordering is
   represented by stable `source_position`, so array permutation cannot change
   output bytes.

No historical input is modified.

## Eligibility and unsupported semantics

V1 accepts only action `T`.

- `C`, `M`, or any correction/cancel/update semantic fails the whole dataset.
  The provider Trades schema documents only `T`, and this contract does not
  invent reversal or correction semantics.
- `F_BAD_TS_RECV` and `F_MAYBE_BAD_BOOK` fail closed because the required
  timestamp or channel completeness is unsafe.
- `F_PUBLISHER_SPECIFIC`, snapshot, market-by-price, and top-of-book flags fail
  closed because their semantics are not mapped for this preparation contract.
- `F_LAST` and the officially reserved safe-to-ignore low bit are accepted.
- Non-empty provider conditions fail closed. V1 cannot claim consolidated
  regular-sale eligibility without documented condition fields and mappings.
- Provider history can be regenerated or corrected. A future acquisition must
  freeze caller-supplied dataset/build/provider versions and immutable raw
  bytes; this module does not infer provider revision identity.

These restrictions can be expanded only in a new reviewed policy/contract
version.

## Watermark and point-in-time policy

For bucket `[minute_start, minute_end)`:

- finalization watermark is `minute_end + 2 seconds`;
- a record received after the watermark is excluded as
  `late_receive_after_watermark`;
- a bucket whose watermark is later than `preparation_as_of_timestamp` is not
  emitted and remains an explicit
  `bucket_not_finalized_as_of_cutoff` gap;
- any event or receive timestamp later than the preparation-as-of instant
  rejects the dataset;
- excluded late records cannot mutate a finalized candle.

The watermark uses receive time, while bucket selection and OHLC order use
event time.

## Sessions, DST, half-days, and gaps

The module does not consult host timezone, current-time APIs, a provider, or an
implicit holiday calendar. The caller supplies a versioned set of explicit UTC
session opens/closes with `America/New_York` identity.

This makes DST and half-days explicit and reviewable. Synthetic fixtures cover
the UTC shift across the March DST boundary and an XNYS half-day close.
Pre/post-market records are excluded. Every missing expected minute is emitted
as a gap with `forward_filled: false`; no candle is synthesized or carried
forward.

## Separate sector breadth

`market_context_sector_etf_breadth_v1` accepts exactly:

`XLB, XLC, XLE, XLF, XLI, XLK, XLP, XLRE, XLU, XLV, XLY`.

It requires all eleven unique candle references and a matching source-candle
digest. It calculates advancing and above-short-average fractions. Output is
always labeled:

- `declared_eleven_sector_etf_participation`;
- `SECTOR_ETF_BREADTH_ONLY`;
- `NOT_FULL_MARKET_BREADTH`;
- `not_full_market_breadth: true`.

It is not S&P 500 breadth, constituent breadth, or whole-market breadth.

## Synthetic verification

Eighteen preparation fixtures cover:

1. normal one-minute candle;
2. equal event timestamps with stable tie-break;
3. out-of-order provider positions;
4. duplicate record rejection;
5. late receive exclusion;
6. unfinalized bucket at cutoff;
7. unsupported correction/cancel;
8. invalid price/size;
9. pre/post-market exclusion;
10. DST sessions;
11. half-day boundary;
12. missing minute;
13. future event/receive timestamps;
14. tampered raw digest;
15. input-array permutation;
16. cross-timezone equivalence;
17. SPY/QQQ/eleven-sector parallel preparation;
18. unsupported flags and conditions.

Additional tests cover NaN/Infinity, naive timestamps, complete
raw-record dispositions, source/candle digests, sector breadth completeness,
breadth permutation determinism, forbidden imports, and public schema evidence.

Fresh result:

- Playwright: `22 passed`;
- cross-TZ digest for UTC, Europe/Stockholm, and America/New_York:
  `0b2df5ba6e6b29d97afe91d304ece0094c9fdfebee3e72b4b4ce4177b331044f`;
- breadth fixture: 7/11 advancing and 6/11 above short average;
- replay outputs: `0`;
- performance calculations: `0`.

## Remaining acquisition gates

The implementation closes the deterministic trade-to-candle semantic gap, but
does not make acquisition ready. The following remain:

- exact source/product and 13-symbol entitlement;
- written local retention and internal replay rights;
- exact provider quote and all-in cost ceiling;
- corporate-action product/policy decision;
- exact UTC date range and XNYS calendar artifact;
- exact non-repository raw and normalized paths;
- provider revision/build metadata obtainable without guessing;
- separate independent freeze/review of this contract;
- later admission, normalization, and replay approvals.

`canonical_binding_ready: false`

## Activity attestation

- authenticated provider calls: `0`
- provider data rows acquired: `0`
- downloads: `0`
- purchases or plan changes: `0`
- real-data normalization: `0`
- replay runs: `0`
- database access: `0`
- persistence/capture: `0`
- commits/pushes/PRs: `0`
- live imports/effects: `0`
- `deno.lock` changes: `0`

## Recommended next Action

Action 667M.2B — Independent Trade-to-Candle Contract Freeze and Review:

- inventory and hash the M.2A implementation, fixtures, tests, documentation,
  and evidence;
- rerun the full synthetic and cross-TZ matrix from a fresh process;
- review watermark sensitivity without changing it;
- review flag/action/condition fail-closed semantics;
- verify raw-record dispositions and digest coverage;
- review the proposed M.1 handoff fields without binding them;
- decide whether the local checkpoint is ready.

It must not acquire data, request a quote, normalize real rows, or run replay.
