# Post-Trade Service Layer Draft, No Write

## Summary

Purpose: create an isolated post-trade service-layer draft that models future server-side persistence operations without importing Supabase, using service-role authority, writing data, or connecting to any database.

Result: no-write service planning module is ready. It returns a structured dry-run plan only.

Decision: `post_trade_service_layer_draft_ready_no_write`.

## Implemented Files

- `lib/post-trade-persistence-service-plan.ts`
- `tests/e2e/post-trade-persistence-service-plan.spec.ts`

Related files:

- `lib/post-trade-payload-validator.ts`
- `app/api/post-trade/payload/validate/route.ts`

## Service Draft Behavior

The service draft accepts a post-trade payload validation result and only plans from a valid result with an accepted payload.

It rejects:

- raw unvalidated payloads
- invalid validation results
- validation wrappers with missing accepted payloads
- accepted payloads that contain forbidden raw broker/browser, credential/session/BankID, token, unredacted document, order authority, or live mutation fields
- validation results with unsafe safety flags

## Dry-Run Plan Shape

For valid accepted payloads, the module returns:

- target tables
- intended operation type marked `dry_run_planned_insert`
- operation mode marked `no_write_plan_only`
- idempotency key
- duplicate prevention key when present
- audit event plan for `execution_record_audit_events`
- safety flags proving no database connection, no database write, no Supabase client import, no service-role usage, no runtime activation, no Trade UI execution, and no live trade/position mutation

The plan is only a model for a future gated write path. It does not persist data.

## Target Tables Modeled

The draft may model dry-run plans for:

- `execution_settlement_reviews`
- `execution_confirmation_evidence`
- `execution_cost_breakdowns`
- `execution_deviation_reviews`
- `execution_learning_candidates`
- `execution_redacted_artifacts`
- `execution_record_audit_events`

## No-Write Boundary

Confirmed by implementation and tests:

- no Supabase client import
- no service-role usage
- no database connection
- no DB/Supabase write
- no API write behavior
- no route write integration
- no runtime write-path activation
- no Trade UI execution
- no broker/Avanza behavior
- no credential/cookie/session/BankID handling
- no order behavior
- no settlement retrieval
- no live trade mutation
- no live position mutation

## Test Coverage

New tests cover:

- valid accepted payload produces a dry-run write plan
- invalid validation result is rejected
- missing accepted payload is rejected
- raw unvalidated payload is rejected without echoing raw content
- unsafe accepted payload shape is rejected
- module source imports no Supabase client, service-role helper, API route, Trade UI, or write service
- module source contains no write-call fragments

## Still Forbidden

Still forbidden:

- production DB connection
- production Supabase write
- staging data write
- test row insertion
- migration apply
- migration repair
- Supabase client import
- service-role usage
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

## Final Decision

`post_trade_service_layer_draft_ready_no_write`
