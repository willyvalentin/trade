# Action 307E: Global API Boundary Regression Diagnostic/Fix

Production returned HTTP 400 with an empty body before route handlers ran for both newly added routes and older known-working routes.

Observed failures:

- `GET /api/historical-backfill/first-tiny-signal-package-discovery-readback/ping`
- `GET /api/historical-backfill/first-tiny-replay-dry-run/ping`
- `GET /api/historical-backfill/first-tiny-candle-persistence-readback/ping`
- `POST /api/historical-backfill/first-tiny-signal-package-discovery-readback` with `{"auth_check_only":true}`
- `GET /api/route-publication-diagnostic`
- `GET /api/hb307c/ping`
- `POST /api/hb307c`

Because known-working routes and new canary routes both failed with no JSON markers, this is treated as a global API boundary regression rather than an Action 307 handler failure.

## What Changed

The proxy API pass-through is now prefix based for the historical backfill diagnostic route family instead of relying on a brittle exact-route allowlist. If proxy blocks an API request, it now returns JSON with:

```json
{
  "boundary": "proxy",
  "boundary_marker": "action_307e_global_api_boundary_regression_fix",
  "reason": "proxy_auth_required_for_non_public_api_route"
}
```

No route-handler automation-secret checks were weakened.

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

## Retest Commands

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a
```

Known-working ping routes:

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping"
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run/ping"
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence-readback/ping"
```

Known-working auth-check route:

```bash
curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

Action 307 original and alias pings:

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping"
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-replay-dry-run/ping"
```

Action 307C canaries:

```bash
curl -i -s "https://trade.valentinlabs.com/api/hb307c/ping"
curl -i -s "https://trade.valentinlabs.com/api/route-publication-diagnostic"
```

Action 307 original auth-check:

```bash
curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

## Expected JSON Markers

- Known-working routes should include `action_307d_known_working_route_boundary_injection`.
- Action 307C canary ping should include `action_307c_hb307c_canary`.
- Route publication diagnostic should include `action_307c_route_publication_diagnostic`.
- Proxy-side boundary blocks should include `action_307e_global_api_boundary_regression_fix`.

## Interpretation

- A. Existing routes return `200` with the 307D marker: deploy and existing API boundary are fixed.
- B. New canary routes return `200`: route publication is fixed too.
- C. Original Action 307 route returns `200` for auth-check: ready to test approved execution later under a separate action.
- D. Proxy JSON boundary error appears: proxy is still catching the request; inspect the `reason` field.
- E. Empty HTTP 400 remains: this is likely a Netlify-level route, build, or deploy issue outside the route handler and proxy JSON boundary.
