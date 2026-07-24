# Post-Trade Remote Execution Adapter Design No Write

Action: 461  
Date: 2026-07-09  
Decision: `post_trade_remote_execution_adapter_design_ready_no_write`

## Scope

This checkpoint designs a future remote execution adapter for isolated staging post-trade mock writes.

This action is design-only. It does not implement the adapter, execute writes, create API write behavior, wire anything into Trade UI, activate runtime write paths, or perform any Supabase insert/update/delete/upsert/RPC/storage operation.

Approved staging target remains:

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Production remains blocked.

## Context

Action 459 resolved the staging service-role key blocker by key-name-only evidence:

- `SUPABASE_STAGING_SERVICE_ROLE_KEY` is present
- no secret value was read or printed
- no `NEXT_PUBLIC_*SERVICE*ROLE*` key names are present
- local Supabase target remains `pdvzyuhykomwfqyyztru`

Remaining blocker:

- no reviewed remote execution adapter exists

## Future Adapter Purpose

A future adapter may eventually perform exactly one narrow job:

- execute approved staging-only mock post-trade persistence write commands
- use server-only staging service-role access through the reviewed service client factory
- accept only sanitized command objects produced by the reviewed pipeline
- write only intended post-trade persistence records and the required audit event

The adapter may eventually require:

- validator success
- ready dry-run persistence plan
- ready no-remote-write command metadata
- audit command metadata
- test-scoped idempotency key
- staging-only target proof
- server-only service-role key presence

## Allowed Future Inputs

The future adapter may accept only:

- validated post-trade payload result
- ready dry-run persistence plan
- sanitized write command objects
- required audit command
- idempotency key shared by payload, dry-run plan, write commands, and audit command
- explicit staging target metadata: `ture-staging` / `pdvzyuhykomwfqyyztru`

The future adapter must reject raw payload objects and must never accept browser, broker, credential, session, BankID, or arbitrary JSON/blob material.

## Target Table Allowlist

The future adapter may only write to the intended post-trade persistence target tables already modeled by the dry-run plan:

- `execution_redacted_artifacts`
- `execution_confirmation_evidence`
- `execution_settlement_reviews`
- `execution_cost_breakdowns`
- `execution_deviation_reviews`
- `execution_learning_candidates`
- `execution_record_audit_events`

It must fail closed if any command targets an unknown table, a legacy/baseline table, a production table, a storage bucket, or any table outside the post-trade persistence allowlist.

## Safety Checks

The future adapter must enforce:

- staging target only: `pdvzyuhykomwfqyyztru`
- production target rejection
- server-only module boundary
- service-role key server-side only
- no `NEXT_PUBLIC` service-role key
- command allowlist
- target table allowlist
- operation allowlist: approved insert-only mock persistence and audit insert
- idempotency key required
- idempotency key alignment across payload, plan, commands, and audit command
- audit command required
- sanitized primitive record bodies only
- no raw broker/browser payload
- no credentials, cookies, sessions, tokens, or BankID material
- no unredacted broker documents
- no arbitrary JSON/blob values
- no settlement retrieval
- no order behavior
- no live trade mutation
- no live position mutation

Fail-closed cases:

- ambiguous target
- production-like target
- missing service-role key
- public-prefixed service-role key
- unsafe safety flags
- missing audit command
- missing or mismatched idempotency key
- unknown target table
- write command outside approved operation shape
- raw/sensitive payload fields
- any request to write production or real broker data

## Forbidden Scope

The future adapter design does not authorize:

- production writes
- production DB connection
- real broker/Avanza data
- raw broker/browser payload persistence
- credentials, cookies, sessions, tokens, or BankID handling
- unredacted broker documents
- settlement retrieval
- order behavior
- Trade UI execution
- runtime write-path activation beyond a separately approved isolated staging test path
- live trade mutation
- live position mutation
- browser automation
- Avanza login

## Required Future Gates

Before any staging mock write execution, the project must complete these separate gates:

1. Adapter implementation no-write/dry-run gate
   - introduce adapter skeleton or dry-run executor shape only
   - no Supabase write methods
   - no command execution
2. Adapter static/security review
   - confirm server-only boundary
   - confirm staging-only target
   - confirm no production usage
   - confirm no raw/sensitive payload acceptance
   - confirm no API/UI wiring
3. Staging mock write execution retry gate
   - explicit user approval
   - one mock/test-scoped write only
   - intended tables and audit event only
4. Post-write verification gate
   - read-only staging verification
   - confirm intended row(s), audit event, idempotency behavior, and no extra tables touched where possible
5. Production gate
   - remains separately blocked and out of scope

## Pass/Fail Criteria

Ready to move toward adapter implementation if all are true:

- staging target remains `pdvzyuhykomwfqyyztru`
- `SUPABASE_STAGING_SERVICE_ROLE_KEY` remains server-only by key-name rules
- no `NEXT_PUBLIC_*SERVICE*ROLE*` key names exist
- validator, dry-run plan, write command draft, and client factory reviews remain valid
- adapter design remains staging-only and insert-only for approved mock persistence commands
- Trade UI remains unwired
- production remains blocked

Do not move forward if any are true:

- target is ambiguous or production-like
- service-role key is missing, public-prefixed, logged, or exposed
- adapter would accept raw payloads or arbitrary JSON/blob values
- adapter would write outside the target table allowlist
- adapter would activate API/UI/runtime write paths without a separate gate
- adapter would touch production, Avanza, orders, settlement retrieval, live trades, or live positions

## Safety Confirmation

This action did not perform:

- production connection
- production Supabase write
- staging data write
- test row insertion
- migration action
- DB/Supabase write
- adapter implementation
- write command execution
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

Unrelated files explicitly left untouched:

- `app/trade-app.tsx`
- `lib/dynamic-movers-readiness.ts`
