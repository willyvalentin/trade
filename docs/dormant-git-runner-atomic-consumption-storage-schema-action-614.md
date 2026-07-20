# Action 614 - Dormant Git Runner Atomic Consumption Storage Schema Plan

Decision: `post_trade_dormant_git_runner_atomic_consumption_storage_schema_plan_ready`

Result status: `post_trade_dormant_git_runner_atomic_consumption_storage_action_614_planning_gate_completed`

## Scope

Action 614 designs the durable Postgres/Supabase storage schema and transactional contract for the Action 613 atomic one-shot consumption record. It is documentation, database-schema design, transactional-contract design, RLS/service-boundary planning, and approval-gate work only.

No migration, SQL function, RPC implementation, persistence adapter, pure transition contract, dormant Git runner, authority consumption, Git execution, process creation or observation, repository inspection, runtime/API/UI/cron/worker/CLI reachability, credential access, environment access, network access, Avanza/trading behavior, persistence behavior, staging activation, deployment, retry, fallback, cache, reissue, commit, push, merge, or deploy is added.

## Approved Baseline

The approved baseline through Action 613 contains:

- final-approved pure dormant Git runner authority-package contract;
- exact six-stage read-only Git observation sequence for `/usr/bin/git`;
- fixed 30000 ms package lifetime;
- exact resolver, revalidation, worktree, compatibility, package-policy, session, and stage-grant fingerprints;
- no atomic storage, no durable consumption record, no SQL schema, no RPC, no service-role adapter, no runner, and no live authority consumption;
- explicit Action 613 decision that durable storage must become the source of truth for one-shot state before any runner can be implemented.

The known absent migration `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` belongs to the older staging execution-authorization path and target table `public.execution_authorization_consumptions`. It remains a precedent for one-shot compare-and-set, RLS, no-client access, and transactional function posture, but it is not reused by this Git runner schema.

## Schema Option Comparison

| Option | Shape | Verdict |
| --- | --- | --- |
| A | Package current-state table plus append-only audit table. | Good baseline but per-stage CAS and completion integrity would be packed into package columns or JSON. |
| B | One table with embedded JSON event history. | Rejected. JSON history makes exact constraints, privacy, and append-only review harder. |
| C | Event table only, reconstructing state. | Rejected for v1. It is audit-friendly but indirect for atomic current-stage predicates. |
| D | Row per package/stage with no package-level row. | Rejected. It loses one obvious aggregate source of truth for active consumer, terminal state, and replay state. |
| E | Reuse old `execution_authorization_consumptions` schema. | Rejected. That schema solves staging authorization consumption, not six-stage Git runner authority. |
| F | Package current-state table plus normalized stage table plus append-only audit table. | Selected. It gives one package source of truth, exact per-stage CAS rows, and transactionally appended sanitized audit events. |

Selected architecture: three future tables, all under `public` unless a later migration review selects a narrower schema namespace:

- `git_runner_authority_consumption_records`;
- `git_runner_authority_consumption_stages`;
- `git_runner_authority_consumption_audit_events`.

## Schema Identities

| Artifact | Identity |
| --- | --- |
| schema family | `ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1` |
| package table schema | `ture.execution.dormant-git-runner-authority-consumption-record.table.v1` |
| stage table schema | `ture.execution.dormant-git-runner-authority-consumption-stage.table.v1` |
| audit table schema | `ture.execution.dormant-git-runner-authority-consumption-audit.table.v1` |
| transaction contract | `ture.execution.dormant-git-runner-authority-consumption-transaction.contract.v1` |
| transaction policy | `ture.execution.dormant-git-runner-authority-consumption-transaction.policy.v1` |
| RLS/access policy | `ture.execution.dormant-git-runner-authority-consumption-storage-access.policy.v1` |
| error mapping policy | `ture.execution.dormant-git-runner-authority-consumption-storage-error.policy.v1` |

These identities are schema evidence only. They do not authorize Git execution, process creation, repository inspection, or authority consumption by themselves.

## Package Table

Planned table: `public.git_runner_authority_consumption_records`.

Purpose: one durable current-state row per final-approved authority package.

Planned immutable columns:

- `id` database UUID;
- `schema_identity`, `schema_version`;
- `consumption_key`;
- `authority_package_id`;
- `authority_package_fingerprint`;
- `authority_policy_fingerprint`;
- `package_contract_identity`, `package_contract_version`;
- `capability_set_identity`, `capability_set_version`;
- `expiry_policy_identity`, `expiry_policy_version`;
- `freshness_policy_identity`, `freshness_policy_version`;
- `sequence_identity`, `sequence_fingerprint`;
- `session_fingerprint`;
- `platform`;
- `executable_identity`;
- `executable_fingerprint`;
- `resolution_fingerprint`;
- `revalidation_fingerprint`;
- `worktree_fingerprint`;
- `compatibility_result_fingerprint`;
- `source_policy_identity`, `source_policy_version`;
- `issued_at`;
- `expires_at`;
- `registered_at`.

Planned mutable-by-transaction-only columns:

- `state`;
- `terminal`;
- `terminal_reason`;
- `terminal_at`;
- `next_consumable_stage_index`;
- `in_flight_stage_index`;
- `consumed_stage_count`;
- `remaining_stage_count`;
- `transition_version`;
- `active_consumer_id`;
- `active_consumer_fingerprint`;
- `claimed_at`;
- `last_transition_at`;
- `aggregate_fingerprint`;
- `record_fingerprint`;
- `updated_at`;
- `expired`;
- `revoked`;
- `replay_detected`;
- `retry_count`;
- `fallback_attempted`.

No package row stores raw paths, raw Git output, porcelain filenames, process handles, environment values, credentials, raw database errors, Node errors, SQL text, stack traces, or arbitrary caller metadata.

## Stage Table Decision

Planned table: `public.git_runner_authority_consumption_stages`.

The stage table is selected instead of six embedded package columns because it improves reviewability for per-stage unique constraints, stage-specific fingerprints, consumed-before-process-attempt evidence, completion evidence, and exact one-row-per-stage checks.

Planned immutable columns:

- `id`;
- `record_id`;
- `consumption_key`;
- `stage_index`;
- `stage_identity`;
- `stage_purpose`;
- `stage_policy_fingerprint`;
- `stage_grant_fingerprint`;
- `stage_grant_result_fingerprint`;
- `stage_authority_fingerprint`;
- `argv_fingerprint`;
- `output_mode`;
- `stdout_limit_bytes`;
- `stderr_limit_bytes`;
- `combined_output_limit_bytes`;
- `retry_count`;
- `fallback_allowed`;
- `created_at`.

Planned transaction-only columns:

- `stage_state`;
- `consumed`;
- `consumed_at`;
- `consumed_by_fingerprint`;
- `stage_consumption_fingerprint`;
- `process_attempt_request_fingerprint`;
- `direct_spawn_request_fingerprint`;
- `completion_recorded`;
- `completion_status`;
- `completion_reason`;
- `completion_evidence_fingerprint`;
- `interpretation_evidence_fingerprint`;
- `completed_at`;
- `stage_transition_version`;
- `stage_record_fingerprint`;
- `updated_at`.

Exactly six stage rows must be inserted in the same registration transaction as the package row. Stage indexes are `0` through `5`. There is no dynamic stage count, caller-selected stage, generic command stage, retry stage, or fallback stage.

## Audit Table

Planned table: `public.git_runner_authority_consumption_audit_events`.

Purpose: sanitized append-only evidence for every state transition attempt that the reviewed transaction boundary accepts for recording.

Planned columns:

- `id`;
- `schema_identity`, `schema_version`;
- `event_sequence`;
- `record_id`;
- `consumption_key`;
- `authority_package_id`;
- `authority_package_fingerprint`;
- `event_type`;
- `operation_identity`;
- `operation_fingerprint`;
- `transition_version_before`;
- `transition_version_after`;
- `stage_index`;
- `consumer_fingerprint`;
- `status`;
- `reason`;
- `state_before`;
- `state_after`;
- `request_fingerprint`;
- `result_fingerprint`;
- `stage_consumption_fingerprint`;
- `stage_completion_fingerprint`;
- `aggregate_fingerprint`;
- `event_fingerprint`;
- `created_at`.

Audit rows are append-only. Future SQL must grant no update or delete path. Audit append and state mutation must occur in the same database transaction, or neither may commit.

## States And Invariants

Selected durable states:

- `issued`;
- `active`;
- `partially_consumed`;
- `consumed`;
- `failed_consumed`;
- `ambiguous_failed_consumed`;
- `expired`;
- `revoked`.

`ambiguous_failed_consumed` is selected for v1 because a stage may be durably consumed before a process attempt and then become crash-ambiguous. Persisting that ambiguity separately from ordinary deterministic failure helps later manual review without permitting retry, replay, reset, or stage reopening.

State invariants:

- `issued`: no active consumer, no consumed stages, `next_consumable_stage_index = 0`, `in_flight_stage_index = null`, non-terminal.
- `active`: exactly one active consumer, no stage consumed yet, non-terminal.
- `partially_consumed`: active consumer present, at least one stage consumed or completed, non-terminal unless a completion terminalizes.
- `consumed`: all six stages consumed and accepted, aggregate finalization recorded, terminal.
- `failed_consumed`: at least one stage consumed and deterministic failure recorded, terminal.
- `ambiguous_failed_consumed`: at least one stage consumed and process/start/completion state ambiguous, terminal.
- `expired`: no further stage may start, terminal.
- `revoked`: no further stage may start, terminal.

`next_consumable_stage_index` is the next stage that may be consumed after all prior completions are accepted. `in_flight_stage_index` is non-null only after a stage is consumed and before its completion or terminal ambiguity/failure is recorded.

## Unique Constraints

Future migration should define uniqueness for:

- `consumption_key`;
- `authority_package_id`;
- `authority_package_fingerprint`;
- `(authority_package_id, authority_package_fingerprint)`;
- `(record_id, stage_index)`;
- `(consumption_key, stage_index)`;
- `stage_grant_fingerprint` within the package;
- `stage_consumption_fingerprint` when non-null;
- `process_attempt_request_fingerprint` when non-null;
- `direct_spawn_request_fingerprint` when non-null;
- `(record_id, event_sequence)`;
- `event_fingerprint`;
- transition operation fingerprints where idempotent replay is forbidden.

Conflict mapping:

- same package ID and same fingerprint: duplicate registration rejected;
- same package ID and different fingerprint: package identity conflict rejected;
- same fingerprint under another package ID: package fingerprint reuse rejected;
- same stage consumption fingerprint twice: stage replay rejected;
- same audit event fingerprint twice: audit replay rejected.

## CHECK Constraints

Future CHECK constraints should cover what Postgres can enforce locally:

- SHA-256 grammar for all fingerprint columns;
- stage index between `0` and `5`;
- next consumable index between `0` and `6`;
- consumed stage count between `0` and `6`;
- remaining stage count between `0` and `6`;
- `retry_count = 0`;
- `fallback_attempted = false`;
- stage retry count `0`;
- stage fallback `false`;
- expiry exactly 30000 ms after issuance where represented as timestamps;
- `expires_at > issued_at`;
- terminal states have `terminal = true`;
- non-terminal states have `terminal = false`;
- `consumed` state has six consumed stages by package counters;
- `issued` state has zero consumed stages by package counters;
- active consumer fields are all null or all present according to state;
- `revoked` and `expired` flags match terminal states;
- aggregate fingerprint is non-null only for `consumed`;
- no completion fields are present before stage consumption;
- no in-flight stage exists in terminal states.

Cross-row invariants remain transactional, not CHECK-only:

- package consumed count equals actual consumed stage rows;
- all six stage rows exist;
- no stage can complete before it is consumed;
- no later stage can consume before prior accepted completion;
- audit append and state mutation are atomic;
- transition version and state predicates match exactly;
- expiration/revocation race precedence is enforced.

## RLS And Access Model

Future migration should:

- enable RLS on all three tables;
- create no permissive anon/authenticated SELECT, INSERT, UPDATE, or DELETE policies;
- revoke direct table privileges from client roles;
- expose no browser/client Supabase path;
- avoid generic table writes from application code;
- route all mutations through reviewed server-only transactional functions;
- use schema-qualified table names, no dynamic SQL, no dynamic table names, no caller-provided reasons outside closed enums, and a fixed `search_path`;
- grant function execution only to the separately reviewed server-only service boundary, not anon/authenticated clients.

Selected access posture: SECURITY DEFINER transactional functions with fixed search path and schema-qualified SQL, callable only by a reviewed server-only adapter using service credentials. Direct service-role table mutation is not the intended path and must be treated as an operational risk requiring separate review controls.

`force row level security` remains a future migration-review decision because service-role/RPC ownership behavior must be reviewed in the target Supabase environment.

## Transaction Operations

Future transactional functions/RPCs:

1. `register_git_runner_authority_package`;
2. `claim_git_runner_authority_consumer`;
3. `consume_git_runner_authority_stage`;
4. `record_git_runner_authority_stage_completion`;
5. `terminalize_git_runner_authority_failure`;
6. `terminalize_git_runner_authority_expiry`;
7. `revoke_git_runner_authority_package`;
8. `finalize_git_runner_authority_aggregate`;
9. `read_git_runner_authority_consumption_state`.

Every mutating operation must:

- accept closed request fields only;
- validate exact package, consumer, stage, transition version, and fingerprint linkage;
- perform one database transaction;
- mutate current state and append audit together;
- return a closed result union;
- return no raw SQLSTATE, table name, query, stack, path, output, or process detail.

No operation accepts arbitrary SQL, arbitrary JSON payloads, caller-selected stage count, caller-selected policy, caller-selected command, caller-selected status, caller-selected reason, test mode, clock injection, process handle, raw output, or repository path.

## Registration

Registration must insert the package row, exactly six stage rows, and one audit event atomically.

Accepted result:

- `package_registered`.

Rejected results:

- `registration_input_rejected`;
- `duplicate_registration_rejected`;
- `package_identity_conflict_rejected`;
- `package_fingerprint_reuse_rejected`;
- `registration_expired_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

Registration does not claim a consumer and does not consume authority.

## Consumer Claim

Consumer claim moves `issued` to `active` and stores exactly one consumer ID/fingerprint.

Accepted result:

- `consumer_claimed`.

Rejected results:

- `claim_input_rejected`;
- `package_not_registered`;
- `package_terminal_rejected`;
- `package_expired`;
- `package_revoked`;
- `concurrent_consumer_rejected`;
- `stale_transition_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

The claim does not create a lease renewal model. The 30000 ms authority lifetime remains the upper bound and cannot be extended.

## Stage Consumption

Stage consumption happens immediately before the future process attempt. If this transaction fails or is ambiguous, no process may be started until separately reviewed read-back proves a consumed-stage result.

Accepted result:

- `stage_consumed`.

Rejected results:

- `stage_consumption_input_rejected`;
- `package_not_registered`;
- `wrong_consumer_rejected`;
- `stale_transition_rejected`;
- `stage_order_rejected`;
- `stage_already_consumed`;
- `stage_in_flight_rejected`;
- `package_expired`;
- `package_revoked`;
- `package_terminal_rejected`;
- `stage_authority_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

On success, the stage row is marked consumed, `in_flight_stage_index` is set, counters are updated, a stage-consumption fingerprint is stored, and audit is appended.

## Stage Completion

Stage completion records the outcome after a consumed stage's process attempt and evidence construction.

Accepted results:

- `stage_completion_accepted`;
- `stage_completion_failed_terminalized`;
- `stage_completion_ambiguous_terminalized`.

Rejected results:

- `stage_completion_input_rejected`;
- `wrong_consumer_rejected`;
- `stale_transition_rejected`;
- `stage_not_consumed`;
- `stage_completion_already_recorded`;
- `stage_completion_linkage_rejected`;
- `package_terminal_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

Accepted completion clears `in_flight_stage_index` and advances `next_consumable_stage_index` by one. Failed completion terminalizes as `failed_consumed`. Ambiguous completion terminalizes as `ambiguous_failed_consumed`.

## Aggregate Finalization

Aggregate finalization requires all six stages consumed and completed with accepted observational evidence, exact aggregate fingerprint linkage, unexpired package at aggregate-construction time, active consumer match, and transition version match.

Accepted result:

- `aggregate_finalized_consumed`.

Rejected results:

- `aggregate_input_rejected`;
- `aggregate_prerequisite_rejected`;
- `wrong_consumer_rejected`;
- `stale_transition_rejected`;
- `package_expired`;
- `package_revoked`;
- `package_terminal_rejected`;
- `storage_operation_rejected`;
- `storage_operation_ambiguous`.

Success marks the package `consumed`, terminalizes it, stores the aggregate fingerprint, and appends audit. It does not expose runtime readiness.

## Expiry And Revocation

Expiry terminalization may be invoked before claim, before stage consumption, after a consumed stage completes too late to continue, or before aggregate finalization.

Revocation terminalization requires exact package identity, expected transition version, deterministic reason, and audit append.

Race precedence:

1. malformed input or identity/fingerprint mismatch;
2. package not found;
3. terminal state;
4. revocation;
5. expiry;
6. consumer mismatch;
7. stale transition version;
8. stage order or stage state mismatch;
9. operation-specific semantic mismatch.

Consumed, failed-consumed, and ambiguous-failed-consumed states do not later become expired.

## Crash And Ambiguity Model

Durable stage consumption before process attempt creates at-most-once posture. It may lose a stage if the process does not start after the stage is consumed. That is safer than allowing a second process attempt.

If the database response is lost after a possible commit, callers must not blindly retry. They may perform a read-back through immutable identifiers and closed result mapping. If read-back cannot prove one exact state, the result is `storage_operation_ambiguous`.

Ambiguous process-start or process-completion evidence terminalizes as `ambiguous_failed_consumed`. No automatic retry, replay, reset, cache substitution, or fallback is permitted.

## Database Error Posture

Known database outcomes map to closed reasons:

- unique violation on consumption key: duplicate registration rejected;
- unique violation on package ID or fingerprint: identity conflict or fingerprint reuse rejected;
- stale version predicate: stale transition rejected;
- affected row count zero: rejected according to precedence;
- audit insert conflict: replay rejected;
- serialization/deadlock/timeout after unknown commit state: storage operation ambiguous;
- other unexpected database error: storage operation rejected.

External results must not include SQLSTATE, constraint names, query text, table names, stack traces, internal IDs beyond approved opaque record references, paths, Git output, or process details.

## Fingerprints

Future fingerprints:

- consumption key fingerprint;
- registration request fingerprint;
- registration result fingerprint;
- package current-state fingerprint;
- each stage row fingerprint;
- each stage-consumption fingerprint;
- each stage-completion fingerprint;
- claim request/result fingerprints;
- expiry/revocation fingerprints;
- aggregate-finalization fingerprint;
- audit-event fingerprint;
- read-back result fingerprint.

All fingerprints bind the relevant schema identity/version, package identity/fingerprint, authority policy fingerprint, session fingerprint, sequence fingerprint, executable/revalidation/worktree/compatibility fingerprints, consumer fingerprint where applicable, stage index where applicable, transition version before/after, state before/after, status/reason, timestamps, and terminal/runtime/authority flags.

Fingerprints grant no authority by themselves. They are integrity evidence only.

## Privacy And Retention

Permitted storage:

- schema and policy identities;
- package/stage/audit identifiers;
- fingerprints;
- state names;
- stage indexes and counters;
- closed reasons;
- timestamps;
- platform and fixed executable identity where already approved.

Forbidden storage:

- raw paths and filenames;
- raw Git stdout/stderr;
- porcelain file entries;
- credentials, tokens, environment values, cookies, browser/session data;
- process handles, PIDs, raw Node errors, raw SQL errors, stack traces;
- arbitrary caller metadata.

Retention duration remains unresolved and should be decided in a separate retention gate before migration implementation or deployment. Action 614 does not define deletion or archival behavior.

## Pure, Database, And Adapter Division

Future implementation order should keep logic split:

- pure transition contract validates closed state transitions and fingerprints without database access;
- database functions enforce equivalent predicates atomically and append audit in one transaction;
- server-only adapter maps approved pure requests/results to the database functions and returns closed results;
- dormant runner may only arrive after the pure contract, database schema/RPC, server adapter, and static reviews pass.

No business logic should exist only in the server adapter. No pure module may import service-role credentials, Supabase clients, filesystem APIs, process APIs, environment access, or network access.

## Migration Package

Future migration package should include:

- enum or CHECK-backed text state/reason/status fields;
- package table;
- stage table;
- audit-event table;
- indexes and unique constraints;
- RLS enablement and deny-client grants;
- SECURITY DEFINER transactional functions with fixed search path;
- grants and revocations;
- comments explaining non-authorization and no-runtime posture;
- static migration tests;
- RPC contract tests;
- RLS/privilege tests;
- rollback and deployment-proof checklist.

Do not create the migration in Action 614. Do not resurrect the old missing authorization-consumption migration.

## Test Strategy

Future test coverage should include:

- schema identity and table names;
- no reuse of `execution_authorization_consumptions`;
- exact columns and unexpected-column rejection;
- unique registration, duplicate registration, ID conflict, fingerprint conflict;
- six stage rows inserted atomically;
- malformed stage indexes reject;
- counters and next/in-flight stage invariants;
- consumer claim and concurrent claim;
- stage consumed once;
- stale transition version rejection;
- wrong consumer rejection;
- expiry and revocation races;
- stage completion accepted, failed terminal, ambiguous terminal;
- aggregate finalization;
- audit append in same transaction;
- transaction rollback on audit failure;
- database-error mapping;
- privacy exclusions;
- RLS deny-client posture;
- no runtime/API/UI/runner reachability.

## Future Gates

1. Pure transition contract.
2. Static review of pure transition contract.
3. Source-controlled migration and transactional RPC implementation.
4. Static SQL/RLS/RPC review.
5. Remediation and final re-review.
6. Server-only storage adapter.
7. Static server-only adapter review.
8. Dormant runner planning.
9. Dormant runner implementation.
10. Staging-only validation planning.
11. Runtime activation approval.
12. Deployment approval.

## Explicit Non-Authorizations

Action 614 does not authorize Git execution, process creation or observation, repository inspection, repository-read authority consumption, process authority consumption, replay prevention implementation, database persistence implementation, storage adapter implementation, runner implementation, runtime/API/UI activation, credentials, environment access, network access, Avanza/trading behavior, migrations, staging, deployment, commit, push, merge, or deploy.

## Recommended Next Action

Action 615 - Implement Pure Atomic Dormant Git Authority Consumption Transition Contract.

## Commit And Deploy

No deploy is recommended for Action 614. A source-control checkpoint commit may be considered only after the documentation diff and validation are manually inspected.
