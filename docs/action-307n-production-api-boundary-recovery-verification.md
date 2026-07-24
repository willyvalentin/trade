# Action 307N: Production API Boundary Recovery Verification

## Recovery Result

Rollback succeeded. The production API boundary is healthy again after rolling back to a known-good deploy.

Post-rollback production checks confirmed:

- no `x-ture-proxy-marker: action_307k_proxy_runtime_crash_isolation`
- no HTTP 400 empty body
- no replay executed
- no provider call
- no Supabase write
- no synthetic outcomes
- no scanner/ranking effect

## Exact Post-Rollback Results

```text
GET /api/historical-backfill/first-tiny-signal-package-discovery-readback/ping
HTTP 200 JSON
route_build_marker: action_303_first_tiny_replay_signal_package_discovery_readback
```

```text
GET /api/historical-backfill/first-tiny-replay-dry-run/ping
HTTP 200 JSON
route_build_marker: action_300_first_tiny_replay_dry_run_execute_attempt
```

```text
GET /api/historical-backfill/first-tiny-candle-persistence-readback/ping
HTTP 200 JSON
route_build_marker: action_296_first_tiny_candle_persistence_readback_verification
```

## Do Not Redeploy 307+ As-Is

Do not redeploy current Action 307+ diagnostic/proxy/runtime changes as-is.

Actions 307-307L proved that static assets worked and proxy ran, but the deployed Next runtime failed after proxy pass-through. Future replay-with-signal-package work should be reintroduced in smaller isolated branches with production ping/auth verification before any execute path is considered.

## Safety Locks

Keep these approval values false:

```text
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false
```

## Current Safety State

- replay with signal package route deployed: no
- replay allowed now: no
- provider call executed: no
- replay executed: no
- synthetic outcomes persisted: no
- Supabase write executed: no
- scanner behavior changed: no
- live ranking changed: no

## Recommended Next Step

Reintroduce Action 307 in a smaller isolated branch:

1. Keep replay approvals false.
2. Do not redeploy Action 307+ diagnostics as-is.
3. Add only the replay-with-signal-package route in isolation.
4. Verify production ping/auth first.
5. Only after healthy production JSON readback, consider a separately approved replay dry-run execute.
