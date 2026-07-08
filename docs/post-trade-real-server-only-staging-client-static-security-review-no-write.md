# Post-Trade Real Server-Only Staging Client Static/Security Review, No Write

## Summary

Purpose: review the real server-only staging Supabase service client factory before any write-service implementation or wiring.

Result: the reviewed factory remains server-only, staging-only, unwired, and no-write. Static coverage confirms Supabase client creation is confined to the server-only factory module and is not imported by the API validation route, service-plan module, Trade UI, or client/UI source.

Decision: `post_trade_real_server_only_staging_client_static_security_review_ready_for_write_service_draft_no_write`.

## Reviewed Source

Reviewed factory:

- `lib/post-trade-service-client-factory.ts`

Reviewed static tests:

- `tests/e2e/post-trade-service-client-factory-draft-static.spec.ts`
- `tests/e2e/post-trade-service-role-env-key-name-static.spec.ts`

Supporting no-write sources reviewed by static coverage:

- `app/api/post-trade/payload/validate/route.ts`
- `lib/post-trade-persistence-service-plan.ts`
- `lib/post-trade-payload-validator.ts`
- `app/trade-app.tsx`

## Review Findings

The factory retains the server-only boundary:

- includes `import "server-only"`
- confines `@supabase/supabase-js` to `lib/post-trade-service-client-factory.ts`
- confines the only `createClient(...)` call to `lib/post-trade-service-client-factory.ts`
- is not imported by the API validation route
- is not imported by the dry-run service-plan module
- is not imported by `app/trade-app.tsx`
- is not imported by client/UI source under `app`

The factory remains staging-only:

- service-role key name: `SUPABASE_STAGING_SERVICE_ROLE_KEY`
- staging URL key name: `SUPABASE_STAGING_URL`
- staging environment: `ture-staging`
- staging project ref: `pdvzyuhykomwfqyyztru`
- no production service-role key usage
- no `NEXT_PUBLIC_*` service-role key usage

The factory fails closed for unsafe state:

- missing staging Supabase URL
- missing staging service-role key
- client-exposed service-role key name
- unexpected service-role or URL env key name
- target mismatch away from `ture-staging` / `pdvzyuhykomwfqyyztru`
- production-like target state

The factory does not log, return, document, or expose secret values.

## No-Write Review

The reviewed factory contains no:

- `.from(...)`
- `.insert(...)`
- `.update(...)`
- `.delete(...)`
- `.upsert(...)`
- `.rpc(...)`
- `.storage`

No write service exists or was created.

The API validation route remains validation/dry-run only. It does not import the factory, create a Supabase client, use service-role authority, or perform DB/Supabase writes.

## Remaining Boundaries

Still blocked:

- write service implementation
- API write behavior
- runtime write-path activation
- Trade UI execution
- staging data writes
- production client creation
- production DB/Supabase writes
- Avanza/browser automation
- credential/cookie/session/BankID handling
- order behavior
- settlement retrieval
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for Action 450:

- no service-role secret values were read
- no service-role secret values were printed
- no production connection
- no production state touch
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
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_real_server_only_staging_client_static_security_review_ready_for_write_service_draft_no_write`
