# Post-Trade Real Server-Only Staging Client Draft, No Write

## Summary

Purpose: create the real server-only staging Supabase service client factory while keeping it unwired and no-write.

Result: the factory now has a real server-only staging client creation path, guarded by fail-closed staging target and environment checks. It remains unwired from API routes, service plans, Trade UI, and client/UI code. No DB/Supabase writes were added or executed.

Decision: `post_trade_real_server_only_staging_client_draft_ready_no_write`.

## Updated Source

Updated module:

- `lib/post-trade-service-client-factory.ts`

Updated static tests:

- `tests/e2e/post-trade-service-client-factory-draft-static.spec.ts`

The module remains marked with:

- `import "server-only"`

## Factory Boundary

The factory now imports Supabase client creation only inside the server-only module:

- `@supabase/supabase-js`
- `createClient`

The factory uses only staging configuration:

- service-role key name: `SUPABASE_STAGING_SERVICE_ROLE_KEY`
- staging URL key name: `SUPABASE_STAGING_URL`
- staging environment: `ture-staging`
- staging project ref: `pdvzyuhykomwfqyyztru`

The factory is not imported by:

- `app/api/post-trade/payload/validate/route.ts`
- `lib/post-trade-persistence-service-plan.ts`
- `app/trade-app.tsx`
- client/UI source under `app`

## Fail-Closed Behavior

The factory fails closed if:

- the staging service-role key is missing
- the staging Supabase URL is missing
- a service-role key name uses `NEXT_PUBLIC_`
- the service-role key name is not `SUPABASE_STAGING_SERVICE_ROLE_KEY`
- the URL env key name is not `SUPABASE_STAGING_URL`
- the target environment/project does not exactly match `ture-staging` / `pdvzyuhykomwfqyyztru`
- the target appears production-like

No secret values are logged, returned, documented, or exposed to client/UI code.

## No-Write Guarantees

The factory contains no:

- `.from(...)`
- `.insert(...)`
- `.update(...)`
- `.delete(...)`
- `.upsert(...)`
- `.rpc(...)`
- `.storage`

It creates no write service, performs no query, and is not wired into runtime/API/UI paths.

## Still Forbidden

Still forbidden:

- reading or printing service-role secret values during validation
- production DB connection
- production Supabase write
- staging data write
- test row insertion
- migration apply or repair
- write service creation
- DB/Supabase write
- Supabase insert/update/delete/upsert/RPC/storage operations
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

Confirmed for Action 449:

- no service-role secret values were read by validation
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
- no write service creation
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

`post_trade_real_server_only_staging_client_draft_ready_no_write`
