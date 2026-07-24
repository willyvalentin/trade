# Action 309: Post-Recovery Safe Development Protocol

## Recovery Baseline

Production is currently protected by rollback deploy:

```text
6a501645908e4100088b7396
```

Local clean base:

```text
512a0c5
```

Production custom domain API pings are healthy on the rollback deploy. Deploy Preview and Branch Deploy runtimes are not currently trusted because non-production Netlify hosts returned HTTP 400 empty body, including for `/login` and known-good API ping routes.

Production custom domain is the only verified healthy runtime.

## Hard Rules

- Do not push `main` directly.
- Do not publish Netlify deploys from unverified branches.
- Do not touch production until branch/deploy-preview runtime behavior is understood.
- Keep all replay/write approvals false.
- Do not introduce new API/runtime routes until staging exists or a dedicated production-safe route rollout plan is approved.

Approval locks:

```text
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false
TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED=false
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED=false
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED=false
TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED=false
```

## Safe Work Allowed

- Docs.
- Static helpers.
- Local tests.
- Non-runtime planning.
- Pure type/helper code not imported by production runtime.

## Unsafe Work Blocked

- `proxy.ts` changes.
- Middleware changes.
- New `app/api` routes.
- New `app` page routes.
- Netlify config changes.
- Replay execute routes.
- Synthetic outcome persistence.
- Scanner/ranking integration.
- Provider fetch paths.
- Supabase write paths.

## Forbidden Recovery Regression Artifacts

The following Action 307 diagnostic/runtime artifacts must not return:

- `action_307k_proxy_runtime_crash_isolation`.
- `app/api/hb307c`.
- `app/api/ping307h`.
- `app/api/route-publication-diagnostic`.
- `app/route-publication-probe`.
- `app/public-probe-307g`.
- `app/ping307h`.
- `public/ping307i.txt`.
- `public/ping307i.json`.
- `public/ping307j.html`.
- `public/action-307l-runtime-boundary-status.json`.

## Local Guard

Run before any branch is proposed for deployment:

```bash
node scripts/action-309-post-recovery-safety-guard.mjs
```

Expected safe result:

```json
{
  "guard_status": "passed",
  "production_deploy_should_remain_rollback": true,
  "main_push_allowed": false,
  "runtime_route_changes_allowed": false,
  "proxy_changes_allowed": false,
  "replay_execute_allowed": false
}
```

If the guard reports `blocked`, do not deploy. Remove the forbidden Action 307K/runtime diagnostics or branch again from clean base `512a0c5`.

## No-Effect Guarantee

This protocol and guard do not:

- call Twelve Data.
- fetch candles.
- persist candles.
- persist raw responses.
- persist fetch-run rows.
- persist synthetic outcomes.
- execute replay.
- add API routes.
- add page routes.
- alter `proxy.ts`.
- alter middleware.
- mutate recommendations.
- change scanner universe.
- change ranking.
- change thresholds.
- change visible recommendations.
- change Learning Acceleration.
- affect Add Trade.
- affect broker, execution, or risk.
