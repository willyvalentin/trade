# Action 625 - Final Re-Review of Git Runner Authority Consumption Storage Migration Remediation

Decision: `post_trade_git_runner_authority_consumption_storage_schema_migration_final_security_review_approved`

Result status: `post_trade_git_runner_authority_consumption_storage_action_625_final_re_review_completed`

Recommended next Action: Action 626 - Implement Git Runner Authority Consumption Transactional RPC Migration

## Scope

Action 625 independently re-reviewed the complete uncommitted Action 622-624 storage migration package:

- `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`
- `tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts`
- Action 622 storage migration docs/checkpoint
- Action 623 static security review/checkpoint
- Action 624 remediation docs/checkpoint
- Action 621 migration/RPC and database-security plans
- final-approved Action 615-620 pure transition contract
- final-approved Action 607-612 authority-package contract
- Actions 613-614 atomic-consumption and storage architecture

This review did not modify the migration or tests and did not add behavior. No transactional RPC, SECURITY DEFINER function, persistence adapter, runtime caller, API/UI/cron/worker/CLI path, runner, authority consumption, Git execution, process creation or observation, repository runtime inspection, credential access, environment access, network access, Avanza/trading behavior, staging behavior, deployment behavior, retry, fallback, cache, or reissue behavior was added.

## Action 623 Finding Verdicts

| Finding | Original severity | Final verdict | Evidence |
| --- | --- | --- | --- |
| `A623-MED-001` | Medium | Remediated | `git_runner_authority_consumption_records_state_progress_check` now uses a closed `case state ... else false end` branch model and binds terminal states to exact reasons, progress, nullability, flags, and aggregate posture. |
| `A623-MED-002` | Medium | Remediated | `git_runner_authority_consumption_records_exact_identity_check` binds fixed semantic identity/version/platform/source-policy/sequence fields to exact approved v1 values. |
| `A623-MED-003` | Medium | Remediated | Focused static migration suite now has 31 tests and inspects executable constraint bodies for CASE structure, exact identities, terminal branches, contradictory rows, and UNKNOWN-safe posture. |

New findings:

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Informational: 0

## Terminal-State Matrix

The package state matrix is complete and fail closed:

- `issued`: current stage 0, consumed 0, remaining 6, transition version 1, audit sequence 1, no consumer, no terminal fields, not expired/revoked, no aggregate.
- `active`: current stage 0, consumed 0, remaining 6, all consumer fields present, no terminal fields, not expired/revoked, no aggregate.
- `partially_consumed`: current stage 0-6, consumed 1-6, remaining `6 - consumed_stage_count`, all consumer fields present, no terminal fields, not expired/revoked, no aggregate. This accepts the ready-for-aggregate row-local posture before finalization.
- `consumed`: current stage 6, consumed 6, remaining 0, terminal true, `sequence_consumed`, terminal timestamp present, no consumer, aggregate present, not expired/revoked.
- `failed_consumed`: current stage 0-5, consumed 1-6, remaining `6 - consumed_stage_count`, terminal true, `stage_failed_terminal`, terminal timestamp present, no consumer, no aggregate, not expired/revoked.
- `ambiguous_failed_consumed`: current stage 0-5, consumed 1-6, remaining `6 - consumed_stage_count`, terminal true, `ambiguous_failed_terminal`, terminal timestamp present, no consumer, no aggregate, not expired/revoked.
- `expired`: current stage 0-6, terminal true, `package_expired_terminal`, terminal timestamp present, no consumer, no aggregate, expired true, revoked false.
- `revoked`: current stage 0-6, terminal true, `package_revoked_terminal`, terminal timestamp present, no consumer, no aggregate, expired false, revoked true.

The boolean checks use equality against NOT NULL boolean columns. This is SQL NULL-safe for the reviewed schema because `terminal`, `expired`, `revoked`, and `fallback_attempted` are declared `not null`.

## SQL NULL/UNKNOWN Review

Postgres CHECK constraints accept TRUE or NULL, so nullable fields were reviewed expression by expression.

Nullable package fields are handled with explicit `is null` or `is not null` where their nullability matters:

- `terminal_reason`
- `terminal_at`
- `active_consumer_id`
- `active_consumer_fingerprint`
- `active_consumer_claimed_at`
- `aggregate_fingerprint`
- `last_audit_event_fingerprint`

The decisive package-state semantics are expressed as `case state ... else false end`. `state` is `not null` and separately closed to the approved state vocabulary. Nullable equality checks inside branches are paired with required `is null`/`is not null` branch posture, so the reviewed contradictory row examples do not pass through UNKNOWN.

## Exact Identity Review

The record table exactly constrains:

- `schema_identity='ture.execution.dormant-git-runner-authority-consumption-storage.schema-family.v1'`
- `schema_version=1`
- `package_contract_identity='ture.execution.pure-dormant-git-runner-authority-package-contract.fixture.v1'`
- `package_contract_version=1`
- `capability_set_identity='ture.execution.read-only-git-repository-observation-capability-set.v1'`
- `capability_set_version=1`
- `expiry_policy_identity='ture.execution.dormant-git-runner-authority-expiry-policy.v1'`
- `expiry_policy_version=1`
- `freshness_policy_identity='ture.execution.dormant-git-runner-authority-freshness-policy.v1'`
- `freshness_policy_version=1`
- `sequence_identity='ture.execution.read-only-git-repository-observation.sequence.root-object-format-head-branch-status-head.v1'`
- `platform='macos'`
- `source_policy_identity='pure_raw_process_completion_evidence_contract_policy_v1'`
- `source_policy_version=1`
- `executable_identity='/usr/bin/git'`

Dynamic package-specific values such as package IDs, session fingerprints, authority package fingerprints, and other SHA-256 linkages remain formatted and unique rather than equality-bound, as intended.

## Regression Review

Package invariants remain intact:

- stage/count ranges;
- `consumed_stage_count + remaining_stage_count = 6`;
- transition version and audit sequence positive;
- retry count zero;
- fallback false;
- exact 30-second expiry;
- lowercase SHA-256 grammar;
- global package uniqueness.

Stage and audit constraints did not regress:

- three-table architecture unchanged;
- FK uses `on delete restrict`;
- six stage identities remain exact;
- stage outcome/reason/nullability checks remain closed;
- audit operation/status/reason vocabulary remains closed;
- audit transition version increments by one;
- audit prior/previous state posture remains constrained;
- audit `runtime_activated=false`, `authority='none'`, and `toctou_eliminated=false` remain enforced.

RLS and privileges remain deny-by-default:

- all three tables enable row-level security;
- no permissive policies are created;
- privileges are revoked from `public`, `anon`, and `authenticated`;
- no direct application grant, client-facing view, trigger, function, RPC, or SECURITY DEFINER behavior exists.

## Cross-Row Limits

The migration remains schema-only. It explicitly defers to future transactional RPC review:

- package counters versus actual stage rows;
- package cursor versus stage progression;
- stage policy fingerprint versus package policy fingerprint;
- consumer versus `consumed_by` linkage;
- audit package identity versus package row;
- audit sequence versus package `next_audit_sequence`;
- audit final fingerprint versus package latest audit fingerprint;
- aggregate finalization versus six accepted completions;
- no later stage after failed/ambiguous completion;
- atomic package/stage/audit mutation.

The schema is approved as a dormant storage foundation only. It is not database-ready, replay-safe, authority-consuming, runtime-ready, staging-ready, execution-ready, deployment-ready, or production-ready.

## Runtime Reachability

Static reachability review found no application/runtime caller for the storage tables or migration:

- no `app`, `components`, or `lib` reference to the storage table names or migration filename;
- no Supabase query or RPC caller was added;
- no runner, API, UI, worker, cron, CLI, adapter, Git execution, process/repository access, credential, environment, network, Avanza, trading, staging, or deployment behavior was added.

Prohibited-operation review found only static test assertions and documentation comments for forbidden phrases. The executable migration creates no function, trigger, view, dynamic SQL, SECURITY DEFINER behavior, policy, direct grant, JSONB payload, raw output/path/process column, or runtime execution path.

## Test Quality

The 31 focused migration tests are sufficient for static approval of this dormant schema package. They inspect executable SQL and normalized constraint bodies, not only documentation comments, for:

- exact table identity and migration timestamp;
- three-table architecture;
- package/stage/audit columns;
- closed package states, stage outcomes, audit operations/statuses/reasons;
- SHA-256 fingerprint grammar;
- exact source-controlled identity constraints;
- removal of broad nonempty checks for fixed semantic identities;
- narrowed terminal reason vocabulary;
- closed `case state ... else false end` state-progress semantics;
- consumed/failed/ambiguous/expired/revoked/nonterminal branch posture;
- representative contradictory terminal rows;
- failed rows with zero consumed progress;
- terminal active-consumer and aggregate nullability;
- stage identity, nullability, outcome, uniqueness, FK, RLS, revocation, privacy, and no-RPC/no-SECURITY-DEFINER posture.

No local database execution was performed because repository-local `psql` is unavailable and no disposable Postgres harness exists in this checkout.

## Migration Baseline Limitation

The unrelated migration remains absent:

`supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`

Action 622-625 did not recreate or modify it. The related static test still fails during module loading with `ENOENT` before tests are discovered. In-scope regression groups pass when that known blocker is excluded.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- Focused Action 622-624 migration suite: first sandbox attempt failed on Playwright `.last-run.json` `EPERM`; minimum-permission rerun passed, 31 tests.
- Pure authority-consumption transition suite: passed, 77 tests.
- Authority-package suite: passed, 155 tests.
- Resolver/revalidation/direct-spawn group: passed, 913 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw-completion/composition/process group: passed, 103 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Broad dormant/process/credential/authorization group: passed, 655 tests, excluding only the known unrelated migration-static blocker.
- Known missing authorization-consumption migration-static test: failed with `ENOENT` before tests were found, as expected.
- Scoped ESLint on the migration test file: passed.
- `git diff --check`: passed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static review items 12-32 from Action 625: completed with pass verdicts.

## Non-Authorizations

Final approval does not authorize:

- transactional RPCs;
- runtime database use;
- live registration;
- live authority consumption;
- replay prevention;
- Git execution;
- process or repository access;
- runner/API/UI activation;
- credentials, environment, or network;
- Avanza/trading;
- staging;
- deployment.

## Commit And Deploy

No deploy is recommended for Action 625.

Do not commit until the complete diff has been manually inspected.
