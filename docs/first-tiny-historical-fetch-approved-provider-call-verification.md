# First Tiny Historical Fetch Approved Provider Call Verification

This runbook verifies the first approved, no-persist historical provider call path.

This is the first path that may call Twelve Data in production, but only for one tightly scoped request and only after an explicit approval signal is configured. It must still persist nothing and affect no scanner, ranking, live recommendation, broker, Add Trade, replay, or risk behavior.

## Current Scope

- Provider: Twelve Data
- Endpoint: `time_series`
- Ticker: `COIN` unless the server-side preview changes
- Interval: `5min`
- Request count: `1`
- Estimated credits: `1`
- Persist candles: no
- Persist fetch runs: no
- Persist raw response: no
- Synthetic outcomes: no
- Replay/backfill: no
- Scanner effect: no
- Live ranking effect: no

## Required Approval Env Vars

Configure these in the production server environment before making the approved attempt:

```bash
TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED=true
TURE_FIRST_TINY_HISTORICAL_FETCH_OPERATOR_LABEL=<safe_label>
TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVAL_REFERENCE=<safe_reference>
TURE_FIRST_TINY_HISTORICAL_FETCH_TICKER=COIN
TURE_FIRST_TINY_HISTORICAL_FETCH_MAX_REQUESTS=1
TURE_FIRST_TINY_HISTORICAL_FETCH_ESTIMATED_CREDITS=1
TURE_FIRST_TINY_HISTORICAL_FETCH_PERSIST_ALLOWED=false
TURE_FIRST_TINY_HISTORICAL_FETCH_REPLAY_ALLOWED=false
TURE_FIRST_TINY_HISTORICAL_FETCH_SCANNER_EFFECT_ALLOWED=false
```

Do not put secrets in the operator label or approval reference. The Twelve Data API key must not be exposed in output, logs, diagnostics, or the Action report.

## Approved No-Persist Curl

Run from the repo root:

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_provider_call":true}' | jq '.'
```

Do not add request body fields for ticker, provider, endpoint, interval, start date, end date, or trading day. The route must derive scope from the fixed server-side preview and approval chain.

## Expected Safe Result: Cache Miss

If the cache lookup misses and the provider call is attempted, expected safe statuses are:

- `execution_status`: `provider_call_completed_no_persist` or `provider_call_failed_no_persist`
- `provider_call_executed`: `true` only if the provider call happened
- `provider_result.call_attempted`: `true` only if the provider call happened
- `provider_result.raw_response_received`: `true` or `false` depending on provider response
- `provider_result.raw_response_persisted`: `false`
- `persistence_plan.candles_persisted`: `false`
- `persistence_plan.fetch_run_persisted`: `false`
- `safety.synthetic_outcomes_persisted`: `false`
- `safety.replay_executed`: `false`
- `safety.scanner_behavior_changed`: `false`
- `safety.live_ranking_changed`: `false`
- `provider_result.api_key_included_in_diagnostics`: `false`

## Expected Safe Result: Cache Hit

If the historical candle cache already has the approved scope:

- `execution_status`: `cache_hit_skipped_provider`
- `provider_call_executed`: `false`
- `provider_result.call_attempted`: `false`
- no raw response is received or persisted
- no candles or fetch-run records are persisted
- no replay, synthetic outcomes, scanner changes, or ranking changes occur

## Result Interpretation Checklist

- `not_approved`: approval env is missing or invalid. Stop and fix the approval signal before retrying.
- `blocked`: inspect `blockers` and do not retry blindly.
- `cache_hit_skipped_provider`: provider call was safely skipped because cache was present.
- `provider_call_completed_no_persist`: the first live provider path worked and still wrote nothing.
- `provider_call_failed_no_persist`: the provider path was reached, but the provider returned an error or unavailable response; it still wrote nothing.

## Diagnostics And Evidence Handling

Do not persist the route result unless a separate safe diagnostics persistence pattern is introduced. For this action, save the terminal output manually into the next Action report.

Market Diagnostics should remain safe and should show no persistence, no replay, no scanner effect, and no live ranking effect for the provider dry execute path.

Stop after one approved attempt. Do not rerun repeatedly without a new operator decision.
