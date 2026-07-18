# Action 555 - Dormant Scoped Process Observer Architecture

## Architecture Verdict

The current fixed direct-spawn boundary already owns the ordinary lifecycle observation required for the one-shot short-lived `git --version` command. A separate observer is still a valid future concept for longer-running or externally supervised processes, but introducing it now would duplicate event-listener and terminal-settlement responsibilities and require a new child-handle ownership model before the raw completion schema is even frozen.

The next boundary should therefore be pure raw process-completion evidence, not a live observer.

## Responsibility Matrix

| Responsibility | Current owner | Future owner if needed | Notes |
| --- | --- | --- | --- |
| Process creation | Direct-spawn boundary | None for Action 556 | Already fixed to one `/usr/bin/git ["--version"]` attempt. |
| Spawn event | Direct-spawn boundary | Raw evidence contract consumes derived field only | No observer needed for current command. |
| Synchronous spawn throw | Direct-spawn boundary | Raw evidence contract consumes derived field only | Already mapped to spawn failure. |
| Asynchronous child error | Direct-spawn boundary | Raw evidence contract consumes derived field only | Already sanitized. |
| stdout data | Direct-spawn boundary | Raw evidence contract consumes bounded data only | Direct-spawn owns data listener. |
| stderr data | Direct-spawn boundary | Raw evidence contract consumes bounded data only | Direct-spawn owns data listener. |
| stdout error | Direct-spawn boundary | Raw evidence contract consumes status only | Already terminal/fail-closed. |
| stderr error | Direct-spawn boundary | Raw evidence contract consumes status only | Already terminal/fail-closed. |
| Output byte limits | Direct-spawn boundary | Raw evidence contract verifies status/limits | Already bounded at source. |
| UTF-8 validation | Direct-spawn boundary currently validates at close | Raw evidence contract should encode validation state | Parser must not redo trust. |
| Exit | Direct-spawn boundary | Raw evidence contract consumes derived field only | Existing evidence records exit-related status. |
| Close | Direct-spawn boundary | Raw evidence contract consumes derived field only | Ordinary completion depends on close. |
| Signal termination | Direct-spawn boundary | Raw evidence contract consumes signal field only | Parser must reject signal termination. |
| Internal fatal condition | Direct-spawn boundary | Raw evidence contract consumes status only | Already settles without indefinite close wait. |
| Kill request | Direct-spawn boundary | Not owned by raw evidence contract | Kill ownership should remain in direct spawn. |
| Kill result | Direct-spawn boundary | Raw evidence contract consumes request result only | No arbitrary kill authority. |
| Listener cleanup | Direct-spawn boundary | Not owned by raw evidence contract | Avoid duplicate listeners. |
| Terminal settlement | Direct-spawn boundary | Raw evidence contract validates terminal state | Avoid two settlement owners. |
| Raw evidence construction | Current direct-spawn evidence exists; normalized contract absent | Action 556 | This is the recommended next gap. |
| CLI interpretation | Absent | Future parser after Action 556 and review | Must remain separate. |

## Process-Handle Ownership Analysis

For the current path, no process handle should cross a boundary. The direct-spawn wrapper creates the child, attaches the only reviewed listeners, owns fixed internal-fatal termination, settles exactly once, and returns immutable non-authoritative evidence.

If a future live observer is later justified, the design must answer:

- Which module owns the child handle from creation to terminal completion.
- How ownership is transferred exactly once.
- Whether the spawn wrapper temporarily retains ownership.
- How the observer proves it received the original approved child instance.
- How clones, proxies, wrappers, and reconstructed process-like objects fail.
- How no child handle escapes to production callers.
- How no generic `observeProcess(child)` API is exposed.
- How one observer is bound to one exact session, tool, purpose, and spawn attempt.
- How duplicate observation is prevented.
- How termination ownership is coordinated.
- How listener ownership cannot conflict.
- How no respawn or retry can occur.

Action 555 does not approve exporting a child handle, process token, process identifier, or generic verifier.

## Provenance Option Comparison

| Option | Assessment | Verdict |
| --- | --- | --- |
| A. Direct-spawn exposes one boundary-specific consume operation internally handing the original child to observer | Best live-observer model if ever needed, because it preserves original-object integrity and one-shot coupling. Still not needed before raw evidence contract. | Future candidate only. |
| B. Closed server-only orchestration owns spawn plus observation | Safer than public handle transfer but larger and risks mixing creation, observation, and interpretation. | Future candidate only after raw contract. |
| C. Observer accepts generic child handle and neutral metadata | Unsafe. Generic handles are caller authority and invite process-like substitution. | Reject. |
| D. Exported brand, token, symbol, fingerprint, or process identifier | Unsafe. Tokens become trust oracles or replay targets and can be confused with authority. | Reject. |
| E. Persisted process identifiers or serialized observation tickets | Unsafe. PID/ticket reuse and cross-session replay risks are unnecessary for the current one-shot command. | Reject. |

## Raw Completion Evidence Contract

The next pure contract should define immutable evidence with closed schemas and fingerprints for:

Identity:

- Contract kind/version.
- Boundary identity.
- Session.
- Purpose.
- Tool.
- Platform.
- Policy identity/version.
- Executable path.
- argv fingerprint.
- Spawn attempt fingerprint.
- Revalidation fingerprint.
- Process-attempt identifier.

Creation:

- Process creation attempted.
- Process created.
- Synchronous spawn failure.
- Asynchronous spawn error.
- Spawn event observed.

Completion:

- Exit observed.
- Exit code.
- Signal.
- Close observed.
- Terminal lifecycle state.
- Process death confirmed or unconfirmed.

Output:

- Raw stdout text or bytes as already bounded by direct spawn.
- Raw stderr text or bytes as already bounded by direct spawn.
- stdout/stderr byte counts.
- Encoding validation status.
- stdout overflow.
- stderr overflow.
- combined overflow.
- stream error status.

Termination:

- Termination requested.
- Fixed signal.
- Termination request accepted, rejected, or threw.
- Process closure after termination confirmed or unconfirmed.

Security:

- No credentials used.
- No network authority.
- No observer authority exported.
- No CLI interpretation.
- `authority:none`.
- `toctouEliminated:false`.

Fields already present in direct-spawn evidence include adapter/policy identity, purpose, platform, operation, tool, executable path, argv, fixed environment, byte limits, revalidation fingerprints, session id, process attempted/started/exited/spawned, terminal reason, internal terminal condition, termination request fields, close-after-internal condition, live-action false flags, authority false/none flags, lifecycle state, status, blocking reasons, and fingerprints.

Fields that require Action 556 schema work include a dedicated raw-completion contract identity, normalized creation/completion state names, explicit spawn-event observation, explicit close-observed naming, process-attempt identifier semantics, parser-consumable encoding state, and closed fail-closed parser preconditions.

## Pure Contract Option

A pure raw process-completion evidence contract materially reduces risk before a live observer or parser because it:

- Defines exact closed schemas.
- Defines terminal states.
- Defines canonical ordering.
- Defines fingerprints.
- Defines fail-closed rules.
- Preserves `authority:none`.
- Preserves no-credential and no-network posture.
- Contains no child handle.
- Contains no process primitive.
- Contains no live observation claim beyond consuming existing immutable evidence.
- Remains testable without spawn.
- Supports future CLI-version parsing.

## Observer Authority Model

If a live observer is ever recommended later, its authority must be limited to:

- Subscribe to fixed events on one already-approved child.
- Collect bounded completion information.
- Request no new process creation.
- Perform no retry.
- Perform no respawn.
- Change no environment or process options.
- Access no credentials or network.
- Emit immutable non-authoritative completion evidence.

Forbidden observer behavior:

- Spawning.
- Killing arbitrary processes.
- Observing arbitrary PIDs.
- Attaching to unrelated processes.
- Accepting caller child handles.
- Parsing CLI versions.
- Writing files.
- Network.
- Credentials.
- API/UI/runner activation.
- Trading or Avanza behavior.

Kill ownership should remain entirely in the direct-spawn boundary for the current fixed command. A later observer may report termination state, but it should not own arbitrary termination authority.

## CLI-Parser Separation

A future Git-version parser must consume immutable terminal raw-completion evidence. It must not own process creation, process observation, credentials, network, authorization consumption, or runtime activation.

Parser preconditions must include zero exit, confirmed close, no signal termination, no output overflow, no stream error, valid bounded UTF-8, exact command/tool/session linkage, and explicitly approved stderr handling. It must fail closed on malformed, ambiguous, oversized, binary, non-zero, signal-terminated, stream-error, overflow, or incomplete results. It must produce evidence, not authority, and should remain pure where possible.

## Non-Authorizations

This architecture plan does not authorize observer implementation, raw evidence adapter implementation, CLI parser implementation, process execution, runtime activation, credentials, network, Avanza, trading, order, position, settlement, persistence, deployment, staging readiness, execution readiness, or production readiness.

## Decision

Decision: `post_trade_scoped_process_observer_boundary_plan_ready`

Result status: `post_trade_scoped_process_observer_action_555_planning_gate_completed`
