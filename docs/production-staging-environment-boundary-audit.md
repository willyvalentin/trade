# Production/Staging Environment Boundary Audit

This runbook verifies which runtime, Supabase project, and safe server-secret presence signals production is using.

The audit is read-only. It must not call Twelve Data, fetch candles, persist candles, persist fetch runs, persist raw responses, run replay, create synthetic outcomes, change scanner behavior, or affect ranking.

## Environment Audit Route

```bash
curl -i -s "https://trade.valentinlabs.com/api/environment-boundary-audit"
```

Expected safe checks:

- If blocked before the route, response includes `auth_boundary_marker: action_276_api_auth_middleware_boundary_audit`
- `audit.supabase_refs.public_supabase_project_ref` is `ekdyopdrrkphlrsilyoo`
- `audit.supabase_refs.known_staging_ref` is `pdvzyuhykomwfqyyztru`
- `audit.supabase_refs.points_to_production` is true
- `audit.supabase_refs.points_to_staging` is false
- `audit.secrets_presence.automation_secret_present` is true
- `audit.secrets_presence.automation_secret_length` is present, usually `64`
- `audit.secrets_presence.twelve_data_api_key_present` is true
- `audit.secrets_presence.twelve_data_api_key_length` is present
- `audit.secrets_presence.supabase_service_role_present` is true
- `audit.route_versions.diagnostics_route_marker_present` is true
- `audit.route_versions.first_tiny_fetch_route_expected_marker` is `action_276_api_auth_middleware_boundary_audit`
- all provider, persistence, replay, scanner, and ranking effect flags are false

If the Supabase ref is `pdvzyuhykomwfqyyztru`, production is pointed at the known staging project and should be reviewed before any fetch approval.

## First Tiny Route Marker

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch/ping"
```

Expected:

- `ok` is true
- `route_ping` is true
- `route_version` is `first_tiny_fetch_ping_v1`
- `route_build_marker` is `action_276_api_auth_middleware_boundary_audit`
- all provider, persistence, replay, scanner, and ranking effect flags are false

Legacy POST route ping can also be checked:

```bash
curl -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch" \
  -H "Content-Type: application/json" \
  --data '{"route_ping":true}' | jq '.'
```

Expected:

- `ok` is true
- `route_ping` is true
- `route_version` is `action_276_api_auth_middleware_boundary_audit`
- `route_build_marker` is `action_276_api_auth_middleware_boundary_audit`

This route ping does not require auth and does not expose environment or secret information. It only proves the deployed route code is the expected version.

## Auth Check Boundary

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a

curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

Expected:

- If blocked by middleware/proxy, response includes `auth_boundary: middleware`
- If route handler is reached, response includes `auth_check_only: true`
- In either case, no provider call, persistence, replay, scanner, or ranking effect occurs

## What Not To Do

Do not add approval env vars, do not call the approved provider-call path, do not fetch historical data, and do not persist any candle, fetch-run, raw response, replay, synthetic outcome, scanner, ranking, or live recommendation changes from this audit.
