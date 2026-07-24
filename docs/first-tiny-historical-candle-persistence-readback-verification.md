# First Tiny Candle Persistence Readback Verification

Conclusion: this is a read-only verification step after the Action 295 write returned `write_completed_readback_unavailable`.

## Why This Exists

Action 295 reported that the first tiny candle persistence write attempted exactly 73 AAPL 5min rows and returned:

- execution status: `write_completed_readback_unavailable`
- candles persisted: `true`
- readback verified: `false`
- warning: `upsert_succeeded_but_readback_verification_failed`

This action checks `historical_candles` with a server-side readback only and compares the persisted rows against the Action 292 static OHLCV payload. It does not write anything.

## Ping

```bash
curl -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence-readback/ping" | jq '.'
```

## Auth Check

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}' | jq '.'
```

## Readback Verification

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"verify_candle_persistence_readback":true}' | jq '.'
```

## Expected Verified Result

```json
{
  "verification_status": "candle_persistence_readback_verified",
  "target_table": "historical_candles",
  "expected_rows": 73,
  "readback_rows": 73,
  "matched_rows": 73,
  "missing_rows": 0,
  "unexpected_rows": 0,
  "mismatched_rows": 0,
  "readback_verified": true,
  "candles_persisted": true,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

## Expected Incomplete Result

```json
{
  "verification_status": "candle_persistence_readback_incomplete",
  "expected_rows": 73,
  "readback_rows": 72,
  "missing_rows": 1,
  "readback_verified": false,
  "candles_persisted": true
}
```

## Expected Mismatch Result

```json
{
  "verification_status": "candle_persistence_readback_mismatch",
  "expected_rows": 73,
  "readback_rows": 73,
  "mismatched_rows": 1,
  "readback_verified": false,
  "candles_persisted": true
}
```

## Safety Guarantees

This route does not:

- call Twelve Data
- fetch candles from a provider
- persist candles
- persist raw response
- persist fetch-run rows
- persist synthetic outcomes
- run replay
- affect scanner universe
- affect ranking
- affect thresholds
- affect visible recommendations
- affect outcome evaluation
- affect Learning Acceleration
- affect Add Trade
- affect broker, execution, or risk

Do not rerun candle persistence unless readback proves `already_recorded` or a separate manual review explicitly approves a follow-up.
