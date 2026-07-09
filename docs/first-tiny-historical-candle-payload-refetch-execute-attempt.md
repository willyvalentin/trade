# First Tiny Historical Candle Payload Refetch Execute Attempt

This runbook executes exactly one approved provider refetch for the missing AAPL 5min candle payload. It may return normalized candle rows in the HTTP response for operator review, but it must not persist raw response, candles, fetch runs, synthetic outcomes, replay output, or scanner/ranking changes.

## Approval Env Vars

Configure only the dedicated Action 283 payload-refetch approval signal:

```bash
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED=true
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_OPERATOR_LABEL=<safe_operator_label>
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REFERENCE=<safe_approval_reference>
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_TICKER=AAPL
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_MAX_REQUESTS=1
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_ESTIMATED_CREDITS=1
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED=false
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED=false
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REPLAY_ALLOWED=false
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED=false
```

Old provider-call approval signals and fetch-run audit-write approval signals do not authorize this route.

## Exact Curl

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-payload-refetch" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_payload_refetch":true}' | jq '.'
```

Do not send provider, ticker, interval, date, candle persistence, raw response persistence, replay, or scanner-effect overrides.

## Expected Not Approved Result

Without the dedicated valid approval signal:

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

With a valid dedicated approval signal, cache miss, and successful provider response:

```json
{
  "execution_status": "payload_refetch_completed_no_persist",
  "provider_call_executed": true,
  "provider_call_succeeded": true,
  "ticker": "AAPL",
  "interval": "5min",
  "trading_day": "2026-07-08",
  "request_count": 1,
  "estimated_credits": 1,
  "raw_candles": 27,
  "normalized_candles": 27,
  "valid_candles": 27,
  "invalid_candles": 0,
  "normalized_payload_available": true,
  "normalized_payload_returned": true,
  "normalized_payload_response_only": true,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

Each normalized candle row should include provider, ticker, interval, timestamp, open, high, low, close, volume, adjusted, trading day, session, timezone, and fetch run id `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`.

## Expected Cache Hit Result

If the candle cache already has readable rows:

```json
{
  "execution_status": "payload_refetch_cache_hit_no_provider_call",
  "provider_call_executed": false,
  "normalized_payload_available": true,
  "candles_persisted": false,
  "raw_response_persisted": false
}
```

## Expected Failed Result

If the provider call fails:

```json
{
  "execution_status": "payload_refetch_failed_no_persist",
  "provider_call_executed": true,
  "provider_call_succeeded": false,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false
}
```

## Safety Guarantees

- maximum one provider request
- fixed scope only: AAPL / 5min / 2026-07-08
- no API key in response
- normalized payload is response-only and not durable
- raw response persisted: `false`
- candles persisted: `false`
- fetch run persisted: `false`
- synthetic outcomes persisted: `false`
- replay executed: `false`
- scanner behavior changed: `false`
- live ranking changed: `false`

## After Success

Immediately disable or remove the payload-refetch approval signal:

- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_OPERATOR_LABEL`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REFERENCE`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_TICKER`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_MAX_REQUESTS`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_ESTIMATED_CREDITS`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REPLAY_ALLOWED`
- `TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED`

Next step: build an executable candle persistence dry-run with the returned payload. Separate future approval is still required before any candle write.
