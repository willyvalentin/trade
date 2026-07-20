# Post-Trade Allowlisted Read-Only Process Executor And Termination Boundary Static/Security Review - Not Run

Action 520 performed a static and security review of the Action 519 allowlisted read-only process executor and termination boundary. No live process, Git command, Supabase command, shell, version command, catalog query, SQL, migration, deployment, credential access, remote connection, evidence persistence, authorization consumption, API/UI/runtime wiring, Avanza/browser automation, settlement retrieval, order behavior, live trade mutation, or live position mutation occurred.

## Files Reviewed

- `lib/post-trade-first-live-read-only-preflight-process-executor-core.ts`
- `lib/post-trade-first-live-read-only-preflight-process-executor.ts`
- `tests/e2e/post-trade-first-live-read-only-preflight-process-executor.spec.ts`
- `docs/post-trade-allowlisted-read-only-process-executor-termination-boundary-first-live-staging-preflight-not-run.md`
- Reviewed dependencies from the execution-boundary contract, first-live authorization artifact, read-only runner, CLI-version collector, opaque credential boundary, and credential-provider design.

## Architecture Finding

The boundary is deterministic, source-controlled, pure in its core, server-only at the exported facade, fixture-driver based, and side-effect free until an injected fake driver is explicitly called by tests. Import, construction, validation, planning, compatibility checks, and fingerprint builders do not start processes, inspect PATH, read environment values, resolve executable paths, access credentials, persist evidence, consume authorization, deploy, or mutate state.

The implementation remains staging-only for `pdvzyuhykomwfqyyztru` and explicitly rejects the production project `ekdyopdrrkphlrsilyoo`.

## Structural Versus Live Finding

A valid process policy, registry, request, fixture result, or fingerprint is only structural evidence. It does not prove that a binary exists, that an executable path is safe, that a process has run, that containment is authoritative, that descendants were terminated, that a CLI is trusted, or that a command was read-only in practice.

The fake-driver evidence remains non-live by design: `liveCommandsExecuted` is always `0`, `observedLive` is `false`, and the executor cannot treat fixture evidence as live preflight evidence.

## Driver Interface Finding

The injected driver contract is narrow and reviewed. It exposes exact request/status/termination/containment/disposal methods only. It exposes no generic exec, spawn, shell string, arbitrary executable, arbitrary args, arbitrary cwd, arbitrary environment, stdin, TTY, raw process object, unrestricted signal API, arbitrary PID access, global process listing, detached-process control, or raw-output logging.

Review hardening added explicit source-controlled fields that reject global process listing and generic containment or termination assertions. There remains no default live driver.

## Executable Registry Finding

The registry contains only `git_cli` and `supabase_cli` component identities with exact expected basenames, no executable paths, no PATH resolution, and explicit rejection of aliases, wrappers, shell functions, script proxies, unresolved symlinks, caller-selected paths, production wrappers, shell, and detached execution.

Count agreement without identity agreement fails. Alias, prefix/suffix/case variants, unknown executables, missing executables, duplicate identities, generic verification, wrappers, and path exposure are rejected.

## Operation Registry Finding

The operation registry binds exact operation IDs, exact executable identities, exact ordered argument arrays, parser identities, timeout/output/workdir/environment policies, closed stdin, disabled TTY, disabled shell, read-only classification, network classification, credential requirement, child-process expectation, and output classification.

The registry includes the reviewed Git and Supabase metadata operations plus the separately authorized Supabase CLI-version observation. Catalog-adapter, deployment, mutation, production, credential-resolution, wildcard, prefix-matched, and arbitrary operations remain excluded.

## Argument Finding

Requests are derived from the registry and validated by exact object identity plus exact ordered argument arrays. Missing, extra, reordered, duplicate, empty, padded, shell-metacharacter, command-substitution, interpolation, newline, carriage return, NUL, Unicode separator, control-character, wildcard, glob, home-expansion, traversal, production-ref, credential-URL, token-like, password-like, arbitrary revision, pathspec, flag, config, pager/editor, external-diff, and hook/helper-style bypasses are rejected.

The implementation does not accept command strings.

## Working Directory Finding

The request uses only the sanitized `ture_trade_repository_root` identity. It does not expose or accept personal absolute paths, home paths, usernames, arbitrary cwd, symlink roots, nested unrelated repositories, traversal, production checkouts, or caller-selected repository roots.

Future live implementation must verify the repository root before dependent operations. A caller-supplied `repositoryVerified: true` remains insufficient.

## Environment Finding

The environment policy starts from an empty environment and models only fixed non-secret behavior: locale identity, no color, pager disabled, editor disabled, prompting disabled, and terminal disabled. It does not inherit PATH, HOME, USER, shell config, Git config, Supabase config, service-role keys, passwords, connection strings, cookies, sessions, BankID material, or raw environment values.

Credential injection remains unimplemented and dependent on the separately reviewed opaque credential handoff.

## Stdin, TTY, Shell, Detached Finding

All requests require closed stdin, no inherited stdin, no pseudo-TTY, no TTY, no shell, no command interpreter, no detached process, no editor, no pager, no browser opener, and no GUI. Any deviation blocks before any future process start.

## Timeout And Output Finding

Timeouts are short, fixed, operation-specific, caller-immutable, no-retry, and session-invalidating: 5 seconds for local Git observations, 15 seconds for Supabase metadata observations, 750 ms graceful and forced termination windows, and a 500 ms containment verification deadline. These values are provisional until a live driver is designed and reviewed.

Output limits are fixed per operation: 16 KiB stdout for Git, 32 KiB stdout for Supabase, and 8 KiB stderr. Caller-raised limits, truncation, overflow-authoritative parsing, parser-after-overflow, and retry are rejected. Raw output must be disposed.

## Lifecycle Finding

The lifecycle state machine supports only reviewed start, run, completed, failed, timeout, termination, containment-verification, terminated, termination-failed, and ambiguous transitions. Terminal-to-running, completed-to-starting/running, terminated-to-starting, failed-to-starting, ambiguous-to-completed, timed-out-to-second-start, termination-failed-to-retry, overflow-to-completed, prompt-to-parsing, secret-to-parsing, mutation-to-completed, child-unknown-to-completed, and timeout-without-containment paths are rejected.

`timed_out` is treated as a blocked transitional state toward termination and containment verification, not as authority to parse or continue.

## Containment And macOS Finding

Containment evidence distinguishes parent state, direct child state, process-group state, descendants, detached children, process-group escapes, browser children, credential helpers, daemons, GUI children, URL openers, observation source, completeness, authoritativeness, boundary session, and freshness.

Parent-only termination is insufficient. Direct-child-only evidence is insufficient when process-group or descendant state is unknown. Unknown descendants, detached descendants, process-group escape, browser/credential-helper/daemon/GUI/URL-opener children, non-authoritative evidence, stale evidence, and mixed boundary sessions are rejected.

The macOS model does not claim that `detached: false` guarantees containment, that parent kill guarantees descendants exit, that process groups always contain all descendants, or that CLIs cannot spawn helpers. A future live driver must provide macOS-specific process-tree evidence.

## Termination Finding

The termination plan remains pure and inert. It models: invalidate session, stop future operations, graceful termination request, bounded wait, containment observation, forced termination if needed, bounded wait, containment re-observation, parent and descendant exit confirmation, raw output disposal, blocked classification, and no retry.

It contains no executable action, process callback, signal dispatch, SQL, deployment, or persistence path.

## Process Result Finding

Sanitized result evidence contains only policy and classification metadata. It contains no raw stdout, raw stderr, executable path, PID, personal path, environment value, credential, command string, SQL, or deployment material.

Review hardening tightened completed-read-only classification so containment must be explicitly `contained`, and completed results with termination requested are rejected. Zero exit alone never authorizes evidence.

Timeout, prompt, secret, overflow, truncation, mutation, unexpected-child, and ambiguous cases remain blocked from parser authority.

## Prompt And Secret Finding

Prompt classifications cover login, browser auth, device code, MFA, password, token, confirmation, project link, migration confirmation, credential helper, GUI launch, URL opener, interactive selection, and press Enter. Unknown prompt classifications are rejected.

Secret scanning covers access tokens, refresh tokens, service-role and anon keys, API keys, passwords, connection strings, PostgreSQL URLs, authorization headers, bearer tokens, cookies, sessions, private keys, client secrets, Keychain metadata, raw environment, PATH dumps, personal paths, BankID, and JWT-like material. Short legitimate Git hashes and version strings are not treated as secrets by themselves.

Sensitive unknown fixture field names are rejected without printing values.

## Fingerprint Finding

SHA-256 builders remain deterministic with stable key ordering and array-order binding. Exact lowercase 64-character hashes are required. Prefix, partial, malformed, changed-field, unsupported nested, and cyclic inputs fail. Fingerprints do not include raw output, executable paths, environment values, credentials, personal paths, or unnecessary PIDs.

## Compatibility Finding

Compatibility validators preserve the execution-boundary contract, authorization artifact, runner, CLI-version collector, opaque credential boundary, credential-provider design, process-executor identity, registries, timeout/output policies, lifecycle, containment, workdir, environment, stdin/TTY/shell prohibitions, one runner invocation, one collection session, no retry, staging-only target, zero deployment, zero SQL, and zero mutation.

They do not invoke the driver, inspect PATH, resolve executables, read environment values, access credentials, create processes, produce live evidence, enable the runner, persist state, or consume authorization.

## Dependency Boundary Finding

The core does not import `child_process`, shell libraries, process-tree libraries, PATH resolvers, environment readers, Git execution libraries, Supabase clients, database clients, credential-provider implementations, API routes, UI/client code, Avanza modules, or browser automation modules.

The exported boundary imports `server-only`.

## Tests Added Or Strengthened

The focused process-executor suite was strengthened for:

- global process listing and generic containment/termination driver-claim rejection
- known prompt taxonomy and unknown prompt rejection
- timeout missing termination evidence rejection
- completed-with-termination-request rejection
- sensitive unknown fixture field-name rejection
- completed-read-only containment tightening

Existing adversarial coverage continues to cover registries, arguments, workdir, environment, timeout, output limits, lifecycle, containment, termination, fake-driver invocation, fingerprints, compatibility, and API/UI unwired state.

## Changes Made During Review

- Hardened `ProcessDriverContract` with explicit `globalProcessListingExposed`, `genericContainmentAssertionAccepted`, and `genericTerminationAssertionAccepted` false fields.
- Hardened fixture validation for sensitive unknown fields, unknown prompt labels, timeout termination evidence, and completed results with termination requested.
- Hardened completed-read-only classification to require contained containment evidence.
- Hardened sanitized result validation for completed lifecycle and no termination request.
- Expanded tests for the new review findings.

## Remaining Risks And Gaps

- Real executable resolver gap: no live path, basename, symlink, wrapper, alias, or shell-function verification exists yet.
- Live process-driver gap: no real process execution implementation exists.
- macOS containment gap: actual process-tree observation, descendants, process groups, helper processes, and detached-child detection remain unimplemented.
- Process-tree verification gap: structural containment evidence is not live containment proof.
- Credential-handoff dependency: opaque staging credentials are still deferred to future provider implementation.
- Exact Supabase version gap: exact live Supabase CLI compatibility still requires a future version observation gate.
- TOCTOU risk: any future live run must re-check target, executable identity, process containment, authorization, and output boundaries at execution time.
- Durable authorization-consumption gap: reviewed authorization remains structural and unconsumed in this boundary.

## Readiness Decision

The boundary is ready for a separate live process-driver implementation design. It is not ready for live command execution, first live preflight execution, credential handoff, executable resolution, evidence persistence, authorization consumption, deployment, SQL, Git mutation, Supabase mutation, API/UI/runtime wiring, or Avanza/browser automation.

Recommended next order:

1. Live process-driver implementation design.
2. Static review of driver design.
3. Live credential-source adapter design or implementation.
4. Final live-run gate.
5. First live read-only preflight.

## Confirmation

No Action 520 live process or target command ran. No Git or Supabase command, shell, version command, catalog query, SQL, migration, deployment, PATH inspection, executable-path resolution, environment value read, credential access, remote connection, evidence persistence, authorization consumption, API/UI/runtime activation, Avanza/browser automation, settlement retrieval, order behavior, live trade mutation, or live position mutation occurred.

Decision:

`post_trade_allowlisted_read_only_process_executor_termination_boundary_first_live_staging_preflight_static_security_review_ready_for_live_process_driver_design`

Result:

`post_trade_allowlisted_read_only_process_executor_termination_boundary_first_live_staging_preflight_static_security_review_completed_not_run`
