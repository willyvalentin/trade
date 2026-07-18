# Action 549 - First-Live Read-Only Direct-Spawn Planning Gate

## Scope

Action 549 is a documentation, architecture, and approval-gate action only. It does not implement process spawn, does not import `child_process`, does not execute `git`, Supabase CLI, or any other executable, does not collect CLI versions, and does not invoke the live resolver, composition adapter, or immediate pre-spawn revalidation adapter.

No observer, credential, authorization-consumption, runner, API, UI, cron, browser, Avanza, trading, order, position, settlement, persistence, network, environment, deployment, commit, push, merge, or deploy behavior occurred.

## Approved Chain Checkpoint

The approved chain entering this gate is:

```text
server-only live resolver
  -> original live resolver provenance
dormant server-only live composition adapter
  -> original Action 540 composition provenance
closed pre-lstat eligibility bridge
  -> one-shot consumption
single bigint lstat
  -> exact metadata comparison
private production-valid revalidation evidence
```

Every stage remains dormant. No process has been spawned, no command has been executed, no CLI version has been collected, and no observer or credential boundary has been activated. The revalidation result is point-in-time evidence only. It grants no spawn authority and records `toctouEliminated: false`.

## Spawn Trust Problem

A future direct-spawn boundary must solve a narrower problem than general command execution: it must convert one approved original revalidation object into at most one fixed, source-controlled, read-only process-start attempt without broadening authority.

The future boundary must:

- accept only the original production-valid Action 543/547 revalidation object;
- verify private original-object provenance through a boundary-specific path, not a generic verifier;
- consume the original revalidation object exactly once before process creation;
- reject clones, reconstructions, serialized copies, copied fingerprints, copied metadata, and copied paths;
- preserve exact tool, platform, policy identity/version, canonical path, session, purpose, capability, provenance, fingerprint, device id, inode, size, mode, modified time, and revalidation timestamp;
- minimize the interval between accepted revalidation and process creation;
- use no shell, PATH lookup, environment-derived executable path, caller process option, retry, fallback executable, alternate path, or second attempt;
- separate spawn authority from observer authority, credential authority, CLI-version evidence, authorization consumption, and result interpretation;
- treat spawn initiation as distinct from successful command completion;
- make process creation failure terminal.

## Future Direct-Spawn Contract

The future contract must be closed over:

- exact approved executable path from the consumed revalidation object;
- exact fixed argument vector from source-controlled policy;
- exact cwd policy;
- exact environment policy;
- exact stdio policy;
- `shell: false`;
- `detached: false`;
- platform-equivalent noninteractive process flags;
- no retry;
- one-shot consumption;
- exact result and failure states.

Production callers must not provide executable path, command name, arguments, flags, shell, cwd, env, PATH, stdio, timeout, signal, uid/gid, detached mode, platform process flags, observer, credentials, network configuration, retry count, or test dependency injection.

## First Command Recommendation

Reviewed fixture operations are:

| Candidate | Operation | Assessment |
| --- | --- | --- |
| `git --version` | `collect_git_version` | Best first command. It is zero-credential, fixed argv, small output, useful for local toolchain evidence, and less cloud/account-oriented than Supabase CLI. It still must be spawned only through an approved absolute path and fixed environment. |
| `supabase --version` | `collect_supabase_cli_version` | Also reviewed structurally, but it is a cloud-oriented CLI with greater future credential/config/proxy concern. It should follow after the first spawn path is reviewed with `git --version`. |
| Other local query | None currently approved | No other command is represented in the reviewed fixture contracts. Adding one requires a separate operation-policy action. |

Recommended first live command scope: `collect_git_version` only, using exact argv `["--version"]`, no cwd, no credentials, no network configuration, no shell, no PATH lookup, and no retry.

## Environment Recommendation

| Model | Verdict | Reason |
| --- | --- | --- |
| Full `process.env` inheritance | Reject | It risks credential, proxy, PATH, HOME, and user-config leakage. |
| Narrowly filtered inherited environment | Avoid for first spawn | It still depends on ambient process state and filtering mistakes. |
| Minimal fixed environment | Accept only if explicitly source-controlled | It avoids PATH/HOME/proxy leakage while allowing reviewed locale stability. |
| No custom env/platform defaults | Avoid | Defaults can still inherit or vary by API/platform. |
| Reviewed fixed environment map | Preferred | The map is source-controlled, deterministic, and omits PATH, HOME, proxy, token, credential, and config variables. |

Future implementation should use a reviewed fixed environment map. It must not read `process.env`, must not inherit PATH or HOME, and must not accept caller env. Do not assume an empty environment is automatically portable; portability must be tested under the fixed map.

## Stdio And Output Recommendation

Future stdio should be:

- stdin disabled/closed;
- no TTY and no inherited stdio;
- stdout and stderr captured through bounded buffers only;
- UTF-8 decoding with deterministic invalid-encoding failure;
- binary output rejected;
- truncation fail-closed;
- stdout max 16 KiB, stderr max 16 KiB, combined max 32 KiB unless a later policy narrows further;
- spawn failure, timeout, signal, and nonzero exit represented as terminal states without retry.

Minimal bounded output collection may remain in the first direct-spawn operation because the only approved first command is a single local version query. The boundary still must not become a general observer. Observer ownership remains separate and requires a later approved boundary.

## TOCTOU Model

The current revalidation is pathname-based. The executable may still be replaced after `lstat`. Ordinary spawn-by-path does not eliminate TOCTOU, no file descriptor is retained, and metadata fingerprints are not permanent execution identity.

| Option | Verdict |
| --- | --- |
| Separate revalidation adapter followed by spawn adapter | Reviewable, but the interval can widen unless the spawn boundary consumes the original immediately. |
| Closed orchestrator invokes revalidation then spawn immediately | Strongest near-term TOCTOU posture, but broader coupling and should be separately designed before replacing the current bridge. |
| Spawn adapter internally owns revalidation | Minimizes interval but collapses boundaries and risks duplicating Action 543 logic. |
| File-descriptor or OS-specific execution | Potentially stronger, but too complex for the next step and requires its own design action. |
| Persisted revalidation evidence consumed later | Unsafe. It widens TOCTOU and weakens original-object provenance. |

Action 549 recommends a dormant direct-spawn adapter that consumes the original revalidation object immediately and remains honest: `toctouEliminated` must stay false.

## Provenance Consumption Recommendation

| Option | Verdict |
| --- | --- |
| Boundary-specific consume operation from the revalidation module | Preferred for the next implementation. It preserves original-object identity, avoids generic trust oracles, and supports one-shot consumption. |
| Closed revalidation-plus-spawn orchestration module | Safer long term for TOCTOU, but broader than the next smallest action. |
| Generic revalidation verifier | Reject. It becomes a reusable trust oracle. |
| Exported token, brand, symbol, hash, or signature | Reject. It is easier to copy, misuse, or widen. |
| Serialized or persisted evidence | Reject. It loses original-object identity and invites replay. |

## Lifecycle Model

Future lifecycle states must be explicit:

- `not_started`
- `pre_spawn_revalidation_blocked`
- `spawn_eligibility_accepted`
- `spawn_attempt_started`
- `spawn_failed`
- `process_started`
- `observer_handoff_pending`
- `terminal_without_process`
- `terminal_process_started_no_result_yet`

`process_started` must not mean the command succeeded. Exit-code collection and interpretation may belong to later observer and CLI-version evidence boundaries. A spawn exception is terminal. No retry, second executable, or fallback path is permitted, and the one-shot input remains consumed on failure.

## Next Action

Recommended next Action: Action 550 - Implement Dormant Server-Only Fixed Read-Only Direct-Spawn Adapter.

The implementation must remain dormant, server-only, unreachable from runtime, and focused on one fixed `collect_git_version` invocation shape. It may introduce a spawn-capable boundary contract only behind a dormant implementation path and must not be wired to observer, CLI interpretation, runner, API, UI, cron, browser, Avanza, trading, persistence, or deployment.

## Mandatory Future Constraints

- server-only first effective import;
- boundary-specific original-object consumption;
- no generic verifier;
- no caller executable, command, or argument input;
- fixed canonical absolute path from approved revalidation;
- fixed source-controlled argv;
- `shell: false`;
- no PATH discovery;
- no caller env or inherited env;
- no credentials;
- no network;
- no retry or fallback;
- one process attempt;
- no detached process;
- stdin disabled;
- bounded stdout/stderr;
- immutable lifecycle evidence;
- no observer authority unless separately approved;
- no CLI interpretation unless separately approved;
- no runtime wiring;
- dormant focused-test reachability only;
- independent security review;
- separate approval before activation.

## Mandatory Review Gates

Future implementation must pass focused implementation tests, server-only import review, export-surface review, provenance-consumption review, one-shot/concurrency review, fixed path/argv review, environment and credential-leakage review, shell/PATH review, process-option closure review, spawn-call-count review, retry/fallback review, output-bound review, lifecycle review, TOCTOU review, runtime-reachability review, prohibited-operation review, independent static security review, remediation and final re-review if needed, and separate approvals before observer integration, CLI result interpretation, runtime activation, or deployment.

## Absent Authority

Action 549 does not authorize process spawn, CLI execution, CLI-version collection, live resolver invocation, live composition invocation, live revalidation invocation, process observation, credentials, authorization consumption, runner enablement, API/UI activation, browser or Avanza automation, trading, order, position, settlement, persistence, network access, environment reads, deployment, or production readiness.

## Decision

Decision: `post_trade_first_live_read_only_direct_spawn_boundary_plan_ready`

Result status: `post_trade_first_live_read_only_direct_spawn_action_549_planning_gate_completed`

Commit/deploy recommendation: no deploy is recommended. A source-control checkpoint commit may be considered only after the Action 549 diff has been manually inspected.
