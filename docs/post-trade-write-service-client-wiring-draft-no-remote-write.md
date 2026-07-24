# Post-Trade Write Service Client Wiring Draft, No Remote Write

## Summary

Purpose: create a no-remote-write wiring draft between the post-trade write-service command builder and the real server-only staging Supabase client factory.

Result: the wiring draft is server-only, references the staging factory target shape, validates no-remote-write command metadata, and always returns execution-blocked metadata. It does not instantiate a Supabase client, execute write commands, or activate API/runtime/UI write paths.

Decision: `post_trade_write_service_client_wiring_draft_ready_no_remote_write`.

## Added Source

Wiring draft:

- `lib/post-trade-write-service-client-wiring-draft.ts`

Static tests:

- `tests/e2e/post-trade-write-service-client-wiring-draft-static.spec.ts`

## Wiring Boundary

The wiring draft is marked server-only:

- `import "server-only"`

It references the real staging client factory only for target shape:

- `POST_TRADE_STAGING_ENVIRONMENT_NAME`
- `POST_TRADE_STAGING_PROJECT_REF`

It does not call:

- `getPostTradeStagingServiceClient`
- `createClient(...)`
- Supabase query or write methods

The draft is not imported by:

- `app/api/post-trade/payload/validate/route.ts`
- `lib/post-trade-write-service-draft.ts`
- `lib/post-trade-service-client-factory.ts`
- `app/trade-app.tsx`
- client/UI runtime code

## Input Requirements

The wiring draft requires:

- a ready `ready_no_remote_write` write command result
- at least one safe write command object
- command execution mode `dry_run_command_only`
- `remoteExecution: false`
- an idempotency key on every command
- a safe audit command
- idempotency alignment between command result, commands, and audit command
- staging target `ture-staging` / `pdvzyuhykomwfqyyztru`

It rejects:

- raw payloads or non-command objects
- invalid write command results
- missing write commands
- missing audit command
- unsafe flags
- idempotency mismatch
- production-like or non-staging target state

## Output Contract

The wiring draft returns structured execution-blocked metadata only:

- write command count
- write command target tables
- staging client target metadata
- audit command presence
- idempotency key
- required future approval gate
- safety flags
- execution status: `blocked_no_remote_write`

No remote execution occurs.

## No-Remote-Write Guarantees

The wiring draft contains no:

- `@supabase/supabase-js`
- `createClient(...)`
- `getPostTradeStagingServiceClient(...)`
- `.from(...)`
- `.insert(...)`
- `.update(...)`
- `.delete(...)`
- `.upsert(...)`
- `.rpc(...)`
- `.storage`
- `process.env`
- `fetch(...)`

The wiring draft does not read or print service-role secrets.

## Still Forbidden

Still forbidden:

- production DB connection
- production Supabase write
- staging data write
- test row insertion
- migration apply or repair
- executing write commands
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

Confirmed for Action 454:

- no production connection
- no production state touch
- no staging data write
- no test row insertion
- no migration apply
- no migration repair
- no DB write
- no Supabase write
- no write command execution
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

`post_trade_write_service_client_wiring_draft_ready_no_remote_write`
