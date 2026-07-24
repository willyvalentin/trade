# Action 307D: Known Working Route Boundary Injection Diagnostic

Production returned HTTP 400 with an empty body for the new Action 307C routes:

- `/api/route-publication-diagnostic`
- `/api/hb307c/ping`
- `/api/hb307c`

Action 307D injects a harmless marker into older routes that have already worked in production. This distinguishes stale deploys from new-route publication/path matching failures and broader API boundary regressions.

## Safety

These probes do not:

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

The expected marker is:

```json
{
  "route_boundary_diagnostic_marker": "action_307d_known_working_route_boundary_injection",
  "deployed_after_307c": true,
  "diagnostic_purpose": "known_working_route_deploy_and_boundary_check"
}
```

## Production Commands

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a
```

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping"
```

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run/ping"
```

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence-readback/ping"
```

```bash
curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

Optional auth-check probes for the other known-working POST routes:

```bash
curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

```bash
curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

## Embedded Route Publication Diagnostic

The signal-package discovery readback ping now also returns:

```json
{
  "route_publication_diagnostic_embedded": {
    "marker": "action_307d_embedded_route_publication_diagnostic"
  }
}
```

That embedded payload lists the expected Action 307 original paths, Action 307 alias paths, and Action 307C canary paths.

## Interpretation

- If known-working routes return `200` JSON with the `action_307d_known_working_route_boundary_injection` marker, the latest deploy reached production and new route publication or proxy path matching is the likely issue.
- If known-working routes return `200` JSON without the Action 307D marker, the deploy is stale.
- If known-working routes return HTTP 400 with an empty body, a broader API boundary regression exists.
- If known-working routes return the updated marker but new routes still fail, use a known-working route path as the fallback host in Action 307E.
