# Post-Trade Write Service Client Wiring Gate, No Remote Write

## Summary

Purpose: define the no-remote-write gate for a future wiring step between the post-trade write-service command draft and the real server-only staging Supabase client factory.

Result: future wiring may be considered only as a server-only, staging-only, no-remote-write draft. No client wiring, write execution, API write behavior, or runtime/UI activation is authorized by this gate.

Decision: `post_trade_write_service_client_wiring_gate_ready_no_remote_write`.

## Current Components

Write service draft:

- `lib/post-trade-write-service-draft.ts`
- builds sanitized command metadata and audit command only
- imports no Supabase client
- imports no service client factory
- has no remote execution path

Real server-only staging client factory:

- `lib/post-trade-service-client-factory.ts`
- server-only
- staging-only
- fail-closed
- reviewed no-write
- unwired from API route, service plan, write-service draft, and Trade UI

## Future Wiring May Authorize

A future separate action may authorize only:

- server-only module boundary
- staging-only client factory reference
- no production client usage
- no client/UI exposure
- no API route write behavior
- write command objects prepared for future execution review
- no remote execution
- no staging data writes
- no test row insertion

The future wiring draft must remain no-remote-write unless a separate staging write execution gate explicitly authorizes remote execution.

## Still Forbidden

Still forbidden:

- production client usage
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

## Required Future Safety Checks

Before any wiring draft:

- validator result must be valid
- accepted payload must be present
- dry-run plan must be ready
- write command builder must return `ready_no_remote_write`
- real client factory must fail closed on missing, ambiguous, public, non-staging, or production-like target state
- no raw broker/browser payload may be accepted
- no credentials, cookies, sessions, tokens, BankID material, or service-role material may be accepted
- idempotency key must be required and aligned
- audit command must be present
- command record bodies must remain sanitized and primitive-only
- output must not include secrets

## Required Future Tests

A future wiring draft must add tests proving:

- wiring module is server-only
- service client factory import remains server-only
- write-service draft remains no-remote-write
- no Supabase write execution methods are called
- no `.insert(...)`, `.update(...)`, `.delete(...)`, `.upsert(...)`, `.rpc(...)`, or `.storage` execution exists
- no API route write behavior is added
- wiring is not imported by `app/trade-app.tsx`
- wiring is not imported by client/UI code
- response/output never contains secrets
- production target remains blocked

## Pass/Fail Criteria

Pass for moving toward a no-remote-write wiring draft:

- all current no-remote-write static/model tests pass
- the factory remains server-only and staging-only
- the write-service draft remains command metadata only
- future wiring scope is explicitly server-only and no-remote-write
- API route and Trade UI remain unwired

Fail:

- any production target or production key is introduced
- any client/UI import is introduced
- any Supabase write execution method is introduced
- any API write behavior is introduced
- any raw broker/browser, credential/session/BankID, unredacted broker doc, arbitrary JSON/blob, or secret-bearing value can reach command output
- idempotency or audit command requirements are bypassed

## Safety Confirmation

Confirmed for Action 453:

- no client wiring was implemented
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

`post_trade_write_service_client_wiring_gate_ready_no_remote_write`
