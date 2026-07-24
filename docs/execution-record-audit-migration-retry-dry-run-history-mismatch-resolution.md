# Execution Record Audit Migration Retry Dry-Run History Mismatch Resolution

## 1. Purpose

This document resolves the Action 779 dry-run mismatch for retrying the approved execution-record audit migrations.

This is a documentation-only resolution plan. It does not apply migrations, run remote SQL, generate types, modify generated type files, implement writers/routes, add persistence/write behavior, or enable downstream broker/Avanza/automatic behavior.

## 2. Failure Context

The prerequisite migration `20260614000000_create_execution_records.sql` has already been applied remotely, as recorded by the Action 778 proof artifact.

The approved audit migrations remain pending:

- `20260615000000_create_execution_record_audit_events.sql`
- `20260615001000_enable_rls_execution_record_audit_events.sql`

Action 779 used a temporary Supabase workdir containing only the two approved audit migration files. The dry-run failed before listing pending migrations because the remote migration history contains `20260614000000`, but that version was absent from the temporary local migration directory used by the CLI.

No apply command was attempted. Broad `supabase db push` remains disallowed.

## 3. Supabase CLI History Behavior

The Supabase CLI compares the remote migration history against the local migration directory supplied to the command. If a remote-applied migration version is missing locally, the CLI can fail before dry-run or apply evaluation.

The Action 779 failure is therefore a tooling/workdir history consistency issue. It is not proof that either audit migration SQL file is invalid.

## 4. Candidate Temp Workdir Strategy

A history-aware temporary workdir should contain exactly:

- `20260614000000_create_execution_records.sql`
- `20260615000000_create_execution_record_audit_events.sql`
- `20260615001000_enable_rls_execution_record_audit_events.sql`

Expected behavior:

- `20260614000000` should be recognized as already applied remotely.
- The dry-run should ideally list only `20260615000000` and `20260615001000` as pending.
- Older unrelated pending local migrations remain excluded from the temporary workdir.
- If dry-run lists anything except the two approved audit migrations, apply must stop.

## 5. Safe Resolution Options

### A. Retry dry-run with a history-aware temp workdir

Requirements:

- Create a temporary Supabase workdir.
- Copy only the remote-applied prerequisite and the two approved audit migrations.
- Run dry-run first.
- Apply only if dry-run lists exactly the two approved audit migrations.
- Capture dry-run, apply, and status-after proof artifacts.
- Remove the temporary workdir.

Risks:

- The temp workdir could still miss another remote-applied migration version.
- Dry-run output could be misunderstood.

Proof artifacts needed:

- Three-file temp workdir dry-run output.
- Apply output if dry-run is clean.
- Status-after output proving the audit versions are remote-applied.
- Proof that no unrelated migrations were applied.

Recommendation: recommended.

### B. Use full migrations directory but stop if dry-run lists unapproved migrations

Requirements:

- Run dry-run against the full linked migration directory.
- Stop if any unapproved pending migration appears.

Risks:

- Higher chance of accidentally applying unrelated pending migrations.
- Requires extra operator review of a broad pending list.

Proof artifacts needed:

- Full-directory dry-run output.
- Explicit unapproved-migration review.

Recommendation: not recommended while a narrower history-aware temp workdir is available.

### C. Approve/apply all pending migrations broadly

Requirements:

- Separate explicit approval for every pending migration.
- Review dependency and rollback implications for the full pending set.

Risks:

- Highest blast radius.
- Applies changes unrelated to the audit-table objective.

Proof artifacts needed:

- Full approval record.
- Dry-run/apply/status proof for the full pending set.

Recommendation: not recommended for this audit-table action trail.

### D. Use direct SQL/manual remote commands

Requirements:

- Separate explicit approval for manual SQL.
- Manual execution proof.
- Manual migration-history reconciliation plan.

Risks:

- Can bypass Supabase migration history.
- Makes future migration status harder to reason about.

Proof artifacts needed:

- Exact SQL execution proof.
- Migration history proof.
- Schema/RLS proof.

Recommendation: not recommended.

### E. Redesign audit migration/FK strategy

Requirements:

- New design action.
- New migration or migration amendment approval.

Risks:

- Delays the existing approved path.
- Could weaken referential integrity if done hastily.

Proof artifacts needed:

- New design proof.
- New approval and migration proof.

Recommendation: reserve only if the history-aware temp workdir path fails for SQL/schema reasons.

## 6. Recommended Path

Use a temporary Supabase workdir containing `20260614000000` plus the two approved audit migrations.

Run dry-run only first. Proceed to apply only if the dry-run lists exactly:

- `20260615000000_create_execution_record_audit_events.sql`
- `20260615001000_enable_rls_execution_record_audit_events.sql`

Capture proof, remove the temporary workdir, avoid the full broad migrations directory, and do not run type generation in the same action.

## 7. Required Next Proof

The next apply attempt must capture:

- dry-run output from the three-file temporary workdir
- apply output if dry-run is clean
- status-after output
- proof that `20260615000000` and `20260615001000` are remote-applied
- proof that no unrelated migrations were applied
- later remote schema/RLS/policy proof

## 8. Updated Blocker/Readiness State

- audit migration application: blocked by dry-run workdir/history mismatch
- prerequisite remote migration: applied
- audit table remote proof: absent
- audit RLS remote proof: absent
- generated audit types: absent
- writer readiness: blocked
- route readiness: blocked
- production write-path readiness: blocked

## 9. Candidate Next Actions

A. Retry Audit Migration Apply With History-Aware Temp Workdir.

B. Reassess Full Migration Directory Dry-Run.

C. Approve Broad Pending Migration Set.

D. Redesign Audit FK Strategy.

## 10. Recommended Next Action

Action 781 - Retry Audit Migration Apply With History-Aware Temp Workdir.

## 11. Risk Assessment

- Accidentally applying unrelated pending migrations: high risk.
- Temp workdir missing remote-applied migration history: high risk.
- Dry-run output misunderstood: high risk.
- Broad `supabase db push` accidentally used: high risk.
- Applying direct SQL outside migration history: high risk.
- Generated types from incomplete schema: high risk.
- Writer implemented before remote proof: high risk.
- Downstream authority implied: high risk.
- Docs zeroed by bulk operations: medium risk.

## 12. Safety Boundaries

- This resolution doc is not migration proof.
- This resolution doc is not remote table proof.
- This resolution doc is not generated types proof.
- This resolution doc is not RLS/security proof.
- This resolution doc does not authorize migration apply.
- This resolution doc does not authorize writer, route, service-role, persistence/write, broker, Avanza/browser, or automatic behavior.

## 13. Verification

Required validation for Action 780:

- `git diff --check`
- `find docs -type f -size 0`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`

## Action 781 Follow-Up

- The recommended history-aware temporary workdir strategy was executed.
- Dry-run listed exactly the two approved audit migrations.
- Apply succeeded for `20260615000000_create_execution_record_audit_events.sql` and `20260615001000_enable_rls_execution_record_audit_events.sql`.
- Status-after proof shows `20260615000000` and `20260615001000` applied remotely.
- The history mismatch blocker is resolved at migration-history level.
- Remote schema/RLS/policy proof remains a separate follow-up blocker.
- No type generation, generated type edit, writer, route, route call, service-role code, runtime write path, broker/Avanza behavior, or automatic mode was added.
- Recommended next action: Action 782 - Verify Audit Table Remote Schema And RLS.

## Action 782 Follow-Up

- Remote audit table schema, FK, constraints, indexes, and RLS were verified.
- Policy query returned no audit-table policies.
- Grant query returned broad anon/authenticated table grants, so policy/grant posture remains unclear until explicit anon/client denial proof is captured.
- The dry-run history mismatch remains resolved.
- No type generation, generated type edit, writer, route, route call, service-role code, runtime write path, broker/Avanza behavior, or automatic mode was added.
- Recommended next action: Action 783 - Resolve Audit Table Policy Grant Verification.

## Action 783 Follow-Up

- Policy/grant denial verification remains blocked.
- Anon/authenticated role-simulation tests were not run because Supabase CLI temp-role connectivity became unstable and rollback safety could not be guaranteed.
- No rows were inserted by Action 783.
- The dry-run history mismatch remains resolved.
- No type generation, generated type edit, writer, route, route call, service-role code, runtime write path, broker/Avanza behavior, or automatic mode was added.
- Recommended next action: Action 784 - Resolve Audit Table Denial Verification Blocker.

## Action 784 Follow-Up

- Denial verification blocker resolution is documented.
- Recommended next path is a local explicit anon-key denial harness instead of SQL role simulation.
- No denial write-attempt tests were run and no rows were inserted.
- The dry-run history mismatch remains resolved.
- No type generation, generated type edit, writer, route, route call, service-role code, runtime write path, broker/Avanza behavior, or automatic mode was added.
- Recommended next action: Action 785 - Create Anon Denial Verification Harness.
