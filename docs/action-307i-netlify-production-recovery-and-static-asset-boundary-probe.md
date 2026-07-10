# Action 307I: Netlify Production Recovery And Static Asset Boundary Probe

Production still returns HTTP/2 `400` with an empty body for ultra-minimal app and API probes:

- `/ping307h`
- `/api/ping307h`
- `/route-publication-probe`
- `/public-probe-307g`
- `/api/hb307c/ping`
- `/api/route-publication-diagnostic`
- known historical-backfill API pings

This is no longer a replay-route issue. It is likely a Netlify deploy, artifact, routing, custom-domain, or platform boundary issue before Next route handlers can run.

## Immediate Safety

Keep all replay approvals false:

```bash
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false
```

Do not run replay execute until production static, app, and API boundaries are healthy again.

## Local Audit

```bash
node scripts/action-307i-netlify-static-boundary-audit.mjs
```

The audit reads local files only. It does not call production, Twelve Data, or Supabase.

## Static Asset Tests After Deploy

These bypass Next app routing and should be served directly from `public/` if Netlify static asset publication is healthy:

```bash
curl -i -s https://trade.valentinlabs.com/ping307i.txt
curl -i -s https://trade.valentinlabs.com/ping307i.json
```

Expected marker:

```text
action_307i_static_public_asset_probe
```

## App/API Tests

```bash
curl -i -s https://trade.valentinlabs.com/ping307h
curl -i -s https://trade.valentinlabs.com/api/ping307h
curl -i -s https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping
```

## Interpretation

- If static assets also return `400` empty body: Netlify deploy, artifact, custom-domain, or platform routing is broken before Next. Use Netlify rollback to the last known good deploy.
- If static assets work but app pages/API fail: Next runtime, proxy, middleware, or adapter output issue.
- If app pages work but API fails: API route publication or runtime issue.
- If old routes work but new routes fail: route publication/path issue.
- If everything works: resume Action 307 ping/auth checks only.

## Rollback Guidance

1. In Netlify UI, open Deploys.
2. Find the last deploy before the first HTTP `400` empty-body regression.
3. Publish or rollback that deploy.
4. Retest known-good pings.
5. Keep all replay approvals false.
6. Do not run replay execute until production API boundary is healthy again.

## Repo Config Notes

`netlify.toml` currently only sets the Netlify Functions directory:

```toml
[functions]
  directory = "netlify/functions"
```

No repo-level broad `/*` redirect, `/api/*` rewrite, forced login redirect, headers block, publish directory, or build command is present.

## Safety

This action does not call Twelve Data, fetch or persist candles, persist raw responses, persist fetch-run rows, persist synthetic outcomes, execute replay, mutate recommendations, change scanner universe, change ranking, change thresholds, change visible recommendations, change Learning Acceleration, affect Add Trade, or affect broker/execution/risk.
