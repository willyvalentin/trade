# First Tiny Replay With Signal Package Dry-Run Execute Attempt

This runbook covers the guarded Action 307 route for exactly one approved,
read-only replay with a selected signal package.

The route uses the persisted AAPL `5min` candle window from
`historical_candles` and the Action 306 selected recommendation row. It does
not call Twelve Data, fetch provider candles, persist synthetic outcomes,
mutate recommendations, affect scanner behavior, or change ranking.

## Selected Signal Package

- Candidate id:
  `recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Source type: `recommendation_row`
- Source row id: `7dd59e66-7e54-4d35-92f9-5cc1ae11c557`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Analysis cutoff: `2026-07-08T13:49:19.521608+00:00`
- Direction: `long`
- Entry: `304.86`
- Stop: `295.62`
- Target: `334.12`
- Confidence/tier: `Low`
- Setup label: `UNKNOWN`

## Verified Candle Source

- Source table: `historical_candles`
- Provider: `twelve_data`
- Ticker: `AAPL`
- Interval: `5min`
- Trading day: `2026-07-08`
- Fetch run id: `fc58a15a-1748-4e8d-b7d9-03e4826c1d5f`
- Expected rows: `73`
- Window: `2026-07-08T13:45:00.000Z` to `2026-07-08T19:45:00.000Z`

## Approval Env Vars

The route only accepts the dedicated Action 306 signal package selection
approval:

```bash
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=true
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_OPERATOR_LABEL=<operator label>
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_REFERENCE=<approval reference>
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_CANDIDATE_ID=recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_TYPE=recommendation_row
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_ROW_ID=7dd59e66-7e54-4d35-92f9-5cc1ae11c557
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TICKER=AAPL
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_INTERVAL=5min
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TRADING_DAY=2026-07-08
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ANALYSIS_CUTOFF=2026-07-08T13:49:19.521608+00:00
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_DIRECTION=long
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ENTRY=304.86
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_STOP=295.62
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TARGET=334.12
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SYNTHETIC_OUTCOME_PERSIST_ALLOWED=false
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SCANNER_EFFECT_ALLOWED=false
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_RANKING_EFFECT_ALLOWED=false
```

Provider-call, audit-write, payload-refetch, corrected-payload-refetch,
candle-persistence, and no-signal replay dry-run approvals do not authorize
this route.

## Ping

```bash
curl -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping" | jq '.'
```

Expected:

```json
{
  "ok": true,
  "route_ping": true,
  "route_build_marker": "action_307_first_tiny_replay_with_signal_package_dry_run_execute_attempt",
  "provider_call_executed": false,
  "replay_executed": false,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false,
  "recommendation_rows_mutated": false,
  "supabase_write_executed": false
}
```

## Auth Check

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run" \
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

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_replay_with_signal_package_dry_run":true}' | jq '.'
```

## Expected Not Approved Result

```json
{
  "execution_status": "not_approved",
  "replay_executed": false,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

## Expected Completed Result Shape

```json
{
  "execution_status": "replay_with_signal_package_completed",
  "counterfactual_result_available": true,
  "replay_outcome_status": "open_at_window_end",
  "entry_touched": true,
  "stop_touched": false,
  "target_touched": false,
  "planned_entry": 304.86,
  "planned_stop": 295.62,
  "planned_target": 334.12,
  "candles_read": 73,
  "candles_verified": 73,
  "lookahead_safety_passed": true,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false,
  "recommendation_rows_mutated": false,
  "supabase_write_executed": false
}
```

## Expected Blocked Result Shapes

Missing or invalid approval:

```json
{
  "execution_status": "not_approved",
  "replay_executed": false
}
```

Missing candles:

```json
{
  "execution_status": "blocked_missing_candles",
  "candles_read": 0,
  "replay_executed": false
}
```

Candle verification mismatch:

```json
{
  "execution_status": "blocked_candle_verification_failed",
  "replay_executed": false
}
```

Signal package validation mismatch:

```json
{
  "execution_status": "blocked_signal_package_validation_failed",
  "replay_executed": false
}
```

## Replay Rule

Only candles after `2026-07-08T13:49:19.521608+00:00` are used for outcome
simulation. For the selected long signal:

- Entry is touched when candle high is at or above `304.86`.
- Stop is touched when candle low is at or below `295.62` after entry.
- Target is touched when candle high is at or above `334.12` after entry.
- If both stop and target are touched in the same candle, the result is
  `ambiguous_intrabar_conservative_stop`.
- The route does not fabricate intrabar sequence.

## Safety Guarantees

- No Twelve Data provider call.
- No provider candle fetch.
- No candle persistence.
- No raw response persistence.
- No fetch-run persistence.
- No synthetic outcome persistence.
- No recommendation mutation.
- No scanner universe, scanner behavior, ranking, threshold, visible
  recommendation, outcome persistence, Learning Acceleration, Add Trade,
  broker/execution, or risk effect.

After a successful dry-run execute, disable the signal package selection approval env immediately.

Next step: replay-with-signal-package result verification.
