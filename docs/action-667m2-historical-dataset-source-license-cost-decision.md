# Action 667M.2 — Historical Dataset Source, License and Cost Decision Gate

Research date: `2026-07-27`

This is a public-documentation-only decision record for
`market_context_historical_dataset_v1`. It authorizes no provider request,
account lookup, quote request, purchase, download, normalization, replay,
database access, or live integration.

## Decision

`action_667m2_dataset_source_decision_ready: true`

The source decision is ready, but acquisition is not ready. No reviewed source
can populate the current candle-row contract without a semantic gap:

- Twelve Data time series documents a bar-open observation time and exchange
  timezone, but its documented response schema does not expose a distinct
  provider-source timestamp or receive timestamp for historical bars.
- Databento trade records expose both `ts_event` and `ts_recv`, but Databento
  OHLCV records expose the bar start rather than those two independent
  timestamps. The current M.1 normalizer accepts candle and breadth rows, not
  raw trades.
- Norgate is daily-only, does not document per-row provider-source/receive
  timestamps for exports, and its individual EULA requires deletion of Data
  and Derived Data after subscription lapse.

The recommended future route is the Databento 252-session package below,
conditional on all of these gates:

1. a separately reviewed, versioned trade-to-candle preparation contract that
   preserves the immutable raw trade bytes and deterministically carries
   `ts_event` and `ts_recv` into each candle;
2. an exact, non-binding Databento price estimate for the frozen symbols,
   schema, and date range;
3. written or account-contract evidence covering local raw retention, internal
   offline research/replay, normalized artifacts, retention after access ends,
   and the proposed repository/evidence boundary;
4. an explicit corporate-action choice and, if selected, an exact current
   corporate-actions quote;
5. a new operator authorization that freezes source, range, cost ceiling, local
   destination, and permitted operations.

Until those gates pass, every package is non-acquirable and no M.1 dataset can
be admitted.

## Contract facts that control the decision

`market_context_historical_dataset_v1` requires:

- SPY and QQQ plus a declared, complete sector/industry context universe;
- required breadth with named constituent universe and counts;
- one declared candle interval;
- explicit observation and provider-source instants;
- an explicit received instant or documented absence;
- rejection of any observation, provider-source, or receive instant after its
  decision instant;
- documented split, dividend, and adjustment policies;
- documented internal research and replay rights;
- immutable raw and normalized digests plus raw-to-normalized lineage.

The current normalizer consumes canonical candle/breadth NDJSON. It does not
consume trades or perform trade-to-candle aggregation. Reusing acquisition time
as provider-source or receive time would both invent semantics and occur after
historical decisions, so it is forbidden.

## Existing account evidence

The task environment exposed no value for `TWELVE_DATA_API_KEY`,
`TWELVEDATA_API_KEY`, `TWELVE_DATA_PLAN`, `TWELVE_DATA_TIER`, or
`MARKET_DATA_PLAN`. No values were printed.

The repository has a configurable `TWELVE_DATA_PLAN_MODE` and a conservative
local free-safe fallback, but those are application policy—not verified
provider-account evidence. Test fixtures mentioning `grow` are also not
account evidence. Twelve Data documents `/api_usage` as a provider endpoint
that consumes a credit, so it was not called.

Actual account plan, entitlements, unused credits, taxes, currency conversion,
and incremental cost are therefore `operator_evidence_required`.

## Official source review

### 1. Twelve Data — reviewed first

Official sources:

- Pricing: <https://twelvedata.com/pricing>
- Terms of Use: <https://twelvedata.com/terms>
- Time-series API: <https://twelvedata.com/docs/market-data/time-series>
- Timezones: <https://support.twelvedata.com/en/articles/5745849-timezones>
- Historical depth and limits:
  <https://support.twelvedata.com/en/articles/5549842-twelve-data-quality-standards>
- Credits: <https://support.twelvedata.com/en/articles/5615854-credits>
- Batch requests:
  <https://support.twelvedata.com/en/articles/5203360-batch-api-requests>
- Plan depth:
  <https://support.twelvedata.com/en/articles/5335783-trial>
- Personal/commercial usage:
  <https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage>

Verified capabilities:

- US equity and ETF time series cover SPY/QQQ and can cover a declared sector
  ETF universe, subject to account entitlement.
- Official quality documentation says 1-minute and 5-minute intraday history is
  available from 2020 onward and responses are limited to 5,000 records per
  call.
- `time_series` costs one API credit per symbol. Batch transport does not remove
  per-symbol credit consumption.
- Stocks and ETFs default to exchange-local time; the API can request another
  timezone.
- The adjustment modes are `all`, `splits`, `dividends`, and `none`, with
  `splits` as the documented default.
- Individual tiers are for personal/internal use and prohibit redistribution.
  The Terms permit internal processing, storage, and non-reversible derived
  data subject to tier/documentation restrictions; they also require deletion
  of Data on termination.
- Current displayed individual prices include Basic free, Grow from
  USD 29/month, Pro from USD 99/month, and Ultra from USD 329/month. The page
  also displays higher configurable examples; actual selection is account and
  credit dependent.

Contract gaps:

- the documented historical time-series values contain one local-market
  `datetime`; no independent provider-source or receive timestamp is documented;
- no official historical breadth endpoint or historical point-in-time
  constituent universe was found;
- current ETF composition is not historical constituent evidence;
- back-adjusted data may incorporate information learned after a historical
  decision unless the adjustment lineage is itself point-in-time;
- storage timeframes beyond the subscription and exact replay/retention rights
  need account-specific written confirmation;
- Grow explicitly excludes deep history and Pro depth is limited versus Ultra,
  so actual range entitlement needs account evidence.

Conclusion: Twelve Data is useful for a diagnostic price extract, but is
`not_viable` for the unchanged M.1 contract.

### 2. Databento — best technical alternative

Official sources:

- US equities: <https://databento.com/equities>
- EQUS.MINI specification:
  <https://databento.com/docs/venues-and-datasets/equs-mini>
- Timestamp standards:
  <https://databento.com/docs/standards-and-conventions/common-fields-enums-types>
- Schema fields:
  <https://databento.com/docs/knowledge-base/new-users/fields-by-schema/imbalance-imbalance>
- Pricing: <https://databento.com/pricing>
- Portal licensing: <https://databento.com/docs/portal>
- Corporate actions: <https://databento.com/corporate-actions>

Verified capabilities:

- Databento lists SPY and QQQ and states that its equity datasets cover
  exchange-listed US securities. Exact coverage of every proposed sector ETF
  must still be frozen by catalog/account evidence.
- EQUS.MINI supports trades and OHLCV at 1-second, 1-minute, 1-hour, and
  1-day intervals. Historical EQUS.MINI starts on `2023-03-28`.
- Trade records carry exchange event time `ts_event` and Databento capture
  receive time `ts_recv`; timestamps are nanoseconds since the Unix epoch and
  receive timestamps are UTC-synchronized and monotonic per symbol.
- Historical filtering uses the schema's index timestamp.
- OHLCV bars use the bar start and are aggregated from receive-time trade
  messages; the OHLCV schema does not preserve separate per-bar `ts_event` and
  `ts_recv`.
- Historical usage is priced by volume, not API credits; the equities page
  advertises historical pricing from USD 0.40/GB and the pricing page requires
  product/schema/range selection for an exact estimate.
- EQUS.MINI has no exchange license fee and is described as available for
  personal and commercial use. Dataset-specific agreements and retention terms
  still need to be captured before admission.
- The corporate-actions product supplies point-in-time events and adjustment
  factors, but its public product page routes current pricing to sales rather
  than publishing a binding package quote.

Contract gap and remediation boundary:

The technical source can preserve both required timestamps only by acquiring
`trades` and applying a new deterministic offline aggregation:

- candle observation time = explicit UTC start of the 1-minute interval;
- candle provider-source time = maximum contributing trade `ts_event`;
- candle receive time = maximum contributing trade `ts_recv`;
- OHLCV/volume = deterministic aggregation of only trades with both timestamps
  at or before the decision instant;
- empty intervals remain explicit missingness, never fabricated candles.

That mapping is a proposal, not current M.1 behavior. It requires a versioned
preparation contract and tests before acquisition. Consequently Databento is
the `recommended` source direction but is currently `viable_with_gaps`,
`license_confirmation_required`, and `cost_confirmation_required`.

### 3. Norgate Data — breadth-rich but incompatible

Official sources:

- Content tables: <https://norgatedata.com/data-content-tables.php>
- Subscription calculator: <https://norgatedata.com/prices.php>
- EULA: <https://norgatedata.com/subscribe/eula.php>
- Product overview: <https://norgatedata.com/>

Verified capabilities:

- US Platinum includes daily current/delisted stocks, Extras, historical index
  constituents, and backtesting support.
- Extras include advance/decline measures and percent-above-moving-average
  breadth for major US exchanges and indices.
- Historical S&P 500 and Nasdaq 100 constituent histories are available with
  the relevant Platinum/Diamond subscription.
- Norgate is daily/EOD, not an intraday source.
- The price calculator requires package selections; it offers 6- or 12-month
  terms and publishes no fixed unselected total.
- The individual EULA permits personal investment/trading use, restricts
  redistribution and commercial use, limits storage/copying, makes the local
  database inaccessible after lapse, and requires deletion of Data and Derived
  Data when a subscription ends.

Conclusion: Norgate has excellent breadth and point-in-time constituent
coverage, but lacks the required timestamp representation and durable evidence
retention rights. It is `not_viable` for this contract and repository workflow.

## Dataset packages

Common exact symbol universe:

- benchmarks: `SPY`, `QQQ`
- sector contexts: `XLB`, `XLC`, `XLE`, `XLF`, `XLI`, `XLK`, `XLP`, `XLRE`,
  `XLU`, `XLV`, `XLY`
- industry contexts: none in v1 of the package
- breadth: fixed-universe sector-ETF breadth over those 11 sector ETFs,
  computing `advancing_fraction` and `above_short_average_fraction`
- calendar: XNYS regular session, holiday/early-close aware, with explicit UTC
  instants and preserved `America/New_York` exchange-time metadata

This breadth measures sector-ETF participation. It must not be described as
S&P 500 constituent breadth or whole-market breadth.

| Package | Source and interval | Parameterized range / expected sessions | Volume and calls | Cost and storage | Contract status |
| --- | --- | --- | --- | --- | --- |
| Minimum viable diagnostic replay | Twelve Data `time_series`, 5-minute, exact 13-symbol universe | Last 20 completed XNYS sessions ending at operator-supplied cutoff; 78 regular bars/session except early closes | 20,280 provider candle rows + 1,560 derived breadth rows = 21,840 normalized domain rows. One 13-symbol batch transport is 13 credits; each symbol is below the 5,000-record response cap. | Incremental USD 0 only if the verified account already covers the symbols/range; otherwise relevant published tier starts at Grow USD 29/month or higher. Actual plan/tax/currency is operator evidence. Storage is measured raw JSON bytes plus canonical NDJSON; pre-download size is not published. | `not_viable`, `license_confirmation_required`: missing independent provider-source/receive timestamps and PIT corporate-action lineage. |
| Recommended statistically useful replay | Databento `EQUS.MINI`, raw `trades`, deterministic proposed 1-minute aggregation, exact 13-symbol universe | Last 252 completed XNYS sessions ending at operator-supplied cutoff; 390 regular minutes/session except early closes | Target: 1,277,640 candles + 98,280 breadth rows = 1,375,920 normalized domain rows. Raw trade count is `T252` and must be priced before acquisition. Expected request topology: one historical range request, one symbology resolution, and optionally one corporate-action request; Databento does not use API credits for historical billing. | Raw DBN is parameterized as `48 * T252 + DBN metadata` bytes from documented trade field widths. Target OHLCV structural lower bound is 71,547,840 bytes before breadth, lineage, metadata, or encoding. Historical advertised floor is USD `0.40 * billable_GB`; exact usage, license, corporate-action price, tax, and retained storage are unquoted. | `recommended`, `viable_with_gaps`, `license_confirmation_required`, `cost_confirmation_required`. Does not bind to current M.1 until the trade-to-candle preparation contract is versioned and approved. |
| Optional extended regime-diversity replay | Databento `EQUS.MINI`, raw `trades`, same proposed 1-minute aggregation and 13 symbols | From EQUS.MINI inception `2023-03-28` through operator-supplied cutoff; approximately 835–845 completed XNYS sessions at the research date, exact count frozen by calendar before quote | For `D` sessions: candles `D * 390 * 13`, breadth `D * 390`, total target rows `D * 390 * 14`, adjusted for early closes/missing bars. At `D=840`: 4,258,800 candles + 327,600 breadth = 4,586,400 rows. Raw count is `Textended`; same expected 2 calls, or 3 with corporate actions. | Raw DBN `48 * Textended + metadata`; at `D=840`, target OHLCV structural lower bound 238,492,800 bytes before breadth/lineage/encoding. Advertised usage floor is USD `0.40 * billable_GB`; exact quote and corporate-action cost are required. | `viable_with_gaps`, `license_confirmation_required`, `cost_confirmation_required`. Greater regime diversity, but the same contract and retention blockers apply. |

The row counts are regular-session planning values, not coverage claims. The
admission gate must use actual calendar sessions and report gaps, duplicates,
out-of-order records, early closes, no-trade minutes, and symbol-specific
coverage.

## Adjustment and point-in-time policy

Twelve Data:

- `adjust=none` preserves raw prices but needs separate point-in-time corporate
  actions.
- Back-adjusted modes cannot be admitted until their historical
  availability/revision lineage is documented; otherwise later events could
  alter earlier prices.

Databento:

- raw trades preserve source data and timestamp evidence;
- a package may remain `adjustment_state=raw` only with an explicit warning that
  splits can create artificial returns;
- the recommended research package should obtain point-in-time corporate
  actions/adjustment factors if the exact license and price are accepted;
- adjustments must be applied as known at each decision instant, never by a
  final full-history factor.

Norgate:

- supports configurable adjustments but the license/retention and timestamp
  blockers prevent admission.

## Exact operator decisions still required

1. Approve or reject the Databento `EQUS.MINI` direction.
2. Approve a separate implementation/review of
   `market_context_historical_trade_to_candle_preparation_v1`; it is a
   prerequisite, not an acquisition.
3. Choose package scope:
   - recommended: 252 completed sessions;
   - optional: all available EQUS.MINI history from `2023-03-28`.
4. Freeze an explicit UTC cutoff and exact XNYS session list.
5. Confirm the 13-symbol catalog coverage and exact product/schema entitlement.
6. Obtain written/account evidence for:
   - local raw retention and duration;
   - internal deterministic replay;
   - normalized and derived evidence retention;
   - repository/team access;
   - deletion obligations after account or subscription termination;
   - no redistribution.
7. Choose corporate-action policy:
   - point-in-time corporate actions with an exact quote; or
   - raw-only with the documented analytical gap.
8. Obtain a non-binding exact provider estimate for raw trades, symbology, and
   any corporate-action product.
9. Set an all-in cost ceiling in USD, including tax/currency effects, and a
   local storage ceiling.
10. Freeze explicit input paths outside version control; raw and normalized
    provider data must never be committed.
11. Authorize only the acquisition step. Normalization and replay remain
    separately gated.

## Concrete future authorization phrase

Do not use this phrase until the trade-to-candle preparation contract, license
evidence, exact quote, dates, and ceilings have been filled in:

> SPÅR 3 — Action 667M.3: Jag godkänner en engångsanskaffning av Databento
> EQUS.MINI `trades` för exakt symbolerna
> `SPY,QQQ,XLB,XLC,XLE,XLF,XLI,XLK,XLP,XLRE,XLU,XLV,XLY`, för de frysta
> XNYS-sessionerna `[START_UTC, END_UTC)`, med point-in-time corporate actions
> `[INCLUDED|EXCLUDED_RAW_ONLY]`, högst `[USD_COST_CEILING]` USD totalt och
> högst `[LOCAL_STORAGE_CEILING]` lokalt. Licensbevis
> `[LICENSE_EVIDENCE_REFERENCE]` tillåter lokal raw-retention, intern offline
> research/replay och retention av normalized/derived evidence under
> `[RETENTION_TERM]`. Kör endast de förhandsgranskade provideranropen och spara
> till exakt `[LOCAL_RAW_PATH]`; ingen normalization, replay, databas,
> repository-commit, push eller liveintegration är godkänd.

Any unresolved placeholder makes the phrase invalid and acquisition remains
unauthorized.

## Activity attestation

- authenticated provider API calls: `0`
- quote/usage API calls: `0`
- provider downloads: `0`
- purchases/subscription changes: `0`
- tokens or credential values read/printed: `0`
- production or historical provider rows acquired: `0`
- normalization runs: `0`
- replay runs: `0`
- database connections: `0`
- commits/pushes/PRs: `0`
- live ranking effect: `false`
- canonical binding ready: `false`
