# Action 667M.5G — sale-condition gap decision

## Decision

The missing Databento DBN `trades` sale-condition semantics are a hard
boundary between four distinct candle uses:

1. Provider-official or eligibility-filtered candles remain `not_ready`.
2. Diagnostic all-reported-trades candles are
   `diagnostic_normalization_ready` for a future, separately authorized
   offline action.
3. Canonical performance or evaluation candles remain `not_ready`.
4. Live ranking inputs remain `not_ready`.

The diagnostic classification is deliberately narrow. It means that every
otherwise admitted `T` record is eligible for a diagnostic one-minute
aggregation under the observed flags inventory. It does not claim that
provider eligibility rules or exchange sale-condition filters were applied.
Consequently these candles can never be labeled official OHLCV, used as
canonical performance evidence, exported to live ranking, or silently
substituted for eligibility-filtered candles.

## Diagnostic contract

`market_context_diagnostic_all_reported_trades_candle_policy_v1` binds the
exact M.5F evidence, raw-file digest root, twenty-session XNYS calendar,
publisher `95`, action inventory, and flags inventory. It requires lossless
nanosecond `ts_event` and `ts_recv`, event-time buckets, a stable raw file
SHA-256 plus zero-based ordinal tie-break, raw-record-to-bucket lineage, no
forward fill, explicit gaps, and a diagnostic-only namespace.

Output is always `raw_unadjusted`. Corporate actions are unavailable and
excluded; no split, dividend, or adjustment state may be inferred.

The gate has three outcomes:

- `diagnostic_normalization_ready`: all diagnostic preconditions pass.
- `not_ready`: evidence, scope, lineage, timestamp, inventory, calendar, or
  watermark prerequisites fail.
- `conflicting`: a caller attempts an official/canonical/live claim, infers
  an adjustment, or introduces sale-condition data without a frozen mapping.

The gate itself emits zero candles and leaves normalization unauthorized.

## Watermark

Two seconds is retained unchanged as
`market_context_provisional_diagnostic_watermark_2s_v1`. Its status remains
`empirically_unvalidated`. The twenty-session receive-lag study passed its
measurable timing criteria, but it cannot resolve missing sale-condition
semantics. The value is neither provider-certified nor production-ready.

## Independent review

The review approved the contract with zero blocker, major, minor, or nit
findings. Semantic honesty is enforced in the output type and runtime gate;
official OHLCV claims fail conflicting. Exact as-of checks and future-record
counts protect point-in-time use. Raw lineage and tie-break requirements are
mandatory. Canonical performance, replay, binding, and live ranking remain
isolated and unauthorized.

The machine-readable decision is
`docs/evidence/action-667m5g-sale-condition-gap-decision.json`.
