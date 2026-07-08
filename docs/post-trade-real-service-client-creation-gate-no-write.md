# Post-Trade Real Service Client Creation Gate, No Write

## Summary

Purpose: create a no-write approval/readiness gate for future real server-only staging Supabase service client creation.

Result: the future real-client step is defined but not executed. No real Supabase client was created, no service-role secret values were read or printed, no service-role authority was used in code, and no data was written.

Decision: `post_trade_real_service_client_creation_gate_ready_no_write`.

## Current State

Reviewed factory draft:

- `lib/post-trade-service-client-factory.ts`

Reviewed tests:

- `tests/e2e/post-trade-service-client-factory-draft-static.spec.ts`
- `tests/e2e/post-trade-service-role-env-key-name-static.spec.ts`

Current factory draft state:

- uses `import "server-only"`
- is scoped to `SUPABASE_STAGING_SERVICE_ROLE_KEY`
- fails closed for missing, public, ambiguous, and non-staging targets
- is unwired from the API validation route
- is unwired from `app/trade-app.tsx`
- imports no `@supabase/supabase-js`
- calls no `createClient`
- contains no query, insert, update, delete, upsert, RPC, or storage fragments
- contains no secret-value reads, logging, or response exposure

Runtime/UI write paths remain blocked. Production remains blocked. Avanza/browser automation remains blocked.

## Future Authorization Scope

A future real client creation action would authorize only:

- server-only staging Supabase client creation
- use of `SUPABASE_STAGING_SERVICE_ROLE_KEY` only
- fail-closed environment validation
- staging target only: `ture-staging` / `pdvzyuhykomwfqyyztru`
- no production service-role key usage
- no client/UI exposure
- no API route wiring unless separately approved
- no write service creation
- no DB/Supabase write operations

## Not Authorized

This gate does not authorize:

- DB/Supabase writes
- Supabase insert/update/delete/upsert/RPC/storage operations
- API write behavior
- write service creation
- production client creation
- production connection
- production Supabase write
- Trade UI execution
- runtime write-path activation
- Avanza/browser automation
- credential/cookie/session/BankID handling
- order behavior
- settlement retrieval
- live trade mutation
- live position mutation

## Future Implementation Preconditions

Before any real client creation action:

- `SUPABASE_STAGING_SERVICE_ROLE_KEY` must exist in a server-only environment
- the service-role key must not be exposed through `NEXT_PUBLIC_*`
- the target must be exactly staging: `ture-staging` / `pdvzyuhykomwfqyyztru`
- production target/key usage must remain blocked
- the factory must remain unwired to Trade UI
- the factory must remain unwired to client/UI code
- the factory must contain no write calls
- the factory must not log, return, snapshot, or document secret values
- route/service write behavior must remain separately gated

## Future Tests

Future real-client implementation tests must verify:

- `import "server-only"` is retained
- `createClient` may exist only in the server-only factory after explicit approval
- only `SUPABASE_STAGING_SERVICE_ROLE_KEY` is used
- no `NEXT_PUBLIC_*SERVICE_ROLE*` key is used
- no production service-role key is referenced
- service-role values are never logged or returned
- factory rejects missing, ambiguous, public, production-like, or non-staging targets
- no insert/update/delete/upsert/RPC/storage calls exist in the factory
- factory is not imported by `app/trade-app.tsx`
- factory is not imported by client/UI code
- API validation route remains no-write unless separately approved

## Future Approval Wording

Paste-ready wording for a future action:

> I approve real server-only staging Supabase service client creation using `SUPABASE_STAGING_SERVICE_ROLE_KEY` only, for `ture-staging` / `pdvzyuhykomwfqyyztru` only. I do not approve DB/Supabase writes, write service creation, API write behavior, production client creation, Trade UI execution, runtime write-path activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, or live trade/live position mutation.

This wording must not be treated as granted until the user provides it in a future action.

## Safety Confirmation

Confirmed for Action 448:

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
- no real Supabase client creation
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

`post_trade_real_service_client_creation_gate_ready_no_write`
