# Post-Trade Allowlisted Read-Only Live Staging Migration Preflight Runner

Action 507 implemented the source-controlled runner layer for a future read-only live staging migration preflight. The runner was not run against the live repository, Git, Supabase, staging, production, or any remote database. No deployment occurred.

## Implemented Files

- `lib/post-trade-read-only-live-staging-migration-preflight-runner-core.ts`
- `lib/post-trade-read-only-live-staging-migration-preflight-runner.ts`
- `tests/e2e/post-trade-read-only-live-staging-migration-preflight-runner.spec.ts`

## Runner Purpose

The runner can later gather authoritative read-only evidence for the reviewed staging migration:

- `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`
- reviewed migration fingerprint `4f4fbfb52a458e502441322bae873940469c89f292db464d177aa10fad9f095a`
- staging project `pdvzyuhykomwfqyyztru`
- rejected production project `ekdyopdrrkphlrsilyoo`

It feeds sanitized evidence into the reviewed Action 506 preflight contract. It does not deploy, apply, repair, reset, or execute SQL.

## Architecture

The implementation is split into two layers:

- Pure runner core: command specifications, argument validation, read-only catalog specifications, parser contracts, output safety checks, evidence construction, collection-session orchestration, and contract evaluation.
- Server-only boundary: `import "server-only"` wrapper that exports the runner and narrow injected interfaces.

The pure core does not call Node child-process APIs, does not import Supabase clients, does not call `createClient`, and does not run commands during import or construction.

## Injected Execution Boundary

The runner accepts injected dependencies only:

- `PostTradeReadOnlyLivePreflightCommandExecutor`
- `PostTradeReadOnlyLivePreflightCatalogAdapter`

Executor inputs are exact command specs only. Executor outputs are sanitized operational metadata with transient output available only at the parser boundary. Final runner results do not include raw stdout, stderr, SQL, URL values, tokens, or secret material.

## Command Families

The runner models these read-only families:

- `git_repository_root`
- `git_current_commit`
- `git_current_branch`
- `git_porcelain_status`
- `git_staged_files`
- `git_unstaged_files`
- `git_untracked_files`
- `local_migration_content`
- `local_migration_inventory`
- `local_file_metadata`
- `supabase_linked_project`
- `supabase_migration_history`

The allowlist is exact. It does not permit command prefixes, caller-provided commands, arbitrary flags, shell operators, shell interpolation, mutation commands, SQL commands, migration apply/repair/reset/push, or deployment commands.

## Supabase And Catalog Boundary

The Supabase CLI command specs are limited to read-only project and migration-history evidence:

- `supabase status --linked --output json`
- `supabase migration list --linked --output json`

Remote catalog inspection is represented through typed query identities only:

- `target_relation_absence`
- `target_schema_object_conflict_scan`
- `referenced_table_existence`
- `referenced_pk_type_verification`
- `uuid_generation_capability`
- `target_policy_index_function_trigger_absence`
- `anon_authenticated_grants`
- `schema_privilege_baseline`
- `ownership_rls_capability`

Catalog specs are staging-only, read-only, and reject raw SQL, caller-provided SQL, arbitrary schemas/tables, mutation, RPC, transaction control, and multiple statements.

## Runtime Policies

- Environment policy: minimal non-secret, no color, no pager.
- Working-directory policy: exact repository-root identity only.
- Stdin policy: closed.
- Timeout policy: bounded per operation.
- Output policy: maximum stdout/stderr byte budgets, truncation detection, fingerprint-only final evidence.
- Parser policy: exact parser identity per operation, malformed and ambiguous output fail closed.
- Interactive prompts: login, password, token, link, browser auth, and migration-confirmation prompts block/ambiguous before evidence construction.
- Secret policy: tokens, service-role key material, connection strings, bearer headers, private keys, cookies, sessions, BankID, personal paths, and raw environment dumps are rejected and never persisted.

## Evidence Construction

The runner builds canonical Action 506 evidence only after all command and catalog specs validate. Evidence uses structured fingerprints for worktree, migration content, migration inventory, project, target project, remote history, remote catalog, and privilege baseline observations.

The default runner state remains inert:

- `runnerStatus: not_run`
- `evidenceCollected: false`
- `liveProjectVerified: false`
- `liveWorktreeVerified: false`
- `deploymentEnabled: false`
- `deploymentStatus: not_deployed`
- `remoteMutation: false`
- `sqlExecuted: false`
- `migrationsApplied: 0`
- `rowsCreated: 0`

## Dry/Inert Operation Plan

`buildPostTradeReadOnlyLivePreflightRunnerPlan()` returns the exact future operation plan and catalog query specs without running them. It is suitable for static/security review and fixture-only tests.

## Remaining Trust Risks

- TOCTOU remains: read-only evidence can become stale before a future deployment action.
- Credential boundary remains external: the runner defines a no-secret executor contract, but future live execution must still prove environment handling separately.
- Supabase CLI output format drift remains possible and must be handled by a future static/security review and a live-read-only approval gate.
- This runner is not a deployment mechanism and cannot authorize migration apply by itself.

## Why The Runner Was Not Run

Action 507 was implementation-only. Running the runner would require executing live Git/Supabase evidence commands or catalog inspection, which is outside this action's scope and remains gated for a later approval.

## Why No Deployment Occurred

The runner has no deployment command, no SQL execution path, no migration apply path, no schema mutation path, and no persistence path. Deployment remains disabled in all runner results.

## Confirmed Non-Events

No live Git command, Supabase command, SQL command, staging connection, production connection, remote catalog inspection, migration deployment, migration apply/repair/reset/push, schema mutation, data write, test row insertion, evidence persistence, readiness artifact consumption, API/UI/runtime activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Decision:

`post_trade_allowlisted_read_only_live_staging_migration_preflight_runner_ready_for_static_security_review`

Result:

`post_trade_allowlisted_read_only_live_staging_migration_preflight_runner_added_not_run_no_deployment`
