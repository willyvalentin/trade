# Action 308: Minimal Replay With Signal Package Ping Reintroduction

## Purpose

Action 308 intentionally reintroduces only a minimal ping route after the production rollback. It verifies whether a new route can publish safely without bringing back the Action 307-307L diagnostic/proxy/runtime branch.

This action does not add an execute route, POST behavior, provider call, Supabase write, replay path, synthetic outcome path, public probe, hb307c route, or route-publication diagnostic.

## Rollback Context

Production was rolled back after the Action 307 diagnostic branch caused or exposed a Next runtime/API boundary failure. The clean recovery branch is based on the known-good deploy before Action 307, where the established historical-backfill pings returned HTTP 200 JSON and no `x-ture-proxy-marker: action_307k_proxy_runtime_crash_isolation` header was present.

## Route

```text
GET /api/historical-backfill/first-tiny-replay-with-signal-package-ping
```

No auth is required because this route returns static no-effect JSON and exposes no secrets.

## Expected JSON

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

## Known-Good Route Retests

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping"
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run/ping"
```

## Interpretation

A. HTTP 200 JSON with `action_308_minimal_replay_with_signal_package_ping`: new route publication is safe.

B. HTTP 400 empty body: route publication/runtime issue reappears; rollback immediately.

C. Known-good pings break after deploy: rollback immediately.

## Safety Locks

Keep these disabled:

```text
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false
```

## No-Effect Guarantees

This action must not:

- call Twelve Data.
- fetch candles.
- persist candles.
- persist raw responses.
- persist fetch-run rows.
- persist synthetic outcomes.
- execute replay.
- create replay execute routes.
- mutate recommendations.
- change scanner universe.
- change ranking.
- change thresholds.
- change visible recommendations.
- change outcome evaluation persistence.
- change Learning Acceleration.
- affect Add Trade.
- affect broker, execution, or risk.
- replace `proxy.ts`.
- add broad proxy or middleware diagnostics.
- add public probe routes.
- add hb307c routes.
- add route-publication-diagnostic routes.
