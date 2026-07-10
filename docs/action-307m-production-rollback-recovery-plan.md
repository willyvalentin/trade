# Action 307M: Production Rollback Recovery Plan

## Current Confirmed State

Static public assets work in production:

- `/ping307i.txt` returns HTTP 200
- `/ping307i.json` returns HTTP 200
- `/ping307j.html` returns HTTP 200
- `/action-307l-runtime-boundary-status.json` returns HTTP 200

Proxy runs in production:

- dynamic route responses include `x-ture-proxy-marker: action_307k_proxy_runtime_crash_isolation`

Next runtime routes fail after proxy pass-through:

- `/ping307h` returns HTTP/2 400 with an empty body
- `/api/ping307h` returns HTTP/2 400 with an empty body
- `/api/hb307c/ping` returns HTTP/2 400 with an empty body
- `/api/route-publication-diagnostic` returns HTTP/2 400 with an empty body
- historical-backfill known-good API pings return HTTP/2 400 with an empty body

Replay/execution has not run. All replay approvals must remain false.

## Immediate Safety Locks

Ensure these Netlify Production environment variables are false before rollback, verification, or redeploy work:

```text
TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED=false
TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=false
TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED=false
TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED=false
TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED=false
TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED=false
TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED=false
```

Do not run replay execute.

## Rollback Steps

1. Open Netlify UI.
2. Go to Deploys.
3. Find the last known good deploy before the first HTTP 400 empty-body regression.
4. Prefer a deploy where these routes previously returned JSON:
   - `/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping`
   - `/api/historical-backfill/first-tiny-replay-dry-run/ping`
   - `/api/historical-backfill/first-tiny-candle-persistence-readback/ping`
5. Publish or rollback that deploy.
6. Do not run replay execute.

## Post-Rollback Verification

Load local environment variables only to provide the automation secret for auth-check requests:

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a
```

Verify the known-good ping routes return JSON:

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping"

curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-replay-dry-run/ping"

curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-candle-persistence-readback/ping"
```

Verify route-handler auth without executing replay:

```bash
curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

Expected:

- HTTP 200
- JSON body
- `route_build_marker` present
- `auth_check.header_matches` true for POST
- no provider call
- no replay
- no Supabase write
- no synthetic outcomes

## If Rollback Works

Mark the production API boundary recovered.

Do not immediately replay. Reintroduce Action 307 work in small branches:

1. Restore stable proxy/auth boundary.
2. Add only static route diagnostics.
3. Add Action 307 route without proxy changes.
4. Verify ping/auth in production.
5. Only then configure approval and execute replay dry-run.

## If Rollback Does Not Work

The likely boundary moves outside the current deploy artifact into Netlify/custom-domain/platform settings.

Check:

- Netlify deploy logs
- domain routing
- Next runtime/plugin config
- environment-level redirects
- custom domain and branch deploy routing

Keep all approvals false.

## Hard Safety

This recovery plan must not:

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
- affect Add Trade, broker, execution, or risk
