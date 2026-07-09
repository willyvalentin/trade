# First Tiny Historical Candle Persistence Result Verification

This artifact records the first successful production readback verification for
the fixed first tiny historical candle persistence scope.

## Production Readback Result

- Conclusion: `first_tiny_historical_candle_persistence_verified`
- Verification status: `candle_persistence_verified`
- Source verification: `corrected_first_tiny_ohlcv_payload_static_captured`
- Target table: `historical_candles`
- Provider: `twelve_data`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Session: `regular`
- Timezone: `America/New_York`
- Adjusted: `false`
- Fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`

## Persisted Scope

- Expected rows: `73`
- Readback rows: `73`
- Matched rows: `73`
- Missing rows: `0`
- Unexpected rows: `0`
- Mismatched rows: `0`
- Duplicate timestamps: `0`
- Out-of-order rows: `0`
- First timestamp: `2026-07-08T13:45:00.000Z`
- Last timestamp: `2026-07-08T19:45:00.000Z`
- Timestamps are 5 minute spaced: `true`

## Safety Flags

- Candles persisted: `true`
- Readback verified: `true`
- Raw response persisted: `false`
- Fetch run persisted by readback: `false`
- Synthetic outcomes persisted: `false`
- Provider call executed during readback: `false`
- Provider call attempted during readback: `false`
- Replay executed: `false`
- Scanner behavior changed: `false`
- Live ranking changed: `false`
- Replay allowed now: `false`
- Scanner use allowed now: `false`

No Twelve Data provider call occurred during the readback verification. The
readback did not persist raw responses, fetch-run rows, synthetic outcomes, or
any additional candle rows.

No replay, backfill execution, scanner behavior, ranking, thresholds, visible
recommendations, Learning Acceleration, Add Trade, broker/execution, or risk
behavior changed as part of this verification artifact.

## Current State

The first tiny historical candle persistence chain is verified for the fixed
AAPL 5 minute scope only. This makes the chain ready for replay/backfill dry-run
planning.

It does not authorize replay, scanner use, ranking changes, or additional
historical candle persistence.

## Next Step

- Disable `TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=true` after the verified
  success if it is still configured.
- Plan replay/backfill dry-run use of the persisted candles.
- Require a separate explicit approval before any replay or scanner use.
