# Action 630 - Local Database Validation Plan

Decision: `post_trade_git_runner_authority_consumption_local_database_validation_plan_ready`

Result status: `post_trade_git_runner_authority_consumption_action_630_planning_gate_completed`

Recommended next Action: Action 631 - Implement Disposable Postgres Validation Harness for Git Runner Authority Consumption Migrations

## Approved Static Baseline

Action 629 approved the committed Action 626-629 transactional RPC migration package for static retention only. The approved baseline includes:

- Action 622-625 storage migration: `supabase/migrations/20260720000000_create_git_runner_authority_consumption_storage.sql`
- Action 626-629 RPC migration: `supabase/migrations/20260720001000_create_git_runner_authority_consumption_rpcs.sql`
- Action 615-620 pure authority-consumption transition contract
- Action 607-612 pure dormant Git runner authority-package contract
- Action 621 database and RPC architecture

Static approval does not mean either migration has been applied to Postgres.

## Remaining Database-Execution Gap

The following remain unverified until a disposable local database validation gate executes:

- SQL parser acceptance;
- table, constraint, index, RLS, function, comment, and revoke creation;
- PL/pgSQL variable and return-query behavior;
- catalog signatures and function ACLs;
- storage constraints under SQL three-valued logic;
- SECURITY DEFINER behavior and fixed search path at runtime;
- row-lock behavior;
- CAS behavior under concurrent sessions;
- mutation and audit rollback atomicity;
- exact read-result row counts;
- privilege denial for `PUBLIC`, `anon`, and `authenticated`.

## Tooling Discovery

Discovery used only safe path/version/config inspection. No database service was started and no database connection occurred.

| Tool/config | Result | Notes |
| --- | --- | --- |
| `supabase` | `/opt/homebrew/bin/supabase`, version `2.107.0` | Direct version command attempted to write telemetry under `~/.supabase`; version was safely obtained with disposable `HOME=/private/tmp/action630-supabase-home`. Global, not repository-local. |
| `docker` | `/usr/local/bin/docker`, version `29.6.1`, build `8900f1d` | CLI exists. Daemon availability was not checked because daemon-status commands are out of scope for Action 630. |
| `podman` | not found | No fallback container runtime discovered. |
| `psql` | not found | No host `psql` client discovered. |
| `pg_isready` | not found | No host readiness client discovered. |
| `supabase/config.toml` | absent | Repository has migrations but no local Supabase config file. |
| package scripts | no database scripts | Scripts are Next.js, Playwright, lint, and unrelated local bridge/mock agent scripts. |
| Compose/Dockerfile | none found | No repository container harness exists. |
| database driver dependency | none found | No `pg`, `postgres`, `slonik`, `knex`, or `kysely` package found in `package-lock.json`. |

## Harness Comparison

Option A, Supabase CLI local stack: realistic Supabase roles and local migration semantics, but requires Docker, no repository `supabase/config.toml` exists, the global CLI writes telemetry unless isolated, and repository-wide migration replay is blocked by the known missing historical migration.

Option B, disposable plain Postgres container: smallest exact-control harness. It can apply only the storage and RPC migrations, bootstrap `anon` and `authenticated`, avoid Supabase project links, and isolate lifecycle/ports. It requires confirmed container-daemon access and either in-container `psql` or a test-only local database client strategy.

Option C, temporary Postgres process from repository-local binaries: not viable because no repository-local Postgres binaries, `psql`, or `pg_isready` were found.

Option D, static-only continuation: insufficient because the database-execution gap remains.

## Selected Harness And Fallback

Preferred harness architecture: disposable plain Postgres container with exact migration control.

Fallback architecture: Supabase CLI local stack only if a future prerequisite check proves it can run with isolated HOME/config, disabled remote linkage, no repository-wide migration replay, and manual application of only the two reviewed migrations.

Selected next Action: Action 631 - Implement Disposable Postgres Validation Harness for Git Runner Authority Consumption Migrations.

Reason: Docker CLI availability and the preferred disposable plain Postgres harness architecture are documented. Action 631 must still perform a fail-closed local runtime preflight before starting any container, including daemon availability, image strategy, explicit local port isolation, environment neutralization, and SQL execution mechanism checks. If those checks cannot prove a disposable no-remote harness, Action 631 must stop.

## Remote-Exclusion Model

The future executable validation must fail closed unless all of these are true:

- database host is explicit loopback or a container-private connection created by the harness;
- database port is selected by the harness and not inherited from environment;
- no `DATABASE_URL`, Supabase URL, service-role token, anon key, project ref, or linked-project config is inherited;
- `HOME`, Supabase config, Docker labels, and temp directories are harness-owned and disposable;
- no `.env*` file is read;
- no `supabase db push`, `supabase migration repair`, `supabase link`, project-listing, or remote command is used;
- no localhost database that pre-exists the harness is accepted;
- network-dependent lookup is prohibited.

Environment neutralization should clear database-related variables by name without reading or logging their values.

## Missing-Migration Handling

The unrelated missing migration remains:

- `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`

A repository-wide `supabase db reset` or full migration replay may fail. The future validation must not create, repair, or skip this migration in place.

Safe approach: create a disposable validation context outside tracked source or under ignored `/tmp`, bootstrap roles/extensions, and apply only:

1. `20260720000000_create_git_runner_authority_consumption_storage.sql`
2. `20260720001000_create_git_runner_authority_consumption_rpcs.sql`

Rejected approach: migration repair or history manipulation.

## Database Version And Extensions

The storage migration uses `gen_random_uuid()`, so the harness must provide `pgcrypto` or a Postgres/Supabase-compatible UUID generation path before applying the storage migration. The future gate must record the exact Postgres version from the disposable database and must not alter tracked migrations to fit an arbitrary version.

No unapproved extension should be enabled. Required extension setup should be part of disposable bootstrap SQL and torn down with the database.

## Role Bootstrap

The disposable database must create local-only roles before applying migrations:

- `anon`
- `authenticated`
- optional `service_role` only for absence-of-grant inspection
- migration owner
- unprivileged test role

Roles should have no passwords and no login unless needed for an explicit local `SET ROLE` or connection test. They must exist only inside the disposable database and must not reuse Supabase credentials.

## Migration Application Plan

Future execution order:

1. create fresh disposable database or container;
2. create required local roles and extension prerequisites;
3. apply storage migration with `ON_ERROR_STOP`;
4. verify storage schema objects;
5. apply RPC migration with `ON_ERROR_STOP`;
6. verify functions, signatures, comments, ACLs, SECURITY DEFINER, and search path;
7. run storage, privilege, RPC, expiry, concurrency, rollback, read, and privacy tests;
8. destroy database/container/temp files with a trap.

No other repository migration should be applied unless separately justified.

## SQL And Catalog Validation

Catalog assertions must prove:

- three storage tables exist;
- all constraints and indexes exist;
- RLS is enabled;
- exactly ten RPC functions exist;
- registration has exactly 50 parameters;
- function parameter types match declarations, comments, and revoke statements;
- no overload exists;
- fixed search path is stored;
- SECURITY DEFINER is set;
- execute ACLs contain no client/public grant;
- comments exist and resolve.

## Storage Constraint Tests

Minimum executable cases:

- canonical issued package accepted;
- exact identities and 30-second expiry enforced;
- invalid fingerprints rejected;
- invalid terminal state/reason/count/flag combinations rejected;
- SQL NULL/UNKNOWN bypass attempts rejected;
- package identity/fingerprint/consumption-key uniqueness conflicts rejected;
- six exact stage identities accepted;
- invalid stage index/identity combinations rejected;
- consumed/completed/detached status constraints enforced;
- audit fingerprint, operation/reason, event sequence, runtime false, authority none, and TOCTOU false enforced.

Invalid cases must use transactions/savepoints so the test database remains usable.

## Privilege And RLS Tests

Minimum executable cases:

- `anon` cannot `SELECT`, `INSERT`, `UPDATE`, or `DELETE` storage tables;
- `authenticated` cannot `SELECT`, `INSERT`, `UPDATE`, or `DELETE` storage tables;
- `PUBLIC` has no direct table privilege;
- `anon`, `authenticated`, and `PUBLIC` cannot execute any RPC;
- read RPC is inaccessible to client roles;
- no permissive RLS policy exists;
- migration-owner behavior is not described as client behavior.

Use `SET ROLE` only inside the disposable database and reset it after each case.

## RPC Integration Tests

Minimum executable cases:

- canonical registration creates one package row, six stage rows, and one audit row atomically;
- duplicate/same-ID/same-fingerprint/consumption-key conflicts leave no partial rows;
- canonical claim succeeds;
- second claimant, stale version, stale fingerprint, and wrong consumer reject;
- stage 0 consumption succeeds;
- duplicate and out-of-order stage consumption reject;
- completion before consumption rejects;
- accepted completion advances state;
- all six stages complete in order;
- stage 3 detached accepted observation is accepted only at stage 3;
- aggregate finalization succeeds only after six accepted completions.

## Expiry Matrix

For every mutation RPC, run timestamps:

- one millisecond before `expires_at`;
- exactly `expires_at`;
- one millisecond after `expires_at`.

Expected result:

- all non-expiry mutation RPCs permit only the pre-expiry case, subject to other predicates;
- `terminalize_git_runner_authority_expiry` permits only at or after expiry;
- expiry rejection produces no mutation and no audit insertion;
- expiry wins over completion, failure, ambiguity, and revocation at the exact boundary.

Use explicit fixture timestamps; do not sleep.

## Failure, Ambiguity, Revocation, And Aggregate

Minimum executable cases:

- rejected completion and process-failed completion terminalize to failed state;
- explicit failure RPC requires at least one consumed stage;
- untouched issued package cannot be failed;
- ambiguous completion terminalizes to ambiguous state;
- explicit ambiguous-failure RPC requires consumed uncompleted process-request linkage;
- completion-already-recorded rejects;
- revoked state is terminal pre-expiry only;
- no retry, reopening, fallback, or later stage progression occurs after terminal states.

## Concurrency And CAS

The future harness needs two-session support for:

- simultaneous consumer claims;
- simultaneous same-stage consumption;
- stale transition after another session commits;
- duplicate aggregate finalization;
- revocation versus expiry;
- stage consumption versus expiry;
- completion versus expiry;
- failure versus expiry.

Expected result: exactly one winner, deterministic loser rejection, one transition-version increment, one audit insertion, no duplicate stage consumption, no partial writes, and no deadlock under expected package-first lock order.

## Rollback And Audit Atomicity

Plan controlled local-only failure cases using temporary validation constraints, transactional privilege changes, or another reviewed disposable mechanism outside tracked migrations.

The gate must prove:

- no package/stage mutation commits without audit;
- no audit commits without package/stage mutation;
- unknown errors do not return accepted-looking results;
- caught exception semantics do not preserve partial writes.

## Read And Error-Leakage Tests

Read RPC must return exactly one row for malformed input, valid not-found input, and valid found input. Verify exact status/reason, bounded fields, inert posture, no audit mutation, no zero-row behavior, and no multi-row behavior.

Error-leakage tests should cover uniqueness conflict, stale CAS, wrong consumer, wrong stage, malformed fingerprint, invalid outcome/reason, and one safe unexpected local database failure. Results must not expose SQLSTATE, SQLERRM, constraint names, table/function names, query text, or stack details.

## Fixture Strategy

Generate canonical happy-path fixture values from final-approved pure authority-package and pure transition builders where practical. Serialize only the bounded scalar values accepted by the RPCs. Negative fixtures should mutate one field at a time.

Do not add production exports, runtime test hooks, credentials, or manually contradictory happy-path identities.

## Test Implementation Approach

Preferred future approach: Playwright/Node orchestration that invokes a disposable plain Postgres container and executes SQL through in-container `psql` or a separately approved test-only client. Keep production dependencies unchanged.

Test files/scripts should be introduced only in the future Action after the harness prerequisite is resolved, for example:

- `tests/e2e/post-trade-git-runner-authority-consumption-local-db-validation.spec.ts`
- `scripts/action-631-git-runner-authority-consumption-local-db-harness.mjs`

No production dependency should be added solely for validation unless separately reviewed.

## Cleanup Model

Future implementation must use a unique Action-scoped container name, volume name, database name, role names, temp directory, and label. Cleanup must run after success or failure and remove only those exact harness-owned resources.

Required cleanup:

- stop/remove disposable container;
- remove temporary volume;
- remove temporary database files;
- remove temporary migration directory;
- release selected port;
- leave repository files unchanged except reviewed test/docs additions.

## Evidence Package

Retain:

- tool paths and versions;
- selected harness and fallback;
- Postgres version;
- migration application result;
- catalog object counts;
- function signature inventory;
- RLS/ACL verdicts;
- constraint/RPC/concurrency/rollback/read test totals;
- cleanup result;
- no-remote proof.

Do not retain credentials, URLs containing secrets, tokens, raw environment, full database dumps, or sensitive process listings.

## Test Matrix

Minimum future groups:

| Group | Minimum cases |
| --- | ---: |
| Harness isolation | 6 |
| Migration parse/application | 4 |
| Catalog inventory | 8 |
| Storage constraints | 24 |
| Identity/version checks | 8 |
| RLS/table privileges | 12 |
| Function signatures | 10 |
| Function execute privileges | 10 |
| Registration | 6 |
| Claim | 5 |
| Stage consumption | 8 |
| Completion | 8 |
| Failure/ambiguity | 8 |
| Expiry/revocation | 18 |
| Aggregate | 5 |
| Read RPC | 6 |
| Error leakage | 8 |
| Audit atomicity | 6 |
| CAS | 6 |
| Concurrency | 8 |
| Cleanup | 5 |
| No-remote proof | 8 |

These are minimum cases, not final pass counts.

## Future Gates

1. Harness static review.
2. Remote-exclusion review.
3. Migration-application review.
4. Catalog/signature review.
5. Constraint execution review.
6. RLS/ACL execution review.
7. RPC integration review.
8. Expiry matrix review.
9. Error-leakage review.
10. Audit rollback review.
11. Concurrency/CAS review.
12. Cleanup review.
13. Independent database-validation review.
14. Remediation and final re-review.
15. Server-only storage-adapter planning.
16. Server-only storage-adapter implementation.
17. Adapter static security review.
18. Dormant runner integration.
19. Staging-only trial.
20. Runtime activation approval.
21. Deployment approval.

## Completed Validation

Action 630R completed the previously blocked non-database validation under the explicitly approved test scope. Each Playwright group was first started without escalation. The groups that failed did so only because Playwright could not write `test-results/.last-run.json`; each exact command was rerun with the minimum filesystem permission needed for reporter output.

- Direct-spawn, executable-revalidation, executable-resolution, and resolver security group: passed, 913 tests.
- Compatibility, parser, orchestrator, and observation group: passed, 451 tests.
- Broad dormant/process/credential/CLI/authorization group excluding the known missing migration-static blocker: passed, 804 tests.
- Action 533 cross-boundary integration suite: passed, 181 tests.

No database, container, network, credential, SQL, migration application, runtime/API/UI/runner, Git execution, product process creation, product process observation, or product repository inspection occurred during Action 630R validation.

## Non-Authorizations

Action 630 did not start a database, connect to a database, apply migrations, execute SQL against Postgres, register a package, consume authority, execute Git, access product process/repository behavior, activate runtime/API/UI/runner paths, read credentials, access network, add Avanza/trading/staging/deployment behavior, or implement retries/fallback/cache/reissue/reconciliation/reset behavior.

## Commit And Deploy

No deploy is recommended for Action 630.

Do not commit until the complete diff has been manually inspected.
