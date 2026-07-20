# Action 307F: Netlify API Publication Forensic Audit

Production still returns HTTP/2 `400` with an empty body for API routes that should return JSON:

- `GET /api/historical-backfill/first-tiny-signal-package-discovery-readback/ping`
- `GET /api/historical-backfill/first-tiny-replay-dry-run/ping`
- `GET /api/historical-backfill/first-tiny-candle-persistence-readback/ping`
- `GET /api/hb307c/ping`
- `GET /api/route-publication-diagnostic`
- `POST /api/historical-backfill/first-tiny-signal-package-discovery-readback` with `{"auth_check_only":true}`
- `POST /api/historical-backfill/first-tiny-replay-with-signal-package-dry-run` with `{"auth_check_only":true}`

Action 307E added proxy JSON diagnostics. Because production still returns an empty-body `400`, the request is likely being blocked before `proxy.ts` can return JSON, or production is not serving the latest build artifact.

## Local Audit

Run this locally after `npm run build`:

```bash
node scripts/action-307f-netlify-api-publication-forensic-audit.mjs
```

The script reads local repository and build artifacts only. It does not call production, Twelve Data, or Supabase.

Check:

- `api_routes_found_in_source`
- `api_routes_found_in_next_manifest`
- `api_routes_found_in_netlify_output`
- `suspected_boundary`
- `blockers`
- `warnings`

## Production Page Probe

Use this normal non-API page to verify whether page routes publish:

```bash
curl -i -s https://trade.valentinlabs.com/route-publication-probe
```

Expected marker:

```text
action_307f_route_publication_probe
```

The home page also includes a diagnostics-only deploy marker:

```text
action_307f_deploy_marker
```

## Production API Retests

```bash
curl -i -s https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping
curl -i -s https://trade.valentinlabs.com/api/hb307c/ping
curl -i -s https://trade.valentinlabs.com/api/route-publication-diagnostic
```

Auth-check route:

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

## Interpretation

- A. Page probe shows `action_307f_route_publication_probe` but APIs still return empty `400`: API publication, platform, or proxy boundary.
- B. Page probe marker is missing: stale deploy or failed deploy.
- C. Local audit shows API routes missing from the Next manifest: build publication issue.
- D. Local audit shows routes in the Next manifest but missing from Netlify output: Netlify adapter/output issue.
- E. Local audit shows routes everywhere but production still returns empty `400`: Netlify platform/deploy configuration issue.
- F. Proxy JSON marker appears: proxy now catches the request; inspect the proxy `reason` field.

Keep all replay approvals false during diagnostics.

## Safety

This action does not:

- call Twelve Data
- fetch candles
- persist candles
- persist raw responses
- persist fetch-run rows
- persist synthetic outcomes
- execute replay
- mutate recommendations
- change scanner universe
- change ranking
- change thresholds
- change visible recommendations
- change Learning Acceleration
- affect Add Trade
- affect broker, execution, or risk
