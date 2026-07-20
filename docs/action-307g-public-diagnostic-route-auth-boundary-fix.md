# Action 307G: Public Diagnostic Route Auth Boundary Fix

Production returned a login redirect for the non-API publication probe:

```text
GET /route-publication-probe -> HTTP/2 307 location: /login
```

That means the auth/proxy boundary is active for diagnostic pages before the page marker can be observed. API diagnostics still returned empty-body `400`, so this action makes the diagnostic probes explicitly public and keeps API diagnostics passed through to their handlers.

## Public Page Probes

```bash
curl -i -s https://trade.valentinlabs.com/route-publication-probe
curl -i -s https://trade.valentinlabs.com/public-probe-307g
```

Expected markers:

- `action_307f_route_publication_probe`
- `action_307g_public_diagnostic_route_auth_boundary_fix`
- `action_307g_public_probe`

## API Diagnostic Probes

```bash
curl -i -s https://trade.valentinlabs.com/api/hb307c/ping
curl -i -s https://trade.valentinlabs.com/api/route-publication-diagnostic
```

The proxy explicitly passes through:

- `/api/hb307c`
- `/api/hb307c/`
- `/api/hb307c/ping`
- `/api/hb307c/ping/`
- `/api/route-publication-diagnostic`
- `/api/route-publication-diagnostic/`
- `/api/historical-backfill/*`

If proxy catches an API route, it returns JSON with:

```json
{
  "boundary": "proxy",
  "boundary_marker": "action_307g_public_diagnostic_route_auth_boundary_fix",
  "reason": "diagnostic_api_route_caught_by_proxy"
}
```

## Interpretation

- A. Public page probes return `200` but API still returns empty `400`: API boundary issue remains.
- B. Public page probes still redirect: auth/proxy public allowlist is not working.
- C. API diagnostics return handler JSON: API boundary is fixed.
- D. API diagnostics return proxy JSON: proxy is still catching the request; inspect `reason`.
- E. Empty `400` remains: Netlify/platform-level issue before proxy or handler.

Keep all replay approvals false during diagnostics.

## Safety

This action does not call Twelve Data, fetch or persist candles, persist raw responses, persist fetch-run rows, persist synthetic outcomes, execute replay, mutate recommendations, change scanner universe, change ranking, change thresholds, change visible recommendations, change Learning Acceleration, affect Add Trade, or affect broker/execution/risk.
