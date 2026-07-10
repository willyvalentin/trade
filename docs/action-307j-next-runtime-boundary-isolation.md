# Action 307J: Next Runtime Boundary Isolation

## Current Production Signal

Static public assets are reachable in production:

- `GET /ping307i.txt` returned HTTP 200 with `action_307i_static_public_asset_probe`
- `GET /ping307i.json` returned HTTP 200 with `action_307i_static_public_asset_probe`

Next runtime routes are still failing before their page or route handler can respond:

- `GET /ping307h`
- `GET /route-publication-probe`
- `GET /public-probe-307g`
- `GET /api/ping307h`
- `GET /api/hb307c/ping`
- `GET /api/route-publication-diagnostic`
- historical-backfill diagnostic pings

This isolates the issue away from static publication and toward the Next runtime boundary: `proxy.ts`, Next runtime configuration, Netlify Next adapter output, or malformed runtime build artifacts.

## Static HTML Probe

Use the pure static HTML probe first:

```bash
curl -i -s https://trade.valentinlabs.com/ping307j.html
```

Expected marker:

```text
action_307j_static_html_probe
```

Expected safety text:

```text
no provider call
no replay
no write
no synthetic outcomes
no scanner/ranking effects
```

## Local Runtime Artifact Audit

Run the local filesystem-only audit:

```bash
node scripts/action-307j-next-runtime-boundary-audit.mjs
```

The audit does not call production, Twelve Data, or Supabase. It inspects local source, build manifests, Netlify output folders, public probes, route files, and proxy runtime risk markers.

## Production Runtime Probes

After deployment, compare static and runtime routes:

```bash
curl -i -s https://trade.valentinlabs.com/ping307j.html
curl -i -s https://trade.valentinlabs.com/ping307h
curl -i -s https://trade.valentinlabs.com/api/ping307h
curl -i -s https://trade.valentinlabs.com/api/hb307c/ping
```

## Optional Proxy-Minimal Mode Test

Set this Netlify env var only for a diagnostic deploy:

```text
TURE_PROXY_MINIMAL_DIAGNOSTIC_MODE=true
```

This keeps emergency diagnostic pass-through routes open and returns a safe JSON proxy boundary response for other API routes. It does not remove authentication globally and does not enable replay, provider calls, Supabase writes, synthetic outcomes, scanner changes, or ranking changes.

## Interpretation

A. Static HTML works but Next pages/API fail: Next runtime, proxy, or Netlify adapter boundary issue.

B. Static HTML fails: static deploy/public asset publication issue.

C. Minimal proxy mode restores runtime routes: proxy/auth boundary issue.

D. Minimal proxy mode does not restore runtime routes: Netlify Next adapter or runtime output issue.

E. Local audit shows routes in source but missing from Next manifest: Next build issue.

F. Local audit shows routes in Next manifest but production fails: Netlify runtime/platform artifact issue.

## Rollback Guidance

If Next runtime routes continue returning HTTP 400 with an empty body, rollback to the last known good deploy before the Action 307 diagnostic route changes. Keep all historical replay and persistence approval flags disabled during rollback and redeploy testing.

## Hard Safety

This action must remain diagnostic-only:

- no Twelve Data call
- no candle fetch
- no candle persistence
- no raw response persistence
- no fetch-run persistence
- no synthetic outcome persistence
- no replay execution
- no recommendation mutation
- no scanner universe change
- no ranking or threshold change
- no Learning Acceleration change
- no Add Trade, broker, execution, or risk effect
