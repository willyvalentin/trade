# Action 623 - Static Security Review of Git Runner Authority Consumption Storage Schema Migration

Decision: `post_trade_git_runner_authority_consumption_storage_schema_migration_static_security_review_blocked_pending_corrections`

Result status: `post_trade_git_runner_authority_consumption_storage_action_623_review_completed_blocked`

Recommended next Action: Action 624 - Remediate Git Runner Authority Consumption Storage Migration Review Findings

## Scope

This independent review inspected the uncommitted Action 622 storage-schema package:

- `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`
- `tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts`
- `docs/git-runner-authority-consumption-storage-migration-action-622.md`
- `docs/git-runner-authority-consumption-storage-action-622-checkpoint.md`

The review also compared the migration to Action 621 planning, Action 614 storage architecture, the final-approved Action 615-620 pure transition contract, and the Action 607-612 authority-package contract.

No migration, production code, tests, runtime path, RPC, database connection, Git command, process, repository inspection, credential, network, Avanza/trading behavior, commit, push, merge, or deployment was added by this review.

## Executive Verdict

The migration is structurally close, but it is not approved in Action 623 because row-local CHECK constraints leave semantically invalid package rows representable, and the focused migration tests do not prove those invalid-row cases.

The review found no critical or high issue and no runtime reachability. The findings are blocking medium schema-integrity findings for a storage foundation that is intended to support later atomic authority consumption.

## Findings

| ID | Severity | Location | Finding | Concrete Scenario | Required Remediation | Approval Impact |
| --- | --- | --- | --- | --- | --- | --- |
| A623-MED-001 | Medium | `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql` lines 166-180 and 192-233 | Terminal package-state constraints do not bind each terminal state to its exact terminal reason/progress posture. | A row with `state='failed_consumed'`, `terminal=true`, `terminal_reason='sequence_consumed'`, `consumed_stage_count=0`, `remaining_stage_count=6`, `current_stage_index=0`, no active consumer, and null aggregate can pass the row-local package checks. Similarly, `ambiguous_failed_consumed`, `expired`, and `revoked` can carry terminal reasons that do not match the pure transition contract. | Add row-local CHECK constraints tying `failed_consumed` to `terminal_reason='stage_failed_terminal'` and at least one consumed stage, `ambiguous_failed_consumed` to `terminal_reason='ambiguous_failed_terminal'` and at least one consumed stage, `expired` to `terminal_reason='package_expired_terminal'`, `revoked` to `terminal_reason='package_revoked_terminal'`, and ensure terminal progress/nullability remains exact. | Blocks approval. |
| A623-MED-002 | Medium | `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql` lines 69-82 and 100-108 | Several row-local semantic identity fields are only nonempty/versioned rather than exact where the approved package model is fixed. | A row can store `platform='windows'`, a different schema identity, a different package contract identity, or a different capability/expiry/freshness policy identity while still satisfying the current nonempty text and version checks. Future RPCs could reject this, but the storage schema can express values outside the approved v1 contract. | Add exact CHECK constraints for fixed v1 storage/package/capability/expiry/freshness identity fields and `platform='macos'`. Leave only explicitly variable fields, such as source policy identity if still intended by the approved contract, outside exact equality and document why. | Blocks approval. |
| A623-MED-003 | Medium | `tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts` lines 289-338 | Migration tests verify many constraint fragments but do not materially test SQL three-valued logic or contradictory package terminal rows. | The suite passes even though the invalid terminal rows described in A623-MED-001 are representable. It checks substrings such as `terminal_reason = 'sequence_consumed'` but not a matrix of rejected state/reason/progress combinations. | Add static negative coverage or a disposable local SQL execution harness, if available, for terminal state/reason/progress contradictions and SQL NULL/UNKNOWN CHECK behavior. At minimum, add semantic static tests that prove each terminal state has its exact reason and progress constraints. | Blocks approval together with A623-MED-001. |

Finding counts:

- Critical: 0
- High: 0
- Medium: 3
- Low: 0
- Informational: 0

## Migration Identity Verdict

Blocked only by the findings above.

Verified:

- exact migration file exists: `20260720000000_create_git_runner_authority_consumption_storage.sql`;
- timestamp has no collision;
- migration is ordered after existing repository migrations;
- no unrelated migration was recreated;
- no `CREATE FUNCTION`, RPC, `SECURITY DEFINER`, dynamic SQL, trigger, view, or runtime mutation path is present;
- no application source import or caller references the new table names.

## Table Architecture Verdict

Pass.

The migration creates exactly:

1. `public.git_runner_authority_consumption_records`
2. `public.git_runner_authority_consumption_stages`
3. `public.git_runner_authority_consumption_audit_events`

Current state is not stored in JSONB, stage state is normalized, audit state is separate, and no general-purpose payload column or client-facing view exists.

## Package Column Verdict

Pass with medium findings on constraint semantics.

The required package columns are present with appropriate base types and nullability. The table includes identity, immutable linkage, current state, consumer, terminal, aggregate, state fingerprint, audit cursor, and timestamp columns.

The review finding is not missing columns; it is that some row-local semantic columns are not exact enough and terminal-state relationships are incomplete.

## Package Closed-Value Verdict

Blocked.

Package `state` is closed to the approved eight values, and `terminal_reason` is closed to a bounded vocabulary. However, the current CHECK model does not bind each terminal state to the exact terminal reason required by the pure contract.

## Package Fingerprint Verdict

Pass.

The reviewed fingerprint columns enforce lowercase SHA-256 grammar with `^[0-9a-f]{64}$`, including nullable fingerprints through `is null or ...` checks. Uppercase, prefixed, whitespace-padded, non-hex, and wrong-length values are rejected when the field is non-null.

## Uniqueness Verdict

Pass.

Global named unique constraints exist for:

- `consumption_key`;
- `authority_package_id`;
- `authority_package_fingerprint`;
- `(authority_package_id, authority_package_fingerprint)`.

The identity columns are NOT NULL and no partial uniqueness weakens the global one-shot identities.

## Package Invariant Verdict

Blocked.

The migration correctly constrains counts, expiry duration, retry/fallback, aggregate nullability, active-consumer grouping, expired/revoked flags, and issued/consumed progress. It does not yet fail closed for terminal reason/progress combinations on failed, ambiguous, expired, and revoked states.

## Stage Column And FK Verdict

Pass.

Stage columns are present. `consumption_record_id` references the package table with `on delete restrict`. Stage index is constrained to 0-5 and `(consumption_record_id, stage_index)` is unique.

## Stage Identity Verdict

Pass.

The migration matches the final-approved six-stage identity order:

- 0: `git_repository_root_v1`
- 1: `git_object_format_v1`
- 2: `git_head_before_v1`
- 3: `git_branch_state_v1`
- 4: `git_porcelain_status_v1`
- 5: `git_head_after_v1`

## Stage Fingerprint Verdict

Pass with documented future RPC equality requirement.

Stage fingerprint columns enforce SHA-256 grammar. Equality between stage `authority_policy_fingerprint` and the package `authority_policy_fingerprint` is cross-row and must be enforced by the future transactional RPC.

## Stage Nullability Verdict

Pass.

The stage constraints distinguish unconsumed, consumed-pending-completion, and completed postures. Completion cannot exist without consumption, completed timestamps cannot precede consumed timestamps under the grouped constraints, accepted outcomes require interpretation fingerprints, failed/rejected/ambiguous outcomes require no interpretation fingerprint, and detached accepted outcome is restricted to stage index 3.

## Audit Column Verdict

Pass.

Required audit identity, transition, state-core/final-state, event, and security fields are present. No raw path, argv, Git stdout/stderr, environment, credentials, process identifiers/handles, stack traces, SQLSTATE, query text, or generic JSON payload columns exist.

## Audit Closed-Value Verdict

Pass.

Operation identities are closed to the nine pure operations. Event status and reason values are CHECK constrained. No generic authorized/success/caller-defined reason is accepted.

## Audit Fingerprint And Version Verdict

Pass.

Audit fingerprints enforce SHA-256 grammar. Event sequence is positive, transition version increments exactly by one, event fingerprints are unique, prior-event and previous-state nullability are constrained where row-local, and audit rows cannot claim runtime activation, authority, or TOCTOU elimination.

## Append-Only Verdict

Pass with correct limitation.

No client UPDATE/DELETE grants, permissive policies, audit mutation functions, rewrite/delete triggers, or `ON DELETE CASCADE` exist. The comments correctly avoid claiming privileged-owner immutability or live replay safety.

## RLS And Privilege Verdict

Pass.

RLS is enabled on all three tables, no permissive policy exists, and privileges are revoked from `public`, `anon`, and `authenticated`. There are no generated sequences requiring sequence grants because UUID defaults use `gen_random_uuid()`. `FORCE ROW LEVEL SECURITY` is not required by the current repository convention and remains a future ownership/RPC review decision.

## Index Verdict

Pass.

Indexes support future transactional lookup. Partial indexes are used for nullable stage-consumption and process-request fingerprints. No client-facing polling/search index was identified.

## SQL Safety Verdict

Pass with parser limitation.

The SQL is static Postgres/Supabase-style SQL, uses schema-qualified table references, no dynamic SQL, no function bodies, and no unsafe casts. `gen_random_uuid()` has repository precedent. Repository-local `psql` was unavailable, so no local SQL parser execution was performed.

## Comment And Non-Authorization Verdict

Pass.

Comments state storage schema only and explicitly deny RPCs, live authority consumption, Git execution, process/repository access, runtime activation, replay-safety claims, and deployment. No database-ready, replay-safe, atomic, execution-ready, Git-compatible, production-ready, or deployment-ready claim was found.

## Test Quality Verdict

Blocked.

The 20 tests materially check identity, tables, columns, closed vocabularies, fingerprint grammar, stage identity mapping, uniqueness/FKs/indexes, RLS/revocations, no RPC/SECURITY DEFINER, privacy columns, and comments. They do not cover the decisive invalid terminal-state rows and SQL three-valued logic risk called out in A623-MED-001.

## Cross-Row Deferred Invariant Verdict

Pass.

Documentation correctly defers cross-row invariants to future transactional RPCs, including exact six stage rows, package counters versus stage rows, policy fingerprint equality, active consumer equality, audit/package linkage, audit sequence allocation, aggregate linkage, stage progression, and atomic state/audit mutation.

## Runtime Reachability Verdict

Pass.

Static search found no references to the new table names or migration identity in `app`, `lib`, `components`, `scripts`, or `package.json`. References are limited to migration/tests/docs.

## Prohibited Operation Result

Pass.

The migration creates no functions, triggers, views, dynamic SQL, RPCs, SECURITY DEFINER behavior, runtime adapter, process/API/UI/runner path, credential, network, Avanza/trading, staging, deployment, retry, fallback, cache, or automatic reissuance behavior.

## Migration Baseline Limitation

Confirmed unrelated.

The existing static suite for `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` still fails before discovery because that older migration is absent. Action 622 did not recreate it, and Action 623 did not modify it.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts --reporter=dot`: passed, 20 tests.
- Pure transition suite: passed, 77 tests.
- Authority-package suite: passed, 155 tests.
- Direct-spawn/revalidation/resolver group: passed, 564 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw/direct-spawn/revalidation/composition/process group: passed, 152 tests.
- Action 533 suite: passed, 181 tests.
- Broad dormant/process/credential/CLI/authorization group: passed, 1540 tests.
- `./node_modules/.bin/eslint tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts`: passed.
- `git diff --check`: passed.
- quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Migration baseline limitation check: failed before discovery on known unrelated missing `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`.
- Repository-local SQL parser: `psql` unavailable; no database execution was performed.

## Final Decision

`post_trade_git_runner_authority_consumption_storage_schema_migration_static_security_review_blocked_pending_corrections`

## Result Status

`post_trade_git_runner_authority_consumption_storage_action_623_review_completed_blocked`

## Recommended Next Action

Action 624 - Remediate Git Runner Authority Consumption Storage Migration Review Findings

## Non-Authorization

This review does not authorize transactional RPCs, runtime database use, live registration, live authority consumption, replay prevention, Git execution, process or repository access, runner/API/UI activation, credentials, environment, network, Avanza/trading, staging, deployment, or production use.
