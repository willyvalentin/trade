# Post-Trade Allowlisted Read-Only Live Staging Migration Preflight Runner Static Security Review

Action 508 performed a static, command-safety, parser-security, trust-boundary, secret-handling, and adversarial review of the allowlisted read-only live staging migration preflight runner. The runner was not run live, no Git/Supabase evidence was collected, no SQL was executed, and no deployment occurred.

## Files Reviewed

- `lib/post-trade-read-only-live-staging-migration-preflight-runner-core.ts`
- `lib/post-trade-read-only-live-staging-migration-preflight-runner.ts`
- `tests/e2e/post-trade-read-only-live-staging-migration-preflight-runner.spec.ts`
- `docs/post-trade-allowlisted-read-only-live-staging-migration-preflight-runner-not-run-no-deployment.md`
- `lib/post-trade-read-only-live-staging-migration-preflight-contract.ts`
- `lib/post-trade-staging-migration-deployment-readiness-artifact-core.ts`
- `lib/post-trade-staging-migration-deployment-gate-core.ts`
- `supabase/migrations/20260710000000_create_execution_authorization_consumptions.sql`

## Runner Architecture

The reviewed runner remains split between a pure core and a server-only exported boundary. The exported boundary uses `import "server-only"`. The pure core defines exact operation specs, catalog specs, validation, transient parsing, sanitized evidence construction, and final contract evaluation. It does not call Node child-process APIs, does not import Supabase clients, does not call `createClient`, and does not run commands on import or construction.

The default runner result remains inert:

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

## Executor Boundary Findings

The executor boundary accepts only a structured command spec: command family, executable identity, operation identity, ordered args, working-directory identity, timeout, read-only marker, parser identity, output limits, environment policy, and closed stdin policy. There is no command string, shell mode, arbitrary executable path, arbitrary working directory, arbitrary environment map, inherited full environment, interactive TTY flag, or stdin-open mode.

Review hardening added rejection for unknown command spec keys, caller-raised timeouts, caller-raised output limits, parser identity tampering, output-classification tampering, and evidence-category tampering. Executor output cannot self-assert authority, project identity, trusted provenance, or completeness; it must survive runner-side validation and final contract evaluation.

## Git Allowlist Findings

The Git/local allowlist remains exact and observational:

- `git rev-parse --show-toplevel`
- `git rev-parse HEAD`
- `git branch --show-current --no-color`
- `git status --porcelain=v1 --untracked-files=all --no-renames`
- `git diff --cached --name-status --no-ext-diff`
- `git diff --name-status --no-ext-diff`
- `git ls-files --others --exclude-standard`
- internal metadata/read/inventory readers for the reviewed migration only

No spec permits add, commit, reset, clean, checkout, switch, restore, stash, merge, rebase, cherry-pick, revert, push, pull, fetch, clone, init, branch mutation, tag mutation, update-index, apply, gc, maintenance, config mutation, hooks, aliases, pager, editor, external diff tools, arbitrary revisions, or arbitrary pathspecs.

## Supabase Allowlist Findings

The Supabase CLI allowlist remains limited to read-only project/history evidence:

- `supabase status --linked --output json`
- `supabase migration list --linked --output json`

No spec permits `db push`, `migration up`, `migration repair`, `db reset`, `link`, `unlink`, project create/delete, functions deploy/delete, secrets mutation, config mutation, seed, SQL execution, remote diff application, arbitrary flags, production selection, or interactive authentication.

## Catalog Adapter Findings

The catalog adapter boundary is typed and staging-only. It accepts predefined query identities only and rejects raw SQL, caller-provided SQL, arbitrary schemas/tables, mutation, RPC, transaction control, and multiple statements.

Review hardening added rejection for unknown catalog query keys, caller-raised catalog timeouts, unknown catalog result keys, generic success booleans, and missing query-specific observations. Missing catalog observations are not interpreted as absence.

Reviewed query identities cover only:

- target relation absence
- conflicting object absence
- dependency existence
- dependency primary-key type
- UUID-generation capability
- target policy/index/function/trigger absence
- anon/authenticated grants
- schema and ownership baseline
- RLS capability baseline

## Argument Validation Findings

Argument validation is schema-based against exact ordered args and also rejects unsafe tokens. Review hardening added coverage for command strings, shell mode, arbitrary executable paths, unknown operation ids, reordered fixed args, empty args, whitespace-padded args, logical operators, backticks, command substitution, environment interpolation, carriage returns, Unicode separators, wildcards, home expansion, URL args, token-like args, production refs, alternate refs, service-role/password/connection env-like keys, inherited environment, TTY, and stdin-open attempts.

## Environment Policy Findings

The runner only models `minimal_non_secret_no_color_no_pager`; it does not accept an arbitrary environment map and does not pass tokens, service-role keys, database passwords, connection strings, cookies, sessions, BankID material, or arbitrary Git/Supabase configuration. Future authentication needed for live read-only Supabase access remains outside this runner and requires a separately reviewed credential boundary.

## Working-Directory Findings

The runner accepts only the expected repository-root identity. It rejects arbitrary, absolute, traversal, home-expanded, and caller-selected working-directory identities. The final evidence uses redacted repository-root identity; no personal home path is serialized.

## Timeout Findings

Every operation has a fixed timeout and every catalog query has a fixed timeout. Caller-raised timeouts are rejected. Timeout results classify the collection as ambiguous, no automatic retry exists, no partial session is merged, and no deployment recommendation follows timeout. Actual process-tree termination remains an executor implementation responsibility for a future live boundary.

## Output-Limit Findings

Every operation has fixed stdout/stderr byte limits. Caller-raised limits are rejected. Overflow or truncation invalidates authoritative collection and does not turn fingerprints into trusted evidence.

## Raw-Output Findings

Raw stdout/stderr exists only as transient parser input. It is not returned in public evidence, not returned in final runner results, not documented, not persisted, not logged by the runner, and is represented only by fingerprints and parsed structured observations. Tests verify final reports do not expose transient output or reviewed SQL.

## Parser Findings

Parser and result validation now reject malformed single-line output, prompts, rejected production refs, ANSI escapes, warning banners, control characters, PostgreSQL URLs, unsafe paths, quoted ambiguous paths, encoded traversal/separator paths, parser-blocked output, timeout, truncation, and secret-like material. Single-line outputs must be exactly one non-empty line.

Porcelain and name-status parsing remain conservative. Ambiguous rename/copy/conflict/submodule cases require parser-blocked classification and cannot become authoritative success. A future live executor should prefer machine-safe porcelain parsing and can further strengthen toward NUL-delimited parsing before live use.

## Prompt-Detection Findings

Prompt detection covers login required, browser auth, device-code prompts, password prompts, token prompts, confirmation prompts, project-linking prompts, migration prompts, MFA prompts, press-enter prompts, interactive selection text, and authentication URLs. Prompt output is never treated as structured success.

## Secret-Scanning Findings

Secret scanning covers access tokens, refresh tokens, personal access tokens, service-role keys/tokens/secrets, anon keys, database passwords, connection strings, authorization headers, bearer tokens, private keys, client secrets, cookies, sessions, BankID, raw environment dumps, username/home paths, JWT-like material, nested arrays, nested objects, alternate casing, separators, hyphens, underscores, and spaces. Detected values are not printed or persisted.

## Evidence-Construction Findings

Evidence construction uses a single collection session and recomputes structured fingerprints for worktree, migration inventory, project, target, history, catalog, and privilege observations. Evidence is authoritative only after spec validation, executor result validation, parsing, and final Action 506 contract evaluation. Raw output, secrets, personal paths, and unsupported nested values are excluded from final evidence.

## Orchestration Findings

The runner executes the planned collection sequence only through injected dependencies. Mandatory failures stop readiness. Production project evidence blocks before readiness. There is no majority-vote readiness, no best-effort deployment classification, no retry, no repair/reset recommendation, and no ability to enable deployment from runner output.

## Dependency-Boundary Findings

The runner core does not import child-process APIs, shell libraries, Supabase/database clients, filesystem write APIs, Git mutation libraries, deployment modules, execution adapters, API routes, or UI/client code. The server-only boundary has no default executor and performs no module-load execution. Static tests confirm the runner is not imported by the post-trade API validation route or Trade UI.

## Tests Added Or Strengthened

The runner suite was expanded from 94 to 158 tests. Added coverage includes:

- command strings, shell mode, arbitrary executable paths, operation-id tampering, fixed-arg reordering, empty/padded args, logical operators, backticks, environment interpolation, carriage returns, Unicode separators, wildcards, home expansion, URL args, and token-like args
- arbitrary env keys, service-role/password/connection env-like keys, inherited environment, stdin-open, TTY, timeout/output-limit/parser/category tampering
- additional Git mutation commands and Supabase arbitrary flag rejection
- raw SQL/caller SQL/schema/table/RPC/transaction/multi-statement/catalog-timeout/catalog-result key rejection
- ANSI escape, warning banner, conflict/rename/copy/delete/submodule ambiguity, quoted path, encoded traversal, malformed migration filename
- missing/generic project evidence, device-code/MFA/press-enter/login-URL prompts
- bearer token, client secret, JWT-like material
- generic catalog success boolean and missing target-absence observation

## Changes Made During Review

- Hardened command spec validation against unknown keys and caller-controlled execution shape.
- Hardened timeout, output-limit, parser identity, output classification, and evidence-category validation.
- Hardened catalog query/result validation against unknown keys, generic success, and missing query-specific observations.
- Broadened dangerous argument detection, prompt detection, unsafe output detection, path validation, and secret scanning.
- Expanded adversarial fixture tests.

## Remaining Risks

- Credential-boundary gap: live read-only Supabase access may require authentication, and credential handling is not implemented here.
- Process-termination gap: the pure runner requires authoritative timeout/termination classification, but actual process-tree cancellation belongs to a future executor.
- CLI-version compatibility risk: Supabase/Git output format drift can invalidate parser assumptions.
- TOCTOU risk: read-only evidence can become stale before any future deployment action.
- Porcelain ambiguity risk: newline-delimited path parsing is conservative for static tests; a future live executor should prefer machine-safe output and parser proof before use.

## Final Review Decision

The runner is ready for a separate source-controlled authorization artifact for its first live read-only execution. That future action may authorize a live read-only preflight run only; it must not authorize deployment, SQL execution, schema mutation, persistence, production access, API/UI/runtime activation, Avanza/browser automation, or credential exposure.

## Confirmed Non-Events

No live runner execution, Git evidence command, Supabase command, shell evidence command, SQL execution, staging connection, production connection, live remote inspection, migration deployment, Git mutation, schema mutation, data mutation, evidence persistence, readiness artifact consumption, API/UI/runtime wiring, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

Decision:

`post_trade_allowlisted_read_only_live_staging_migration_preflight_runner_static_security_review_ready_for_first_live_read_only_authorization_artifact`

Result:

`post_trade_allowlisted_read_only_live_staging_migration_preflight_runner_static_security_review_completed_not_run_no_deployment`
