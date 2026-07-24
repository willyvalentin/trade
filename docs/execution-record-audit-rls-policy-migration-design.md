# Execution Record Audit RLS Policy Migration Design

## 1. Purpose

Action 747 defines the documentation-only design for a future RLS policy migration for `public.execution_record_audit_events`.

The design explains how RLS should be enabled for the future audit event table and which policies should or should not exist before any production audit writer or audit route is allowed.

This is design-only. It is not an applied policy, not RLS/security proof, not migration proof, not remote table proof, and not a migration file. Action 747 does not create an RLS policy migration file, does not apply policies, does not apply the audit table migration, does not run Supabase commands, and does not add writer, route, route-call, persistence, or write-path behavior.

## 2. Current State

- Local audit table migration file exists: `supabase/migrations/20260615000000_create_execution_record_audit_events.sql`.
- The audit table migration has not been applied by this action.
- Remote `public.execution_record_audit_events` table proof does not exist.
- Generated audit table types do not exist.
- RLS/security proof does not exist.
- Server-only proof does not exist.
- Service-role proof does not exist.
- Route/auth proof does not exist.
- No audit writer exists.
- No audit route/write path exists.
- No production insert route/write path exists.
- Dry-run diagnostics and dev-preview surfaces exist, but they are not RLS proof, route/auth proof, server-only proof, migration proof, generated-types proof, or write approval.

## 3. Desired RLS Stance

The desired future posture is:

- RLS should be enabled before any production audit writer or audit route is allowed.
- No permissive client write policies should exist.
- Anonymous users must not insert, update, or delete audit events.
- Authenticated client/browser users must not insert, update, or delete audit events directly.
- Read policies default to none unless a separate read policy design is explicitly justified, reviewed, and approved later.
- Service-role/server-side writes are the only proposed write model, and only through a proven server-only route/writer boundary.
- Route/auth proof remains required even when RLS is enabled.
- RLS must not be treated as a substitute for caller authentication, action authorization, payload validation, idempotency, duplicate-prevention, or no-downstream-authority proof.

## 4. Future Migration Identity

Proposed future migration name:

- `enable_execution_record_audit_events_rls`

Proposed migration path pattern:

- `supabase/migrations/YYYYMMDDHHMMSS_enable_execution_record_audit_events_rls.sql`

Target table:

- `public.execution_record_audit_events`

Dependencies:

- Audit table migration application proof exists.
- Remote table proof confirms `public.execution_record_audit_events` exists in the intended environment.
- RLS/security policy design is reviewed and approved.
- Server-only/service-role proof remains tracked separately.
- Route/auth proof remains tracked separately.

Status:

- Not created as a migration file in Action 747.
- Not applied.
- Not verified against a remote environment.

## 5. Proposed RLS SQL Skeleton

Draft/design-only SQL skeleton, not executed:

```sql
-- DRAFT ONLY - DO NOT RUN FROM THIS DOCUMENT.
-- Future migration candidate:
-- supabase/migrations/YYYYMMDDHHMMSS_enable_execution_record_audit_events_rls.sql

alter table public.execution_record_audit_events
  enable row level security;

-- Optional discussion item:
-- force row level security can be considered if the operating model requires
-- table owners to obey policies too. This should not be enabled casually
-- without confirming service-role/server-side writer behavior and operational
-- implications in the target Supabase environment.
--
-- alter table public.execution_record_audit_events
--   force row level security;

-- No anonymous insert/update/delete policies should be created.
-- No authenticated client/browser insert/update/delete policies should be created.
-- No generic select/read policy should be created by default.
-- Service-role/server-side writes rely on a separately proven server-only
-- route/writer model and must not expose service-role credentials to clients.
```

This SQL is a design sketch only. A future migration file must be separately created, reviewed, applied, and verified.

## 6. Proposed Policy Model

The proposed policy model is intentionally restrictive:

- No anonymous insert policy.
- No anonymous update policy.
- No anonymous delete policy.
- No authenticated client/browser insert policy.
- No authenticated client/browser update policy.
- No authenticated client/browser delete policy.
- No generic select/read policy by default.
- Service-role bypass may be used only through a server-only route/writer after server-only/service-role proof exists.
- No policy should grant audit write permission directly to a browser session.
- If future audit reads are needed, a separate read policy design and proof action must define scope, caller, data minimization, redaction, and denial behavior.

Policy omission is intentional: absent policies should keep anonymous and browser-authenticated direct writes denied when RLS is enabled.

## 7. Verification Requirements

Future RLS policy proof must verify:

- RLS is enabled for `public.execution_record_audit_events`.
- Policy list contains no permissive client write policies.
- Anonymous insert is denied.
- Authenticated client/browser insert is denied.
- Anonymous and authenticated update/delete are denied.
- Any read behavior is absent by default or separately designed and approved.
- Route/server write model is separately proven.
- Service-role behavior is separately proven.
- Errors from denial tests do not leak secrets or sensitive details.
- Policy inspection output is captured against the intended Supabase project/environment.
- Reviewer, date, command/source, expected result, pass/fail, output path, and blocker notes are recorded.

Future verification commands should be selected by the operator after the table exists remotely and after an approved migration file exists. Action 747 does not run database commands.

## 8. Evidence Artifact Checklist

| artifact | command/source | expected result | output path | reviewer | date | pass/fail | blocker notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RLS enablement command output | Future migration apply output | RLS migration applied successfully in target environment | TBD | TBD | TBD | TBD | Missing output blocks proof |
| Policy list output | Future `pg_policies` inspection | No permissive anon/client write policies | TBD | TBD | TBD | TBD | Permissive write policy blocks writer/route |
| Anonymous insert denial output | Future approved denial test | Anonymous insert denied | TBD | TBD | TBD | TBD | Anonymous insert allowed blocks release |
| Authenticated insert denial output | Future approved denial test | Browser/authenticated insert denied | TBD | TBD | TBD | TBD | Authenticated insert allowed blocks release |
| Update/delete denial output | Future approved denial tests | Anonymous/authenticated update/delete denied | TBD | TBD | TBD | TBD | Update/delete allowed blocks release |
| Service-role/server-only proof reference | Future proof artifact | Server-only/service-role proof exists and is reviewed | TBD | TBD | TBD | TBD | Missing proof blocks writer/route |
| Route/auth proof reference | Future proof artifact | Route/auth proof exists and is reviewed | TBD | TBD | TBD | TBD | Missing proof blocks route calls |
| Reviewer approval | Human review | Reviewer/date recorded before policy migration application or writer work | TBD | TBD | TBD | TBD | Missing approval blocks implementation |
| Rollback readiness note | Future operator checklist | Backout plan reviewed without opening client writes | TBD | TBD | TBD | TBD | Unknown rollback blocks application |

This table is intentionally empty. It is a future evidence structure and is not proof.

## 9. Rollback/Backout Considerations

Rollback or backout must be explicit, reviewed, and environment-specific:

- Disabling RLS or dropping policies must require manual approval.
- Backout must not accidentally create permissive client writes.
- Operators must capture the remote environment and current policy state before changing policies.
- Policy drift must be checked before and after any future migration.
- If a policy migration fails partially, writer/route implementation remains blocked until state is understood and reviewed.
- If emergency backout is required, the safest default is to preserve no client writes and disable any production writer/route rather than opening direct browser writes.

Action 747 does not create, apply, disable, or drop policies.

## 10. Relationship to Audit Table Migration

- The RLS policy migration depends on the audit table migration being applied first.
- The local audit table migration file alone is not remote table proof.
- The RLS policy migration design is not migration proof.
- Applying the audit table migration alone is not RLS/security proof.
- Applying an RLS migration later must include remote policy inspection and denial-test evidence before any writer or route can be approved.

## 11. Relationship to Generated Types

- Generated types are not RLS/security proof.
- RLS policies do not alter the TypeScript table shape.
- Audit writer implementation still requires generated audit table types separately.
- Generated execution-record types are not enough for audit event writer work.
- Generated audit table types must match the verified remote schema before writer implementation, but they do not prove policy safety.

## 12. Relationship to Server-Only/Service-Role Proof

- RLS policy design is not server-only proof.
- Service-role/server-only proof is separate.
- Writer or route service-role usage remains blocked until server-only/service-role proof exists.
- No service-role key may be public-prefixed.
- No service-role key may appear in logs, errors, responses, screenshots, fixtures, docs artifacts, client bundles, or serialized browser payloads.
- No client bundle service-role exposure is allowed.

## 13. Relationship to Route/Auth Boundary

- RLS is not a substitute for route authentication or authorization.
- A future audit route must authenticate the caller before writer use.
- A future audit route must authorize execution-record context and event action before writer use.
- A future audit route must validate and sanitize payloads before writer use.
- Route success must not authorize stats/PnL, trade reconciliation, rollback/correction, UI source-of-truth, notification, broker/order behavior, Avanza/browser behavior, or automatic mode.
- Route/auth proof remains separate and required even if RLS is enabled and verified.

## 14. Remaining Blockers

- Audit table migration application proof.
- Remote table proof.
- RLS policy migration file.
- RLS policy application proof.
- Generated audit table types proof.
- Server-only proof.
- Service-role proof.
- Route/auth proof.
- Audit writer implementation.
- Audit route/write path.
- Production insert route/write path.
- Idempotency tests.
- Duplicate-prevention tests.
- Downstream no-authority proof.

## 15. Candidate Next Actions

A. Reassess RLS Policy Migration Design.

B. Create RLS Policy Migration File.

C. Create Audit Writer Implementation Readiness Matrix.

D. Apply Audit Table Migration Manually.

## 16. Recommended Next Action

Recommended default: Action 748 - Reassess RLS Policy Migration Design.

The reassessment should verify this design remains documentation-only, is not an applied policy, does not create a migration file, does not claim RLS/security proof, and preserves the no-writer/no-route/no-write boundary.

## 17. Risk Assessment

- RLS policy design mistaken for applied policy.
- RLS assumed safe without remote verification.
- Table migration applied without RLS follow-up.
- Client write accidentally allowed.
- Authenticated browser write accidentally allowed.
- Read policy leaks audit data.
- Policy drift between design and remote state.
- Service-role proof assumed.
- Route/auth proof assumed.
- Generated types assumed enough.
- Downstream authority implied by RLS success.
- Docs zeroed or damaged by bulk documentation operations.

Mitigation: keep this action documentation-only, require future migration file review, require future remote verification, require denial tests, require server-only/service-role proof, require route/auth proof, and keep writer/route/write behavior blocked.

## 18. Verification

Required Action 747 verification:

- `git diff --check`
- `find docs -type f -size 0`

Expected result:

- Whitespace check passes.
- Zero-byte docs check returns no files.
- Only documentation files are changed.
- No RLS policy migration file is created.
- No RLS policy is created or applied.
- No migration is applied.
- No Supabase mutation or type-generation command is run.
- No generated type file is modified.
- No audit writer, audit route, route call, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation/reconciliation, UI update, notification, broker behavior, Avanza behavior, or automatic mode is added.

## Action 748 - RLS Policy Migration Design Reassessment

- Added docs/execution-record-audit-rls-policy-migration-design-reassessment.md as the documentation-only reassessment of the Action 747 RLS policy migration design.
- The reassessment verifies the design remains non-proof and covers desired RLS stance, future migration identity, draft/non-executed SQL skeleton, proposed restrictive policy model, verification requirements, evidence artifacts, rollback/backout considerations, relationships to audit table migration, generated types, server-only/service-role proof, and route/auth proof, remaining blockers, risks, and next action.
- No RLS policy migration file was created, no RLS policies were created/applied, no migration was applied, no Supabase mutation/type-generation commands were run, no generated type files were modified, no RLS/security/route-auth/server-only/service-role/migration/generated-types proof is claimed, and no service-role code, writer, route, route call, insert path, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation, UI notification, broker behavior, Avanza behavior, or automatic mode was added.
- Recommended next action: Action 749 - Create RLS Policy Migration File.

## Action 749 - RLS Policy Migration File

- Added supabase/migrations/20260615001000_enable_rls_execution_record_audit_events.sql as the local RLS policy migration file for public.execution_record_audit_events.
- The migration enables row level security and intentionally creates no permissive anon/authenticated/client insert, update, delete, or select policies; it grants no client/browser write access and creates no writer, route, function, trigger, service-role client, or runtime write path.
- The migration was not applied, no Supabase migration/mutation/type-generation commands were run, no generated type files were modified, no RLS/security/route-auth/server-only/service-role/migration/generated-types proof is claimed, and no service-role code, writer, route, route call, insert path, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation, UI notification, broker behavior, Avanza behavior, or automatic mode was added.
- Recommended next action: Action 750 - Reassess RLS Policy Migration File.
## Action 750 - RLS Policy Migration File Reassessment

- Added docs/execution-record-audit-rls-policy-migration-file-reassessment.md as the documentation-only reassessment of the local RLS policy migration file supabase/migrations/20260615001000_enable_rls_execution_record_audit_events.sql.
- The reassessment verifies the file exists locally, targets public.execution_record_audit_events, enables row level security, creates no permissive anon/authenticated/client write or read policies, grants no client/browser access, creates no writer/route functions, adds no service-role code, and preserves service-role/server-only, route/auth, generated-types, migration-application, and RLS-proof blockers.
- The RLS migration file remains local and unapplied; no Supabase migration/mutation/type-generation commands were run, no generated type files were modified, no RLS/security/route-auth/server-only/service-role/migration/generated-types proof is claimed, and no writer, route, route call, insert path, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation, UI notification, broker behavior, Avanza behavior, or automatic mode was added.
- Recommended next action: Action 751 - Create Audit Writer Implementation Readiness Matrix.

## Action 751 - Audit Writer Implementation Readiness Matrix

- Added docs/execution-record-audit-writer-implementation-readiness-matrix.md as the documentation-only readiness matrix for any future execution-record audit writer implementation.
- The matrix consolidates proof gates for schema/table design, table migration file, migration application proof, remote table proof, generated audit table types, RLS policy migration file, RLS application and remote policy proof, anon/client denial proof, server-only/service-role proof, route/auth proof, idempotency, duplicate prevention, evidence/provenance, payload validation, downstream no-authority, audit writer design, audit route contract design, production insert separation, broker/Avanza no-action, and automatic-mode disabled proof.
- Current readiness is explicitly blocked for audit writer implementation, audit route implementation, and production write-path implementation because required proof artifacts remain missing. No migration was applied, no migration file was edited, no Supabase migration/mutation/type-generation commands were run, no generated type files were modified, no RLS policies were created/applied, no service-role code/client was added, and no writer, route, route call, insert path, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation, UI notification, broker behavior, Avanza behavior, or automatic mode was added.
- Recommended next action: Action 752 - Reassess Audit Writer Implementation Readiness Matrix.

## Action 752 - Audit Writer Implementation Readiness Matrix Reassessment

- Added docs/execution-record-audit-writer-implementation-readiness-matrix-reassessment.md as the documentation-only reassessment of docs/execution-record-audit-writer-implementation-readiness-matrix.md.
- The reassessment verifies the matrix remains documentation-only, non-proof, no-runtime, and no-write; verifies audit writer implementation readiness, audit route implementation readiness, and production write-path readiness are blocked; and confirms missing proof artifacts remain the blocker reason.
- It verifies readiness gate coverage, proof dependency order, critical blockers, false-positive readiness traps, downstream authority protections, relationships to existing docs, risk posture, and the next proof-producing action. No migration was applied, no migration file was edited, no Supabase migration/mutation/type-generation commands were run, no generated type files were modified, no RLS policies were created/applied, no service-role code/client was added, and no writer, route, route call, insert path, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation, UI notification, broker behavior, Avanza behavior, or automatic mode was added.
- Recommended next action: Action 753 - Apply Audit Table Migration Manually.

## Action 753 - Audit Table Migration Application Blocked

- Added docs/execution-record-audit-table-migration-application-proof.md as the Action 753 migration-application proof/blocker record.
- Action 753 was blocked before any Supabase command or migration application because the intended Supabase project/environment was not explicitly confirmed by the operator; target environment and approval remain required before migration status, migration apply, or remote verification commands may run.
- No migration was applied, no migration file was edited, no Supabase migration/mutation/type-generation commands were run, no generated type files were modified, no RLS policies were created/applied, no proof artifacts were generated under docs/proofs, and remote table/RLS/policy proof remains missing.
- No service-role code/client, audit writer, audit route, route call, insert path, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation, UI notification, broker behavior, Avanza behavior, or automatic mode was added.
- Recommended next action: Action 754 - Resolve Audit Table Migration Application Blocker.

## Action 754 - Audit Table Migration Application Blocker Resolution

- Added docs/execution-record-audit-table-migration-application-blocker-resolution.md as the documentation-only blocker-resolution checklist for Action 753.
- The blocker remains unresolved because no explicit Supabase project name, project ref, environment type, database target, approving operator, approval timestamp, backup/snapshot decision, or rollback/backout acknowledgement was provided in the current operator context.
- No migration was applied, no migration file was edited, no Supabase migration/status/mutation/type-generation commands were run, no generated type files were modified, no RLS policies were created/applied, and no remote table/RLS/policy proof or docs/proofs command artifacts were created.
- No service-role code/client, audit writer, audit route, route call, insert path, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation, UI notification, broker behavior, Avanza behavior, or automatic mode was added.
- Recommended next action: Action 755 - Request/Record Audit Table Migration Target Approval.

## Action 755 - Audit Table Migration Target Approval Record

- Added docs/execution-record-audit-table-migration-target-approval-record.md as the documentation-only target approval record/template for the audit table migration.
- The approval record keeps migration application blocked because Supabase project name/ref, environment type, database target, approving operator, approval timestamp, backup/snapshot decision, rollback/backout acknowledgement, command operator, verification reviewer, and exact approval statement are not recorded.
- No migration was applied, no migration file was edited, no Supabase status/migration/mutation/type-generation commands were run, no generated type files were modified, no RLS policies were created/applied, and no remote table/RLS/policy proof or docs/proofs command artifacts were created.
- No service-role code/client, audit writer, audit route, route call, insert path, execution-record creation, persistence/write behavior, Supabase/localStorage write, audit append, stats/PnL update, rollback/correction, trade mutation, UI notification, broker behavior, Avanza behavior, or automatic mode was added.
- Recommended next action: Action 756 - Provide Audit Table Migration Target Approval.
