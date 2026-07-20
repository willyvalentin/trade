# Action 307K: Proxy Runtime Crash Isolation

## Context

Static public assets work in production:

- `/ping307i.txt`
- `/ping307i.json`
- `/ping307j.html`

Next runtime routes still return HTTP 400 with an empty body:

- `/ping307h`
- `/api/ping307h`
- `/api/hb307c/ping`
- `/api/route-publication-diagnostic`
- historical-backfill diagnostic pings

Because proxy JSON diagnostics did not appear, `proxy.ts` may be failing before page/API handlers run, or the failure may be in Netlify Next adapter/runtime output.

## What Changed

`proxy.ts` is now a standalone diagnostic proxy:

- imports only `NextResponse` and `NextRequest` from `next/server`
- does not import app, lib, Supabase, auth, scanner, broker, execution, or diagnostics modules
- passes through all `/api/*` requests
- passes through diagnostic page routes
- adds `x-ture-proxy-marker: action_307k_proxy_runtime_crash_isolation` where possible
- returns safe JSON if an API route is ever blocked by proxy logic

Route handlers remain responsible for their own `x-automation-secret` checks.

## Production Tests After Deploy

```bash
curl -i -s https://trade.valentinlabs.com/ping307h
curl -i -s https://trade.valentinlabs.com/api/ping307h
curl -i -s https://trade.valentinlabs.com/api/hb307c/ping
curl -i -s https://trade.valentinlabs.com/api/route-publication-diagnostic
curl -i -s https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping
```

## Interpretation

- If these now return JSON, the proxy runtime/auth boundary was the cause.
- If they still return HTTP 400 with an empty body, the issue is likely Netlify Next adapter/runtime output, not proxy logic.
- If page routes work but API routes fail, isolate API runtime publication next.
- If API routes work, return only to Action 307 ping/auth flow. Do not execute replay or provider calls.

## Safety

Keep replay approvals false. This action does not read or validate replay approvals in proxy.

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
