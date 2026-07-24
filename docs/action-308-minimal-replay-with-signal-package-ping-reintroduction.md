# Action 308: Minimal Replay With Signal Package Ping Reintroduction

## Why Ping-Only

Production was rolled back after Actions 307-307L caused or exposed a Next runtime boundary failure. Action 307N verified that the known-good API boundary recovered after rollback.

Action 308 intentionally reintroduces only a minimal ping route. It does not add an execute route, auth-check route, replay route, provider call, persistence path, proxy change, public probe, `hb307c` route, or broad runtime diagnostic.

## Route

```text
GET /api/historical-backfill/first-tiny-replay-with-signal-package-ping
```

Expected JSON:

```json
{
  "ok": true,
  "route_ping": true,
  "route_build_marker": "action_308_minimal_replay_with_signal_package_ping",
  "purpose": "minimal_route_publication_check_only",
  "replay_with_signal_package_execute_route_present": false,
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

## Production Test

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-ping"
```

## Interpretation

A. HTTP 200 JSON with `action_308_minimal_replay_with_signal_package_ping`: new route publication is safe.

B. HTTP 400 empty body: route publication/runtime issue reappears; rollback immediately.

C. Known-good pings break after deploy: rollback immediately.

Known-good pings to recheck:

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping"
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run/ping"
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence-readback/ping"
```

## Safety Locks

Keep these approval values false:

```text
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false
```

## Hard Safety

This action does not:

- call Twelve Data
- fetch candles
- persist candles
- persist raw responses
- persist fetch-run rows
- persist synthetic outcomes
- execute replay
- add a POST route
- add an execute route
- mutate recommendations
- change scanner universe
- change ranking
- change thresholds
- change visible recommendations
- change outcome evaluation persistence
- change Learning Acceleration
- affect Add Trade, broker, execution, or risk
- replace or broaden proxy behavior
