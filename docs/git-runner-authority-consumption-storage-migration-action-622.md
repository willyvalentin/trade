# Action 622 - Git Runner Authority Consumption Storage Schema Migration

Decision: `post_trade_git_runner_authority_consumption_storage_schema_migration_ready_for_static_security_review`

Result status: `post_trade_git_runner_authority_consumption_storage_action_622_migration_implemented`

Recommended next Action: Action 623 - Static Security Review of Git Runner Authority Consumption Storage Schema Migration

## Baseline

Action 622 starts from the committed Action 621 migration/RPC planning checkpoint, the final-approved Action 615-620 pure authority-consumption transition contract, and the approved Action 614 storage-schema architecture.

The baseline head at implementation time was `f577917 Plan Git authority consumption storage and RPCs`.

## Migration Identity

Created migration:

`supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`

The timestamp did not collide with an existing migration. The known absent unrelated migration `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` was not recreated.

This migration is schema-only. It creates no transactional RPCs, SECURITY DEFINER functions, storage adapter, runtime caller, runner, Git execution path, process observation path, repository inspection path, or live authority-consumption behavior.

## Tables Created

1. `public.git_runner_authority_consumption_records`
2. `public.git_runner_authority_consumption_stages`
3. `public.git_runner_authority_consumption_audit_events`

The tables preserve the Action 614/621 three-table architecture:

- one package record per authority package;
- six fixed stage rows per package, to be inserted later by a reviewed RPC;
- append-only-by-permission audit events linked to the package.

## Column Model

Package records store immutable package identity and linkage fields, current package state, stage counters, consumer claim fields, terminal fields, aggregate fingerprint, state-core/final-state fingerprints, latest audit event fingerprint, and timestamps.

Stage records store only stage identity, stage grant/authority fingerprints, consumption fingerprints, process-request fingerprint, completion/interpretation fingerprints, closed outcome/reason, and timestamps. They store no raw argv, raw path, Git output, process handle, PID, credential, environment value, or repository data.

Audit records store package linkage, consumer/stage linkage, operation/status/reason, transition versions, state fingerprints, relevant evidence fingerprint, prior/event fingerprints, and explicit inert authority posture.

## Closed Text Values

The migration uses CHECK-backed text constraints rather than Postgres enums.

Package states are closed to:

- `issued`
- `active`
- `partially_consumed`
- `consumed`
- `failed_consumed`
- `ambiguous_failed_consumed`
- `expired`
- `revoked`

Stage outcomes are closed to:

- `accepted`
- `accepted_detached_observation`
- `rejected`
- `process_failed`
- `ambiguous_process_state`

Audit operations and reasons are closed to the current Action 615-620 transition vocabulary plus the Action 621 storage-error mapping reasons required for later RPC review.

## Fingerprint Constraints

Every fingerprint column uses lowercase SHA-256 CHECK grammar:

`^[0-9a-f]{64}$`

Nullable fingerprint fields allow null but must match the grammar when present. The migration rejects uppercase, prefixed, whitespace-padded, or variable-length fingerprints.

Fingerprints remain evidence only. They do not grant authority, prove replay safety, or authorize process execution.

## Package Invariants

The package table constrains:

- exact v1 schema/contract/capability/expiry/freshness/source-policy/sequence identities and versions;
- exact `platform='macos'` and `executable_identity='/usr/bin/git'`;
- `current_stage_index` between 0 and 6;
- consumed and remaining stage counts between 0 and 6;
- consumed plus remaining count equals 6;
- `transition_version >= 1`;
- `next_audit_sequence >= 1`;
- `retry_count = 0`;
- `fallback_attempted = false`;
- `expires_at = issued_at + interval '30 seconds'`;
- terminal/nonterminal state consistency;
- expired and revoked flag consistency;
- aggregate fingerprint only for `consumed`;
- active-consumer group nullability;
- terminal group nullability;
- issued-state initial progress;
- active-state initial consumer claim posture;
- partially consumed progress with at least one consumed stage;
- consumed-state terminal progress and `sequence_consumed` reason;
- failed, ambiguous, expired, and revoked terminal states with exact terminal reasons, progress, flags, active-consumer nullability, and aggregate nullability.

Action 624 tightened these constraints after Action 623 review. The terminal package-state semantics are now expressed with a closed `case state ... else false end` CHECK so an omitted branch cannot pass through SQL three-valued logic.

## Stage Invariants

The stage table constrains:

- stage index 0 through 5;
- exact stage identity mapping:
  - 0: `git_repository_root_v1`
  - 1: `git_object_format_v1`
  - 2: `git_head_before_v1`
  - 3: `git_branch_state_v1`
  - 4: `git_porcelain_status_v1`
  - 5: `git_head_after_v1`
- unconsumed state has null consumption and completion fields;
- consumed pending completion has exact consumption/process fingerprints;
- completed state has completion fingerprint, closed outcome, closed reason, and completion time;
- accepted outcomes require an interpretation fingerprint;
- rejected, failed, and ambiguous outcomes require no interpretation fingerprint;
- `accepted_detached_observation` is allowed only for stage index 3;
- completion time cannot precede consumption time.

## Audit Invariants

The audit table constrains:

- unique `(consumption_record_id, event_sequence)`;
- unique `event_fingerprint`;
- event sequence positive;
- transition version increments by exactly one;
- stage index/identity mapping when a stage is referenced;
- closed operation/status/reason values;
- `runtime_activated = false`;
- `authority = 'none'`;
- `toctou_eliminated = false`;
- prior event fingerprint is null for sequence 1 and required after sequence 1;
- previous state fingerprint is null only for registration.

Audit rows are append-only through table permissions. No UPDATE, DELETE, or audit-update RPC exists in this Action.

## Unique Constraints

Package uniqueness:

- `consumption_key`
- `authority_package_id`
- `authority_package_fingerprint`
- `(authority_package_id, authority_package_fingerprint)`

Stage uniqueness:

- `(consumption_record_id, stage_index)`
- `(consumption_record_id, stage_grant_fingerprint)`
- unique non-null `stage_consumption_fingerprint`
- unique non-null `process_request_fingerprint`

Audit uniqueness:

- `(consumption_record_id, event_sequence)`
- `event_fingerprint`

## Foreign Keys

Stages and audit events reference `public.git_runner_authority_consumption_records(id) on delete restrict`.

There is no package-delete path in v1. Stage and audit rows cannot detach from a package.

## Indexes

Indexes support future reviewed server-side transactional lookups:

- nonterminal package lookup by `(state, expires_at)`;
- active consumer lookup by `(active_consumer_fingerprint, state)`;
- package CAS lookup by `(consumption_key, transition_version)`;
- transition version lookup;
- stage completion lookup by `(consumption_record_id, consumed, completion_recorded)`;
- audit review lookup by `(operation_identity, created_at desc)`.

No client-facing polling or search index was added.

## RLS Posture

RLS is enabled on all three tables with no permissive policies.

Direct privileges are revoked from:

- `public`
- `anon`
- `authenticated`

No direct table privileges are granted to application roles in this Action. A future RPC migration must separately define SECURITY DEFINER ownership, fixed search path, execute grants, and closed return behavior.

## Grants And Revocations

The migration revokes all privileges on the three tables from `public`, `anon`, and `authenticated`.

It does not grant direct table privileges to `service_role` or any application role. The intended owner posture is migration-owner/table-owner controlled storage with no runtime access until a separately reviewed RPC package exists.

## Append-Only Posture

The audit table is append-only by permission posture:

- no client table privileges;
- no permissive RLS policy;
- no audit UPDATE/DELETE function;
- no trigger that rewrites or deletes audit rows.

The schema alone does not prevent a privileged database owner from mutating data and does not claim live replay safety.

## Cross-Row Invariants Deferred To RPC

The following remain future RPC-enforced invariants:

- exactly six stage rows per package;
- package counters match stage rows;
- prior accepted completions gate later stage consumption;
- no stage completion before consumption across concurrent transactions;
- no duplicate terminalization after terminal state;
- audit append and state mutation atomicity;
- audit sequence allocation;
- transition-version CAS;
- expiry/revocation race precedence;
- one-winner concurrent consumption.

No unsafe triggers were added to simulate these business transitions.

## Migration Tests

Created focused static migration tests:

`tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts`

The suite inspects the actual migration text and verifies migration identity, three table names, required columns, CHECK constraints, SHA-256 grammar, fixed stage mapping, unique/FK/index inventory, RLS/revocations, no permissive policies, no RPC/SECURITY DEFINER behavior, no sensitive raw-data columns, comments, and non-runtime posture.

## Static Security Review

Self-review verdict:

- unsafe default privileges: not found;
- absent RLS: not found;
- permissive policies: not found;
- unconstrained semantic state/status/reason text: not found for in-scope semantic columns;
- weak fingerprint grammar: not found;
- nullable contradiction paths: constrained where row-local;
- invalid state/count combinations: row-local checks present;
- invalid stage identity mapping: constrained;
- audit UPDATE/DELETE exposure: no client grants and no update/delete functions;
- dynamic SQL: not present;
- SECURITY DEFINER: not present;
- unrelated table modifications: not present;
- raw sensitive-data columns: not present;
- overclaiming comments: not present.

## Explicit Non-Authorizations

Action 622 does not authorize:

- database readiness;
- migration application to any environment;
- RPC deployment;
- atomic replay safety;
- live package registration;
- authority consumption;
- Git execution;
- process creation or observation;
- repository inspection;
- runner implementation;
- runtime/API/UI activation;
- credentials, environment, network, Avanza, trading, staging, deployment, retries, fallback, caching, or automatic reissuance.

## Remaining Prerequisites

Before any storage can be used, separate actions must review and approve:

1. static security review of this schema migration;
2. remediation and final re-review if required;
3. transactional RPC migration;
4. RPC static security review;
5. RPC remediation/final re-review if required;
6. server-only storage adapter planning and implementation;
7. storage adapter security review;
8. separate dormant runner integration planning.

## Commit And Deploy

No deploy is recommended for Action 622.

Do not commit until the complete diff has been manually inspected.
