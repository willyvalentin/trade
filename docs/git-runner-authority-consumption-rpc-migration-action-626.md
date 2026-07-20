# Action 626 - Git Runner Authority Consumption Transactional RPC Migration

Decision: `post_trade_git_runner_authority_consumption_transactional_rpc_migration_implemented_ready_for_static_security_review`

Result status: `post_trade_git_runner_authority_consumption_rpc_action_626_implemented_not_activated`

Recommended next Action: Action 627 - Static Security Review of Git Runner Authority Consumption Transactional RPC Migration

## Scope

Action 626 implements one dormant Supabase migration containing transactional RPC primitives for the previously approved Git runner authority-consumption storage schema.

Created migration:

- `supabase/migrations/20260720001000_create_git_runner_authority_consumption_rpcs.sql`

The migration adds no application caller, no runner, no API/UI/cron/worker/CLI reachability, no Git execution, no process creation or observation, no repository inspection, no credentials, no environment access, no network access, no Avanza/trading behavior, no staging behavior, no deployment behavior, no retry, no fallback, no cache, and no automatic reissue.

## Preconditions

Verified before implementation:

- workspace: `/Users/willysimonsson/Dev/trade-action-534`
- branch: `codex/action-534-live-resolver`
- HEAD contains the Action 625 approval checkpoint: `04d3883 Add reviewed Git authority consumption storage schema`
- git status was clean
- storage migration exists: `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`
- no prior `20260720001000` migration existed

## RPC Inventory

The migration creates exactly ten functions:

1. `register_git_runner_authority_package`
2. `claim_git_runner_authority_consumer`
3. `consume_git_runner_authority_stage`
4. `record_git_runner_authority_stage_completion`
5. `terminalize_git_runner_authority_failure`
6. `terminalize_git_runner_authority_ambiguous_failure`
7. `terminalize_git_runner_authority_expiry`
8. `revoke_git_runner_authority_package`
9. `finalize_git_runner_authority_aggregate`
10. `read_git_runner_authority_consumption_state`

All functions use `language plpgsql`, `security definer`, and fixed `search_path = pg_catalog, public`. Execute privileges are revoked from `public`, `anon`, and `authenticated` for every function signature.

## Transaction Model

The mutation RPCs use row locks and compare-and-swap transition checks over:

- `consumption_key`
- `authority_package_fingerprint`
- `transition_version`
- `state_fingerprint`
- active consumer fingerprint where applicable
- stage index, identity, grant, and process-request fingerprints where applicable

Each permitted mutation writes the package/stage state and one audit event in the same database transaction. Rejected transitions return closed non-authoritative rows and do not grant runtime authority.

## Registration

`register_git_runner_authority_package` validates exact approved source-controlled identity fields before inserting:

- storage schema identity/version
- pure dormant authority-package contract identity/version
- read-only Git repository observation capability-set identity/version
- fixed expiry and freshness policy identity/version
- six-stage Git observation sequence identity
- executable identity `/usr/bin/git`
- platform `macos`
- source policy identity/version
- fixed 30-second expiry
- lowercase SHA-256-shaped fingerprints

It inserts one package row, exactly six fixed stage rows, and one registration audit event. Duplicate package identity, consumption key, or package fingerprint paths fail closed.

## Stage Order

The only accepted stage identities are:

1. `git_repository_root_v1`
2. `git_object_format_v1`
3. `git_head_before_v1`
4. `git_branch_state_v1`
5. `git_porcelain_status_v1`
6. `git_head_after_v1`

`consume_git_runner_authority_stage` requires an active/partially consumed package, the exact current stage index, the exact stage identity, a matching stage-grant fingerprint, and the exact active consumer fingerprint. Stages after index 0 require the previous stage to have a recorded accepted completion.

## Completion And Terminalization

`record_git_runner_authority_stage_completion` accepts only closed outcomes:

- `accepted`
- `accepted_detached_observation` for stage 3 only
- `rejected`
- `process_failed`
- `ambiguous_process_state`

Successful completions advance the stage cursor. Rejected or failed completions terminalize to `failed_consumed`. Ambiguous completions terminalize to `ambiguous_failed_consumed`. Dedicated terminalization RPCs also cover failure, ambiguous failure, expiry, and revocation with exact CAS checks.

Action 628 completed the still-uncommitted v1 RPC contract by adding the final-approved expiry boundary to every non-expiry mutation path that previously lacked it. Stage completion, failure terminalization, ambiguous terminalization, and revocation now require their semantic operation timestamp to be strictly before `expires_at`; at or after expiry they return `transition_rejected` / `package_expired` before consumer/stage checks, mutation, or accepted audit insertion. `terminalize_git_runner_authority_expiry` remains the only RPC that accepts an observed timestamp at or after expiry.

## Aggregate Finalization

`finalize_git_runner_authority_aggregate` requires:

- exact consumer fingerprint;
- current stage index 6;
- consumed stage count 6;
- remaining stage count 0;
- package not terminal, expired, or revoked;
- all six stages consumed and completion-recorded;
- all six stages accepted, with stage 3 allowed to use `accepted_detached_observation`;
- observed time before expiry.

It writes the aggregate fingerprint, terminalizes the package as `consumed`, and records one audit event.

## Read RPC

`read_git_runner_authority_consumption_state` returns bounded package and stage state/fingerprint fields only. It does not expose unrestricted audit history, raw output, raw paths, process data, credentials, environment values, or authority-bearing secrets.

After Action 628, the read RPC returns exactly one deterministic row for malformed input, absent package linkage, and found package linkage. Missing linkage returns `authority_consumption_state_not_found` with null package/stage fields and inert authority posture. Found linkage returns one package-level `authority_consumption_state_found` row with bounded package fields and null/false stage fields.

## Security Posture

Every mutation result returns explicit inert posture:

- `runtime_activated:false`
- `authority:'none'`
- `toctou_eliminated:false`

The migration creates no grants, policies, triggers, tables, app caller, runtime caller, process API, network API, or dynamic SQL path. SQL comments explicitly preserve non-authorization: the RPCs are dormant database primitives only.

## Static Review Notes

Action 626 found and corrected one local implementation mismatch before final validation: the `register_git_runner_authority_package` revoke/comment signatures initially omitted one text parameter. The SQL signatures were corrected and the focused suite now compares every function declaration against its revoke and comment signatures.

## Validation

- `./node_modules/.bin/tsc --noEmit`: first sandbox attempt failed on `tsconfig.tsbuildinfo` `EPERM`; minimum-permission rerun passed.
- New Action 626/628 focused RPC migration suite: first sandbox attempt failed on Playwright `.last-run.json` `EPERM`; minimum-permission reruns passed, final suite count 45 tests after Action 628 expiry/read remediation.
- Action 626 RPC plus Action 622-625 storage migration group: passed, 69 tests.
- Pure authority-consumption transition plus authority-package group: passed, 232 tests.
- Resolver/revalidation/direct-spawn group: passed, 913 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw-completion/composition/process/credential/authorization/Action 533 group: passed, 804 tests.
- Known unrelated authorization-consumption migration-static check: failed with `ENOENT` before tests were found for missing `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`.
- Scoped ESLint on the new TypeScript test: passed.
- `git diff --check`: passed.

Final validation commands were rerun after documentation updates where applicable and are recorded in the Action 626 checkpoint.

## Non-Authorizations

Action 626 does not authorize:

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
- persistence outside this migration;
- staging;
- deployment.

## Commit And Deploy

No deploy is recommended for Action 626.

Do not commit until the complete diff has been manually inspected.
