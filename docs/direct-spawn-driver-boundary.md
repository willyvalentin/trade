# Direct Spawn Driver Boundary

## Purpose

Action 529 adds a deterministic, fixture-only, server-only direct-spawn driver boundary for a future macOS read-only staging preflight. It models the source-controlled contract a future live direct-spawn implementation must satisfy. It does not spawn a process, execute a command, inspect PATH, inspect the filesystem, read environment values, read credentials, send signals, schedule timers, invoke observers, consume authorization, or enable runner behavior.

## Identity

Exact fixture identity:

`ture.execution.direct-spawn-driver-boundary.fixture.v1`

- driver kind: `direct_spawn_driver_boundary`
- platform: `macos`
- implementation mode: `fixture_only`
- execution model: `direct_spawn`
- shell mode: `forbidden`
- source model: `injected_fixture`
- policy version: `1`

A future live driver must use a separate exact identity and a separate review gate.

## Policy

Exact policy:

`first_live_read_only_direct_spawn_v1`

The policy requires one-shot direct-spawn structure, no retry, one active process, exact executable authority, exact operation binding, exact boundary session, fresh fixture capabilities, bounded output, timeout policy, observer policy, termination policy, and future authorization linkage.

The policy prohibits arbitrary commands, arbitrary executable paths, arbitrary arguments, arbitrary working directories, environment inheritance, environment overrides, credential injection, stdin, shell execution, live fixture spawning, PID creation, process group creation, signal sending, authorization consumption, and runner enablement.

## Supported Operations

| Operation | Tool identity | Exact argv | Repository required |
| --- | --- | --- | --- |
| `collect_git_version` | `git` | `["--version"]` | false |
| `collect_supabase_cli_version` | `supabase_cli` | `["--version"]` | false |

No `run_command`, `execute`, `spawn_any`, `shell`, `run_script`, deployment, SQL, Git status, Git discovery, or Supabase deployment operation is defined.

## Fixture Capabilities

The boundary defines distinct runtime-provenance-checked fixture artifacts:

- spawn-session capability;
- `FixtureExecutableSpawnAuthority`;
- `FixtureRepositorySpawnAuthority`;
- fixture authorization link.

They are deeply frozen, fingerprinted, clone resistant, session bound, expiry bound, noninterchangeable, and fixture-only. They are not live executable or repository authority and cannot enable process start.

## Authorization Link

The fixture authorization link binds session, operation, and an authorization artifact fingerprint. It contains no token or secret and records:

- `authorizationConsumed: false`
- `authorizesLiveSpawn: false`

It does not consume durable authorization.

## Exact Argv

Argv comes only from the operation registry. It is an immutable tuple `["--version"]`. Caller-supplied argv, shell syntax, command strings, response-file syntax, wildcards, newline, NUL, and command concatenation are rejected. The boundary never converts argv into a command string.

## Working Directory

Both first-version operations use:

- `workingDirectoryMode: none`
- `workingDirectory: null`

No current working directory, home directory, repository authority, executable parent directory, root directory, or caller-supplied cwd is used.

## Environment

The environment model is exact and empty:

- `environmentMode: empty_exact`
- `environmentKeys: []`
- `inheritsParentEnvironment: false`

The boundary does not read `process.env` and does not carry credentials through environment values.

## Credentials

First-version operations require no credentials:

- credentials required: false
- credentials provided: false

The boundary does not access Keychain, Git credentials, Supabase credentials, service-role keys, tokens, cookies, sessions, or BankID material.

## Stdio And Output

The fixture plan models:

- stdin closed;
- no interactive mode;
- no TTY;
- no inherited stdio;
- bounded sanitized stdout capture;
- bounded sanitized stderr capture;
- stdout max bytes: 16 KiB;
- stderr max bytes: 16 KiB;
- combined max bytes: 32 KiB;
- UTF-8 only;
- binary output rejected;
- truncation fail-closed.

No live output is captured.

## Timeout And Termination

Exact timeout policy:

`first_live_read_only_version_command_timeout_v1`

The fixture plan records timeout and termination policy linkage only. No timer is scheduled, no signal is sent, no termination is attempted, and no termination is verified live.

## Observer Linkage

Exact observer policy:

`first_live_read_only_no_expected_children_v1`

The boundary links to the reviewed observer policy structurally. It does not invoke the observer, create process capabilities, accept PIDs, accept process groups, enumerate processes, or create descendant state.

## Lifecycle

Compatible fixture plans end at:

`fixture_execution_not_started`

The lifecycle vocabulary intentionally excludes live-running states such as spawned, running, PID-created, completed-live, or terminated-live.

## Authority And Completeness

Authority is always:

`fixture_structural_only`

Completeness is derived from request, session, executable authority, repository authority, authorization link, operation binding, output policy, timeout policy, termination policy, observer policy, freshness, and session consistency. Complete fixture structure remains nonlive and insufficient for execution.

## Evidence Guarantees

Fixture result evidence records:

- `fixtureOnly: true`
- `authoritativeLive: false`
- `executionAttempted: false`
- `executionStarted: false`
- `processSpawned: false`
- `pidCreated: false`
- `processGroupCreated: false`
- `shellUsed: false`
- `outputCapturedLive: false`
- `timeoutScheduled: false`
- `terminationAttempted: false`
- `signalsSent: false`
- `terminationVerifiedLive: false`
- `observerInvokedLive: false`
- `authorizationConsumed: false`
- `enablesProcessStart: false`
- `enablesPreflightRunner: false`

## Fingerprints

Deterministic SHA-256 fingerprints use these domains:

- `ture:direct-spawn-driver-boundary:identity:v1`
- `ture:direct-spawn-driver-boundary:policy:v1`
- `ture:direct-spawn-driver-boundary:operation:v1`
- `ture:direct-spawn-driver-boundary:spawn-session-capability:v1`
- `ture:direct-spawn-driver-boundary:executable-fixture-authority:v1`
- `ture:direct-spawn-driver-boundary:repository-fixture-authority:v1`
- `ture:direct-spawn-driver-boundary:authorization-link:v1`
- `ture:direct-spawn-driver-boundary:request:v1`
- `ture:direct-spawn-driver-boundary:plan:v1`
- `ture:direct-spawn-driver-boundary:evidence:v1`
- `ture:direct-spawn-driver-boundary:compatibility:v1`
- `ture:direct-spawn-driver-boundary:result:v1`

## Compatibility

Compatibility is structural only:

- trusted resolver: fixture authority is structurally linked but not live executable authority;
- process executor: fixture plan is structurally compatible but not executor-invoking;
- live-driver design: direct-spawn model compatible but execution disabled;
- process observer: observer policy linked but not invoked;
- CLI-version collector: version operations linked but not run;
- credential boundary: first operations require no credentials;
- authorization: fixture link does not consume or grant live authorization;
- runner: structurally compatible but not runner-enabling.

## Prohibitions

| Property | Action 529 fixture driver |
| --- | --- |
| Builds exact fixture spawn plan | Yes |
| Spawns process | No |
| Uses shell | No |
| Creates PID | No |
| Creates process group | No |
| Captures live output | No |
| Schedules timeout | No |
| Sends signals | No |
| Consumes authorization | No |
| Accesses credentials | No |
| Enables runner | No |

## Future Live Plan

A future live driver requires separate review for spawn API selection, executable-path containment, cwd containment, environment construction, stdio implementation, output bounds, timeout scheduling, process-group behavior, signal handling, observer integration, credential handling, authorization consumption, TOCTOU mitigation, macOS compatibility, staging execution, and a final live gate.
