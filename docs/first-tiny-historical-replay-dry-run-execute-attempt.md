# First Tiny Historical Replay Dry-Run Execute Attempt

This runbook covers the guarded route for exactly one approved read-only replay
dry run using the 73 verified persisted AAPL `5min` candles.

The route does not call Twelve Data, fetch provider candles, persist synthetic
outcomes, mutate recommendations, affect scanner behavior, or change ranking.

## Approval Env Vars

The route only accepts the dedicated Action 299 replay dry-run approval signal:

```bash
TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=true
TURE_FIRST_TINY_REPLAY_DRY_RUN_OPERATOR_LABEL=<operator label>
TURE_FIRST_TINY_REPLAY_DRY_RUN_REFERENCE=<approval reference>
TURE_FIRST_TINY_REPLAY_DRY_RUN_TICKER=AAPL
TURE_FIRST_TINY_REPLAY_DRY_RUN_TRADING_DAY=2026-07-08
TURE_FIRST_TINY_REPLAY_DRY_RUN_INTERVAL=5min
TURE_FIRST_TINY_REPLAY_DRY_RUN_FETCH_RUN_ID=fc58a15a-1748-4e8d-b7d9-03e4826c1d5f
TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_TICKERS=1
TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_DAYS=1
TURE_FIRST_TINY_REPLAY_DRY_RUN_SYNTHETIC_OUTCOME_PERSIST_ALLOWED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_SCANNER_EFFECT_ALLOWED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_RANKING_EFFECT_ALLOWED=false
```

Provider-call, audit-write, payload-refetch, corrected-payload-refetch, and
candle-persistence approvals do not authorize this route.

## Ping

```bash
curl -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run/ping" | jq '.'
```

Expected:

```json
{
  "ok": true,
  "route_ping": true,
  "route_build_marker": "action_300_first_tiny_replay_dry_run_execute_attempt",
  "provider_call_executed": false,
  "replay_executed": false,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

## Auth Check

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run" \
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

curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_replay_dry_run":true}' | jq '.'
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

## Expected Completed No-Signal-Package Result

The first version does not fabricate historical entry, target, or stop values.
If the 73 persisted candles are read and verified but no signal package exists,
the safe result is:

```json
{
  "execution_status": "replay_dry_run_completed_no_signal_package",
  "replay_executed": true,
  "candles_read": 73,
  "candles_verified": 73,
  "signal_package_available": false,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

## Expected Blocked Missing Analysis Cutoff Result

If a signal package is supplied by a future path but lacks an analysis cutoff:

```json
{
  "execution_status": "replay_dry_run_blocked_missing_analysis_cutoff",
  "replay_executed": false,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

## Expected Failed Result

Failures should remain non-mutating:

```json
{
  "execution_status": "failed",
  "provider_call_executed": false,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false
}
```

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

After a successful dry-run execute, disable the replay dry-run approval env
signal immediately.

Next step: replay dry-run result verification.
