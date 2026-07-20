# Action 308R: Clean Recovery Branch For Minimal Ping Reintroduction

## Purpose

Action 308 must be reintroduced from a clean recovery branch based on the last known-good production deploy, not on top of the Action 307B-307L diagnostic branch.

Production rollback target:

```text
deployId 6a501645908e4100088b7396
```

## Why Action 308 Failed

The Action 308 ping route was deployed together with broken diagnostic/runtime boundary code. Production showed:

- HTTP/2 400 empty body on the new ping.
- HTTP/2 400 empty body on known-good pings.
- `x-ture-proxy-marker: action_307k_proxy_runtime_crash_isolation`.

That marker proves the deploy still included the Action 307K proxy/runtime diagnostic code. Action 308 must not be applied on top of that branch state.

## Forbidden Production Branch Artifacts

These files and routes must not be included in the clean production recovery branch:

- `proxy.ts` from Action 307K.
- `/api/hb307c`.
- `/api/ping307h`.
- `/api/route-publication-diagnostic`.
- `/route-publication-probe`.
- `/public-probe-307g`.
- `/ping307h`.
- `/ping307j.html`.
- `public/ping307i.*`.
- `public/action-307l-runtime-boundary-status.json`.
- Action 307C-307M diagnostic scripts, docs, and routes unless they are kept only outside the production branch.

## Required Known-Good Routes

These known-good routes must remain available after rollback and before reintroducing the minimal Action 308 ping:

- `/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping`.
- `/api/historical-backfill/first-tiny-replay-dry-run/ping`.
- `/api/historical-backfill/first-tiny-candle-persistence-readback/ping`.

## Local Guard

Run this before preparing a production branch:

```bash
node scripts/action-308r-production-clean-branch-guard.mjs
```

Expected clean output:

```json
{
  "guard_status": "clean",
  "forbidden_artifacts_found": [],
  "forbidden_proxy_marker_found": false,
  "action_307k_proxy_marker_present": false,
  "clean_for_minimal_ping_reintroduction": true,
  "recommended_action": "create_minimal_action_308_ping_branch_from_known_good_deploy"
}
```

If the guard reports `blocked`, do not deploy that branch. Branch again from deploy `6a501645908e4100088b7396` and reapply only the minimal Action 308 ping route.

## Minimal Reintroduction Rule

The next production branch should add only:

- the minimal Action 308 GET ping route.
- its static helper, if needed.
- its focused documentation and tests.

It must not add a POST route, execute route, provider call path, Supabase write path, replay path, proxy change, public probe, hb307c route, route-publication diagnostic, or Action 307B-307L runtime diagnostic artifact.

## Safety Locks

Keep these disabled:

```text
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false
```

## No-Effect Guarantees

This recovery guard/checklist must not:

- call Twelve Data.
- fetch candles.
- persist candles.
- persist raw responses.
- persist fetch-run rows.
- persist synthetic outcomes.
- execute replay.
- mutate recommendations.
- change scanner universe.
- change ranking.
- change thresholds.
- change visible recommendations.
- affect Learning Acceleration.
- affect Add Trade.
- affect broker, execution, or risk.
