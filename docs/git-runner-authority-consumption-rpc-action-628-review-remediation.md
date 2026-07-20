# Action 628 - RPC Migration Review Remediation

Decision: `post_trade_git_runner_authority_consumption_rpc_action_627_findings_remediated_ready_for_re_review`

Result status: `post_trade_git_runner_authority_consumption_action_628_remediation_completed`

Recommended next Action: Action 629 - Independent Final Re-Review of Git Runner Authority Consumption Transactional RPC Migration Remediation

## Scope

Action 628 remediates the three Action 627 medium findings in the uncommitted Action 626-627 Git runner authority-consumption transactional RPC package.

Changed artifacts:

- `supabase/migrations/20260720001000_create_git_runner_authority_consumption_rpcs.sql`
- `tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts`
- `docs/git-runner-authority-consumption-rpc-migration-action-626.md`
- `docs/git-runner-authority-consumption-rpc-action-626-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

No application caller, TypeScript storage adapter, runner, API/UI/cron/worker/CLI reachability, live database connection, Git execution, process creation or observation, repository inspection, credentials, environment access, network access, Avanza/trading behavior, persistence beyond the reviewed migration text, staging, deployment, retry, fallback, cache, automatic reissue, reconciliation, or package reset was added.

## Finding-To-Remediation Matrix

| Finding | Severity | Action 627 issue | Action 628 remediation | Verdict |
| --- | --- | --- | --- | --- |
| `A627-MED-001` | Medium | Four non-expiry mutation RPCs could mutate state or accepted audit rows at or after `expires_at`. | Added explicit semantic operation timestamp checks requiring `< r.expires_at` in `record_git_runner_authority_stage_completion`, `terminalize_git_runner_authority_failure`, `terminalize_git_runner_authority_ambiguous_failure`, and `revoke_git_runner_authority_package`. Expiry rejection returns `transition_rejected` / `package_expired` before consumer, stage, mutation, and accepted audit paths. | Remediated pending independent re-review. |
| `A627-MED-002` | Medium | `read_git_runner_authority_consumption_state` returned zero rows for a missing package. | Reworked the read RPC to return exactly one deterministic row for input rejection, not found, and found. Not found now returns `authority_consumption_state_not_found` with null package/stage fields and inert posture. Found returns exactly one package-level row with stage fields null/false. | Remediated pending independent re-review. |
| `A627-MED-003` | Medium | Focused static tests did not cover the expiry and read-not-found gaps. | Expanded the focused migration suite from 38 to 45 tests with expiry-order tests for all four affected mutation RPCs, unaffected-expiry regression coverage, read not-found one-row coverage, and inert read-result posture coverage. | Remediated pending independent re-review. |

## Expiry Remediation

The final-approved policy remains:

- non-expiry mutation transitions are allowed only when their semantic operation timestamp is strictly before `expires_at`;
- equality with `expires_at` rejects;
- values after `expires_at` reject;
- `terminalize_git_runner_authority_expiry` remains the only function that accepts an observed timestamp at or after expiry;
- no RPC automatically invokes expiry terminalization as a side effect of another transition;
- no retry, fallback, reconciliation, package reset, or automatic reissue was introduced.

Affected operation timestamps:

- `record_git_runner_authority_stage_completion`: `p_completed_at`
- `terminalize_git_runner_authority_failure`: `p_observed_at`
- `terminalize_git_runner_authority_ambiguous_failure`: `p_observed_at`
- `revoke_git_runner_authority_package`: `p_observed_at`

The expiry checks occur after input grammar, package lookup, package linkage, transition version/state fingerprint, terminal/revoked/expired state, and timestamp-order checks, and before consumer linkage, stage lookup where applicable, mutation, and accepted audit insertion.

## Read Result Remediation

`read_git_runner_authority_consumption_state` now has a closed one-row result posture:

- malformed input returns one `read_rejected` / `input_contract_rejected` row;
- absent package linkage returns one `authority_consumption_state_not_found` row;
- matching package linkage returns one `authority_consumption_state_found` row.

The read function no longer depends on a package-to-stage `left join` that can create zero rows or multiple stage rows. Found output is bounded to package-level state and fingerprint fields, with stage fields null or false. Not-found output reveals no package identity, no stage state, no audit history, no raw output, no process data, no repository data, and no authority-bearing material.

Every read result preserves:

- `runtime_activated:false`
- `authority:'none'`
- `toctou_eliminated:false`

## Production Changes

Production SQL changes were limited to:

- adding four exact expiry checks and deterministic `package_expired` rejections;
- moving the ambiguous-terminalization stage lookup after package expiry validation;
- changing read-state lookup to a package row lookup with explicit input-rejected, not-found, and found branches.

No storage table, policy, trigger, grant, runtime adapter, application code, or production TypeScript behavior was changed.

## Tests Added

The focused RPC migration suite added seven static tests:

1. stage-completion expiry rejection before mutation;
2. failure terminalization expiry rejection before mutation and audit;
3. ambiguous terminalization expiry rejection before stage lookup and audit;
4. revocation expiry rejection before revoked state and audit;
5. unaffected RPC expiry posture regression;
6. deterministic read not-found row;
7. inert authority posture for read found and not-found branches.

Focused count before Action 628: 38 tests.

Focused count after Action 628: 45 tests.

## Static Review Notes

Action 628 preserves:

- dormant migration posture;
- SECURITY DEFINER functions with fixed `search_path`;
- execute revocation from `public`, `anon`, and `authenticated`;
- absence of dynamic SQL;
- row-lock and CAS transition model;
- no runtime reachability;
- no application-level authority consumption;
- no process, Git, repository, credential, environment, network, Avanza, trading, staging, or deployment behavior.

Static SQL execution with a disposable database remains pending because no repository-local `psql`/disposable harness was available during the prior review cycle.

## Validation

Focused validation passed after the known Playwright sandbox `.last-run.json` `EPERM` was rerun with minimum required filesystem permission:

- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts --reporter=dot`: passed, 45 tests.

Full Action 628 validation is recorded in the Action 628 checkpoint. In-scope suites passed; the unrelated authorization-consumption migration-static limitation remains the missing historical file `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`.

## Non-Authorizations

Action 628 does not authorize:

- Git execution;
- process creation or observation;
- repository inspection;
- runtime database invocation;
- live authority consumption by application code;
- replay safety beyond the reviewed dormant RPC semantics;
- runner implementation;
- API/UI/cron/worker/CLI activation;
- credentials, environment, or network;
- Avanza/trading;
- staging;
- deployment.

## Commit And Deploy

No deploy is recommended for Action 628.

Do not commit until the complete diff has been manually inspected.
