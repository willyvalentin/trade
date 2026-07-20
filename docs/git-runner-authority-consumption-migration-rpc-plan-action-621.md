# Action 621 - Git Runner Authority Consumption Migration And RPC Plan

Decision: `post_trade_git_runner_authority_consumption_migration_rpc_plan_ready`

Result status: `post_trade_git_runner_authority_consumption_action_621_planning_gate_completed`

Recommended next Action: Action 622 - Implement Git Runner Authority Consumption Storage Schema Migration

## Approved Baseline

Action 621 plans the future Postgres/Supabase storage and transactional RPC package for the final-approved dormant Git runner authority-consumption chain:

1. Action 607-612 final-approved pure dormant Git runner authority package;
2. Action 613 atomic one-shot consumption architecture;
3. Action 614 three-table storage and transaction architecture;
4. Action 615-620 final-approved pure authority-consumption transition contract.

This action is planning-only. It creates no SQL, migration, RPC, persistence adapter, storage behavior, runtime caller, runner, Git execution, process creation, process observation, repository inspection, credentials, environment access, network access, Avanza/trading behavior, staging activation, or deployment.

The known absent migration `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` targets the older execution-authorization path and must not be recreated or reused. The Git runner schema is independently named and versioned because it stores six-stage Git runner package consumption, not staging execution-authorization consumption.

## Migration Package Structure

Use two future migrations:

1. `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`
   - creates tables, CHECK constraints, unique constraints, indexes, comments, RLS enablement, and deny-all table grants;
   - creates no mutating RPCs.

2. `supabase/migrations/20260720001000_create_git_runner_authority_consumption_rpcs.sql`
   - creates transactional SECURITY DEFINER functions/RPCs, fixed grants, comments, and function-level security posture;
   - does not alter unrelated tables.

The timestamps are newer than all current repository migrations and do not collide with existing files. If implementation occurs after another migration claims either timestamp, retain the exact suffixes and choose the next available later timestamp pair.

## Table Architecture

Use the approved three-table architecture:

1. `public.git_runner_authority_consumption_records`
2. `public.git_runner_authority_consumption_stages`
3. `public.git_runner_authority_consumption_audit_events`

Creation order:

1. records table;
2. stages table with FK to records;
3. audit table with FK to records;
4. indexes and CHECK/unique constraints;
5. RLS enablement, revocations, comments.

Do not collapse state into JSON event history. Do not reuse unrelated execution-authorization tables.

## Enum And CHECK Decision

Use text columns with exact CHECK constraints, not Postgres enums.

Rationale:

- CHECK-backed text remains fail-closed while allowing future reviewed states/reasons through ordinary migration changes.
- Postgres enums are harder to remove or reorder and can complicate downgrade/review workflows.
- The v1 contract is still closed because every state, operation, status, reason, stage outcome, and terminal reason must have an exact named CHECK constraint.

No unconstrained text is allowed for semantic state, operation, status, reason, terminal reason, or stage outcome.

Closed state values:

- `issued`
- `active`
- `partially_consumed`
- `consumed`
- `failed_consumed`
- `ambiguous_failed_consumed`
- `expired`
- `revoked`

Closed stage outcomes:

- `accepted`
- `accepted_detached_observation`
- `rejected`
- `process_failed`
- `ambiguous_process_state`

Closed audit status:

- `transition_permitted`
- `transition_rejected`

Closed audit operations:

- `register_package`
- `claim_consumer`
- `consume_stage`
- `record_stage_completion`
- `terminalize_failure`
- `terminalize_ambiguous_failure`
- `terminalize_expiry`
- `revoke_package`
- `finalize_aggregate`

## Package Table Model

Table: `public.git_runner_authority_consumption_records`.

Identity and immutable linkage columns:

| Column | Type | Nullability | Mutability |
| --- | --- | --- | --- |
| `id` | `uuid default gen_random_uuid()` | not null primary key | immutable |
| `consumption_key` | `text` | not null unique | immutable |
| `authority_package_id` | `text` | not null unique | immutable |
| `authority_package_fingerprint` | `text` | not null unique | immutable |
| `authority_policy_fingerprint` | `text` | not null | immutable |
| `schema_identity` | `text` | not null | immutable |
| `schema_version` | `integer` | not null | immutable |
| `package_contract_identity` | `text` | not null | immutable |
| `package_contract_version` | `integer` | not null | immutable |
| `capability_set_identity` | `text` | not null | immutable |
| `capability_set_version` | `integer` | not null | immutable |
| `expiry_policy_identity` | `text` | not null | immutable |
| `expiry_policy_version` | `integer` | not null | immutable |
| `freshness_policy_identity` | `text` | not null | immutable |
| `freshness_policy_version` | `integer` | not null | immutable |
| `session_fingerprint` | `text` | not null | immutable |
| `sequence_identity` | `text` | not null | immutable |
| `sequence_fingerprint` | `text` | not null | immutable |
| `executable_identity` | `text` | not null | immutable |
| `executable_fingerprint` | `text` | not null | immutable |
| `resolution_fingerprint` | `text` | not null | immutable |
| `revalidation_fingerprint` | `text` | not null | immutable |
| `worktree_fingerprint` | `text` | not null | immutable |
| `compatibility_result_fingerprint` | `text` | not null | immutable |
| `platform` | `text` | not null | immutable |
| `source_policy_identity` | `text` | not null | immutable |
| `source_policy_version` | `integer` | not null | immutable |
| `issued_at` | `timestamptz` | not null | immutable |
| `expires_at` | `timestamptz` | not null | immutable |

Mutable-by-RPC-only current state columns:

| Column | Type | Nullability |
| --- | --- | --- |
| `state` | `text` | not null |
| `current_stage_index` | `smallint` | not null |
| `consumed_stage_count` | `smallint` | not null |
| `remaining_stage_count` | `smallint` | not null |
| `transition_version` | `integer` | not null |
| `active_consumer_id` | `text` | null |
| `active_consumer_fingerprint` | `text` | null |
| `active_consumer_claimed_at` | `timestamptz` | null |
| `terminal` | `boolean` | not null |
| `terminal_reason` | `text` | null |
| `terminal_at` | `timestamptz` | null |
| `expired` | `boolean` | not null |
| `revoked` | `boolean` | not null |
| `retry_count` | `smallint` | not null default `0` |
| `fallback_attempted` | `boolean` | not null default `false` |
| `aggregate_fingerprint` | `text` | null |
| `next_audit_sequence` | `integer` | not null |
| `state_core_fingerprint` | `text` | not null |
| `last_audit_event_fingerprint` | `text` | null |
| `state_fingerprint` | `text` | not null |
| `created_at` | `timestamptz` | not null default `now()` |
| `updated_at` | `timestamptz` | not null default `now()` |
| `last_transition_at` | `timestamptz` | not null |

Do not use JSONB for current semantic state.

## Stage Table Model

Table: `public.git_runner_authority_consumption_stages`.

Columns:

| Column | Type | Nullability |
| --- | --- | --- |
| `id` | `uuid default gen_random_uuid()` | not null primary key |
| `consumption_record_id` | `uuid references public.git_runner_authority_consumption_records(id) on delete restrict` | not null |
| `stage_index` | `smallint` | not null |
| `stage_identity` | `text` | not null |
| `authority_policy_fingerprint` | `text` | not null |
| `stage_grant_fingerprint` | `text` | not null |
| `stage_authority_fingerprint` | `text` | not null |
| `process_request_fingerprint` | `text` | null |
| `consumed` | `boolean` | not null default `false` |
| `consumed_at` | `timestamptz` | null |
| `consumed_by_fingerprint` | `text` | null |
| `stage_consumption_fingerprint` | `text` | null |
| `completion_recorded` | `boolean` | not null default `false` |
| `completion_fingerprint` | `text` | null |
| `interpretation_fingerprint` | `text` | null |
| `stage_outcome` | `text` | null |
| `stage_reason` | `text` | null |
| `completed_at` | `timestamptz` | null |
| `stage_transition_version` | `integer` | not null |
| `stage_record_fingerprint` | `text` | not null |
| `created_at` | `timestamptz` | not null default `now()` |
| `updated_at` | `timestamptz` | not null default `now()` |

FK behavior: `on delete restrict`. There is no package-delete path in v1.

Exactly six rows are inserted during registration. Unique `(consumption_record_id, stage_index)` enforces one row per stage. Stage index must be `0` through `5`.

## Audit Table Model

Table: `public.git_runner_authority_consumption_audit_events`.

Columns:

| Column | Type | Nullability |
| --- | --- | --- |
| `id` | `uuid default gen_random_uuid()` | not null primary key |
| `consumption_record_id` | `uuid references public.git_runner_authority_consumption_records(id) on delete restrict` | not null |
| `package_id` | `text` | not null |
| `package_fingerprint` | `text` | not null |
| `authority_policy_fingerprint` | `text` | not null |
| `consumption_key` | `text` | not null |
| `consumer_fingerprint` | `text` | null |
| `stage_index` | `smallint` | null |
| `stage_identity` | `text` | null |
| `event_sequence` | `integer` | not null |
| `operation_identity` | `text` | not null |
| `event_status` | `text` | not null |
| `event_reason` | `text` | not null |
| `transition_version_before` | `integer` | null |
| `transition_version_after` | `integer` | null |
| `observed_at` | `timestamptz` | not null |
| `previous_state_fingerprint` | `text` | null |
| `next_state_core_fingerprint` | `text` | null |
| `next_state_fingerprint` | `text` | null |
| `relevant_evidence_fingerprint` | `text` | null |
| `event_fingerprint` | `text` | not null |
| `created_at` | `timestamptz` | not null default `now()` |

Audit rows are append-only. Grant no update or delete privileges. State mutation and audit insertion must commit or roll back together.

## Unique Constraints And Indexes

Unique constraints:

- `git_runner_authority_consumption_records_consumption_key_key` on `consumption_key`;
- `git_runner_authority_consumption_records_package_id_key` on `authority_package_id`;
- `git_runner_authority_consumption_records_package_fingerprint_key` on `authority_package_fingerprint`;
- `git_runner_authority_consumption_records_package_pair_key` on `(authority_package_id, authority_package_fingerprint)`;
- `git_runner_authority_consumption_stages_record_stage_key` on `(consumption_record_id, stage_index)`;
- `git_runner_authority_consumption_stages_stage_grant_key` on `(consumption_record_id, stage_grant_fingerprint)`;
- partial unique `git_runner_authority_consumption_stages_consumption_fingerprint_uidx` on `stage_consumption_fingerprint where stage_consumption_fingerprint is not null`;
- partial unique `git_runner_authority_consumption_stages_process_request_uidx` on `process_request_fingerprint where process_request_fingerprint is not null`;
- `git_runner_authority_consumption_audit_record_sequence_key` on `(consumption_record_id, event_sequence)`;
- `git_runner_authority_consumption_audit_event_fingerprint_key` on `event_fingerprint`.

Indexes:

- records by `authority_package_id`;
- records by `authority_package_fingerprint`;
- records by `(state, expires_at)`;
- records by `(active_consumer_fingerprint, state) where active_consumer_fingerprint is not null`;
- records by `(consumption_key, transition_version)`;
- stages by `(consumption_record_id, stage_index)`;
- stages by `(consumption_record_id, consumed, completion_recorded)`;
- audit by `(consumption_record_id, event_sequence)`;
- audit by `(operation_identity, created_at desc)`;
- audit by `event_fingerprint`.

These indexes support transactional lookup and review. They do not imply polling runtime or client access.

## CHECK Constraint Inventory

Global helper patterns:

- lowercase SHA-256: `^[a-f0-9]{64}$`;
- nonempty identity text: `length(btrim(column)) > 0`;
- fixed version: `schema_version = 1` and contract/policy versions `= 1`.

Package constraints:

- state in approved durable states;
- `current_stage_index between 0 and 6`;
- `consumed_stage_count between 0 and 6`;
- `remaining_stage_count between 0 and 6`;
- `consumed_stage_count + remaining_stage_count = 6`;
- `retry_count = 0`;
- `fallback_attempted = false`;
- `expires_at = issued_at + interval '30 seconds'`;
- `transition_version >= 1`;
- `next_audit_sequence >= 1`;
- terminal states have `terminal = true`, nonterminal states have `terminal = false`;
- `expired = true` only when state is `expired`;
- `revoked = true` only when state is `revoked`;
- `aggregate_fingerprint is not null` only when state is `consumed`;
- `issued` has zero progress, no consumer, stage index `0`, transition version `1`, and terminal false;
- active and partially consumed states require active consumer ID/fingerprint;
- terminal states require `terminal_reason` and `terminal_at` and no active consumer;
- consumed state requires six consumed, zero remaining, current stage `6`, terminal reason `sequence_consumed`;
- non-consumed states require `aggregate_fingerprint is null`.

Stage constraints:

- `stage_index between 0 and 5`;
- `consumed = false` requires consumed/process fields null;
- `consumed = true` requires consumed timestamp, consumer fingerprint, stage consumption fingerprint, and process request fingerprint;
- `completion_recorded = false` requires completion/outcome/reason/completed fields null;
- `completion_recorded = true` requires completion fingerprint, stage outcome, stage reason, and completed timestamp;
- completion requires consumption;
- accepted outcomes require interpretation fingerprint;
- rejected, failed, and ambiguous outcomes require interpretation fingerprint null;
- `accepted_detached_observation` allowed only at stage `3`;
- `stage_transition_version >= 1`;
- `retry_count = 0` if represented on the stage.

Audit constraints:

- operation in closed operation set;
- event status in closed status set;
- event reason in closed reason set;
- `event_sequence >= 0`;
- stage index null for non-stage operations and `0..5` for stage operations;
- stage identity null iff stage index null;
- permitted audit rows require `next_state_core_fingerprint`, `next_state_fingerprint`, and `transition_version_after`;
- SHA-256 grammar for all fingerprint columns;
- no raw output/path/process columns exist.

Cross-row invariants requiring RPC logic:

- exactly six stage rows per package;
- package counters equal stage rows;
- prior accepted completions gate later stage consumption;
- no stage completion before consumption;
- no duplicate terminalization after terminal state;
- audit append and state mutation atomicity;
- audit sequence allocation;
- transition version CAS;
- expiry/revocation race precedence.

## RPC Inventory

Future RPCs:

1. `public.register_git_runner_authority_package`
2. `public.claim_git_runner_authority_consumer`
3. `public.consume_git_runner_authority_stage`
4. `public.record_git_runner_authority_stage_completion`
5. `public.terminalize_git_runner_authority_failure`
6. `public.terminalize_git_runner_authority_ambiguous_failure`
7. `public.terminalize_git_runner_authority_expiry`
8. `public.revoke_git_runner_authority_package`
9. `public.finalize_git_runner_authority_aggregate`
10. `public.read_git_runner_authority_consumption_state`

No generic update-state RPC.

All mutating RPCs return a closed row shape:

- `status text`;
- `reason text`;
- `consumption_record_id uuid`;
- `consumption_key text`;
- `previous_state_fingerprint text`;
- `next_state_core_fingerprint text`;
- `next_state_fingerprint text`;
- `event_fingerprint text`;
- `transition_version_before integer`;
- `transition_version_after integer`;
- `storage_committed boolean`;
- `storage_ambiguous boolean`;
- `runtime_activated boolean default false`;
- `authority text default 'none'`;
- `error_public_reason text`.

Return no SQLSTATE, constraint name, table name, query text, stack trace, raw path, Git output, PID, process handle, environment value, credential, or arbitrary diagnostic blob.

## RPC Contracts

All RPCs take exact `p_` parameters only. None accepts caller-supplied next state or audit events.

### `register_git_runner_authority_package`

Parameters:

- `p_consumption_key text`;
- `p_authority_package_id text`;
- `p_authority_package_fingerprint text`;
- `p_authority_policy_fingerprint text`;
- `p_package_contract_identity text`;
- `p_package_contract_version integer`;
- `p_capability_set_identity text`;
- `p_capability_set_version integer`;
- `p_expiry_policy_identity text`;
- `p_expiry_policy_version integer`;
- `p_freshness_policy_identity text`;
- `p_freshness_policy_version integer`;
- `p_session_fingerprint text`;
- `p_sequence_identity text`;
- `p_sequence_fingerprint text`;
- `p_executable_identity text`;
- `p_executable_fingerprint text`;
- `p_resolution_fingerprint text`;
- `p_revalidation_fingerprint text`;
- `p_worktree_fingerprint text`;
- `p_compatibility_result_fingerprint text`;
- `p_platform text`;
- `p_source_policy_identity text`;
- `p_source_policy_version integer`;
- `p_issued_at timestamptz`;
- `p_expires_at timestamptz`;
- `p_state_core_fingerprint text`;
- `p_state_fingerprint text`;
- six exact stage tuples represented by fixed scalar parameters or a reviewed SQL composite array with exact length six;
- `p_observed_at timestamptz`;
- `p_event_fingerprint text`.

Effects: insert one package row, six stage rows, and one audit row in one transaction. Duplicate same ID/fingerprint maps to `duplicate_registration_rejected`; ID conflict maps to `package_identity_conflict_rejected`; fingerprint reuse maps to `package_fingerprint_reuse_rejected`; expired package maps to `registration_expired_rejected`.

### `claim_git_runner_authority_consumer`

Parameters:

- `p_consumption_key text`;
- `p_authority_package_fingerprint text`;
- `p_expected_transition_version integer`;
- `p_current_state_fingerprint text`;
- `p_consumer_id text`;
- `p_consumer_fingerprint text`;
- `p_observed_at timestamptz`;
- `p_next_state_core_fingerprint text`;
- `p_next_state_fingerprint text`;
- `p_event_fingerprint text`.

CAS: state `issued`, expected version, no consumer, nonterminal, unexpired, unrevoked, exact package linkage, stage zero.

### `consume_git_runner_authority_stage`

Parameters add:

- `p_stage_index smallint`;
- `p_stage_grant_fingerprint text`;
- `p_stage_consumption_fingerprint text`;
- `p_process_request_fingerprint text`.

CAS: package and stage rows locked, active consumer matches, stage equals current stage, no in-flight stage, stage unconsumed, prior accepted completions satisfied, before expiry, nonterminal, retry/fallback false.

Success marks the stage consumed before any future process creation. No process is created by the RPC.

### `record_git_runner_authority_stage_completion`

Parameters add:

- `p_stage_index smallint`;
- `p_process_request_fingerprint text`;
- `p_completion_fingerprint text`;
- `p_interpretation_fingerprint text`;
- `p_stage_outcome text`;
- `p_completed_at timestamptz`.

CAS: exact consumed stage, no existing completion, expected version, active consumer, process-request linkage. Accepted outcomes advance the stage. Failed or ambiguous outcomes terminalize.

### Terminalization And Aggregate RPCs

`terminalize_git_runner_authority_failure` and `terminalize_git_runner_authority_ambiguous_failure` require consumer linkage, expected version, current fingerprint, failure fingerprint, observed timestamp, and final fingerprints.

`terminalize_git_runner_authority_expiry` requires expected version, current fingerprint, observed timestamp at or after expiry, and final fingerprints.

`revoke_git_runner_authority_package` requires package linkage, expected version, revocation fingerprint, closed revocation reason, observed timestamp, and final fingerprints.

`finalize_git_runner_authority_aggregate` requires exact active consumer, expected version, aggregate fingerprint, all six accepted completions, before expiry, and final fingerprints.

`read_git_runner_authority_consumption_state` accepts immutable lookup fields (`p_consumption_key`, package ID/fingerprint) and returns a closed read result. It performs no mutation and does not authorize retry.

## Pure Contract To RPC Mapping

The future server-only adapter must call the pure transition builder first or otherwise produce the same final-approved transition semantics. The RPC then enforces database CAS and stores the pure result evidence atomically.

| Pure operation | RPC |
| --- | --- |
| `register_package` | `register_git_runner_authority_package` |
| `claim_consumer` | `claim_git_runner_authority_consumer` |
| `consume_stage` | `consume_git_runner_authority_stage` |
| `record_stage_completion` | `record_git_runner_authority_stage_completion` |
| `terminalize_failure` | `terminalize_git_runner_authority_failure` |
| `terminalize_ambiguous_failure` | `terminalize_git_runner_authority_ambiguous_failure` |
| `terminalize_expiry` | `terminalize_git_runner_authority_expiry` |
| `revoke_package` | `revoke_git_runner_authority_package` |
| `finalize_aggregate` | `finalize_git_runner_authority_aggregate` |

Database fields read internally: current package row, six stage rows as needed, transition version, consumer fields, stage state, expiry/revocation/terminal fields, next audit sequence.

Caller fields accepted: only package identifiers, expected transition version, observed timestamp, closed consumer/stage/fingerprint fields, and pure-contract computed fingerprints. Caller never supplies next-state body or audit event body.

Consistency risk: SQL must duplicate the approved TypeScript predicates for storage enforcement. The implementation package must include static tests comparing operation names, state/reason vocabularies, nullability, version rules, and fingerprint fields against the pure contract.

## Locking And Isolation

Selected posture:

- mutating RPCs run in one transaction;
- package row is selected `for update` before mutable decision;
- relevant stage row is selected `for update` for stage operations;
- transition version is checked in the same transaction and update predicate;
- unique constraints enforce one package, one stage consumption fingerprint, one process request fingerprint, and one audit sequence;
- one concurrent transition wins;
- losers return deterministic stale/concurrency/not-claimable reasons;
- no read-then-write outside transaction;
- no application-only locks;
- no advisory locks in v1 unless a future review proves semantic binding and necessity.

Serializable isolation is optional for v1 if row locks and unique constraints prove one-winner semantics. If implementation discovers predicate-write gaps, choose serializable for the mutating RPCs and document exact retry prohibition: serialization failures map to a closed rejected or ambiguous storage result, not automatic retry.

## Database Error Mapping

Known closed mappings:

- unique `consumption_key`: `duplicate_registration_rejected`;
- package ID unique conflict: `package_identity_conflict_rejected`;
- package fingerprint unique conflict: `package_fingerprint_reuse_rejected`;
- `(record_id, stage_index)` conflict during registration: `storage_integrity_rejected`;
- stage consumption fingerprint conflict: `stage_already_consumed` or `storage_integrity_rejected` by precedence;
- process request fingerprint conflict: `stage_authority_rejected`;
- audit event sequence conflict: `storage_operation_ambiguous` unless read-back proves the committed event;
- stale version affected-row zero: `stale_transition_rejected`;
- wrong consumer: `wrong_consumer_rejected`;
- wrong state/terminal/revoked/expired: exact closed state reason;
- serialization/deadlock/timeout before mutation: `storage_operation_rejected`;
- uncertain commit after mutation attempt: `storage_operation_ambiguous`;
- unexpected error: `storage_operation_rejected`.

No raw SQLSTATE, constraint name, table name, query text, stack trace, path, output, or process detail may be returned.

## Migration Test Package

Action 622 schema tests should include:

- migration file exists with exact timestamp/suffix;
- all three table names exist;
- no unrelated table changes;
- exact column names/types/nullability;
- CHECK-backed text closures;
- SHA-256 grammar checks;
- uniqueness/index inventory;
- FK `on delete restrict`;
- RLS enabled on all three tables;
- no anon/authenticated grants;
- no raw path/output/environment columns;
- no RPCs in schema-only migration.

Later RPC tests should include:

- exact function names and signatures;
- SECURITY DEFINER;
- fixed `search_path`;
- no dynamic SQL;
- execute revoked from public/anon/authenticated;
- transaction all-or-nothing;
- duplicate registration conflicts;
- one-consumer claim race;
- concurrent stage consumption one winner;
- stale version rejection;
- rollback on audit insert failure;
- accepted completion progression;
- failure and ambiguity terminalization;
- expiry/revocation race;
- duplicate finalization rejection;
- search-path attack rejection;
- no raw database errors.

## Implementation Order

1. Action 622 - Implement Git Runner Authority Consumption Storage Schema Migration.
2. Static security review of schema migration.
3. Remediation and final re-review if needed.
4. Implement transactional RPC migration.
5. Static security review of RPC migration.
6. Remediation and final re-review if needed.
7. Implement server-only storage adapter.
8. Review/remediate/final-review storage adapter.
9. Only after separate approval, plan dormant runner integration.

Action 622 should implement only the schema migration. RPC implementation is deferred because table constraints/RLS are independently reviewable and lower risk than combining schema and transactional function logic.

## Explicit Non-Authorizations

This plan does not authorize database readiness, migration application, RPC deployment, atomic replay safety, authority consumption, Git execution, process creation, process observation, repository inspection, runner implementation, runtime/API/UI activation, credentials, environment access, network access, Avanza/trading behavior, persistence writes, staging activation, deployment, retries, fallback, cache substitution, or automatic reissuance.

## Commit And Deploy

No deploy is recommended for Action 621.

Do not commit until the complete planning diff has been manually inspected.
