# Action 500 - Durable Authorization Consumption Staging Migration Static SQL/Security Review No Deployment No Execution

Decision: `post_trade_durable_authorization_consumption_staging_migration_static_sql_security_review_ready_for_staging_deployment_gate`

Result status: `post_trade_durable_authorization_consumption_staging_migration_static_sql_security_review_completed_no_deployment_no_execution`

## Migration Reviewed

- `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`

## Repository Compatibility Findings

The migration is ordered after `20260709000000_create_historical_candle_storage.sql` and after the existing execution evidence migrations:

- `20260614000000_create_execution_records.sql`
- `20260615000000_create_execution_record_audit_events.sql`

Compatibility findings:

- `public.execution_records(id)` is `uuid primary key default gen_random_uuid()`.
- `public.execution_record_audit_events(id)` is `uuid primary key default gen_random_uuid()`.
- `public.execution_record_audit_events.execution_record_id` already references `public.execution_records(id) on delete restrict`.
- The new migration uses `uuid` FK columns and `on delete restrict`.
- Timestamp columns use `timestamptz` and `now()`, matching current execution/post-trade conventions.
- `gen_random_uuid()` is already used by repository migrations.

## SQL Syntax Findings

Static review found the migration is a forward schema migration with explicit statements, semicolons, schema-qualified table names, valid check expressions, valid interval syntax, valid boolean comparisons, valid FK syntax, valid RLS syntax, and valid revoke syntax.

No undeclared variables, environment substitution, procedural block, dynamic SQL, trigger, RPC, or function definition exists.

## SQL Fixes Made During Review

- Removed physical safety/prohibition capability columns from the migration table.
- Replaced that flexible capability storage with absence of those columns plus fixed project/state/evidence constraints, RLS, and privilege revocation.
- Added non-empty checks for critical text identity and binding fields.
- Expanded static tests to detect JSON/JSONB, payload, metadata, browser/broker/credential/session/BankID fields, permissive policies, broad grants, destructive statements, procedural SQL, triggers, functions, and unrelated `ALTER TABLE`.

## Table Findings

The exact table is `public.execution_authorization_consumptions`.

No temporary table, unlogged table, inherited table, partitioned table, alternate table, generic JSON metadata table, payload/blob table, production-target capability table, or runtime invocation table is created.

## Column Findings

Columns remain scoped to:

- authorization identity
- execution binding
- execution contract
- lifecycle
- execution evidence

Critical identity and binding fields are `not null`. Values that must be supplied by a future reviewed boundary do not receive caller-bypassing defaults. Fixed contract values intentionally default to the reviewed staging semantics.

Text columns remain `text` for compatibility with existing repository conventions, but critical text identity fields now require `length(btrim(...)) > 0`.

## Constraint Findings

Project constraints enforce:

- `target_project_id = 'pdvzyuhykomwfqyyztru'`
- target project is not `ekdyopdrrkphlrsilyoo`
- `rejected_production_project_id = 'ekdyopdrrkphlrsilyoo'`

State constraints allow only:

- `unused`
- `consumed`
- `invalid`
- `expired`

Execution contract constraints enforce operation count `2`, row count `2`, first table `execution_records`, second table `execution_record_audit_events`, table order not equal/reversed, exact audit dependency, `mock_only = true`, `one_shot = true`, and `retry_allowed = false`.

Timestamp constraints enforce `expires_at > issued_at` and a bounded 15-minute validity window. Consumed evidence additionally requires `consumed_at >= issued_at` and `consumed_at <= expires_at`.

## Evidence-Invariant Findings

The migration prevents partial evidence states:

- `unused` rows cannot have consumed timestamp, execution ids, affected-row evidence, persistence operation identity, or result classification.
- `consumed` rows must have consumed timestamp, both execution ids, affected authorization rows exactly `1`, persistence operation identity, and exact result classification `transitioned_unused_to_consumed`.
- `invalid` and `expired` rows cannot have execution evidence.

The SQL does not permit generic success classification as a consumed result.

## Uniqueness Findings

Staging-scoped uniqueness exists for:

- artifact id
- authorization fingerprint
- execution attempt id
- execution plan id
- consumption operation id
- artifact id plus execution plan id

Critical unique identity columns are non-null, so uniqueness cannot be bypassed by null values. No weak partial unique indexes are used for these identities.

## Foreign-Key Findings

The migration references:

- `public.execution_records(id)` as UUID with `on delete restrict`
- `public.execution_record_audit_events(id)` as UUID with `on delete restrict`

No cascade, set-null, or set-default delete behavior exists.

## Audit/Execution Ownership Limitation

Simple FKs can prove both referenced rows exist, but they cannot by themselves prove that `execution_audit_event_id` belongs to the same `execution_record_id`. This remains a required future atomic database-function invariant and post-write verification requirement. No trigger was added in this action.

## Index Findings

Unique indexes cover replay/identity paths. Non-unique indexes are limited to:

- immutable read-back lookup
- state/expiry review

No generic broad index or production-specific index exists.

## RLS Findings

RLS is enabled on `public.execution_authorization_consumptions`.

No policy is created. No anon policy, authenticated policy, permissive `USING (true)` policy, client select policy, client insert policy, client update policy, or client delete policy exists.

## Privilege Findings

The migration revokes all table privileges from `anon` and `authenticated`. It creates no grant to `public`, no grant to client roles, and no direct service-role mutation grant.

Future deployment verification must still inspect live grants/default privileges because schema-level or platform defaults can only be proven in the target catalog after deployment.

## Service-Role Risk

Service role may bypass RLS. Application code must not directly mutate this table. The only intended future mutation boundary is a separately reviewed staging-only database function with narrow source-controlled inputs, no dynamic SQL, no generic upsert, no partial commit, and no retry loop.

## Migration-Safety Findings

The migration creates schema only. It contains no insert, update, delete, merge, truncate, drop, trigger, function, RPC, dynamic SQL, procedural block, extension installation, production connection command, schema reset, API/UI/runtime wiring, seed rows, authorization rows, execution rows, audit rows, authorization consumption, adapter invocation, or final gate execution.

## Idempotency Findings

The migration uses repository-style `if not exists` for table and index creation. Static review treats this as source-controlled migration convention, not as a supported runtime rerun or drift-acceptance mechanism. Staging deployment must still happen once through the reviewed migration path and must be followed by catalog verification.

## Rollback Findings

No rollback SQL was added or executed. Future rollback remains a manual/reviewed staging-only plan:

- allowed only if zero rows exist
- stop for manual review if any evidence row exists
- no cascade into `execution_records`
- no cascade into `execution_record_audit_events`
- no silent deletion of durable evidence
- no production touch

## Static-Test Changes

The migration static test now covers filename/timestamp ordering, single intended table creation, no temporary/unlogged/inherited/partitioned table, UUID primary key, critical columns, non-empty identity checks, exact state/project/count/table/audit constraints, evidence invariants, uniqueness, FK behavior, RLS, revokes, absence of policies/grants/functions/triggers/RPC/procedural SQL/destructive SQL, no runtime wiring, no JSON/payload/metadata fields, and repeated side-effect-free text inspection.

## Remaining Risks

The migration is ready for a separate staging deployment gate, but it has not been applied. Remaining proof still requires deployment approval, staging apply, live catalog verification, generated type verification if needed, and later design/review of the atomic database function.

## No-Deployment Confirmation

No SQL was executed. No migration was deployed. No Supabase CLI or remote command was run. No staging or production connection occurred. No remote schema mutation, row creation, persistence, authorization consumption, database function creation, RPC creation, execution invocation, adapter invocation, final gate execution, API/UI/runtime activation, Avanza/browser automation, credential/session/cookie/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Recommended next action:

`Action 501 - Add Explicit Source-Controlled Staging Migration Deployment Gate, Without Deployment`
