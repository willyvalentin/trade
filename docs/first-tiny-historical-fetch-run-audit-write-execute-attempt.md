# First Tiny Fetch-Run Audit Write Execute Attempt

This runbook executes exactly one approved `historical_candle_fetch_runs` audit-row insert for the verified first tiny no-persist provider call.

It must not call Twelve Data, fetch candles, persist candles, persist raw provider response, persist synthetic outcomes, run replay, change scanner behavior, change ranking, affect visible recommendations, affect Add Trade, affect broker/execution, or affect risk.

## Approval Env Vars

Configure the dedicated Action 279 audit-write approval signal only. Do not use the old provider-call approval signal.

Expected values:

```bash
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED=true
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL=<safe_operator_label>
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE=<safe_approval_reference>
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER=AAPL
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS=1
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED=false
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED=false
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED=false
```

## Exact Curl

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch-run-audit-write" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_fetch_run_audit_write":true}' | jq '.'
```

No request-supplied ticker, date, provider, interval, candle persistence, raw-response persistence, replay, or scanner-effect override is allowed.

## Expected Not Approved Result

Without the dedicated valid approval signal:

```json
{
  "execution_status": "not_approved",
  "fetch_run_persisted": false,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false
}
```

## Expected Completed Result

With a valid dedicated approval signal and no existing duplicate audit row:

```json
{
  "execution_status": "fetch_run_audit_write_completed",
  "audit_rows_inserted": 1,
  "fetch_run_persisted": true,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "synthetic_outcomes_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false,
  "max_one_row_enforced": true,
  "no_candle_persistence_enforced": true
}
```

## Expected Already Recorded Result

If the exact audit row already exists:

```json
{
  "execution_status": "fetch_run_audit_write_already_recorded",
  "audit_rows_inserted": 0,
  "fetch_run_persisted": true,
  "duplicate_prevented": true,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

## Readback Verification

The route attempts to verify the inserted or existing row:

- ticker `AAPL`
- request count `1`
- valid candles `27`
- raw response persisted false
- candles persisted false
- replay executed false
- scanner behavior changed false
- live ranking changed false

If insert succeeds but readback is unavailable, the route may return `write_completed_readback_unavailable` with a warning. This still does not permit another insert without duplicate checks.

## Rollback / No-Op Plan

This write is an audit row only. It does not create candle rows or affect the scanner. If operator review fails after insertion:

- leave candle persistence disabled
- leave replay disabled
- leave scanner/ranking usage disabled
- disable the audit-write approval env signal
- review the single audit row manually

## After Success

Immediately disable or remove the audit-write approval env signal:

- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED`
- `TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED`

Any candle persistence requires a separate future approval and implementation action.
