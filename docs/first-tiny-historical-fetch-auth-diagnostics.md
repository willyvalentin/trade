# First Tiny Historical Fetch Auth Diagnostics

This runbook verifies the first tiny historical fetch route authentication path without calling Twelve Data or writing anything.

The diagnostics are safe to inspect because they expose only presence, length, and boolean match information. They never return the automation secret, hashes, provider API keys, Supabase keys, approval signal values, candles, fetch-run records, replay output, or scanner changes.

## Setup

Run commands from the repo root:

```bash
cd /Users/willysimonsson/Dev/trade
set -a
source .env.local
set +a
```

Do not paste or commit real secret values. The command references `${AUTOMATION_SECRET}` only through the local shell environment.

## Auth Check Only

```bash
curl -i -s -X POST "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch" \
  -H "Content-Type: application/json" \
  -H "x-automation-secret: ${AUTOMATION_SECRET}" \
  --data '{"auth_check_only":true}'
```

Expected when auth passes:

- `ok` is true
- `auth_check_only` is true
- `auth_diagnostics.env_name_used` is `AUTOMATION_SECRET`
- `auth_diagnostics.server_secret_present` is true
- `auth_diagnostics.server_secret_length` matches the configured secret length
- `auth_diagnostics.header_name_used` is `x-automation-secret`
- `auth_diagnostics.header_present` is true
- `auth_diagnostics.header_length` matches the sent header length
- `auth_diagnostics.header_matches` is true
- `auth_diagnostics.trimmed_header_matches` is true
- `auth_diagnostics.diagnostics_safe` is true
- `provider_call_executed` is false
- `candles_persisted` is false
- `fetch_run_persisted` is false
- `raw_response_persisted` is false
- `replay_executed` is false
- `scanner_behavior_changed` is false
- `live_ranking_changed` is false

Expected when auth fails:

- HTTP status is unauthorized when checked with `curl -i`
- `error` is `Unauthorized.`
- If blocked before route handler, `auth_boundary` is `middleware`
- `auth_boundary_marker` is `action_276_api_auth_middleware_boundary_audit`
- `auth_diagnostics.server_secret_present` shows whether production has `AUTOMATION_SECRET`
- `auth_diagnostics.header_present` shows whether the route received `x-automation-secret`
- `auth_diagnostics.server_secret_length` and `auth_diagnostics.header_length` show length mismatch without exposing values
- `auth_diagnostics.header_matches` is false
- `auth_diagnostics.trimmed_header_matches` shows whether whitespace is the likely issue
- all provider, persistence, replay, scanner, and ranking effect flags remain false

## Boundary Ping

```bash
curl -i -s "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch/ping"
```

Expected:

- If blocked before route handler, `auth_boundary` is `middleware`
- If route handler is reached, `route_version` is `first_tiny_fetch_ping_v1`
- `route_build_marker` is `action_276_api_auth_middleware_boundary_audit`
- no provider call, persistence, replay, scanner, or ranking effect occurs

Stop after this check. Do not add approval env vars, do not retry with approval, and do not persist any historical data.
