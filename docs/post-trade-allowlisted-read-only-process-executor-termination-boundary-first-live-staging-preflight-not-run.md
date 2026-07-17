# Post-Trade Allowlisted Read-Only Process Executor And Termination Boundary - Not Run

Action 519 implemented a source-controlled process-executor and termination boundary for a future first live read-only staging preflight. It did not run Git, Supabase, shell, version, catalog, SQL, migration, deployment, credential, or remote commands.

## Purpose

The boundary models how a future reviewed runner may execute exact read-only Git and Supabase observations for `ture-staging / pdvzyuhykomwfqyyztru`. It remains inert and fixture-driven until a separate live-driver approval exists.

## Architecture

- Pure core: `lib/post-trade-first-live-read-only-preflight-process-executor-core.ts`
- Server-only facade: `lib/post-trade-first-live-read-only-preflight-process-executor.ts`
- Tests: `tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts`

The default state is `not_run` with zero processes started, completed, terminated, commands executed, SQL, migrations, rows, deployment, remote mutation, and Git mutation.

## Injected Driver

The driver contract is narrow and fixture-only. It supports exact process request start/status/termination/containment/disposal methods, but exposes no generic `exec`, `spawn`, shell strings, arbitrary executable, arbitrary args, arbitrary environment, raw process object, detached process control, unrestricted signal dispatch, arbitrary PID access, or raw output logging.

There is no default live driver.

## Registries

The executable registry contains only reviewed `git_cli` and `supabase_cli` identities and stores no executable paths. It prohibits aliases, wrappers, shell functions, script proxies, unresolved symlinks, caller-selected paths, production wrappers, shell, and detached execution.

The operation registry binds the reviewed process-based runner operations:

- Git repository root, commit, branch, porcelain status, staged files, unstaged files, and untracked files
- Supabase linked project and migration history
- Supabase CLI version observation for later separate authorization

Catalog adapter operations are not included in the process registry.

## Request And Argument Security

Process requests are deterministic derivations from the operation registry. They include exact operation, exact ordered args, session, authorization, parser, working-directory policy, environment policy, timeout policy, output-limit policy, closed stdin, disabled TTY, disabled shell, detached false, read-only true, no retry, and deterministic fingerprint.

Argument validation rejects altered, reordered, missing, extra, duplicate, empty, padded, shell-metacharacter, command-substitution, interpolation, newline, NUL, Unicode separator, wildcard, glob, home-expansion, traversal, production-ref, alternate-ref, token-like, password-like, credential-URL, arbitrary revision, arbitrary pathspec, and arbitrary Supabase flag inputs.

## Working Directory And Environment

The working-directory policy exposes only the reviewed repository-root identity. It stores no personal absolute path and rejects caller-selected absolute paths, traversal, symlink roots, nested unrelated repositories, and production checkout assumptions.

The environment policy starts from an empty environment and models only fixed non-secret behavior: locale identity, no color, pager disabled, editor disabled, prompting disabled, and terminal disabled. Credential injection remains deferred to the opaque credential boundary and is not implemented here.

## Stdin, TTY, Shell

Stdin is closed. TTY, pseudo-TTY, shell, command interpreter, shell expansion, editor, pager, browser opener, and GUI interaction remain disabled.

## Timeout And Output Limits

Timeout policies are fixed per operation: local Git observations use 5 seconds, Supabase metadata observations use 15 seconds, with 750 ms graceful and forced termination grace windows plus a 500 ms containment verification deadline. Caller-raised timeouts are rejected. Timeouts invalidate the session and prohibit retry.

Output limits are fixed per operation: Git stdout is 16 KiB, Supabase stdout is 32 KiB, stderr is 8 KiB. Truncation is prohibited; overflow blocks parser authority, requires raw output disposal, invalidates the session, and prohibits retry.

## Lifecycle And Containment

The lifecycle state machine supports reviewed happy-path and timeout/termination paths only. It rejects terminal-to-running transitions, failed-to-starting, ambiguous-to-completed, timeout-to-second-start, termination-failed-to-retry, overflow-to-completed, prompt-to-parsing, and secret-to-parsing behavior.

The containment contract models macOS process-tree uncertainty explicitly. Parent exit alone is insufficient. Authoritative completion requires parent, direct children, process group, descendants, detached-child, process-group escape, browser child, credential-helper child, daemon, GUI child, and URL opener checks.

## Termination Sequence

The pure termination plan invalidates the session, stops new operations, requests graceful termination, waits, inspects containment, requests forced termination if needed, waits, inspects again, confirms parent and descendants exited, disposes raw output, blocks readiness, and prohibits retry.

## Sanitized Result Evidence

Result evidence contains only sanitized metadata: request, operation, instance, session, executable identity, policy identities, lifecycle terminal state, timestamps, exit/signal classification, timeout and termination flags, containment verification, byte counts, output fingerprints, prompt/secret flags, mutation flag, result classification, and evidence fingerprint.

It contains no raw stdout, raw stderr, PID, executable path, personal path, credentials, command string, or environment value.

## Prompt And Secret Detection

Prompt and secret signals block parser authority and readiness. The model includes login, browser auth, device code, MFA, password, token, confirmation, project-link, migration-confirmation, credential-helper, GUI, and URL-opener prompts. Secret material categories include tokens, service-role keys, anon keys, API keys, passwords, connection strings, authorization headers, bearer tokens, cookies, sessions, private keys, client secrets, Keychain metadata, raw environment, PATH dumps, home paths, BankID material, JWT-like material, and base64-like credential material.

## Compatibility

Pure validators bind the executor to the execution-boundary contract, authorization artifact, runner, CLI-version collector, credential-provider design, staging project, rejected production project, registries, timeout/output policies, working-directory policy, environment policy, stdin/TTY/shell policy, no-retry, one runner invocation, one collection session, and zero deployment/SQL/mutation posture.

## Fingerprints

Deterministic SHA-256 builders cover executable registry, operation registry, process request, timeout registry, output-limit registry, lifecycle policy, containment evidence, termination plan, sanitized process result, driver contract, and compatibility inputs. Fingerprints use stable key ordering, preserve array ordering, exclude raw output, executable paths, environment values, credentials, personal paths, and unnecessary PIDs, and reject cyclic values.

## Remaining Risks

- Live executable resolution is not implemented.
- A real process driver is not implemented.
- macOS process-tree containment still requires a reviewed implementation.
- Termination verification remains modeled, not proven live.
- Credential handoff remains deferred to the opaque provider boundary.
- Supabase CLI exact live compatibility remains unresolved until a future live observation gate.
- TOCTOU risk remains for any future live run and must be handled by the final execution gate.

## Confirmation

No command was run. No process was spawned. No Git or Supabase command was invoked. No shell, version command, catalog query, SQL, migration, deployment, credential access, PATH inspection, executable path resolution, environment read, remote connection, evidence persistence, authorization consumption, API/UI/runtime activation, Avanza/browser automation, settlement retrieval, order behavior, live trade mutation, or live position mutation occurred.

Decision:

`post_trade_allowlisted_read_only_process_executor_termination_boundary_first_live_staging_preflight_ready_for_static_security_review`

Result:

`post_trade_allowlisted_read_only_process_executor_termination_boundary_first_live_staging_preflight_added_not_run`
