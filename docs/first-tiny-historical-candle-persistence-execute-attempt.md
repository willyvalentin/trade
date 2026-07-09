# First Tiny Candle Persistence Execute Attempt

Conclusion: the execute route exists for one tiny approved candle persistence attempt, but it remains locked unless the Action 294 approval signal is valid and the operator explicitly calls the route.

## Approval Env Vars

Set these in server env only:

```text
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=true
TURE_FIRST_TINY_CANDLE_PERSISTENCE_OPERATOR_LABEL=<operator label>
TURE_FIRST_TINY_CANDLE_PERSISTENCE_REFERENCE=<review/change reference>
TURE_FIRST_TINY_CANDLE_PERSISTENCE_TICKER=AAPL
TURE_FIRST_TINY_CANDLE_PERSISTENCE_INTERVAL=5min
TURE_FIRST_TINY_CANDLE_PERSISTENCE_TRADING_DAY=2026-07-08
TURE_FIRST_TINY_CANDLE_PERSISTENCE_FETCH_RUN_ID=fc58a15a-1748-4e8d-b7d9-03e4826c1d5f
TURE_FIRST_TINY_CANDLE_PERSISTENCE_MAX_ROWS=73
TURE_FIRST_TINY_CANDLE_PERSISTENCE_EXPECTED_INSERTS=73
TURE_FIRST_TINY_CANDLE_PERSISTENCE_RAW_RESPONSE_PERSIST_ALLOWED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_REPLAY_ALLOWED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_SCANNER_EFFECT_ALLOWED=false
```

The route does not accept first tiny provider-call approval, audit-write approval, payload-refetch approval, or corrected payload-refetch approval as authorization for candle persistence.

## Ping

```bash
curl -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence/ping" | jq '.'
```

Expected safe ping:

```json
{
  "ok": true,
  "route_ping": true,
  "route_build_marker": "action_295_first_tiny_candle_persistence_execute_attempt",
  "provider_call_executed": false,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false
}
```

## Auth Check

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}' | jq '.'
```

## Execute

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_candle_persistence":true}' | jq '.'
```

## Expected Not Approved Result

```json
{
  "execution_status": "not_approved",
  "candles_persisted": false,
  "candle_rows_inserted": 0,
  "candle_rows_updated": 0,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false
}
```

## Expected Completed Result

```json
{
  "execution_status": "candle_persistence_completed",
  "target_table": "historical_candles",
  "source_verification": "corrected_first_tiny_ohlcv_payload_static_captured",
  "plan_version": "v2_static_ohlcv_payload",
  "attempted_rows": 73,
  "candle_rows_inserted": 73,
  "candle_rows_updated": 0,
  "candle_rows_skipped": 0,
  "candle_rows_rejected": 0,
  "readback_verified": true,
  "candles_persisted": true,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "synthetic_outcomes_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

## Expected Already Recorded Result

```json
{
  "execution_status": "candle_persistence_already_recorded",
  "attempted_rows": 73,
  "candle_rows_inserted": 0,
  "candle_rows_updated": 0,
  "candle_rows_skipped": 73,
  "duplicate_prevented": true,
  "candles_persisted": true
}
```

## Expected Blocked Mismatch Result

```json
{
  "execution_status": "blocked",
  "blockers": ["existing_row_mismatch_requires_manual_review"],
  "candles_persisted": false,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false
}
```

## Safety Guarantees

This route does not:

- call Twelve Data
- fetch candles
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

After a successful completion or already-recorded response, disable the candle persistence approval env signal immediately.

Next step: candle persistence result verification.
