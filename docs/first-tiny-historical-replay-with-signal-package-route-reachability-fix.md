# First Tiny Replay With Signal Package Route Reachability Fix

Action 307 added the first tiny replay-with-signal-package dry-run route, but
the first production manual test returned HTTP `400` with an empty body before
the route handler responded.

Observed production failure:

- `GET /api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping`
  returned HTTP `400`, empty body, no JSON, and no `route_build_marker`.
- `POST /api/historical-backfill/first-tiny-replay-with-signal-package-dry-run`
  with `auth_check_only` returned HTTP `400`, empty body, no JSON, and no
  `route_build_marker`.
- Execute attempt returned an empty response.

Likely boundary: request handling before the Next route handler. Action 307B
adds explicit pass-through coverage, ping slash coverage, reachability markers,
and a shorter alias route.

## Fixed Routes

Original route:

- `GET /api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping`
- `POST /api/historical-backfill/first-tiny-replay-with-signal-package-dry-run`

Alias route:

- `GET /api/historical-backfill/first-tiny-signal-replay-dry-run/ping`
- `POST /api/historical-backfill/first-tiny-signal-replay-dry-run`

Both routes use the same Action 307 helper and return:

- `route_build_marker:
  action_307_first_tiny_replay_with_signal_package_dry_run_execute_attempt`
- `route_reachability_fix_marker: action_307b_route_reachability_fix`

## Reachability Safety

Keep this disabled while testing route reachability:

```bash
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
```

Reachability tests should only prove that the handler returns JSON. They should
not execute replay.

## Ping Curl

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping"
```

Alias:

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-replay-dry-run/ping"
```

Expected JSON includes:

```json
{
  "ok": true,
  "route_ping": true,
  "route_build_marker": "action_307_first_tiny_replay_with_signal_package_dry_run_execute_attempt",
  "route_reachability_fix_marker": "action_307b_route_reachability_fix",
  "provider_call_executed": false,
  "provider_call_attempted": false,
  "candles_persisted": false,
  "raw_response_persisted": false,
  "fetch_run_persisted": false,
  "synthetic_outcomes_persisted": false,
  "replay_executed": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false,
  "recommendation_rows_mutated": false,
  "supabase_write_executed": false
}
```

## Auth Check Curl

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

Alias:

```bash
curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-replay-dry-run" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

Expected JSON includes:

```json
{
  "ok": true,
  "auth_check_only": true,
  "route_build_marker": "action_307_first_tiny_replay_with_signal_package_dry_run_execute_attempt",
  "route_reachability_fix_marker": "action_307b_route_reachability_fix",
  "auth_diagnostics": {
    "server_secret_present": true,
    "header_present": true,
    "header_matches": true,
    "diagnostics_safe": true
  },
  "replay_executed": false,
  "synthetic_outcomes_persisted": false,
  "scanner_behavior_changed": false,
  "live_ranking_changed": false,
  "recommendation_rows_mutated": false,
  "supabase_write_executed": false
}
```

## Execute Curl

Run execute only after ping and auth_check return JSON with both route markers.
Keep approval disabled for reachability-only tests.

```bash
curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"execute_replay_with_signal_package_dry_run":true}' | jq '.'
```

## Safety Guarantees

- No Twelve Data provider call.
- No provider candle fetch.
- No candle persistence.
- No raw response persistence.
- No fetch-run persistence.
- No synthetic outcome persistence.
- No replay execution during ping or auth_check.
- No recommendation mutation.
- No scanner universe, scanner behavior, ranking, threshold, visible
  recommendation, Learning Acceleration, Add Trade, broker/execution, or risk
  effect.
