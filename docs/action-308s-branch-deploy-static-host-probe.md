# Action 308S: Branch Deploy Static Host Probe

## Purpose

Action 308S adds static public probes to the clean Action 308 branch. The goal is to distinguish static artifact publication from Next runtime/API boundary failure on Netlify Deploy Preview and Branch Deploy hosts.

Production custom domain pings are healthy, but non-production Netlify URLs have returned HTTP 400 empty body for both `/login` and API pings. That suggests the branch/deploy-preview host or context may fail before, or inside, the Next runtime while production remains healthy.

## Static Probe Files

```text
/action-308s-branch-host-probe.txt
/action-308s-branch-host-probe.json
```

These files are static assets under `public/`. They do not run application code, call providers, access Supabase, execute replay, or affect scanner/ranking.

## Branch Deploy Test Commands

```bash
DEPLOY_URL="https://recovery-action-308-clean--trade-vl.netlify.app"

curl -i -s "$DEPLOY_URL/action-308s-branch-host-probe.txt"
curl -i -s "$DEPLOY_URL/action-308s-branch-host-probe.json"
curl -i -s "$DEPLOY_URL/login"
curl -i -s "$DEPLOY_URL/api/environment-boundary-audit/ping"
curl -i -s "$DEPLOY_URL/api/historical-backfill/first-tiny-replay-with-signal-package-ping"
```

## Interpretation

A. Static files return 200 but `/login` and `/api` return 400:

Branch deploy artifact is served, but the Next runtime fails on the non-production host/context.

B. Static files also return 400:

Branch deploy/static artifact publication problem.

C. Static files and runtime routes return 200:

Branch deploy is healthy and can be used as gate.

D. Production remains healthy:

Do not touch production until branch deploy is understood.

## No-Effect Guarantees

This action does not:

- call Twelve Data.
- fetch candles.
- persist candles.
- persist raw responses.
- persist fetch-run rows.
- persist synthetic outcomes.
- execute replay.
- create execute routes.
- mutate recommendations.
- change scanner universe.
- change ranking.
- change thresholds.
- change visible recommendations.
- change Learning Acceleration.
- affect Add Trade.
- affect broker, execution, or risk.
- alter `proxy.ts`.
- add diagnostics routes under `app/api`.
- add public runtime pages.
