# Action 307L: Netlify Next Runtime Adapter Isolation

## Observed Production Facts

Static public assets work:

- `/ping307i.txt` returned HTTP 200
- `/ping307i.json` returned HTTP 200
- `/ping307j.html` returned HTTP 200

The minimal 307K proxy is also live. Dynamic route responses include:

```text
x-ture-proxy-marker: action_307k_proxy_runtime_crash_isolation
```

But Next runtime routes still return HTTP 400 with an empty body:

- `/ping307h`
- `/api/ping307h`
- `/api/hb307c/ping`
- `/api/route-publication-diagnostic`
- `/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping`

## Meaning

Proxy is no longer the primary suspect. Requests reach `proxy.ts`, proxy passes through, and the failure occurs afterward in the Next/Netlify runtime route layer.

The likely boundary is one of:

- Netlify Next adapter output
- malformed deployed runtime artifact
- Next build/runtime config incompatibility
- platform deploy state requiring rollback

## Local Audit

Run the local filesystem-only audit:

```bash
node scripts/action-307l-netlify-next-runtime-adapter-audit.mjs
```

The audit does not call production, Twelve Data, or Supabase. It reads local source, Next build manifests, Netlify output folders if present, `netlify.toml`, public redirects/headers, and package metadata.

## Static Status Probe

After deploy, confirm static publication separately:

```bash
curl -i -s https://trade.valentinlabs.com/action-307l-runtime-boundary-status.json
```

Expected marker:

```text
action_307l_runtime_boundary_status_static
```

## Next Runtime Retests

```bash
curl -i -s https://trade.valentinlabs.com/ping307h
curl -i -s https://trade.valentinlabs.com/api/ping307h
```

Optional broader runtime retests:

```bash
curl -i -s https://trade.valentinlabs.com/api/hb307c/ping
curl -i -s https://trade.valentinlabs.com/api/route-publication-diagnostic
curl -i -s https://trade.valentinlabs.com/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping
```

## Interpretation

A. Static status works and runtime still returns HTTP 400 with the proxy marker: Netlify Next runtime adapter/output issue.

B. Audit shows routes in source and `.next` manifest but missing `.netlify` output: Netlify adapter issue.

C. Audit shows missing `.next` route manifests: Next build issue.

D. Audit shows middleware manifest mismatch: proxy/middleware packaging issue.

E. No obvious local issue and production still returns HTTP 400: rollback to last known good deploy.

## Rollback Recommendation

If 307L does not identify a narrow config fix, rollback production to the last deploy where known API pings returned JSON, then re-apply replay and diagnostic changes in smaller batches.

Do not proceed to replay execution while runtime routes return empty 400s.

## Safety

This action is diagnostic-only:

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
