# Action 550 - Dormant Server-Only Fixed Read-Only Direct-Spawn Adapter

## Summary

Action 550 implements the smallest dormant server-only fixed read-only direct-spawn adapter for the future first-live staging preflight. The implementation is focused-test reachable only and is not wired into API, UI, runner, observer, credential, CLI-version interpretation, browser, Avanza, trading, persistence, cron, or deployment paths.

The only allowed process shape is the first approved command scope from Action 549:

```text
/usr/bin/git --version
```

The implementation does not run during validation against the real Git binary. The focused tests use a controlled source harness and mocked process primitive.

## Module Graph

- `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter-core.ts`
  - pure core;
  - imports `node:crypto` only;
  - defines identity, fixed policy, lifecycle evidence, observations, fingerprints, and fail-closed evaluation.
- `lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts`
  - first effective import is `import "server-only";`;
  - only new module importing `node:child_process`;
  - owns the single `spawn` call;
  - performs no import-time work.
- `lib/post-trade-dormant-server-only-immediate-pre-spawn-revalidation-adapter.ts`
  - adds the boundary-specific original-object consume bridge for Action 550;
  - exports no generic verifier, token, symbol, brand, reset, or trust oracle.

## Production API

The production wrapper exposes:

```ts
spawnDormantServerOnlyFixedReadOnlyGitVersion({
  revalidationResult,
})
```

The caller can provide only the original immediate pre-spawn revalidation result object. The caller cannot provide executable path, command name, argv, cwd, env, PATH, stdio, timeout, signal, uid, gid, detached mode, platform process flags, observer, credentials, network configuration, retry count, or test dependency injection.

## Provenance Consumption

Before the process primitive can be called, the Action 550 bridge verifies the exact original production-valid Action 543/547 revalidation object:

- exact input shape;
- private production provenance on the result and evidence objects;
- not previously consumed for the dormant fixed direct-spawn boundary;
- exact kind/version and adapter identity;
- status `revalidated_non_authoritative_evidence`;
- purpose `first_live_read_only_staging_preflight`;
- platform `macos`;
- tool `git`;
- exact path `/usr/bin/git`;
- Action 543 policy identity/version;
- exact metadata match;
- exact SHA-256 result/evidence fingerprints;
- `pointInTimeOnly: true`;
- `toctouEliminated: false`;
- no authority-bearing fields.

Consumption happens before process creation. Success, spawn exception, spawn error, output failure, nonzero exit, signal termination, or a successful mocked process exit consumes the original input. A second call gets zero additional process attempts.

## Fixed Process Contract

The wrapper uses:

- executable path: consumed approved path, required to be `/usr/bin/git`;
- argv: `["--version"]`;
- `shell: false`;
- `detached: false`;
- `cwd: undefined`;
- `stdio: ["ignore", "pipe", "pipe"]`;
- `windowsHide: true`;
- no retry;
- no fallback executable;
- no alternate path;
- no observer handoff;
- no credential handoff;
- no CLI-version parsing.

## Environment

The fixed source-controlled environment is:

```text
LANG=C
LC_ALL=C
```

The wrapper does not read `process.env`, does not inherit PATH or HOME, and does not include USERPROFILE, XDG variables, Git credential variables, SSH variables, proxy variables, tokens, API keys, credential-helper configuration, network configuration, or shell configuration.

## Output Bounds

The adapter uses bounded stdout/stderr collection:

- stdin ignored;
- stdout max: 16 KiB;
- stderr max: 16 KiB;
- combined max: 32 KiB;
- UTF-8 decoding with fail-closed invalid encoding;
- binary output detected through NUL and fail-closed;
- overflow is terminal;
- no streaming to logs;
- no CLI-version interpretation.

Raw bounded output can appear only in immutable direct-spawn lifecycle evidence. It does not prove a valid Git version and does not create CLI-version evidence.

## Lifecycle

The core represents:

- `spawn_eligibility_blocked`;
- `spawn_attempt_started`;
- `spawn_failed`;
- `process_started`;
- `terminal_without_process`;
- `terminal_process_started_no_result_yet`;
- `terminal_process_exited_no_cli_interpretation`.

`process_started` does not mean command success. Process exit does not mean version compatibility. Nonzero exit, signal termination, invalid output, output overflow, spawn error, and spawn exception are terminal and do not retry.

## TOCTOU Limitation

The adapter preserves the Action 549 trust limit:

- immediate revalidation is pathname-based;
- the path may change after `lstat`;
- ordinary spawn by path does not eliminate TOCTOU;
- no file descriptor is retained;
- metadata and fingerprints are not permanent execution identity;
- spawn evidence does not prove the exact revalidated inode was executed;
- `toctouEliminated` remains false.

## Authority Model

The adapter grants no observer authority, credential authority, CLI-version authority, authorization-consumption authority, network authority, API/UI/runner authority, trading authority, Avanza authority, order/position/settlement authority, persistence authority, deployment authority, or staging readiness.

The only narrow live behavior represented by the wrapper is one consumed shell-free process creation attempt when invoked with the original approved revalidation object.

## Test Seam

Tests do not execute the real Git binary. The focused suite transpiles the actual server-only wrapper source with a controlled mocked `spawn` primitive and a test-only mocked consume bridge. This exercises the wrapper order and process options without widening the production API or adding dependency injection to production code.

## Remaining Blockers

Before observer or CLI-version interpretation:

- independent static/security review of Action 550;
- remediation if findings appear;
- final re-review after remediation if needed;
- separate observer integration approval;
- separate CLI-version interpretation approval;
- separate runtime activation approval;
- separate deployment approval.

## Security Assertions

No real executable was run during validation. No real Git version was collected. No credentials or environment values were read. No network request occurred. No runtime, API, UI, runner, observer, credential, browser, Avanza, trading, order, position, settlement, persistence, or deployment behavior was activated.

## Decision

Decision: `post_trade_dormant_server_only_fixed_read_only_direct_spawn_adapter_ready_for_static_security_review`

Result status: `post_trade_dormant_server_only_fixed_read_only_direct_spawn_adapter_implemented_not_activated`

Recommended next Action: Action 551 - Static Security and Contract Review of Dormant Fixed Read-Only Direct-Spawn Adapter.
