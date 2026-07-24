# Execution Records Migration Dependency Inventory For Audit Table

## 1. Purpose

Action 776 identifies the `public.execution_records` prerequisite required before the audit table migration can be retried.

This document is a documentation-only dependency inventory. It does not apply migrations, run broad `supabase db push`, run migration apply, run remote SQL, generate Supabase types, edit generated type files, edit migration files, create/drop/alter remote tables, create/apply RLS policies, implement an audit writer, implement an audit route, add route calls, add service-role code, add persistence/write behavior, add Supabase/localStorage writes, append audit, mutate trades, add broker/Avanza behavior, or enable automatic mode.

## 2. Failure Context

Action 774 attempted to apply only the approved audit migrations:

- `20260615000000_create_execution_record_audit_events.sql`
- `20260615001000_enable_rls_execution_record_audit_events.sql`

The audit migration failed because `public.execution_records` does not exist remotely in staging.

The audit migration contains:

- `execution_record_id uuid not null references public.execution_records(id) on delete restrict`

The RLS audit migration was not reached. Action 774 status-after proof confirms both audit migrations remain unapplied remotely.

A broad linked-workdir `supabase db push` was avoided because its dry run would have applied eight additional unapproved pending migrations before the two audit migrations.

## 3. Prerequisite Migration Inventory

Prerequisite migration:

- Path: `supabase/migrations/20260614000000_create_execution_records.sql`
- Timestamp/version: `20260614000000`
- Purpose: create draft normalized execution record table.
- Remote status: pending remotely in both status-before and status-after proof artifacts; Remote column is blank.

Table created:

- `public.execution_records`

Important columns:

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `user_id uuid null`
- `account_id text null`
- `broker text not null`
- `broker_order_id text null`
- `broker_confirmation_id text null`
- `broker_result_id uuid null`
- `handoff_session_id text null`
- `planning_snapshot_id text null`
- `source_recommendation_id text null`
- `source_position_id text null`
- `ticker text not null`
- instrument identity fields
- `side text not null`
- `execution_phase text not null`
- `execution_mode text not null`
- `quantity numeric not null`
- `price numeric not null`
- fee/gross/net numeric fields
- `confirmed_at timestamptz not null`
- `captured_at timestamptz null`
- `idempotency_key text not null`
- `record_fingerprint text not null`
- `source_fingerprint text not null`
- `broker_result_fingerprint text null`
- `source_environment text not null`
- `is_mock boolean not null default false`
- `is_dev boolean not null default false`
- `validation_status text not null`
- JSONB validation and metadata fields

Primary key:

- `id uuid primary key default gen_random_uuid()`

Indexes and constraints:

- Unique index on `idempotency_key`.
- Unique index on `record_fingerprint`.
- Partial unique index on `(broker, broker_confirmation_id)` for non-mock/non-dev records.
- Partial unique index on `(broker, broker_order_id, confirmed_at)` when broker order exists and confirmation id is null.
- Partial unique index on `broker_result_id`.
- Indexes for user/account/ticker/broker order/broker confirmation/source recommendation/source position/confirmed_at/created_at/environment mock-dev queries.
- Check constraints for side, execution phase, execution mode, broker, source environment, validation status, positive quantity/price, non-negative money fields, and captured-at sanity.

RLS/policy stance:

- RLS is intentionally not enabled in this migration.
- Comments state production writes should be server-only until RLS policies, ownership, idempotency lookup, and duplicate handling are reviewed.
- The migration creates no permissive client insert/update policies.

Generated type implications:

- Applying this migration would be prerequisite proof for generated execution-record table types.
- It is not generated type proof by itself.
- Audit table generated types remain blocked until both `public.execution_records` and `public.execution_record_audit_events` are applied and proven.

## 4. Dependency Chain Review

Direct SQL dependencies for `20260614000000_create_execution_records.sql`:

- No local table references were found in the migration.
- No `references public...` clauses were found in the migration.
- The migration creates `public.execution_records` and indexes/checks on that table.

Assumptions and possible environment dependencies:

- The migration uses `gen_random_uuid()`, which assumes UUID generation support is available in the target Supabase database.
- Earlier migration status shows multiple pending migrations before `20260614000000`, but no direct SQL reference from `20260614000000` to those earlier local migration tables was identified.

Can the audit migration be applied after only this prerequisite?

- Likely yes for the FK dependency, because the audit migration requires `public.execution_records(id)` and the prerequisite creates `id uuid primary key`.
- This remains a plan-level conclusion, not remote proof.
- Before applying only this prerequisite, a dry run from a temporary workdir containing only the prerequisite migration should confirm the CLI would apply only that migration.
- After prerequisite apply, remote proof must verify `public.execution_records(id)` exists with UUID type before retrying the audit migration.

Other prerequisites:

- No other direct local migration dependency for `public.execution_records` was identified from SQL references.
- Uncertainty remains around target database extension/function availability for `gen_random_uuid()` and remote schema drift.

Other pending migrations depending on `public.execution_records`:

- `20260615000000_create_execution_record_audit_events.sql` depends on `public.execution_records(id)`.
- `20260615001000_enable_rls_execution_record_audit_events.sql` depends on `public.execution_record_audit_events`.
- No other local migration file was found referencing `public.execution_records`.

## 5. Pending Migration Set Review

Known pending migrations from the status-before/status-after proof artifacts:

- `20260520000000_add_execution_metadata_to_positions.sql`
- `20260528000000_create_recommendation_snapshots.sql`
- `20260528001000_create_recommendation_outcomes.sql`
- `20260528002000_create_recommendation_scan_runs.sql`
- `20260528003000_create_recommendation_batches.sql`
- `20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql`
- `20260610000000_execution_audit_foundation.sql`
- `20260614000000_create_execution_records.sql`
- `20260615000000_create_execution_record_audit_events.sql`
- `20260615001000_enable_rls_execution_record_audit_events.sql`

Unapproved for Action 774:

- All pending migrations except the two audit migrations were unapproved for the audit-table apply action.

`20260614000000_create_execution_records.sql` is part of the unapproved pending set.

Broad `supabase db push` remains disallowed because it would apply unrelated recommendation/execution migrations and expand the blast radius beyond the audit-table approval.

## 6. Safe Resolution Options

### Option A - Approve/apply only `20260614000000_create_execution_records.sql` first using a temporary workdir

Requirements:

- Explicit approval for exactly `20260614000000_create_execution_records.sql`.
- Temporary workdir with only that migration and non-printed link metadata.
- Dry-run proof showing only the prerequisite migration would apply.
- Apply-output proof.
- Status-after proof.
- Remote schema proof that `public.execution_records(id)` exists and is UUID.

Risks:

- Hidden environment dependency such as missing `gen_random_uuid()` support.
- Remote schema drift.
- Applying prerequisite without reviewing RLS/security implications.

Proof artifacts needed:

- prerequisite status-before
- prerequisite dry-run output
- prerequisite apply output
- prerequisite status-after
- remote `public.execution_records` schema proof

Recommended status:

- Recommended after explicit approval.

### Option B - Approve/apply all prerequisite migrations if dependency chain requires more

Requirements:

- Identify exact dependency chain.
- Separate approval for each prerequisite or approved prerequisite set.
- Proof that each migration is needed.
- Apply/status/schema proof for each applied prerequisite.

Risks:

- Broader schema changes than necessary.
- Harder rollback/backout analysis.
- Potential unrelated recommendation/execution side effects.

Proof artifacts needed:

- dependency-chain inventory
- approved migration list
- dry-run output
- apply output
- status-after output
- remote schema proof for required tables

Recommended status:

- Use only if the prerequisite migration cannot safely apply alone.

### Option C - Redesign audit FK strategy

Requirements:

- Explicit schema design update.
- Migration design reassessment.
- Migration file edit or follow-up migration approval.
- Review of orphan audit-row and referential-integrity risks.

Risks:

- Weakens or delays referential integrity.
- May create audit rows that cannot be reliably tied to execution records.
- Could hide an environment readiness problem.

Proof artifacts needed:

- revised schema design
- revised migration design
- reviewed migration file
- remote proof after apply

Recommended status:

- Not recommended as default; use only with explicit design approval.

### Option D - Apply all pending migrations broadly

Requirements:

- Explicit approval for all pending migrations and target environment.
- Review of all pending migration effects.
- Full dry-run, apply, and verification proof.

Risks:

- Applies unrelated migrations.
- Larger blast radius.
- More difficult failure/backout path.

Proof artifacts needed:

- full pending migration approval
- dry-run output
- apply output
- status-after output
- schema proofs for all affected objects

Recommended status:

- Not allowed without explicit broad approval.

## 7. Recommended Path

Recommended default:

- Apply only the minimum prerequisite migration(s) required for `public.execution_records`, after explicit approval.
- Start with `20260614000000_create_execution_records.sql`.
- Prove the prerequisite applies cleanly and verify remote `public.execution_records(id)`.
- Retry the audit migrations only after prerequisite remote table proof.
- Do not broad-push the eight unapproved migrations.

## 8. Required Approval Before Prerequisite Apply

Before applying `20260614000000_create_execution_records.sql`, record:

- Target Supabase project name.
- Target project ref.
- Environment type.
- Database target.
- Exact prerequisite migration file(s).
- Approving operator.
- Approval timestamp.
- Backup/snapshot decision.
- Rollback/backout acknowledgement.
- Expected command operator.
- Expected verification reviewer.
- Exact approval statement.

## 9. Remaining Blockers

- Prerequisite migration approval.
- Prerequisite migration application proof.
- Remote `public.execution_records` proof.
- Audit migration application proof.
- Remote audit table proof.
- Remote RLS proof.
- Generated audit table types proof.
- Server-only/service-role proof.
- Route/auth proof.
- Audit writer remains absent.
- Audit route/write path remains absent.
- Production write path remains absent.

## 10. Candidate Next Actions

A. Request/Record Execution Records Prerequisite Migration Approval.

B. Apply Execution Records Prerequisite Migration Manually.

C. Redesign Audit FK Strategy.

D. Retry Audit Table Migration Apply.

## 11. Recommended Next Action

Action 777 - Request/Record Execution Records Prerequisite Migration Approval.

## 12. Risk Assessment

- Applying broad pending migrations accidentally: high risk because unrelated migrations would apply.
- Prerequisite migration has hidden dependencies: medium risk; SQL references show no direct local table dependency, but remote function/extension and schema drift still need proof.
- Applying prerequisite without approval: high risk.
- Applying wrong environment: high risk.
- Remote schema diverges from local migration assumptions: high risk.
- FK strategy changed silently: high risk.
- Generated types from incomplete schema: high risk.
- Writer implemented before dependency proof: high risk.
- Downstream authority implied: high risk; prerequisite/audit schema proof does not authorize runtime behavior.
- Docs zeroed by bulk operations: medium risk.

## 13. Verification

Required validation for Action 776:

- `git diff --check`
- `find docs -type f -size 0`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`

## Action 777 - Prerequisite Migration Approval Record

- Created `docs/execution-records-prerequisite-migration-target-approval-record.md`.
- The record identifies `20260614000000_create_execution_records.sql` as the prerequisite migration requiring separate approval.
- Target context is known from the audit migration trail, but approving operator, approval timestamp, backup/snapshot decision, rollback/backout acknowledgement, command operator, verification reviewer, and exact prerequisite approval statement are not recorded.
- The decision remains `blocked` because prior audit migration approval is not prerequisite migration approval.
- No migration apply, broad `supabase db push`, remote SQL, type generation, generated type edit, migration edit, service-role code, writer, route, route call, runtime write path, or downstream behavior was performed.
- Recommended next action: Action 778 - Provide Execution Records Prerequisite Migration Approval.

## Action 778 - Prerequisite Migration Applied

- Explicit approval was provided by Willy Simonsson for applying only `20260614000000_create_execution_records.sql`.
- A temporary Supabase workdir dry run listed exactly `20260614000000_create_execution_records.sql`.
- The prerequisite migration apply succeeded.
- Status-after proof shows `20260614000000` present in both Local and Remote.
- Audit migrations `20260615000000` and `20260615001000` remain not applied.
- Proof artifacts:
  - `docs/proofs/execution-records-prerequisite-migration-dry-run-output.txt`
  - `docs/proofs/execution-records-prerequisite-migration-apply-output.txt`
  - `docs/proofs/execution-records-prerequisite-migration-status-after.txt`
- No broad pending migration set, audit migration, remote SQL, type generation, generated type edit, migration edit, service-role code, writer, route, route call, runtime write path, or downstream behavior was performed.
- Recommended next action: Action 779 - Retry Audit Table Migration Apply.

## Action 779 - Dependency Inventory Follow-Up

- The prerequisite migration is applied remotely, but Supabase CLI dry run from a temp workdir containing only the two audit migration files failed because remote history contains `20260614000000`.
- This confirms the next blocker is migration-history alignment for a safe temp-workdir retry, not the original missing `public.execution_records` prerequisite.
- No audit migration apply, broad pending migration apply, remote SQL, type generation, generated type edit, writer, route, route call, runtime write path, or downstream behavior was performed.
- Status: `audit_migration_retry_dry_run_blocked_remote_history_mismatch`.
- Recommended next action: Action 780 - Resolve Audit Migration Retry Dry-Run Remote History Mismatch.

## Action 780 - History-Aware Retry Dependency Update

- The dependency inventory now separates remote schema prerequisite status from Supabase CLI migration-history alignment.
- `20260614000000_create_execution_records.sql` is the remote-applied prerequisite and should be included in the next temporary workdir to satisfy CLI history checks.
- The two approved audit migrations should be the only pending migrations in that temporary workdir.
- Unrelated local migrations remain excluded from the recommended retry strategy.
- No migration apply, broad pending migration apply, remote SQL, type generation, generated type edit, writer, route, route call, runtime write path, or downstream behavior was performed.
- Recommended next action: Action 781 - Retry Audit Migration Apply With History-Aware Temp Workdir.

## Action 781 - Dependency Inventory Apply Result

- The history-aware temp workdir included `20260614000000`, `20260615000000`, and `20260615001000`.
- Dry-run and apply confirmed only the two audit migrations were pending/applied.
- Status-after proof shows the prerequisite and both audit migration versions present remotely.
- The migration dependency path is resolved at migration-history level.
- Remote schema-level FK proof remains incomplete until follow-up schema inspection.
- No broad pending migration apply, type generation, generated type edit, writer, route, route call, runtime write path, or downstream behavior was performed.
- Recommended next action: Action 782 - Verify Audit Table Remote Schema And RLS.

## Action 782 - Dependency Inventory Remote Verification Result

- Remote `public.execution_records` and `public.execution_record_audit_events` both exist.
- Remote audit FK from `execution_record_id` to `execution_records(id)` is verified.
- Remote audit table constraints and indexes are verified.
- RLS is verified on the audit table.
- Policy/grant posture remains incomplete because broad anon/authenticated grants were returned and explicit denial proof is still needed.
- No type generation, generated type edit, writer, route, route call, runtime write path, or downstream behavior was performed.
- Recommended next action: Action 783 - Resolve Audit Table Policy Grant Verification.
