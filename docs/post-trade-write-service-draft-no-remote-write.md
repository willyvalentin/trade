# Post-Trade Write Service Draft, No Remote Write

## Summary

Purpose: create a post-trade write service draft that builds structured write command objects from validated payloads and dry-run persistence plans without executing remote writes.

Result: the draft module builds no-remote-write command objects only. It remains isolated from the real staging service client factory, API write behavior, Trade UI, and runtime write paths.

Decision: `post_trade_write_service_draft_ready_no_remote_write`.

## Added Source

Write service draft:

- `lib/post-trade-write-service-draft.ts`

Static and model tests:

- `tests/e2e/post-trade-write-service-draft.spec.ts`

## Input Contract

The draft accepts only:

- a valid post-trade payload validator result
- the validator-approved `acceptedPayload`
- a ready dry-run service plan from `buildPostTradePersistenceDryRunPlan`

The draft rejects:

- invalid validator results
- missing accepted payloads
- missing dry-run plans
- unready dry-run plans
- idempotency mismatch between payload and plan
- unsafe validation safety flags
- raw broker/browser payload fields
- credentials, cookies, sessions, tokens, BankID material, or service-role material
- unredacted broker documents
- arbitrary JSON/blob values in accepted payload fields

## Output Contract

Successful output is command metadata only:

- target table
- prepared operation type
- sanitized record body
- idempotency key
- audit event command
- safety flags
- execution mode: `dry_run_command_only`
- remote execution: `false`

The command objects are not executed.

## No-Remote-Write Boundary

The draft does not import:

- `@supabase/supabase-js`
- `post-trade-service-client-factory`
- API routes
- Trade UI

The draft contains no:

- `createClient(...)`
- `.from(...)`
- `.insert(...)`
- `.update(...)`
- `.delete(...)`
- `.upsert(...)`
- `.rpc(...)`
- `.storage`
- `process.env`
- `fetch(...)`

The draft does not read or print service-role secrets.

## Wiring Boundary

The draft is not wired into:

- `app/api/post-trade/payload/validate/route.ts`
- `lib/post-trade-persistence-service-plan.ts`
- `app/trade-app.tsx`
- client/UI runtime code

The existing API validation route remains validation and dry-run planning only. It does not call the write-service draft and does not perform write behavior.

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

Confirmed for Action 451:

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

`post_trade_write_service_draft_ready_no_remote_write`
