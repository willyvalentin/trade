# Action 591 - Runtime Deployment Identity Configuration and Verification

## Purpose

Provide the canonical manual-authorization and manual-execution routes with one non-secret, revision-bound deployment identity without depending on Netlify build-only identifiers at request time.

## Runtime Contract

`TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT` is the explicit production runtime variable. It must be the full, lowercase 40-character Git commit SHA for the deployed production revision. The server-only resolver rejects missing, malformed, or non-canonical values, then falls back to `COMMIT_REF` and `NETLIFY_COMMIT_REF` only when either also satisfies that exact SHA contract.

The resolved identity is used by the shared server-side manual authorization context, so issuance and canonical manual execution bind to the same revision identity. The value is non-secret, bounded, and is never returned by the public readiness response.

## Production Configuration

The code was deployed to production revision `7eb1f42440d7555041f68697a2d05157f3a640f5` and is ready to consume the explicit runtime variable.

The required Netlify site-scoped production runtime configuration is:

```text
TURE_CONTINUOUS_INTELLIGENCE_DEPLOYMENT_COMMIT=7eb1f42440d7555041f68697a2d05157f3a640f5
```

The value is the authoritative `origin/main` Git SHA, is non-secret, and satisfies the resolver's exact lower-case 40-hex-character contract. It must be configured with permission to manage the `trade-vl` site's production runtime environment.

### Verification Status

The deployed code was verified ready, but the current Netlify credential received `Forbidden` from the documented site environment creation API. Earlier CLI writes did not create a runtime-scoped value. No second canonical readiness GET was made after that failure: the only allowed Action 591 diagnostic call had already reported the missing environment category before this explicit fallback code existed.

Once an authorized operator configures the variable above and triggers a production deployment, make one authenticated, parameter-free GET to the canonical issuance-readiness route. It must return HTTP `200` and `diagnostic_ready` before any future issuance is considered.

## Safety Boundaries

This action does not issue or consume an authorization or lease; invoke manual execution; call a provider; create a claim; write audit or ledger records; alter canary or kill-switch defaults; or activate a schedule.

## Durable-State Confirmation

The sole Action 591 readiness GET returned HTTP `200` before and after which manual authorizations, leases, claims, audit rows, and ledger rows were all `0`; daily usage remained `0 / 0`. Global canary defaults and schedule state remained unchanged.

## Production Reverification (2026-07-22)

The runtime deployment identity is now configured and verified without exposing its value in diagnostic output:

- the variable is present for the deployed runtime;
- its value satisfies the canonical lower-case 40-character Git SHA contract;
- it equals the deployed production revision `7eb1f42440d7555041f68697a2d05157f3a640f5`;
- it is available to the shared issuance/execution binding, proven by `required_environment_configuration: true` and `response_mapping_compatible: true` from the canonical readiness route.

One authenticated, parameter-free readiness GET returned HTTP `200` with sanitized category `readiness_blocked`, not `diagnostic_ready`. All identity, request, table/RPC, signature, permission, transaction, concurrency, global-safe-default, and schedule-inactivity checks passed. The remaining independent blocker is `production_readiness: false`.

Before and after that GET, manual authorizations, leases, claims, audit rows, and credit-ledger rows were all `0`; daily usage remained `0 / 0`. The canary remained disabled, the kill switch remained active, and no schedule, credential, provider, claim, audit, ledger, or flag mutation occurred.
