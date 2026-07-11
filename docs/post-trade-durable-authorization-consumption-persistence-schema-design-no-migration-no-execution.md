# Action 497 - Durable Authorization Consumption Persistence Schema Design No Migration No Execution

Decision: `post_trade_durable_authorization_consumption_persistence_schema_design_ready_for_static_security_review`

Result status: `post_trade_durable_authorization_consumption_persistence_schema_design_added_no_migration_no_execution`

## Purpose

This checkpoint designs the source-controlled persistence schema required to durably and atomically enforce one-shot staging execution authorization. It is a typed TypeScript schema specification only. It does not create a migration, write SQL, call Supabase, create tables, create indexes, create constraints, enable RLS, create a database function, persist authorization, consume authorization, invoke execution, or write staging data.

## Files Added

- `lib/post-trade-durable-authorization-consumption-persistence-schema-design.ts`
- `tests/e2e/post-trade-durable-authorization-consumption-persistence-schema-design.spec.ts`

## Selected Table

The selected dedicated table name is `execution_authorization_consumptions`.

The table is execution-specific and intentionally distinct from `execution_records`, `execution_record_audit_events`, trade records, position records, broker records, and recommendation records.

## State Model

The durable schema design uses the smallest safe authoritative state set:

- `unused`
- `consumed`
- `invalid`
- `expired`

Recommended initial state is `unused`. Ambiguity is not persisted as an authoritative durable state. Ambiguous outcomes remain caller-side observations requiring authoritative read-back before any future continuation.

## Column Inventory

Database-managed columns:

- `id`
- `created_at`

Immutable identity, binding, contract, and safety columns:

- `authorization_artifact_id`
- `authorization_artifact_version`
- `authorization_fingerprint`
- `authorization_type`
- `source_action_identity`
- `execution_attempt_id`
- `execution_plan_id`
- `consumption_operation_id`
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
- `expected_operation_count`
- `expected_row_count`
- `first_target_table`
- `second_target_table`
- `audit_dependency_identity`
- `mock_only`
- `one_shot`
- `retry_allowed`
- `issued_at`
- `expires_at`
- `staging_only`
- `server_only`
- `source_controlled`
- `execution_disabled_before_consumption`
- `production_access_allowed`
- `api_invocation_allowed`
- `ui_invocation_allowed`
- `client_invocation_allowed`
- `browser_automation_allowed`
- `broker_interaction_allowed`
- `avanza_interaction_allowed`
- `credential_handling_allowed`
- `session_handling_allowed`
- `bankid_handling_allowed`
- `migration_capability_allowed`
- `schema_mutation_allowed`
- `trade_mutation_allowed`
- `position_mutation_allowed`
- `order_mutation_allowed`

Atomic-consumption-only columns:

- `authorization_state`
- `consumed_at`
- `execution_record_id`
- `execution_audit_event_id`
- `affected_authorization_row_count`
- `persistence_operation_identity`
- `result_classification`
- `updated_at`

## Mutability Classification

Authorization identity, target binding, execution-function binding, final-gate binding, expected execution contract, timestamps for issuance/expiry, and safety markers are immutable after insert.

Only the atomic consumption fields may change, and only inside a future reviewed staging-only database function or transaction boundary. Direct table update privileges should be denied for client roles and should not be used as the execution path.

## Uniqueness Model

The design requires staging-scoped uniqueness for:

- authorization artifact id
- authorization fingerprint
- execution attempt id
- execution plan id
- consumption operation id
- authorization artifact id plus execution plan id

This prevents duplicate authorization rows, duplicate attempts, duplicate operations, artifact reuse across plans, plan reuse through multiple authorizations, and bypass attempts using a new operation or attempt id.

## Check Constraints

The future migration should provide constraints for:

- target project must be staging `pdvzyuhykomwfqyyztru`
- production marker is rejected target `ekdyopdrrkphlrsilyoo` only, not an execution target
- allowed states only
- consumed-at matches state
- execution ids match state
- result classification matches state
- expiry follows issuance
- validity window is bounded
- one-shot is true
- retry is false
- mock-only is true
- expected operation and row counts are fixed at two
- ordered target tables are exact
- audit dependency is exact
- forbidden capability markers remain false

## Timestamp Invariants

The future schema should require expiry after issuance, a bounded validity window, null `consumed_at` before consumption, non-null `consumed_at` after consumption, and consumed evidence that is temporally consistent with issuance and expiry.

## Execution Evidence Model

Successful durable consumption requires both:

- `execution_record_id`
- `execution_audit_event_id`

It also requires `affected_authorization_row_count` to be exactly one, a matching persistence-operation identity, and a reviewed success classification.

## Foreign-Key Strategy

The design recommends referencing both `execution_records.id` and `execution_record_audit_events.id`, with an explicit consistency requirement that the audit event references the same execution record. This gives the strongest read-back evidence while preserving the dependency from execution record to audit event.

## Index Strategy

Future indexes are planned for:

- authorization artifact lookup
- read-back verification across immutable identifiers
- replay detection by execution attempt and consumption operation
- expiry sweep by state and expiry timestamp

## RLS And Privileges

The future table should have RLS enabled and no client-facing policies. `anon` and `authenticated` must have no direct select, insert, update, or function execution access.

Service-role bypass of RLS remains a risk and should be mitigated by routing mutation through a reviewed staging-only database function. The design recommends denying direct service-role table insert/update for the intended path and granting execution capability only to the reviewed function boundary in a later, separately gated migration.

## Database Function Boundary

A future staging-only database function should atomically:

1. identify the exact unused authorization row
2. compare all immutable identity and safety fields
3. reject expired or mismatched authorization
4. insert one mock `execution_records` row
5. obtain its id
6. insert one dependent `execution_record_audit_events` row
7. transition authorization state to `consumed`
8. attach both created ids
9. store authoritative evidence
10. return a strict result object

The function must use one transaction, no partial commits, no retry loop, no broad JSON input, no dynamic SQL, no dynamic table names, no caller-provided production target, and no arbitrary caller-provided payload.

## Append-Only Audit Decision

The recommended initial architecture is one durable state row plus the existing `execution_record_audit_events` evidence. A separate append-only authorization ledger is not initially required because it adds operational surface area without materially improving one-shot enforcement for the first staging-only mock write path.

## Migration Plan

No migration was created in this action.

The future migration plan is:

- create a dedicated staging-only table
- create exact constraints
- create indexes
- enable RLS
- revoke client access
- create no client policies
- prepare a server-only function privilege model
- leave execution function creation for a later action
- seed no rows
- keep production deployment blocked
- include rollback and verification steps

## Verification Plan

Future verification should confirm:

- table exists in staging only
- exact columns exist and unexpected columns do not
- constraints, uniqueness rules, and indexes exist
- RLS is enabled
- no client policies exist
- no client grants exist
- production is unchanged
- migration creates zero rows
- direct client insert/update is rejected

## Remaining Risks

This is a schema design only. It still needs a static/security review, a separately approved migration draft, migration static review, staging apply gate, live read-only verification, and a reviewed database function before any durable authorization consumption or execution can occur.

## No-Execution Confirmation

No migration, SQL, Supabase call, table/index/constraint/RLS/function creation, persistence, authorization consumption, source-controlled execution function invocation, write-capable adapter invocation, final gate execution, staging row creation, production connection, API/UI/runtime activation, Avanza/browser automation, credential/session/cookie/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Recommended next action:

`Action 498 - Perform Static and Security Review of Durable Authorization Consumption Persistence Schema Design`
