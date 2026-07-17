# Action 498 - Durable Authorization Consumption Persistence Schema Design Static/Security Review No Migration No Execution

Decision: `post_trade_durable_authorization_consumption_persistence_schema_design_static_security_review_ready_for_source_controlled_migration_implementation`

Result status: `post_trade_durable_authorization_consumption_persistence_schema_design_static_security_review_completed_no_migration_no_execution`

## Files Reviewed

- `lib/post-trade-durable-authorization-consumption-persistence-schema-design.ts`
- `tests/e2e/post-trade-durable-authorization-consumption-persistence-schema-design.spec.ts`
- `docs/post-trade-durable-authorization-consumption-persistence-schema-design-no-migration-no-execution.md`
- `lib/post-trade-durable-one-shot-authorization-consumption-contract.ts`
- `lib/post-trade-staging-execution-authorization-artifact-core.ts`
- `lib/post-trade-final-staging-execution-gate-core.ts`
- `lib/post-trade-staging-execution-function.ts`
- `lib/post-trade-staging-insert-function.ts`

## Exact Table Name

The reviewed table name remains `execution_authorization_consumptions`. No alternate alias is accepted by the validator. The design remains separate from execution rows, audit rows, recommendation rows, position rows, trade rows, broker state, and generic persistence abstractions.

## Column Review

The column inventory remains specific to durable execution authorization consumption. No arbitrary metadata column, raw JSON/blob column, broker payload column, browser state column, credential column, session column, cookie column, BankID column, trade mutation column, or production execution column was added.

Classification:

- database-managed: `id`, `created_at`
- immutable after insert: authorization identity, artifact version/fingerprint, source action identity, execution attempt/plan/operation identity, staging/production binding, execution-function identity, final-gate identity, expected counts, ordered tables, audit dependency, timestamp issuance/expiry, and safety markers
- atomic-consumption-only: `authorization_state`, `consumed_at`, `execution_record_id`, `execution_audit_event_id`, `affected_authorization_row_count`, `persistence_operation_identity`, `result_classification`, `updated_at`

No columns were removed. The review hardened classification by requiring critical unique identity fields to be non-null.

## State-Model Findings

The smallest safe durable state model remains:

- `unused`
- `consumed`
- `invalid`
- `expired`

`ambiguous`, `pending`, and `reserved` are not persisted. Ambiguity remains a caller-side observation that requires authoritative read-back. The reviewed transition model is:

- insert as `unused`
- `unused -> consumed` only inside the reviewed atomic consumption function
- optional `unused -> invalid`
- optional `unused -> expired`

There is no transition from `consumed`, `invalid`, or `expired` back to a usable state.

## Uniqueness Findings

The design uses staging-scoped composite uniqueness, with `target_project_id` as the first column, for:

- authorization artifact id
- authorization fingerprint
- execution attempt id
- execution plan id
- consumption operation id
- authorization artifact id plus execution plan id

The validator now rejects missing unique constraints, wrong unique columns, global scope where staging-scoped uniqueness is required, and nullable critical identity fields.

## Constraint Findings

The required future constraints cover exact staging target, explicit rejected-production marker, allowed states, consumed timestamp/state consistency, execution id/state consistency, authoritative result classification, affected authorization rows exactly one, persistence operation identity after consumption, expiry after issuance, bounded validity, no usable reactivation, partial-evidence prevention, one-shot true, retry false, mock-only true, exact counts, exact ordered target tables, exact audit dependency, and forbidden capability markers.

Partial-evidence states such as consumed without audit id, consumed without execution id, consumed without operation identity, unused with consumed timestamp, or unused with execution ids remain rejected by design.

## Foreign-Key Findings

The design continues to require references to both:

- `execution_records.id`
- `execution_record_audit_events.id`

The audit FK must carry the consistency requirement that the audit event references the same execution record stored on the consumption row. Future delete behavior should be `RESTRICT` or `NO ACTION`; cascade deletion is rejected because it could destroy durable forensic evidence. Deferrable constraints may be appropriate inside the future transaction, but no SQL was written here.

## Index Findings

Indexes remain planned for artifact lookup, read-back, replay detection, and expiry review. The future migration should avoid redundant indexes that are already covered by unique constraints and should not create alternate weak identity paths.

## RLS And Privilege Findings

The design requires RLS enabled, no client policies, no client select policies, no anon access, no authenticated-user access, no direct client insert/update/delete/select, and no Trade UI/client access.

Service-role bypass remains the major operational risk. Defense in depth is the reviewed database-function boundary: server-only module boundaries, exact source-controlled function call, narrow inputs, denied direct mutation where technically possible, review gates, staging-only deployment, and no production function during initial verification.

## Atomic Database-Function Boundary

The future function must be staging-only and must atomically identify one exact unused authorization, compare all immutable binding fields, reject expiry and mismatches, insert exactly one mock `execution_records` row, insert exactly one dependent `execution_record_audit_events` row, verify audit ownership, update the durable consumption row with both ids and evidence, and return a strict authoritative result.

The design rejects dynamic SQL, dynamic table names, broad JSON input, caller-provided production target, partial commits, retry loops, application-coordinated sequential writes, direct service-role mutation outside the function, and generic upsert semantics.

## Migration-Plan Findings

The migration plan remains future-only. It requires exact table, columns, constraints, unique constraints, required indexes, foreign keys, RLS enablement, privilege revocation, no client policies, no seed rows, no authorization rows, no execution rows, staging-only deployment, production exclusion, rollback plan, and post-deploy verification. It explicitly leaves database-function creation to a later action.

## Rollback Findings

Rollback must be staging-only and must remove only unused new schema objects. It must require manual review if rows unexpectedly exist, must never silently delete execution evidence, must not cascade into `execution_records` or `execution_record_audit_events`, and must not touch production.

## Verification-Plan Findings

Future verification must check staging table presence, production absence, exact columns, unknown-column absence, exact data types, exact nullability, constraints, uniqueness, indexes, foreign keys, RLS, no anon/authenticated policies, no client grants, rejected direct client insert/update/delete, zero durable authorization rows, no execution rows created, no audit rows created, and no runtime path activation.

## Validator Findings

The pure TypeScript validator remains deterministic, side-effect free, SQL-free, migration-free, Supabase-free, and fail-closed. Review hardening added rejection for:

- unsafe transition models
- nullable critical identity fields
- weakened unique columns or scope
- missing affected-row, operation-identity, no-reactivation, and partial-evidence constraints
- cascade foreign-key deletion
- missing audit/execution consistency requirement
- client select policies
- direct delete grants
- broad JSON input
- dynamic table names
- application sequential writes
- generic upserts
- seeded authorization or execution rows
- destructive rollback after rows
- cascade rollback
- runtime API/UI wiring in the migration plan
- missing production-absence, exact-schema, zero-row, and direct-delete verification

## Adversarial Tests

Focused adversarial tests now cover table identity, column inventory, mutability, nullable unique identities, unknown columns, altered types, altered nullability, weakened uniqueness, unsafe transitions, persisted ambiguous/pending/reserved states, missing constraints, partial evidence bypasses, cascade delete behavior, missing audit ownership, weakened RLS, client grants, direct service-role mutation, broad function behavior, migration seed rows, destructive rollback hazards, missing verification checks, SQL-free source, Supabase-free source, persistence-free source, and execution-free source.

## Changes Made During Review

- Added typed transition requirements.
- Added FK delete behavior and deferrability recommendations.
- Added client select policy and direct delete privilege requirements.
- Added function-boundary bans for application sequential writes and generic upsert.
- Added migration-plan bans for authorization/execution seed rows, destructive rollback with rows, cascade rollback, and runtime wiring.
- Added verification requirements for production absence, unknown-column absence, exact type/nullability, zero authorization rows, no execution/audit rows, and direct client delete rejection.
- Expanded validator and tests for the above.

## Remaining Risks

This is still a schema design and static review only. A separately approved source-controlled migration implementation, migration static/security review, staging deployment gate, read-only verification, and later reviewed database-function implementation are still required before durable authorization consumption can exist.

## Final Review Decision

The durable authorization-consumption persistence schema design is ready for separate source-controlled migration implementation.

No migration file, SQL text, SQL execution, Supabase call, schema mutation, table/index/constraint/policy/RLS/function creation, persistence, authorization consumption, execution function invocation, adapter invocation, final gate execution, staging row creation, production connection, API/UI/client wiring, runtime activation, Avanza/browser automation, credential/session/cookie/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Recommended next action:

`Action 499 - Implement Source-Controlled Staging Migration for Durable Authorization Consumption Schema, Without Deployment or Execution`
