# Post-Trade Service Client Factory Draft, No Write

## Summary

Purpose: create a server-only Supabase service client factory draft for future staging write service usage while keeping the implementation no-write and unwired.

Result: a server-only, staging-only, fail-closed factory draft was added. It does not import Supabase, does not create a Supabase client, does not connect to a database, and does not write data.

Decision: `post_trade_service_client_factory_draft_ready_no_write`.

## Added Source

Added module:

- `lib/post-trade-service-client-factory.ts`

Added static tests:

- `tests/e2e/post-trade-service-client-factory-draft-static.spec.ts`

The module uses `import "server-only"` following the local Next.js guidance for preventing client-side execution of server-only code.

## Factory Draft Boundary

The factory draft is intentionally not a live Supabase client factory yet. It models the fail-closed staging-only environment boundary and returns structured readiness metadata for a future factory gate.

The module:

- is server-only
- is staging-only by default
- uses only the planned staging key name: `SUPABASE_STAGING_SERVICE_ROLE_KEY`
- does not use `NEXT_PUBLIC_*` service-role names
- does not reference production service-role key names
- does not import `@supabase/supabase-js`
- does not call `createClient`
- does not perform queries, inserts, updates, deletes, upserts, RPCs, or storage operations
- is not imported by the API validation route
- is not imported by `app/trade-app.tsx`
- is not wired into client/UI code

## Fail-Closed Rules

The factory draft returns blocked status if:

- the staging service-role key is missing
- a service-role key name is client-exposed with `NEXT_PUBLIC_`
- the service-role key name is unexpected or ambiguous
- the target environment/project does not exactly match `ture-staging` / `pdvzyuhykomwfqyyztru`
- the target is production-like

Ready status is possible only for:

- environment: `ture-staging`
- project ref: `pdvzyuhykomwfqyyztru`
- service-role env key name: `SUPABASE_STAGING_SERVICE_ROLE_KEY`
- explicit staging key presence signal

No secret value is returned or logged.

## Still Forbidden

Still forbidden:

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

Confirmed for Action 446:

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
- no live Supabase client creation
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

`post_trade_service_client_factory_draft_ready_no_write`
