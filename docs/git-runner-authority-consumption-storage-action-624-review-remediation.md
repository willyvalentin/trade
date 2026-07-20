# Action 624 - Git Runner Authority Consumption Storage Review Remediation

Decision: `post_trade_git_runner_authority_consumption_storage_action_623_findings_remediated_ready_for_re_review`

Result status: `post_trade_git_runner_authority_consumption_storage_action_624_remediation_completed`

Recommended next Action: Action 625 - Independent Final Re-Review of Git Runner Authority Consumption Storage Migration Remediation

## Scope

Action 624 remediated the blocking Action 623 findings against the uncommitted Action 622-623 storage migration package.

Changed artifacts:

- `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`
- `tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts`
- `docs/git-runner-authority-consumption-storage-migration-action-622.md`
- `docs/git-runner-authority-consumption-storage-action-624-review-remediation.md`
- `docs/git-runner-authority-consumption-storage-action-624-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

No RPC, SECURITY DEFINER function, persistence adapter, runtime caller, API/UI/cron/worker/CLI path, runner, authority consumption, Git execution, process creation or observation, repository runtime inspection, credential access, environment access, network access, Avanza/trading behavior, staging behavior, deployment behavior, retry, fallback, cache, or reissue behavior was added.

## Finding-to-Remediation Matrix

| Finding | Severity | Remediation | Verdict |
| --- | --- | --- | --- |
| `A623-MED-001` | Medium | Replaced the permissive terminal progress branch with a `case state ... else false end` CHECK that binds each package state to exact terminal reason, progress, active-consumer, aggregate, expired, and revoked posture. | Remediated. |
| `A623-MED-002` | Medium | Added `git_runner_authority_consumption_records_exact_identity_check` with exact v1 storage/package/capability/expiry/freshness/sequence/platform/source-policy values and exact versions. | Remediated. |
| `A623-MED-003` | Medium | Expanded the static migration suite from 20 to 31 tests with exact identity, SQL UNKNOWN-safe CASE, terminal reason, contradictory terminal row, zero-consumed failure, active-consumer, and aggregate posture checks. | Remediated. |

## A623-MED-001 Closure

The package table now binds terminal state semantics row-locally:

- `consumed` requires `terminal_reason='sequence_consumed'`, exact 6/0 progress, terminal timestamp, no active consumer, and aggregate fingerprint present.
- `failed_consumed` requires `terminal_reason='stage_failed_terminal'`, at least one consumed stage, no active consumer, no aggregate, not expired, and not revoked.
- `ambiguous_failed_consumed` requires `terminal_reason='ambiguous_failed_terminal'`, at least one consumed stage, no active consumer, no aggregate, not expired, and not revoked.
- `expired` requires `terminal_reason='package_expired_terminal'`, `expired=true`, `revoked=false`, no active consumer, and no aggregate.
- `revoked` requires `terminal_reason='package_revoked_terminal'`, `expired=false`, `revoked=true`, no active consumer, and no aggregate.

The check is expressed as `case state ... else false end`, so a state outside the closed set or an unhandled branch cannot pass through SQL three-valued logic as an omitted disjunct.

## A623-MED-002 Closure

The record table now binds fixed semantic identity columns to exact approved values:

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

The source-policy equality is a v1 storage restriction for the currently approved package input lineage. It does not add runtime reachability or accept unknown source policies.

## A623-MED-003 Closure

The static test suite now checks:

- exact source-controlled identity equality instead of nonempty text checks;
- terminal reason vocabulary narrowed to terminal package reasons;
- SQL `case state ... else false end` posture;
- nonterminal state terminal-nullability and active-consumer posture;
- exact `consumed` terminal reason/progress/aggregate posture;
- exact failed and ambiguous terminal reasons and at-least-one-consumed-stage posture;
- exact expired/revoked flags and terminal reasons;
- representative contradictory terminal rows;
- zero-consumed failed terminal rows;
- terminal states cannot retain active consumers or stale aggregate posture.

Focused migration test count changed from 20 to 31.

## Contract Posture

The three-table architecture remains unchanged:

1. `public.git_runner_authority_consumption_records`
2. `public.git_runner_authority_consumption_stages`
3. `public.git_runner_authority_consumption_audit_events`

The migration filename is unchanged because the package remains uncommitted. No schema version bump is required; the remediation completes the intended v1 storage closure before first commit.

## Validation

- `./node_modules/.bin/tsc --noEmit`: first sandbox attempt failed on `tsconfig.tsbuildinfo` `EPERM`; minimum-permission rerun passed.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts --reporter=dot`: first sandbox attempt failed on Playwright `.last-run.json` `EPERM`; minimum-permission rerun passed, 31 tests.
- Pure authority-consumption transition suite: passed, 77 tests.
- Authority-package suite: passed, 155 tests.
- Resolver/revalidation/direct-spawn group: passed, 913 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw-completion/composition/process group: passed, 103 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Broad dormant/process/credential/authorization group: wildcard run failed during discovery on known unrelated missing migration `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`; rerun excluding that baseline-limitation file passed, 655 tests.
- Scoped ESLint on changed TS/JS files: passed.
- Static prohibited-operation review: only test assertion/comment hits; migration contains no RPC, SECURITY DEFINER, process, credential, network, runtime, or Git execution behavior.
- Static runtime-reachability review: no `app`, `components`, or `lib` references to the new storage table names or migration filename.
- Migration-suite baseline limitation check: known missing authorization-consumption migration remains absent and unrelated.
- `git diff --check`: passed.
- Quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.

## Remaining Limitations

The storage schema still does not provide RPC atomicity, authority consumption, one-winner replay prevention, runtime activation, package registration, or database-readiness proof. Those remain future separately reviewed Actions.

## Commit And Deploy

No deploy is recommended for Action 624.

Do not commit until the complete diff has been manually inspected.
