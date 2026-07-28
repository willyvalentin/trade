# Action 667M.5I — Real diagnostic historical market-context shadow replay

Action 667M.5I completed an offline, diagnostic-only replay of the verified
20-session normalized dataset. The full per-decision and per-session output is
stored in the encrypted, Git-ignored diagnostic namespace. Repository evidence
contains only aggregate statistics, policies, versions, and digests.

## Contract and scope

- Replay engine: `market_context_shadow_replay_v1`
- Diagnostic replay: `market_context_real_diagnostic_historical_shadow_replay_v1`
- Schedule: `market_context_diagnostic_replay_schedule_2026_20_sessions_v1`
- Metric derivation: `market_context_diagnostic_metric_derivation_v1`
- Decisions: exactly 60, three per each of 20 regular XNYS sessions
- Decision times: 10:30:02, 12:30:02, and 15:30:02 America/New_York
- Inputs: SPY, QQQ, and eleven sector ETFs
- Breadth label: permanently `not_full_market_breadth`

Only finalized current-session buckets and prior sessions enter a decision.
The adapter checks candle end, the provisional two-second receive watermark,
last event time, last receive time, provider source time, and decision time
before calling the existing replay contract. Current-session full-day bars are
never constructed for an earlier decision.

## Diagnostic limitations

The normalized candles remain all-reported-trades diagnostic candles. They are
not provider-official OHLCV, are raw and unadjusted, do not have sale-condition
semantics, and are not eligible for canonical performance evaluation. The
two-second watermark remains `empirically_unvalidated`.

Evidence strength is ordinal evidence, not probability. No outcome join,
recommendation-confidence mapping, win rate, expectancy, precision, P&L, model
training, canonical binding, or live ranking effect was produced.

## Results

All 60 decisions reconciled. V1 and V2 classifications agreed on all 60
decisions. The V2 regime distribution was:

- `choppy_high_volatility`: 22
- `conflicting_context`: 22
- `insufficient_data`: 7
- `neutral_balanced`: 6
- `risk_on_fragile`: 2
- `risk_on_trending`: 1

There were 31 sufficient, 22 conflicting, and 7 insufficient decisions.
Evidence strength was strong for 31, moderate for 22, and insufficient for 7.
Four decisions carried provider-gap data quality. Across 660 sector contexts,
88 were rankable and 572 were explicitly not rankable.

The replay passed zero-input-leakage checks:

- future input points passed to the core: 0
- provider timestamps after the decision: 0
- record-finalization violations: 0
- current-session full-day aggregations: 0

The adapter explicitly excluded 146,260 future current-session candles, 1,940
future current-session gaps, and 2,889,900 later-session rows.

## Determinism

UTC Run A, UTC Run B, Europe/Stockholm with reversed input order, and
America/New_York produced byte-identical canonical output trees:

- replay dataset digest:
  `be4ecb4c391e7415546a1fab41a4e9abab6eba5742e74abaeccb82783fac7555`
- replay output-tree digest:
  `9275616f957eb447f642bd06108823ba42d7f5179f08e28ec5dc565fe08005b1`
- core replay evidence digest:
  `a9fbc4112cbdcf95ad8fd82f29156ed0f3d7625e6421d0b55b4127bd8d0497f3`

## Isolation

The runner has no provider, credential, database, capture, scanner,
recommendation, publication, or live consumer import. The bridge export remains
inactive. `canonical_binding_ready` and `live_ranking_effect` remain false.
