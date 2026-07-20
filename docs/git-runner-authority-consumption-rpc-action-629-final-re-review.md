# Action 629 - Final Re-Review of Git Runner Authority Consumption RPC Remediation

Decision: `post_trade_git_runner_authority_consumption_transactional_rpc_migration_final_security_review_approved`

Result status: `post_trade_git_runner_authority_consumption_action_629_final_re_review_completed`

Recommended next Action: Action 630 - Plan Disposable Local Database Validation of Git Runner Authority Consumption Migrations

## Scope

Action 629 independently re-reviewed the complete uncommitted Action 626-628 transactional RPC migration package. The review inspected the executable SQL, focused migration tests, storage migration, Action 627 findings, Action 628 remediation, pure authority-consumption transition contract posture, storage-schema posture, authority-package posture, runtime reachability, and validation results.

This was a final static security and contract re-review only. It did not modify either migration, did not modify RPC tests, did not implement a TypeScript storage adapter, did not connect to a database, did not register or consume a real authority package, did not execute Git, did not create or observe a process, and did not inspect a repository through runtime behavior.

## Finding Verdicts

| Finding | Original severity | Final verdict | Evidence |
| --- | --- | --- | --- |
| `A627-MED-001` | Medium | Remediated | The four affected non-expiry mutation RPCs now reject semantic operation timestamps at or after `expires_at` with `transition_rejected` / `package_expired` before mutation and accepted audit insertion. |
| `A627-MED-002` | Medium | Remediated | `read_git_runner_authority_consumption_state` now validates input, selects a bounded package row into a local record, returns an explicit one-row not-found result when no row exists, and returns one package-level found row when linkage matches. |
| `A627-MED-003` | Medium | Remediated | The focused migration suite now has 45 tests and includes individual expiry-order coverage for completion, failure terminalization, ambiguous terminalization, revocation, unaffected expiry posture, read not-found, and read inert posture. |

New findings:

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Informational: 0

One trivial documentation correction was made during re-review: Action 628 remediation docs now name the revocation function's actual timestamp parameter as `p_observed_at`, matching the Action 621 RPC plan and the SQL signature.

## Expiry Matrix

Final expiry posture:

| RPC | Timestamp | Expiry posture |
| --- | --- | --- |
| `register_git_runner_authority_package` | `p_observed_at` | Rejects when `p_observed_at >= p_expires_at`; also requires `p_expires_at = p_issued_at + interval '30 seconds'`. |
| `claim_git_runner_authority_consumer` | `p_observed_at` | Rejects when `p_observed_at >= r.expires_at`. |
| `consume_git_runner_authority_stage` | `p_observed_at` | Rejects when `p_observed_at >= r.expires_at`. |
| `record_git_runner_authority_stage_completion` | `p_completed_at` | Rejects when `p_completed_at >= r.expires_at`. |
| `terminalize_git_runner_authority_failure` | `p_observed_at` | Rejects when `p_observed_at >= r.expires_at`. |
| `terminalize_git_runner_authority_ambiguous_failure` | `p_observed_at` | Rejects when `p_observed_at >= r.expires_at`. |
| `revoke_git_runner_authority_package` | `p_observed_at` | Rejects when `p_observed_at >= r.expires_at`. |
| `finalize_git_runner_authority_aggregate` | `p_observed_at` | Rejects when `p_observed_at >= r.expires_at`. |
| `terminalize_git_runner_authority_expiry` | `p_observed_at` | Rejects when `p_observed_at < r.expires_at`; accepts only at or after expiry if other predicates pass. |

No non-expiry mutation RPC accepts equality at `expires_at`. No database clock such as `now()`, `clock_timestamp()`, `transaction_timestamp()`, or `statement_timestamp()` substitutes for the supplied semantic timestamp in the RPC migration.

## Remediated Gates

Completion expiry: pass. `record_git_runner_authority_stage_completion` checks `p_completed_at >= r.expires_at` before stage lookup, stage update, package update, current-stage advancement, terminalization for rejected/failed/ambiguous outcomes, audit insertion, and permitted result construction. The gate applies to all closed outcomes.

Failure expiry: pass. `terminalize_git_runner_authority_failure` checks `p_observed_at >= r.expires_at` before consumer/consumed-stage prerequisites, mutation, consumer clearing, version/audit increments, and audit insertion. Untouched issued packages still reject through `r.consumed_stage_count < 1`.

Ambiguous failure expiry: pass. `terminalize_git_runner_authority_ambiguous_failure` checks `p_observed_at >= r.expires_at` before stage lookup, stage mutation, package terminalization, and audit insertion. Process-request linkage, consumed-stage requirement, ambiguity evidence fingerprint, and no-retry posture remain intact.

Revocation expiry: pass. `revoke_git_runner_authority_package` checks `p_observed_at >= r.expires_at` before setting revoked state, clearing consumer fields, changing fingerprints, incrementing transition/audit sequence, or inserting audit. Expiry wins over revocation at the boundary; callers must invoke the expiry RPC separately where appropriate.

Rejected-path non-mutation: pass. Each expiry rejection returns before every `UPDATE`, accepted audit `INSERT`, version increment, audit-sequence increment, last-audit-fingerprint change, consumer clearing, and stage completion mutation in the affected function.

## Read Result Review

Read result union: pass.

`read_git_runner_authority_consumption_state` returns one deterministic row for each class:

- malformed input: `read_rejected` / `input_contract_rejected`;
- valid input without matching package linkage: `authority_consumption_state_not_found` / `authority_consumption_state_not_found`;
- valid input with matching package linkage: `authority_consumption_state_found` / `authority_consumption_state_found`.

Read control flow: pass. The function validates input, selects a bounded package row into `r`, checks `not found`, returns an explicit not-found row, and otherwise returns one package-level found row. It no longer depends on a bare `RETURN QUERY SELECT ... WHERE ...` that can yield zero rows, nor on a package-to-stage join that can yield multiple rows.

Read privacy and bounds: pass. The read RPC exposes bounded package state/fingerprint fields and null/false stage fields for package-level read results. It does not expose unrestricted audit history, raw repository paths, argv, Git output, process identifiers, credentials, environment values, SQLSTATE, SQLERRM, query text, stack traces, or unrestricted consumer identifiers. It remains read-only, SECURITY DEFINER, fixed-search-path, ungranted, and runtime-unreachable.

## Inventory And Security

Function inventory/signatures: pass. The migration defines exactly ten approved functions, with no overloads, no unexpected functions, and no removed functions. Declaration, `REVOKE`, and `COMMENT` signatures match in the focused suite; registration remains the reviewed 50-parameter signature.

SECURITY DEFINER/search path: pass. Every function remains `language plpgsql`, `security definer`, and `set search_path = pg_catalog, public`. Storage relations are referenced as `public.` qualified relations. No dynamic SQL, caller-selected identifier, `EXECUTE`, or `format()` path was found.

Privileges: pass. Every function has `revoke execute ... from public, anon, authenticated`. No later execute grant to `service_role`, app roles, runtime roles, or browser clients exists. Action 628 added no table grants, RLS policy, trigger, table, or view.

Locking/CAS regression: pass. Non-registration mutations still lock package rows first. Stage operations still lock stage rows after package rows. Aggregate finalization locks stage rows in deterministic `stage_index` order. Expected transition version and state fingerprint checks remain present before mutation. Read changes introduced no mutation or lock.

Result union: pass. Mutation results remain closed and non-leaking, with inert `runtime_activated:false`, `authority:'none'`, and `toctou_eliminated:false`. Rejected results do not return accepted next-state/audit evidence. Exception handlers return deterministic storage rejection rows without SQLSTATE, SQLERRM, constraint names, stack, or query text.

Audit atomicity: pass statically. Successful mutation paths still update package/stage rows and insert exactly one audit event within the same PL/pgSQL function body. Rejected expiry paths and read paths insert no audit event. Static review cannot replace database execution for subtransaction behavior.

SQL NULL/UNKNOWN safety: pass statically. Storage `expires_at` is `not null`; operation timestamps are `timestamptz` inputs evaluated after row lookup. If a nullable input or constraint issue reaches storage execution unexpectedly, exception handlers fail closed as storage rejection. Static SQL execution remains unverified.

## Test Quality

Focused test quality: pass for static approval. The 45-test suite extracts executable function bodies, strips comments and string literals for dynamic/prohibited-operation checks where appropriate, verifies exact function inventory, signature alignment, SECURITY DEFINER/search-path posture, privilege revocation, no broad grants, registration identity, stage ordering, closed outcomes, expiry-gate ordering, bounded read output, SHA-256 grammar, audit presence, reachability, and prohibited-operation posture.

The Action 628 tests materially fail if the remediated expiry checks are absent or placed after mutation/audit fragments, or if the read function falls back to zero-row not-found behavior.

## Static-Only Limitation

Database execution was not performed. `psql` was unavailable in the active shell, and no repository-local disposable database harness was identified. A global `supabase` CLI exists, but Action 629 did not start or connect to a local or remote database.

Still unverified until Action 630:

- SQL parser acceptance by Postgres;
- actual function creation;
- PL/pgSQL declaration and return-shape matching;
- real `FOUND` behavior;
- SECURITY DEFINER ownership;
- real privilege revocation;
- exception/subtransaction behavior;
- row-lock behavior;
- concurrent CAS behavior;
- actual constraint interaction.

This limitation is acceptable for this final static review gate because Action 629 approves only retaining the dormant, ungranted migration text pending a separately reviewed disposable local database validation gate.

## Regression Review

Prior function regression: pass. Action 628 did not weaken registration, claim, stage consumption, completion outcome/reason closure, detached stage-3 handling, failure prerequisites, ambiguity prerequisites, terminalize-expiry, aggregate six-stage validation, audit linkage, error non-leakage, or SQL-injection posture.

Storage/contract regression: pass. Action 628 did not modify the storage migration, storage RLS or privileges, storage CHECK constraints, pure transition contract, authority-package contract, six-stage sequence, 30-second expiry policy, or no-retry/fallback posture.

Runtime reachability: pass. Static search found no app/API/UI/worker/cron/CLI caller, TypeScript storage adapter, Supabase RPC invocation, runner, runtime registration, runtime authority consumption, Git execution, process/repository access, credential/environment/network access, Avanza/trading, staging, or deployment behavior. References remain limited to migrations, tests, and documentation.

Prohibited-operation result: pass. The executable migration has no dynamic SQL, network, process, credential, Git execution, runtime, runner, trigger, policy, or grant path. Static scan matches were limited to revoke statements and inert comment/test/doc strings.

Migration limitation: unchanged and unrelated. `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql` remains missing; its static test fails with `ENOENT` before test discovery. Actions 626-629 did not create or modify it.

## Validation

- `./node_modules/.bin/tsc --noEmit`: passed.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts --reporter=dot`: first sandbox attempt failed with Playwright `.last-run.json` `EPERM`; minimum-permission rerun passed, 45 tests.
- `npx playwright test tests/e2e/post-trade-git-runner-authority-consumption-storage-migration.spec.ts --reporter=dot`: passed, 31 tests.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-authority-consumption-transition-contract.spec.ts --reporter=dot`: passed, 77 tests.
- `npx playwright test tests/e2e/post-trade-pure-dormant-git-runner-authority-package-contract.spec.ts --reporter=dot`: passed, 155 tests.
- Direct-spawn/revalidation/resolver group: passed, 913 tests.
- Compatibility/parser/orchestrator/observation group: passed, 451 tests.
- Broad dormant/process/credential/CLI/authorization group excluding the known missing migration blocker: passed, 804 tests.
- Action 533 cross-boundary suite: passed, 181 tests.
- Known missing authorization-consumption migration-static suite: failed with `ENOENT` before tests were found; unrelated.
- `./node_modules/.bin/eslint tests/e2e/post-trade-git-runner-authority-consumption-rpc-migration.spec.ts`: passed.
- `git diff --check`: passed.
- quiet `.env.local` diff guard: passed.
- `find docs -type f -size 0`: passed.
- Static review gates 13-35: passed.
- Migration baseline limitation check: unrelated missing migration confirmed.

## Non-Authorizations

Final static approval does not authorize:

- application database calls;
- runtime package registration;
- runtime authority consumption;
- a TypeScript server adapter;
- Git execution;
- process or repository access;
- runner/API/UI activation;
- credentials, environment, or network;
- Avanza/trading;
- staging;
- deployment.

It also does not mean the migration has been database-executed, runtime-ready, application-integrated, live replay-safe, repository-inspection-ready, Git-compatible, staging-ready, execution-ready, observer-ready, credential-ready, deployment-ready, or production-ready.

## Commit And Deploy

No deploy is recommended for Action 629.

Do not commit until the complete diff has been manually inspected.
