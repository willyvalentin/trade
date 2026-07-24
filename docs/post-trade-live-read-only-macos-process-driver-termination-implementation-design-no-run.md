# Action 521 - Live Read-Only macOS Process Driver and Termination Implementation Design, No Run

## Purpose

Action 521 designs the future server-only live read-only process driver for the first live staging preflight on macOS. This is a source-controlled implementation design only. It does not run Git, Supabase, version commands, process executors, preflight runners, catalog checks, SQL, migration deployment, or any live process.

The design is captured in:

- `lib/post-trade-live-read-only-macos-process-driver-design.ts`
- `tests/e2e/post-trade-live-read-only-macos-process-driver-design.spec.ts`

## Driver Identity

The future driver identity is:

`reviewed_macos_read_only_preflight_process_driver_v1`

It is bound to:

- macOS only
- reviewed architecture support policy for `arm64`, `x64`, and universal binaries
- direct spawn only
- shell disabled
- detached process mode disabled
- stdin closed
- TTY and pseudo-terminal disabled
- bounded stdout and stderr capture
- fixed operation timeout policies
- scoped process-tree observation
- descendant termination verification
- no automatic retry
- one process operation at a time
- one boundary session
- no global process enumeration
- no arbitrary executable, arguments, working directory, or environment
- no deployment capability

Other platforms require separate reviewed implementations.

## Executable Resolution Strategy

The design defines a future exact executable resolver contract for the Git CLI and Supabase CLI. It does not inspect PATH, resolve executable paths, inspect the filesystem, or choose a live executable in this action.

The future resolver must reject:

- caller-selected paths
- inherited PATH only resolution
- aliases
- shell functions
- wrappers
- script proxies
- unreviewed symlinks
- multiple matches
- world-writable executables
- world-writable containing directories where detectable
- production-specific wrappers
- stale or changed executable capabilities

Public evidence must not expose absolute resolved paths, personal paths, device/inode details, or runtime filesystem details. Public evidence is limited to opaque executable identity, expected basename, capability status, classifications, timestamps, and sanitized fingerprints.

## Executable Capability Evidence

Executable capability evidence is short-lived and must be rechecked immediately before any future spawn. It includes reviewed classifications for:

- expected basename
- supported architecture
- regular executable status
- ownership classification
- file type classification
- code-signing or provenance classification where feasible
- no alias/function/wrapper/script proxy/unreviewed symlink
- no multiple matches
- no caller-selected path
- no production wrapper
- no path replacement or post-verification change

The design explicitly keeps absolute paths, personal paths, and public device/inode evidence out of public results.

## Working Directory Capability

The working-directory capability is a reviewed repository-root identity, not a public absolute path. The future implementation must reject symlink roots, nested unrelated repositories, production checkouts, caller-selected paths, public absolute paths, and personal paths.

## Spawn Request Policy

The future live driver may only use a direct executable plus an exact argument array from the Action 519-520 operation registry. The design rejects:

- command strings
- shells
- command concatenation
- pipes and redirection
- command substitution
- shell expansion
- inherited stdio
- interactive terminals
- background launches
- GUI launches
- arbitrary cwd
- arbitrary environment

No function in the Action 521 design imports `child_process`, calls `spawn`, `exec`, `execFile`, or creates a runnable request.

## Environment Construction

The future environment policy starts from an empty environment and allows only fixed, non-secret entries:

- `LC_ALL=C.UTF-8`
- `LANG=C.UTF-8`
- `NO_COLOR=1`
- `PAGER=`
- `EDITOR=`
- `GIT_TERMINAL_PROMPT=0`
- `SUPABASE_NON_INTERACTIVE=1`

The design rejects inherited environment, PATH dumps, HOME/USER leakage, shell config, arbitrary Git/Supabase config, public secret values, public credential handoff details, and public credential variable names.

No `.env.local` value, process environment value, credential value, URL value, or secret value was read or printed.

## Opaque Credential Capability

The credential policy is capability-shaped, opaque, and single-use. It does not define a secret value, key name, token, URL, cookie, or session material.

Future credential handoff must:

- be one operation only
- forbid reuse
- avoid public secret slot values
- avoid public environment variable names
- require cleanup after success, failure, timeout, prompt detection, secret detection, overflow, and containment failure
- treat cleanup ambiguity as blocking

## Output Capture and Decoder

The output policy is bounded and transient:

- Git stdout limit: 16 KiB
- Supabase stdout limit: 32 KiB
- stderr limit: 8 KiB
- separate stdout and stderr buffers
- byte counting before parser authority
- overflow and truncation block authority
- raw output logging forbidden
- file output forbidden
- persistent buffers forbidden
- prompt detection before parser authority
- secret detection before parser authority
- raw buffer disposal required

The decoder is UTF-8 only and rejects invalid encoding, NULs, control characters, Unicode separators, ANSI sequences, prompts, banners, and dirty parser handoffs.

The design does not claim guaranteed zeroization.

## macOS Process Observation and Containment

The process observer design is scoped to the known process instance and known process group. It rejects unrestricted global process listing and generic containment booleans.

Future observation must classify:

- parent state
- direct children
- descendants
- process-group state
- detached descendants
- process-group escapes
- browser children
- GUI children
- URL opener children
- credential helpers
- daemons
- unknown children

Helper processes require separate review. Ambiguous containment cannot be converted into a successful read-only result.

## Timeout and Termination

Timeout policy requires monotonic time, bounded operation-specific timeouts, bounded graceful and forced termination windows, bounded containment verification, no caller override, session invalidation on timeout, and no retry.

Termination policy requires:

- known process or process-group target
- no arbitrary PID signal capability
- no unrestricted signal API
- session invalidation before signal
- future operations stopped before signal
- bounded graceful wait
- bounded forced wait
- containment observation after graceful and forced termination
- parent-only exit not sufficient
- signal-delivery success not sufficient
- process-group exit alone not sufficient if escape state is unknown
- no detached certainty claim from force kill
- cleanup after final classification
- no retry

## Lifecycle

The lifecycle policy defines allowed transitions through initialization, executable resolution, verification, spawn preparation, process start, running, exit observation, timeout, termination, containment verification, output disposal, completion, failure, termination, ambiguity, and disposal.

It rejects:

- second starts
- disposed reuse
- failed retry
- ambiguous retry
- timeout second start
- completed-to-running transitions
- cleanup ambiguity converted to completion

## Sanitized Driver Result

The sanitized result contains no raw stdout, raw stderr, executable path, cwd path, PID, process group id, environment value, credential value, URL, secret, cookie, session, BankID artifact, or personal path.

Completed read-only results require:

- zero exit classification
- contained containment evidence
- no timeout
- no prompt
- no secret
- no mutation
- no overflow
- no truncation
- output disposal
- credential cleanup confirmation when credential handoff was used

## Compatibility With Reviewed Layers

The compatibility summary binds this design to the Action 519-520 allowlisted read-only process executor and earlier reviewed first-live staging preflight layers. It preserves:

- no shell
- no TTY
- closed stdin
- detached false
- one process at a time
- one runner invocation
- one collection session
- no retry
- staging only
- zero deployment
- zero SQL mutation
- zero data mutation

The Action 510 authorization fingerprint remains upstream context, but this action does not consume or persist authorization.

## Inert Implementation Plan

The inert future implementation plan confirms this action contains no executable path, cwd path, command string, credential, secret environment value, raw output, PID, shell, SQL, deployment, retry, process start, executable resolution, PATH inspection, environment read, credential access, or live command execution.

## Remaining Gaps

The following remain unresolved and intentionally require future gates:

- live executable resolver
- live executable capability evidence
- live macOS process driver
- live process-tree observer
- authoritative containment implementation
- authoritative termination implementation
- live version-command execution
- exact observed Supabase CLI version
- live credential handoff
- TOCTOU controls
- durable authorization consumption
- first live staging preflight execution

## Safety Confirmation

No production connection, staging data write, test row insertion, migration action, DB/Supabase write, Git command, Supabase command, version command, SQL/catalog/deployment operation, live process execution, PATH inspection, filesystem path resolution, environment value read, credential access, API/UI/runtime activation, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, live trade mutation, or live position mutation occurred.

## Decision

`post_trade_live_read_only_macos_process_driver_termination_implementation_design_ready_for_static_security_review`

## Result

`post_trade_live_read_only_macos_process_driver_termination_implementation_design_added_no_run`

## Recommended Next Action

Action 522 - Perform static/security review of the live read-only macOS process driver and termination implementation design, without running commands.
