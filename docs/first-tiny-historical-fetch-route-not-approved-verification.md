# First Tiny Historical Fetch Route Not-Approved Verification

This runbook verifies that the first tiny historical fetch route is locked by default in production.

It must prove that, without a valid `TURE_FIRST_TINY_HISTORICAL_FETCH_*` approval signal, the route performs no Twelve Data call and writes nothing.

## Setup

Run commands from the repo root:

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a
```

Do not paste or commit real secret values. The commands below reference `${AUTOMATION_SECRET}` only through the local shell environment.

## A. Missing Automation Secret Should Fail

```bash
curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch" \
  -H "Content-Type: application/json" \
  --data '{"execute_provider_call":true}' | jq '.'
```

Expected:

- HTTP status is unauthorized when checked with `curl -i`
- Response includes `Unauthorized.`
- `provider_call_executed` is absent or false
- no provider call occurs
- no candles, fetch-run records, raw response, replay, synthetic outcomes, scanner changes, or ranking changes occur

## B. Missing `execute_provider_call: true` Should Fail

```bash
curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{}' | jq '.'
```

Expected:

- Response includes `execute_provider_call_true_required`
- `provider_call_executed` is false
- `candles_persisted` is false
- `fetch_run_persisted` is false
- `replay_executed` is false
- `scanner_behavior_changed` is false

## C. Scope Override Attempt Should Fail

```bash
curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_provider_call":true,"ticker":"AAPL"}' | jq '.'
```

Expected:

- Response includes `arbitrary_scope_override_rejected`
- Request-supplied ticker/provider/date values are not accepted
- `provider_call_executed` is false
- no provider call occurs
- no persistence or scanner effect occurs

## D. Authenticated Default Without Approval Signal

Before running this check, confirm no valid approval signal is configured in the production environment:

- `TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED` is not `true`
- or one of the required approval-signal fields is missing/invalid

Then run:

```bash
curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_provider_call":true}' | jq '.'
```

Expected:

- `execution_status` is `not_approved`
- `provider_call_executed` is false
- `provider_result.call_attempted` is false
- `provider_result.raw_response_received` is false
- `provider_result.raw_response_persisted` is false
- `persistence_plan.candles_persisted` is false
- `persistence_plan.fetch_run_persisted` is false
- `safety.synthetic_outcomes_persisted` is false
- `safety.replay_executed` is false
- `safety.scanner_behavior_changed` is false
- `safety.live_ranking_changed` is false
- `provider_result.api_key_included_in_diagnostics` is false

Market Diagnostics should continue to show:

- `First Tiny Historical Fetch Provider Dry Execute`
- `Execution status: not_approved`
- `Provider call capable: yes`
- `Provider call executed: no`
- `Provider call attempted: no`
- `Raw response received: no`
- `Raw response persisted: no`
- `Candles persisted: no`
- `Fetch run persisted: no`
- `Synthetic outcomes persisted: no`
- `Replay executed: no`
- `Scanner behavior changed: no`

Stop after this verification. Do not add approval env vars, do not retry with approval, and do not persist any historical data.
