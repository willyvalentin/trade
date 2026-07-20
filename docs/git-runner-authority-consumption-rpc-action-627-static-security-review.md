# Action 627 - Static Security Review of Git Runner Authority Consumption Transactional RPC Migration

Decision: `post_trade_git_runner_authority_consumption_transactional_rpc_migration_static_security_review_blocked_pending_corrections`

Result status: `post_trade_git_runner_authority_consumption_action_627_review_completed_blocked`

Recommended next Action: Action 628 - Remediate Git Runner Authority Consumption Transactional RPC Migration Review Findings

## Scope

Action 627 independently reviewed the complete uncommitted Action 626 transactional RPC migration package:

- `supabase/migrations/20260720001000_create_git_runner_authority_consumption_rpcs.sql`
- `tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts`
- Action 626 implementation and checkpoint docs
- Action 622-625 storage migration package
- Action 615-620 pure authority-consumption transition contract
- Action 607-612 pure dormant Git runner authority package contract
- Action 613-614 atomic-consumption and storage architecture
- Action 621 migration/RPC and database-security plans

This was a static review only. No database execution was performed, no remote or live database was contacted, no authority package was registered, no application behavior consumed authority, no Git command was executed, no process was created or observed, and no repository was inspected through runtime behavior.

## Findings

| ID | Severity | Location | Finding | Scenario | Required remediation | Approval impact |
| --- | --- | --- | --- | --- | --- | --- |
| `A627-MED-001` | Medium | `record_git_runner_authority_stage_completion`, `terminalize_git_runner_authority_failure`, `terminalize_git_runner_authority_ambiguous_failure`, `revoke_git_runner_authority_package` in `supabase/migrations/20260720001000_create_git_runner_authority_consumption_rpcs.sql` | Several non-expiry transitions do not reject observed/completed times at or after `r.expires_at`. The pure transition contract rejects expired observed times for these operations through `validateExistingInput`. | A package can be consumed before expiry, then a later call after expiry can record accepted or terminal completion evidence, terminalize failure/ambiguity, or revoke the package instead of failing closed as expired. Aggregate finalization still rejects after expiry, but state/audit mutation after expiry violates the approved freshness model. | Add explicit `observed_at`/`completed_at < r.expires_at` checks to every non-expiry mutation path that relies on live package validity, with deterministic rejected reasons and focused static tests. | Blocks approval. |
| `A627-MED-002` | Medium | `read_git_runner_authority_consumption_state`, lines 780-817 | The read RPC returns zero rows for a missing package rather than an explicit deterministic not-found posture. Action 627 requires deterministic not-found behavior. | A caller cannot distinguish "not found" from empty result handling without an out-of-band row-count convention. That weakens closed result semantics for a SECURITY DEFINER read primitive, even though it does not mutate state. | Return one explicit bounded rejection row, such as `read_rejected` / `package_linkage_rejected`, when no matching package exists. Keep it ungranted and privacy-safe. | Blocks approval. |
| `A627-MED-003` | Medium | `tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts`, lines 241-263 and 279-291 | The focused Action 626 suite does not inspect expiry rejection for completion/failure/ambiguity/revocation and does not assert an explicit not-found posture for the read RPC. | The suite passed while `A627-MED-001` and `A627-MED-002` remained present, so it does not materially prove the full executable SQL required by Action 627. | Add static tests that fail without the missing expiry checks and read not-found branch. | Blocks approval until paired with code remediation. |

Findings by severity:

- Critical: 0
- High: 0
- Medium: 3
- Low: 0
- Informational: 0

## Migration Identity And Scope

Verdict: pass with blocking findings elsewhere.

The migration filename is exact: `20260720001000_create_git_runner_authority_consumption_rpcs.sql`. It follows the approved storage migration timestamp `20260720000000`. No timestamp collision was found.

The migration creates no table, trigger, view, policy, extension, role, schema, app object, TypeScript adapter, runner, API/UI/cron/worker/CLI caller, dynamic SQL path, or runtime activation path.

## Function Inventory And Signatures

Verdict: pass.

Exactly ten approved functions exist:

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

No overloads, default parameters, variadic parameters, polymorphic parameters, JSON/JSONB arbitrary state input, or extra callable signatures were found.

Static signature script result:

- registration: 50 parameters; revoke/comment signatures match.
- all other functions: declaration, revoke, and comment signatures match.

## SECURITY DEFINER And Search Path

Verdict: pass.

Every function is `language plpgsql`, `security definer`, with exact `set search_path = pg_catalog, public`. All table references are explicitly `public.` qualified. The SQL contains no dynamic SQL, no identifier parameters, no caller-controlled schema/table names, and no unqualified custom function calls.

The use of `public` in the search path is not currently exploitable in this migration because custom relations are schema-qualified and built-in calls resolve through `pg_catalog` first. No temporary-schema redirection path was found.

## Privileges

Verdict: pass.

Every function has `revoke execute ... from public, anon, authenticated`. No later execute grant, service-role grant, table grant, permissive RLS policy, or runtime role path was introduced.

## Input Surface

Verdict: blocked by `A627-MED-001`.

Positive observations:

- Callers cannot supply final package state, terminal booleans, consumed counts, next transition version, event status, operation identity, table/schema names, SQL fragments, or audit objects.
- Fingerprint-bearing parameters are checked against lowercase SHA-256 grammar before intended mutation.
- Stage identity input is closed in `consume_git_runner_authority_stage`.
- Completion outcome and interpretation-fingerprint nullability are closed.

Blocking gap:

- Several mutation paths do not reject after `expires_at`, so caller-supplied observed/completed time can drive post-expiry state/audit mutation.

## SQL NULL/UNKNOWN Review

Verdict: pass for mutation safety, with reason-quality limitations.

Most trust fields are `NOT NULL` in storage. Nullable fields are generally guarded with `is null` / `is not null` storage constraints. If a nullable or malformed parameter causes a later NOT NULL/constraint failure, the outer exception handler returns `storage_operation_rejected`; the mutation is rolled back by PL/pgSQL exception subtransaction semantics. This is fail-closed, though less reason-specific than ideal.

No NULL/UNKNOWN path was found that returns a permitted transition without the intended row linkage, but the missing expiry comparisons are not a NULL issue and remain blocking.

## Result Union

Verdict: pass.

Mutation results return only `transition_permitted` or `transition_rejected` style statuses with deterministic reasons. Read returns `read_permitted` or exception-level `read_rejected`. No SQLSTATE, SQLERRM, stack, constraint name, query text, raw exception, or sensitive database internals are returned. All returned posture remains `runtime_activated:false`, `authority:'none'`, and `toctou_eliminated:false`.

## Transaction And Rollback

Verdict: pass statically.

Mutation and audit insertion happen inside single PL/pgSQL function bodies. There is no explicit `COMMIT`, autonomous transaction, external side effect, dynamic SQL, retry, or fallback. In PL/pgSQL, an exception block rolls back statements inside that block before executing the handler, so broad `WHEN OTHERS` does not preserve partial updates while returning a rejected row.

This remains static-only; database execution is still required to verify actual creation and return type behavior.

## Lock Order

Verdict: pass.

Non-registration mutations lock the package row first with `SELECT ... FOR UPDATE`. Stage operations lock package first, then stage rows. Aggregate finalization locks the package and then locks stage rows ordered by `stage_index`. No alternate stage-before-package lock order was found.

## CAS And Versioning

Verdict: pass.

Non-registration mutations compare the locked row's `transition_version` and `state_fingerprint` with caller-supplied expected values, then update by locked `id`, previous transition version, and previous state fingerprint. Next transition version is computed internally as `v_previous_version + 1`; callers do not select it.

## Operation Reviews

Registration verdict: pass. Exact identities, platform, executable, six-stage creation, initial state, fixed 30-second expiry, and first audit event are constructed internally.

Claim verdict: pass. Requires issued state, no consumer, stage/count posture, unexpired observed time, exact CAS, and valid consumer fields.

Stage-consumption verdict: pass. Requires active/partially consumed state, exact active consumer, current stage, exact stage identity/grant, unconsumed stage, previous accepted completion for later stages, unexpired observed time, and audit insertion.

Completion verdict: blocked by `A627-MED-001`. Outcome closure and audit insertion are present, but the RPC lacks `p_completed_at < r.expires_at` and lacks an explicit `r.current_stage_index = p_stage_index` cursor check.

Failure/ambiguity verdict: blocked by `A627-MED-001`. Both are closed and audited, but neither rejects at/after expiry.

Expiry verdict: pass. Requires observed time at/after expiry and terminalizes to `expired`.

Revocation verdict: blocked by `A627-MED-001`. It is closed and audited, but can revoke after expiry rather than failing closed or routing to expiry.

Aggregate verdict: pass. Requires six accepted completed stages, exact package counts, active consumer, nonterminal posture, and observed time before expiry.

Read verdict: blocked by `A627-MED-002`. The selected fields are bounded and privacy-safe, but missing records return no deterministic not-found row.

## Audit Atomicity

Verdict: pass statically.

Every successful mutation inserts one audit event after package/stage mutation, using the package identity, authority-policy fingerprint, consumption key, consumer/stage where applicable, operation/status/reason, transition versions, previous and next fingerprints, relevant evidence fingerprint, prior event fingerprint, event fingerprint, and inert runtime posture.

Rejected paths return before mutation, except paths that encounter database exceptions; those are rolled back by the exception block.

## SQL Injection And Hostile Input

Verdict: pass.

No `EXECUTE`, `format`, string-built SQL, identifier input, dynamic cast, schema name input, table name input, JSON/JSONB payload, network call, process call, or credential call was found. Scalar inputs are used as bound PL/pgSQL values.

## Test Quality

Verdict: blocked by `A627-MED-003`.

The 38 focused tests materially cover function inventory, signatures, SECURITY DEFINER, fixed search path, execute revocation, lack of broad grants/dynamic SQL, exact registration identities, six-stage ordering, terminalization branches, aggregate finalization, bounded read fields, audit insertion, SHA-256-shaped checks, reachability, and prohibited-operation posture.

They do not cover the decisive missing expiry checks or explicit read not-found behavior.

## Static-Only Limitation

Verdict: acceptable only for a blocked static review.

No local `psql` binary or repository-local disposable Postgres/Supabase harness was available. Therefore, this review did not verify:

- SQL parse validity;
- actual function creation;
- function signature resolution by the database;
- PL/pgSQL variable ambiguity;
- return-query type matching;
- row-lock behavior under real concurrency;
- unique-conflict mapping;
- RLS/execute behavior in a database;
- constraint compatibility at execution time.

Those gaps should be handled by a later disposable local database validation gate after remediation.

## Runtime Reachability

Verdict: pass.

Static search found no app, component, library, API, runner, worker, cron, CLI, Supabase RPC caller, storage adapter, runtime registration path, or runtime consumption path invoking the functions or tables. References are limited to migrations, tests, and documentation.

## Storage And Prior-Contract Regression

Verdict: pass for file modification; blocked for semantic parity.

Action 626 did not modify the final-approved storage migration, pure transition contract, authority-package contract, expiry policy, six-stage sequence, no-retry/fallback posture, or runtime reachability. However, the RPC migration diverges from the pure transition contract's expired-observed-time rejection for several mutation operations.

## Migration Baseline Limitation

The unrelated file remains missing:

`supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`

Action 626-627 did not recreate or modify it. Its static test fails during module loading with `ENOENT` before test discovery. In-scope suites pass when that known blocker is excluded.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- RPC plus storage migration suites: passed, 69 tests.
- Pure transition plus authority-package suites: passed, 232 tests.
- Resolver/revalidation/direct-spawn group: passed, 913 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Neutralization/raw/composition/process/credential/authorization/Action 533 group: passed, 804 tests.
- Known missing authorization-consumption migration-static test: failed with `ENOENT` before tests were found, as expected and unrelated.
- Scoped ESLint on the RPC migration test: passed.
- `git diff --check`: passed.
- quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static migration identity/order review: completed.
- Static function inventory/signature review: completed.
- Static SECURITY DEFINER/search-path review: completed.
- Static privilege/overload/input/NULL/result/transaction/lock/CAS/operation/audit/exception/SQL-injection/test-quality/database-gap/storage-regression/runtime/prohibited-operation reviews: completed.

## Non-Authorizations

This review does not authorize application database calls, runtime registration or consumption, a server adapter, Git execution, process or repository access, runner/API/UI activation, credentials, environment, network, Avanza/trading, staging, deployment, or production use.

## Commit And Deploy

No deploy is recommended for Action 627.

Do not commit until the complete diff has been manually inspected and the blocking remediation has been completed and reviewed.
