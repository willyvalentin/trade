# Corrected First Tiny Candle Payload Refetch Execute Attempt

Route build marker: `action_289_corrected_first_tiny_candle_payload_refetch_execute_attempt`

This route can execute exactly one approved corrected AAPL 5min payload refetch using `full_day_fetch_then_filter_locally`. It returns the locally filtered normalized payload response-only and never persists candles, raw responses, fetch runs, synthetic outcomes, replay, scanner changes, or ranking changes.

## Approval Env Vars

The route only accepts the dedicated corrected payload refetch approval signal:

- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED=true`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_OPERATOR_LABEL=<operator label>`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REFERENCE=<approval reference>`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_TICKER=AAPL`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY=full_day_fetch_then_filter_locally`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_MAX_REQUESTS=1`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_ESTIMATED_CREDITS=1`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED=false`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED=false`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REPLAY_ALLOWED=false`
- `TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED=false`

Old first-tiny provider-call approvals, fetch-run audit approvals, and prior payload-refetch approvals do not authorize this corrected route.

## Ping

```bash
curl -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-corrected-candle-payload-refetch/ping" | jq '.'
```

Expected:

```json
{
  "ok": true,
  "route_ping": true,
  "route_build_marker": "action_289_corrected_first_tiny_candle_payload_refetch_execute_attempt",
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

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-corrected-candle-payload-refetch" \
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

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-corrected-candle-payload-refetch" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_corrected_payload_refetch":true}' | jq '.'
```

## Expected Not Approved Result

```json
{
  "execution_status": "not_approved",
  "provider_call_executed": false,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false
}
```

## Expected Completed Result

```json
{
  "execution_status": "corrected_payload_refetch_completed_no_persist",
  "strategy_id": "full_day_fetch_then_filter_locally",
  "provider_call_executed": true,
  "provider_call_succeeded": true,
  "request_count": 1,
  "estimated_credits": 1,
  "ticker": "AAPL",
  "interval": "5min",
  "trading_day": "2026-07-08",
  "intended_ny_window": "09:45 -> 15:45",
  "filtered_window_matches_intended": true,
  "normalized_payload_response_only": true,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "fetch_run_persisted": false
}
```

## Expected Window Mismatch Result

```json
{
  "execution_status": "corrected_payload_refetch_window_mismatch_no_persist",
  "provider_call_executed": true,
  "filtered_window_matches_intended": false,
  "candles_persisted": false,
  "raw_response_persisted": false
}
```

## Expected Failed Result

```json
{
  "execution_status": "corrected_payload_refetch_failed_no_persist",
  "provider_call_executed": true,
  "provider_call_succeeded": false,
  "candles_persisted": false,
  "raw_response_persisted": false
}
```

## Safety Guarantees

- at most one Twelve Data `time_series` request
- no API key returned
- no raw provider envelope persisted
- filtered normalized payload is response-only and not durable
- candles persisted: `false`
- raw response persisted: `false`
- fetch run persisted: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`

Disable the corrected payload-refetch approval signal immediately after a successful response.

Next step after a passing result: corrected payload result verification, then executable candle persistence dry-run if the window passes. A separate candle persistence approval/write action is still required.
