# Action 628 Checkpoint - RPC Migration Review Remediation

Action: 628 - Remediate Git Runner Authority Consumption Transactional RPC Migration Review Findings

Decision: `post_trade_git_runner_authority_consumption_rpc_action_627_findings_remediated_ready_for_re_review`

Result status: `post_trade_git_runner_authority_consumption_action_628_remediation_completed`

Recommended next Action: Action 629 - Independent Final Re-Review of Git Runner Authority Consumption Transactional RPC Migration Remediation

## Findings Remediated

- `A627-MED-001`: remediated by adding strict `< expires_at` checks to completion, failure terminalization, ambiguous terminalization, and revocation RPCs.
- `A627-MED-002`: remediated by making read-state return one deterministic found/not-found row instead of zero rows for not found.
- `A627-MED-003`: remediated by expanding focused static migration coverage from 38 to 45 tests.

## Files Created

- `docs/git-runner-authority-consumption-rpc-action-628-review-remediation.md`
- `docs/git-runner-authority-consumption-rpc-action-628-checkpoint.md`

## Files Modified

- `supabase/migrations/20260720001000_create_git_runner_authority_consumption_rpcs.sql`
- `tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts`
- `docs/git-runner-authority-consumption-rpc-migration-action-626.md`
- `docs/git-runner-authority-consumption-rpc-action-626-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Corrected RPC Posture

The affected mutation RPCs now reject at or after expiry using `transition_rejected` / `package_expired` before mutation and accepted audit insertion:

- `record_git_runner_authority_stage_completion`
- `terminalize_git_runner_authority_failure`
- `terminalize_git_runner_authority_ambiguous_failure`
- `revoke_git_runner_authority_package`

`terminalize_git_runner_authority_expiry` remains the only RPC that accepts an observed timestamp at or after `expires_at`.

`read_git_runner_authority_consumption_state` now returns:

- one `read_rejected` / `input_contract_rejected` row for malformed read input;
- one `authority_consumption_state_not_found` row for absent package linkage;
- one `authority_consumption_state_found` package-level row for matching package linkage.

All results remain non-authoritative with `runtime_activated:false`, `authority:'none'`, and `toctou_eliminated:false`.

## Security Verdicts

- Dormant migration posture: preserved.
- SECURITY DEFINER and fixed search path: preserved.
- Execute privileges revoked from `public`, `anon`, and `authenticated`: preserved.
- Dynamic SQL: absent.
- Application/runtime reachability: absent.
- Git/process/repository behavior: absent.
- Credential/environment/network behavior: absent.
- Avanza/trading/staging/deployment behavior: absent.
- Retry/fallback/cache/automatic reissue behavior: absent.

## Validation

Validation results:

- `./node_modules/.bin/tsc --noEmit`: first sandbox attempt failed on `tsconfig.tsbuildinfo` `EPERM`; minimum-permission rerun passed.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts --reporter=dot`: first sandbox attempt failed on Playwright `.last-run.json` `EPERM`; minimum-permission rerun passed, 45 tests.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts --reporter=dot`: passed, 76 tests.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: passed, 232 tests.
- Resolver/revalidation/direct-spawn group: passed, 913 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw-completion/composition/process/credential/authorization/Action 533 broad group: passed, 804 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Known authorization-consumption migration-static limitation check: failed with `ENOENT` before tests were found for missing `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`; unrelated and unchanged.
- `./node_modules/.bin/eslint tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts`: passed.
- `git diff --check`: passed.
- quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static app/component/lib/script reachability scan: passed; no runtime caller matched.
- Static executable migration prohibited-operation scan: passed; matches were limited to revoke statements and inert comment/test/doc strings.
- Static expiry and read-result review: passed.
- Repository-local `psql` availability check: unavailable, so disposable database execution was not performed.

Known sandbox behavior:

- TypeScript required minimum-permission rerun for `tsconfig.tsbuildinfo`.
- Playwright required minimum-permission reruns for `test-results/.last-run.json`.

Known unrelated migration limitation:

- `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains absent.
- The durable authorization-consumption migration static suite may still fail with `ENOENT` before test discovery when included directly.
- Action 628 did not create or modify that migration.

## Non-Authorizations

Action 628 does not authorize Git execution, process creation or observation, repository inspection, runtime RPC invocation, live authority consumption by application code, runner implementation, API/UI/cron/worker/CLI activation, credentials, environment, network, Avanza/trading, staging, deployment, retries, fallback, cache, or automatic reissue.

## Commit And Deploy

No deploy is recommended for Action 628.

Do not commit until the complete diff has been manually inspected.
