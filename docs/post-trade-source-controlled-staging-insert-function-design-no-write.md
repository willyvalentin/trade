# Post-Trade Source-Controlled Staging Insert Function Design No Write

Action: 484  
Date: 2026-07-09  
Decision: `post_trade_source_controlled_staging_insert_function_design_ready_no_write`

## Scope

This checkpoint designs the missing source-controlled staging insert function for the final isolated mock write flow.

This action does not implement the function, execute writes, insert test rows, run migrations, modify adapter execution behavior, create API write behavior, wire anything into Trade UI, activate runtime write paths, or perform any DB/Supabase write.

## Future Function Scope

The future execution function must be:

- server-only
- staging-only
- one-shot only
- source-controlled
- disabled from API/UI/runtime paths unless a later gate explicitly approves otherwise

It may perform exactly two intended staging inserts:

1. `public.execution_records`
2. `public.execution_record_audit_events`

No other table may be written by this function.

## Required Inputs

The future implementation must require:

- verified local Supabase target `pdvzyuhykomwfqyyztru`
- `SUPABASE_STAGING_URL` present server-side
- `SUPABASE_STAGING_SERVICE_ROLE_KEY` present server-side
- no `NEXT_PUBLIC` service-role key
- validated mock payload
- ready dry-run plan
- sanitized write command metadata
- reviewed prerequisite command result
- one-shot approval context
- test-scoped unique idempotency key
- reviewed dependent audit command
- one-shot eligibility result from the reviewed unblock mechanism

The function must fail closed if any input is missing, ambiguous, production-like, unsafe, or not aligned.

## Execution Order

The future function must execute in this exact order:

1. Re-check the staging target is exactly `pdvzyuhykomwfqyyztru`.
2. Re-check server-side staging env key presence without printing values.
3. Re-check no `NEXT_PUBLIC` service-role key exists.
4. Re-check one-shot eligibility.
5. Insert exactly one sanitized mock `public.execution_records` row.
6. Capture the returned `execution_records.id`.
7. Insert exactly one dependent `public.execution_record_audit_events` row using that returned ID.
8. Stop.

The audit insert must never run unless the execution-record insert succeeds and returns a valid ID.

## Allowed Supabase Operations

The future implementation may use only the minimal service-role operations required for the two-row staging mock write:

- one insert into `execution_records` with returned ID
- one insert into `execution_record_audit_events` using that returned ID
- minimal readback/select-return behavior required to verify the two inserted rows

The future implementation must not use:

- update
- delete
- upsert
- RPC
- storage
- broad table scans
- broad queries
- direct SQL
- manual dashboard writes
- migration actions

## Sanitized Data Rules

The future execution-record row may persist only reviewed mock/test metadata.

The future audit row may persist only reviewed mock/test audit metadata and the created execution record ID.

The function must reject:

- raw broker/browser payloads
- raw Avanza/browser state
- credentials
- cookies
- sessions
- tokens
- BankID material
- unredacted broker documents
- arbitrary JSON/blob values
- real broker/Avanza data
- settlement retrieval output
- order behavior output
- live trade mutation data
- live position mutation data

## Failure Handling

The future implementation must:

- stop before write if any precondition fails
- stop after the first failed insert
- not blindly retry
- not repair/reset
- not run migrations
- not switch idempotency keys after failure
- not use direct SQL/manual dashboard fallback
- document sanitized error details only

If the execution-record insert succeeds but the dependent audit insert fails, the action must stop immediately and document the partial state without attempting repair or retry. A separate cleanup/reconciliation gate must decide any follow-up.

## Post-Write Verification

If a future execution action writes, it must verify:

- exactly one intended mock `execution_records` row exists in staging
- exactly one intended dependent `execution_record_audit_events` row exists in staging
- audit event references the created `execution_records.id`
- persisted data is sanitized mock/test metadata only
- no raw broker/browser payload was persisted
- no credentials/cookies/session/BankID material was persisted
- no unredacted broker document was persisted
- no real broker/Avanza data was persisted
- no extra tables were touched where possible
- idempotency behavior is documented without broad/repeated writes

## Not Authorized

This design does not authorize:

- implementation in this action
- write execution in this action
- production connection
- production write
- real broker/Avanza data
- API write behavior
- Trade UI/runtime activation
- Avanza/browser automation
- settlement retrieval
- order behavior
- live trade mutation
- live position mutation
- broad writes
- blind retry
- direct SQL/manual dashboard writes

## Future Gates

Required future gates:

- source-controlled staging insert function implementation no execution
- source-controlled staging insert function static/security review
- final one-shot staging mock write retry
- post-write verification and cleanup/reconciliation gate

Production remains blocked. Runtime/API/UI write paths remain blocked. Avanza/browser automation remains blocked.

## Safety Confirmation

This action did not perform:

- production connection
- production Supabase write
- staging data write
- test row insertion
- migration action
- DB/Supabase write
- write command execution
- adapter execution behavior change
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
