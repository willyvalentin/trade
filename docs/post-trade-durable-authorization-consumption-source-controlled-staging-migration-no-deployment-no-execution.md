# Action 499 - Durable Authorization Consumption Source-Controlled Staging Migration No Deployment No Execution

Decision: `post_trade_durable_authorization_consumption_source_controlled_staging_migration_ready_for_static_sql_security_review`

Result status: `post_trade_durable_authorization_consumption_source_controlled_staging_migration_added_no_deployment_no_execution`

## Migration File

- `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`

This action created one source-controlled migration file only. It was not deployed or executed.

## Table Created

- `public.execution_authorization_consumptions`

The table is dedicated to durable one-shot staging execution authorization consumption. It is separate from `execution_records`, `execution_record_audit_events`, recommendation tables, position tables, trade tables, and any broker/runtime tables.

## Primary Key And Foreign-Key Types

The migration follows repository conventions:

- primary key: `id uuid primary key default gen_random_uuid()`
- `execution_record_id uuid null references public.execution_records(id) on delete restrict`
- `execution_audit_event_id uuid null references public.execution_record_audit_events(id) on delete restrict`

The referenced tables use `uuid` primary keys in the existing migrations.

## Column Groups

Identity:

- `id`
- `authorization_artifact_id`
- `authorization_artifact_version`
- `authorization_fingerprint`
- `authorization_type`
- `source_action_identity`
- `execution_attempt_id`
- `execution_plan_id`
- `consumption_operation_id`

Binding:

- `execution_scope`
- `target_project_id`
- `rejected_production_project_id`
- `execution_function_name`
- `execution_function_contract_version`
- `execution_function_implementation_decision`
- `execution_function_review_decision`
- `final_gate_identity`
- `final_gate_implementation_decision`
- `final_gate_review_decision`

Execution contract:

- `expected_operation_count`
- `expected_row_count`
- `first_target_table`
- `second_target_table`
- `audit_dependency_identity`
- `mock_only`
- `one_shot`
- `retry_allowed`

Lifecycle:

- `authorization_state`
- `issued_at`
- `expires_at`
- `consumed_at`
- `created_at`
- `updated_at`

Execution evidence:

- `execution_record_id`
- `execution_audit_event_id`
- `affected_authorization_row_count`
- `persistence_operation_identity`
- `result_classification`

Capability/prohibition markers are not physically stored as flexible state. The migration relies on absence of capability columns, fixed staging/production constraints, RLS, privilege revocation, and the future reviewed database-function boundary.

## Defaults

Safe semantic defaults:

- `authorization_state = 'unused'`
- `target_project_id = 'pdvzyuhykomwfqyyztru'`
- `rejected_production_project_id = 'ekdyopdrrkphlrsilyoo'`
- `expected_operation_count = 2`
- `expected_row_count = 2`
- `first_target_table = 'execution_records'`
- `second_target_table = 'execution_record_audit_events'`
- `audit_dependency_identity = 'execution_record_audit_events.execution_record_id_from_execution_records.id'`
- `mock_only = true`
- `one_shot = true`
- `retry_allowed = false`
- `created_at = now()`
- `updated_at = now()`

Execution-critical identity fields are not defaulted and must be supplied by a future reviewed server/database boundary.

## Constraints

The migration adds check constraints for:

- target project is exactly staging `pdvzyuhykomwfqyyztru`
- target project is not production `ekdyopdrrkphlrsilyoo`
- rejected production marker is exactly `ekdyopdrrkphlrsilyoo`
- allowed states are `unused`, `consumed`, `invalid`, and `expired`
- execution scope is fixed
- operation and row counts are fixed at two
- ordered target tables are fixed and cannot be reversed or duplicated
- audit dependency is exact
- mock-only, one-shot, and retry settings are fixed
- expiry is after issuance and bounded to 15 minutes
- unused rows have no consumption evidence
- consumed rows have complete authoritative evidence
- invalid/expired rows have no execution evidence
- no runtime, client, broker, browser, credential, session, BankID, trade, position, or order capability columns exist

No trigger was added. Historical transition enforcement remains assigned to a future reviewed atomic database function and privilege boundary.

## Uniqueness

The migration adds staging-scoped unique indexes for:

- `target_project_id, authorization_artifact_id`
- `target_project_id, authorization_fingerprint`
- `target_project_id, execution_attempt_id`
- `target_project_id, execution_plan_id`
- `target_project_id, consumption_operation_id`
- `target_project_id, authorization_artifact_id, execution_plan_id`

All critical unique identity columns are non-null.

## Foreign Keys

The migration references both execution evidence tables with conservative delete behavior:

- `execution_records(id) on delete restrict`
- `execution_record_audit_events(id) on delete restrict`

The future atomic database function must still verify that the audit event belongs to the stored execution record. That cross-row ownership proof is documented rather than implemented as a trigger in this action.

## Index Strategy

Non-redundant supporting indexes:

- read-back lookup across immutable identifiers
- state/expiry review

The uniqueness indexes cover artifact, fingerprint, attempt, plan, operation, and artifact/plan replay detection.

## RLS And Privileges

RLS is enabled on `public.execution_authorization_consumptions`.

The migration creates no policies and revokes table privileges from `anon` and `authenticated`. It does not grant direct service-role mutation privileges. A future reviewed database function must define its own narrow privilege model in a separate action.

## Zero-Row Behavior

The migration contains no seed inserts, no authorization rows, no execution rows, no audit rows, no database function, no RPC, no runtime writer, and no API/UI/client wiring. Applying it should create schema only and zero data rows.

## Staging And Production Posture

The table is constrained to staging project `pdvzyuhykomwfqyyztru`. Production project `ekdyopdrrkphlrsilyoo` is represented only as a rejected-production marker and cannot be the target.

No production deployment, production connection, or production write occurred.

## Rollback Plan

Rollback is a future manual/reviewed plan only:

- staging-only
- allowed only if zero rows exist
- must stop for manual review if any row exists
- must not cascade into `execution_records`
- must not cascade into `execution_record_audit_events`
- must never silently delete durable authorization or execution evidence
- must not touch production

No rollback SQL was created in this action.

## Expected Review Steps

Next review should statically inspect the migration SQL for:

- exact table/column/constraint/index/FK/RLS/privilege posture
- compatibility with existing execution table key types
- no rows created
- no database function or RPC
- no permissive client policy
- no cascade deletion
- no production deployment behavior
- no runtime/API/UI wiring

## No-Deployment Confirmation

No migration deployment, SQL execution, Supabase CLI command, Supabase remote call, remote schema mutation, table creation in a database, row creation, authorization consumption, execution function invocation, adapter invocation, final gate execution, production connection, API/UI/client wiring, runtime activation, Avanza/browser automation, credential/session/cookie/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Recommended next action:

`Action 500 - Perform Static SQL and Security Review of Durable Authorization Consumption Staging Migration`
