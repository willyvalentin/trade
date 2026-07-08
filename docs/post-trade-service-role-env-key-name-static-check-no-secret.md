# Post-Trade Service-Role Env Key-Name Static Check, No Secret

## Summary

Purpose: perform a no-secret static check of future service-role environment key names and planned server-only usage boundaries.

Result: the expected future staging service-role key pattern is server-only and non-public. Current route, validator, service-plan, and Trade UI sources do not read or expose service-role keys. No `.env.local` secret values were read or printed.

Decision: `post_trade_service_role_env_key_name_static_check_ready_no_secret`.

## Inspection Boundary

This checkpoint inspected only source-controlled key-name patterns and source text boundaries. It did not inspect `.env.local` values and did not print any secret values.

Safe static coverage added:

- `tests/e2e/post-trade-service-role-env-key-name-static.spec.ts`

The static check covers:

- no `NEXT_PUBLIC_*SERVICE_ROLE*` pattern in current `app` or `lib` source
- no service-role references in `app/trade-app.tsx`
- no planned service-role env key reads in the no-write validation route
- no planned service-role env key reads in the validator
- no planned service-role env key reads in the dry-run service-plan module
- no service-role logging or route-response fragments in current no-write sources

## Expected Future Key Pattern

Expected future staging-only service-role key name:

- `SUPABASE_STAGING_SERVICE_ROLE_KEY`

This key name is server-only by convention because it does not use a `NEXT_PUBLIC_` prefix. It is staging-specific and does not authorize production service-role usage.

Future supporting non-secret keys may include:

- `SUPABASE_STAGING_PROJECT_REF`
- `SUPABASE_STAGING_ENVIRONMENT_NAME`

No actual secret values were read or validated in this action.

## Findings

Findings:

- no planned service-role key uses `NEXT_PUBLIC_*`
- no production service-role usage is authorized
- no current service-role key is imported or referenced in `app/trade-app.tsx`
- no current route/service-plan/validator source imports Supabase for write behavior
- no current route/service-plan/validator source reads `SUPABASE_STAGING_SERVICE_ROLE_KEY`
- no current route/service-plan/validator source reads production service-role key names
- no service-role token logging or response fragments were found in current no-write sources

## Fail-Closed Criteria

Future implementation must fail closed if:

- `SUPABASE_STAGING_SERVICE_ROLE_KEY` is missing
- the staging key name is ambiguous
- a production service-role key is selected for staging work
- any service-role key is exposed through `NEXT_PUBLIC_*`
- any service-role key appears in client/UI code
- any service-role token is logged, printed, returned, snapshotted, committed, or passed to browser code
- any route attempts write behavior before the approved service-role client factory and staging write gates

Missing staging key means no write service. Ambiguous key means no write service. Production-like key means blocked. Client-exposed key means blocked.

## Still Forbidden

Still forbidden:

- reading or printing service-role secret values
- production DB connection
- production Supabase write
- staging data write
- test row insertion
- migration apply or repair
- Supabase client import for this gate
- service-role usage in code
- service-role write service creation
- DB/Supabase write
- API write behavior
- runtime write-path activation
- Trade UI execution
- browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order action
- settlement retrieval
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for Action 445:

- no `.env.local` secret values were read
- no service-role secret values were read
- no service-role secret values were printed
- no production connection
- no production state touch
- no production Supabase write
- no staging data write
- no test row insertion
- no migration apply
- no migration repair
- no DB write
- no Supabase write
- no Supabase client import
- no service-role usage in code
- no service-role write service creation
- no API write behavior
- no API/UI activation
- no Trade UI execution
- no runtime write-path activation
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no settlement retrieval
- no real trade/broker data insertion
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_service_role_env_key_name_static_check_ready_no_secret`
