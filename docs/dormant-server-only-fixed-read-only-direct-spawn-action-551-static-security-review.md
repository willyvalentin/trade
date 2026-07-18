# Action 551 - Static Security and Contract Review of Dormant Fixed Read-Only Direct-Spawn Adapter

## Executive Summary

Action 551 reviewed the uncommitted Action 550 dormant server-only fixed read-only direct-spawn adapter. The review confirms the adapter is narrow, server-only, unreachable from runtime/API/UI/runner paths, and fixed to `/usr/bin/git` with argv `["--version"]`. The production API does not accept caller path, argv, environment, cwd, process options, retry, fallback, observer, credential, or runner inputs.

The review is blocked pending remediation because the current server-only wrapper can start a child process without a deterministic timeout/termination owner, and stream error events are not handled. Those gaps are lifecycle and resource-control issues at the first boundary that can create a process.

Decision: `post_trade_dormant_server_only_fixed_read_only_direct_spawn_adapter_static_security_review_blocked_pending_remediation`

Result status: `post_trade_dormant_server_only_fixed_read_only_direct_spawn_adapter_action_551_review_completed_blocked`

## Artifacts Reviewed

- `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts`
- `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core.ts`
- `tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts`
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts`
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter-core.ts`
- `docs/dormant-server-only-fixed-read-only-direct-spawn-adapter-action-550.md`
- `docs/dormant-server-only-fixed-read-only-direct-spawn-action-550-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`
- Related Action 540, 543, 545, 547, 548, 549, and 533 boundary contracts and focused tests.

## Server-Only Verdict

Pass with one scoped live primitive. The process-capable module starts with `import "server-only";` and is the only reviewed Action 550 module importing `node:child_process`. The pure core imports `node:crypto` only and has no filesystem, process, environment, network, or server-only primitive.

Static reachability review found no route, API, UI, cron, runner, observer, credential, CLI collector, trading, or Avanza caller importing the direct-spawn adapter outside its focused test and implementation files.

## Production API Verdict

Pass. The production wrapper exposes only `spawnDormantServerOnlyFixedReadOnlyGitVersion({ revalidationResult })`. It accepts no caller-controlled executable, argv, cwd, env, stdio, shell, timeout, signal, uid, gid, detached mode, Windows options, retry, fallback, observer, process primitive, dependency injection, test mode, metadata, authority fields, tool, or platform.

## Provenance-Consumption Verdict

Pass with blocked lifecycle follow-up. The bridge is boundary-specific and verifies private original production revalidation provenance, exact Action 543/547 result and evidence fingerprints, exact path `/usr/bin/git`, exact tool/platform/purpose/policy linkage, no authority claims, and point-in-time TOCTOU posture before returning an approved executable path.

The consumed WeakSet is private and no generic verifier, WeakSet, reset, replay, token, symbol, brand, or trust oracle is exported. Valid inputs are consumed before process creation, so spawn success, spawn failure, and output failure consume the original input. Invalid or non-provenance inputs do not reach process creation.

## Executable And Argv Verdict

Pass. The executable is fixed to `/usr/bin/git` through the consumed revalidation bridge and core validation. The argv is fixed to `["--version"]` from source-controlled policy. There is no PATH lookup, command concatenation, shell string, alternate executable, fallback, Supabase CLI path, or caller-controlled tool path.

## Environment Verdict

Pass. The wrapper does not read `process.env` and does not spread the parent environment. The environment passed to `spawn` contains only `LANG=C` and `LC_ALL=C`. No PATH, HOME, USERPROFILE, XDG, proxy, Git credential, SSH, token, API key, shell, or credential-helper environment variable is included.

Residual observation: `git --version` is not expected to consult repository config or credentials. The fixed environment substantially reduces helper/config exposure, but it does not by itself prove absence of all platform-level dynamic loader behavior. That remains outside the current adapter's authority and is not a credential access path in source.

## Process Options Verdict

Pass. The wrapper uses `shell:false`, `detached:false`, `cwd:undefined`, `stdio:["ignore","pipe","pipe"]`, and `windowsHide:true`. It passes no IPC, extra file descriptors, caller signal, uid/gid, timeout, or process-group option. Stdin is unavailable.

## Process-Call Count Verdict

Pass. Static scan found exactly one approved `spawn(` call, in the server-only wrapper. There is no `exec`, `execFile`, `fork`, wrapper library, retry, fallback, hidden second process attempt, or import-time spawn.

## Output And UTF-8 Verdict

Blocked. The adapter counts stdout, stderr, and combined output as chunks arrive and stops retaining chunks once limits are exceeded. It uses fatal UTF-8 decoding and treats NUL output as binary. It does not stream output to logs and does not parse CLI-version evidence.

However, overflow only sets flags and waits for `close`; it does not terminate the child, dispose listeners, or return a terminal overflow result independently of process closure. Because this boundary is the first process-creating boundary and no observer/timeout owner is active, an overflowing or non-closing child could hold the promise and process resources indefinitely.

## Lifecycle And Race Verdict

Blocked. The result is settled at most once through a local guard and uses `close` for normal terminal collection, which avoids treating `exit` as fully collected output. Spawn throws and asynchronous spawn errors are represented as terminal failed observations. Child creation success is not conflated with command success.

The wrapper does not listen for stdout or stderr `error` events. In Node's EventEmitter model, an unhandled stream `error` can throw rather than returning structured fail-closed evidence. There is also no deterministic timeout path for a child that neither closes nor emits an error.

## Termination Verdict

Blocked. The adapter currently does not terminate the child on output overflow and has no fixed timeout/kill path. No termination authority is exposed to callers, and no caller-controlled signal exists, but the absence of any lifecycle owner means overflow or hang conditions can leave a child running until it exits on its own.

## Authority Verdict

Pass. Results grant no reusable spawn authority, observer authority, credential authority, CLI-version authority, authorization-consumption authority, network authority, API/UI/runner authority, trading authority, Avanza authority, order/position/settlement authority, persistence authority, or deployment authority. Raw output remains direct-spawn evidence only and is not parsed into CLI-version evidence.

## TOCTOU Verdict

Pass. The adapter preserves `toctouEliminated:false`, does not claim the revalidated inode was executed, retains no file descriptor, and documents pathname-based replacement risk. Spawn evidence remains non-authoritative and must be re-reviewed before any later boundary consumes it.

## Test-Seam Verdict

Pass with coverage gap. The focused tests exercise the actual server-only wrapper source through a mocked `spawn` primitive and test-only consume bridge. They do not execute the real Git binary and do not add production dependency injection.

Coverage is meaningful for fixed path/argv/env/options, clone rejection, one-shot duplicate rejection, spawn throw/error, nonzero exit, signal termination, overflow flags, invalid UTF-8, NUL/binary output, no API/UI/runtime wiring, and static prohibited operations. Missing coverage exists for stdout/stderr stream error events and never-closing child lifecycle handling.

## Findings

| ID | Severity | Location | Finding | Exploit or failure scenario | Required remediation | Blocks approval |
| --- | --- | --- | --- | --- | --- | --- |
| F-551-001 | High | `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts:70` and `:76` | Overflow is detected but does not terminate the child, dispose stream listeners, or settle independently of `close`. | A future regression or unexpected executable behavior emits output beyond bounds and keeps running; the promise waits for `close` while resources remain owned by an unobserved child. | Add a separately reviewed fixed lifecycle owner for overflow/timeout termination or block live process creation until observer/timeout/termination integration is approved. The behavior must be fixed, non-caller-controlled, and tested. | Yes |
| F-551-002 | High | `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts:70`, `:76`, and `:82` | stdout/stderr stream `error` events are not handled. | A stream error can surface as an unhandled EventEmitter error instead of structured fail-closed evidence, bypassing the one-result lifecycle model. | Add fail-closed stream-error listeners with exactly-once settlement and tests for stdout and stderr stream errors. | Yes |
| F-551-003 | Medium | `tests/e2e/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.spec.ts` | Focused suite lacks never-closing child and stream-error coverage. | Existing tests can pass while lifecycle hangs or stream errors remain unmodeled. | Add focused mocked-spawn coverage after remediation. | Yes |

## Prohibited-Operation Result

Static scans found only the approved `node:child_process` import and single `spawn(` call in the server-only wrapper, plus SHA-256 hashing in pure modules. No prohibited source path for `exec`, `execFile`, shell, `process.env`, PATH lookup, network/fetch, credentials, Keychain, browser storage, BankID, Supabase auth/write, persistence, API/UI/runner wiring, observer activation, CLI-version interpretation, authorization consumption, Avanza, trading/order/position/settlement, or deployment was found in the reviewed Action 550 production files.

## Security Assertions

No real executable was run. No real Git version was collected. No process was spawned by validation. No shell was used. No credentials or environment values were read. No network request occurred. No observer, credential, CLI-version interpretation, authorization-consumption, API, UI, runner, cron, browser, Avanza, trading, order, position, settlement, persistence, deployment, commit, push, or merge behavior occurred.

## Decision

Decision: `post_trade_dormant_server_only_fixed_read_only_direct_spawn_adapter_static_security_review_blocked_pending_remediation`

Result status: `post_trade_dormant_server_only_fixed_read_only_direct_spawn_adapter_action_551_review_completed_blocked`

Recommended next Action: Action 552 - Remediate Dormant Fixed Read-Only Direct-Spawn Lifecycle Termination and Stream-Error Handling.

