# Staging diagnostic readiness preflight

`scripts/verify-staging-diagnostic-readiness.mjs` is the fail-closed, local
preflight for the first persisted diagnostic scan against `ture-staging`. It
never reads `.env.local`, opens a network connection, invokes a route, calls a
market/AI provider or prints a secret.

It accepts only process-environment values scoped to the intended isolated
runtime and emits booleans, key names, failure codes and the public Supabase
project reference. It exits zero only when every requirement is satisfied.

## Required branch-scoped configuration

The branch deploy must contain exactly these functional prerequisites:

| Key | Requirement | Why it is needed |
| --- | --- | --- |
| `AUTOMATION_SECRET` | Present; an isolated random secret | Authenticates the diagnostic route. |
| `NEXT_PUBLIC_SUPABASE_URL` | Must resolve to `pdvzyuhykomwfqyyztru` (`ture-staging`) | Prevents an accidental production target. |
| One of `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_ROLE`, `SUPABASE_SERVICE_ROLE_SECRET` | Exactly one present, scoped to `ture-staging` | Supports the server-only schema probe and future diagnostic persistence. |
| `TURE_APPLICATION_OWNER_USER_ID` | A valid UUID for the intentionally selected staging application owner | Lets the route verify the server-owned principal. |
| `TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED` | Absent or any value other than `true` | Ensures `env_check` never contacts the market-data provider. |

`OPENAI_API_KEY`, `TWELVE_DATA_API_KEY` and `TRADE_APP_PASSWORD` are not
needed for the `env_check` itself. Their presence is reported only as a boolean
for operator review; the script never prints a value.

## Run the preflight

Export only the branch-scoped staging values into a clean shell, then run:

```bash
node scripts/verify-staging-diagnostic-readiness.mjs
```

The expected result is `"ready": true`. A non-zero exit code is deliberate and
must be treated as a stop condition. Do not substitute the production Supabase
reference, an unverified owner UUID or a provider-enabled runtime to make it
pass.

## Narrow next external action

Only after this preflight passes may an explicitly scoped branch-preview
request call `POST /api/diagnostics/run-scan` with:

```json
{ "mode": "env_check", "max_tickers": 1 }
```

The route must be authenticated through `x-automation-secret`. With dynamic
movers disabled, this confirms only the owner and server-side schema path; it
does not call OpenAI, request market data or persist rows. A separate decision
is still required before `diagnostic_persist`, which can write marked scan-run,
snapshot and batch records to `ture-staging`.
