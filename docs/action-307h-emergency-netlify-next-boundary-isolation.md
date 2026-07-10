# Action 307H: Emergency Netlify/Next Boundary Isolation

Production returned HTTP/2 `400` with an empty body for both API diagnostics and public page probes:

- `/route-publication-probe`
- `/public-probe-307g`
- `/api/hb307c/ping`
- `/api/route-publication-diagnostic`
- known historical API ping routes

Because proxy JSON diagnostics did not appear, this action adds an emergency top-level proxy bypass for diagnostic routes before auth, cookies, session checks, or redirects run.

## Emergency Probes

```bash
curl -i -s https://trade.valentinlabs.com/ping307h
curl -i -s https://trade.valentinlabs.com/route-publication-probe
curl -i -s https://trade.valentinlabs.com/public-probe-307g
curl -i -s https://trade.valentinlabs.com/api/ping307h
curl -i -s https://trade.valentinlabs.com/api/hb307c/ping
curl -i -s https://trade.valentinlabs.com/api/route-publication-diagnostic
```

Expected markers:

- `action_307h_ping307h_static_page`
- `action_307h_api_ping307h`
- `action_307h_emergency_boundary_isolation`

## Proxy Bypass

The proxy immediately passes through these paths with `NextResponse.next()`:

- `/ping307h`
- `/ping307h/`
- `/route-publication-probe`
- `/route-publication-probe/`
- `/public-probe-307g`
- `/public-probe-307g/`
- `/api/ping307h`
- `/api/ping307h/`
- `/api/hb307c`
- `/api/hb307c/`
- `/api/hb307c/ping`
- `/api/hb307c/ping/`
- `/api/route-publication-diagnostic`
- `/api/route-publication-diagnostic/`
- `/api/historical-backfill/*`

`TURE_PUBLIC_DIAGNOSTIC_ROUTES_ENABLED=false` disables public/no-effect diagnostic bypasses. The historical API family still passes through because route handlers own their automation-secret checks.

## Netlify Config Check

`netlify.toml` currently only sets:

```toml
[functions]
  directory = "netlify/functions"
```

No broad `/*` redirect, `/api/*` rewrite, forced login redirect, headers block, publish directory, or build command is present in the repo-level Netlify config.

## Interpretation

- If `/ping307h` works but `/api/ping307h` fails: API publication or API boundary issue.
- If both `/ping307h` and `/api/ping307h` fail with empty `400`: deploy/build/platform issue before app routes.
- If `/ping307h` redirects to `/login`: proxy/auth bypass was not applied or the deploy is stale.
- If `/api/ping307h` returns JSON but historical routes fail: historical route family or path issue.
- If all diagnostics work: return to Action 307 ping/auth-check before execute.

Keep all replay approvals false during diagnostics.

## Safety

This action does not call Twelve Data, fetch or persist candles, persist raw responses, persist fetch-run rows, persist synthetic outcomes, execute replay, mutate recommendations, change scanner universe, change ranking, change thresholds, change visible recommendations, change Learning Acceleration, affect Add Trade, or affect broker/execution/risk.
