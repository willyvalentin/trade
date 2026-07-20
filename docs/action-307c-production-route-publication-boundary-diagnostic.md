# Action 307C Production Route Publication Boundary Diagnostic

Action 307 added replay-with-signal-package dry-run routes. Action 307B added
JSON markers, trailing-slash proxy pass-throughs, and a short alias.

Production still returned HTTP `400` with an empty body before route handlers
responded:

- Original ping:
  `/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping`
- Original auth check:
  `/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run`
- Alias auth check:
  `/api/historical-backfill/first-tiny-signal-replay-dry-run`

No response included JSON or `route_build_marker`, which means the boundary is
before the Action 307 route handler.

## Diagnostic Routes

Ultra-short canary:

- `GET /api/hb307c/ping`
- `POST /api/hb307c`

Route publication diagnostic:

- `GET /api/route-publication-diagnostic`

These routes are static and no-effect. They do not execute replay.

Keep this disabled during every diagnostic request:

```bash
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
```

## Curl Commands

Original ping:

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping"
```

Alias ping:

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-replay-dry-run/ping"
```

HB307C canary ping:

```bash
curl -i -s "https://trade.valentinlabs.com/api/hb307c/ping"
```

Route publication diagnostic:

```bash
curl -i -s "https://trade.valentinlabs.com/api/route-publication-diagnostic"
```

HB307C auth check:

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -i -s -X POST "https://trade.valentinlabs.com/api/hb307c" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

## Expected HB307C Ping Shape

```json
{
  "ok": true,
  "route_ping": true,
  "route_build_marker": "action_307c_hb307c_canary",
  "purpose": "production_route_publication_boundary_diagnostic",
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

## Interpretation

A. Old working routes work, `/api/hb307c/ping` works, but Action 307 routes
fail:

Route path or path-pattern issue. Action 307D should move the replay with signal
package dry-run route to a short production path:

- `/api/hb307/replay-signal`
- `/api/hb307/replay-signal/ping`

B. `/api/hb307c/ping` fails too:

Proxy, middleware, deploy publication, or broader host boundary issue.

C. `/api/route-publication-diagnostic` is missing:

Likely stale deploy or route publication issue. Confirm the current production
deploy includes Action 307C.

D. Old working routes fail too:

Broader API boundary issue beyond the Action 307 path.

## Safety Guarantees

- No Twelve Data provider call.
- No provider candle fetch.
- No candle persistence.
- No raw response persistence.
- No fetch-run persistence.
- No synthetic outcome persistence.
- No replay execution.
- No recommendation mutation.
- No scanner universe, scanner behavior, ranking, threshold, visible
  recommendation, Learning Acceleration, Add Trade, broker/execution, or risk
  effect.
