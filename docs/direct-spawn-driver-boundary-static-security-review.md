# Direct Spawn Driver Boundary Static Security Review

## Executive Summary

Action 530 reviewed the Action 529 direct-spawn driver boundary as an adversarial, fixture-only contract for a future separately reviewed macOS live direct-spawn driver. The boundary remains deterministic, source-controlled, server-only at the runtime wrapper, capability scoped, session bound, expiry bound, exact-operation bound, shell-forbidden, environment isolated, cwd isolated, credential isolated, no-retry, one-shot, fail-closed, and unable to initiate or authorize live process execution.

Review decision: `approved`.

Approval covers the fixture boundary contract only. It does not approve process spawning, command execution, live Git or Supabase invocation, runner wiring, API wiring, UI wiring, observer invocation, authorization consumption, credential access, or deployment.

## Reviewed Worktree State

Reviewed Action 529 artifacts:

- `lib/post-trade-direct-spawn-driver-boundary-core.ts`
- `lib/post-trade-direct-spawn-driver-boundary.ts`
- `tests/e2e/post-trade-direct-spawn-driver-boundary.spec.ts`
- `docs/direct-spawn-driver-boundary.md`
- `docs/direct-spawn-driver-boundary-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

Action 530 created:

- `tests/e2e/post-trade-direct-spawn-driver-boundary-security-review.spec.ts`
- `docs/direct-spawn-driver-boundary-static-security-review.md`
- `docs/direct-spawn-driver-boundary-review-checkpoint.md`

Action 530 updated:

- `lib/post-trade-direct-spawn-driver-boundary-core.ts`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

Unrelated pre-existing worktree changes remain outside this review scope.

## Architecture Summary

The core module exports pure fixture builders, validators, exact policies, exact operation definitions, fingerprint helpers, compatibility evidence, and a fixture adapter whose only method is `createFixturePlan`. The server wrapper imports `server-only` and exposes a boundary summary plus the fixture adapter. No production export is equivalent to `spawn`, `execute`, `run`, `exec`, `fork`, `launch`, `invoke`, or a generic command runner.

Data flow:

caller-provided fixture construction options -> spawn-session capability -> executable fixture authority -> optional repository fixture authority -> fixture authorization link -> direct-spawn fixture request -> exact operation definition -> exact argv and policy checks -> sanitized fixture plan -> no-execution evidence -> compatibility summary -> frozen result.

Caller-controlled values are limited to fixture builder options and validator inputs. Trust-critical values are source-controlled, computed, fingerprinted, runtime-provenance checked, and deeply frozen. Compatibility is informational only.

## Export Inventory

Runtime exports reviewed: 31.
Type exports reviewed: 26.
Total exported surfaces reviewed: 57.

Runtime export classes:

- constants: identity, policy IDs, injected timestamps, fingerprint domains, server boundary ID;
- builders: policy, registry, operation definition, capabilities, authorization link, request, adapter, compatibility, future live-driver plan, server boundary;
- validators: identity, policy, operation, capabilities, authorization link, request, exact argv;
- fingerprint helper: identity fingerprint.

Trust impact:

- capability-bearing exports create fixture-only objects with module-private provenance;
- request and adapter exports create structural plans only;
- compatibility exports cannot enable runner or execution;
- server runtime exports are guarded by `import "server-only"`.

Execution capability: none.

## Dependency Review

Production direct-spawn files import only:

- `node:crypto` for SHA-256;
- source-controlled design constants from related reviewed modules;
- `server-only` in the server wrapper.

Implementation-only searches found no matches for live execution primitives in `lib/post-trade-direct-spawn-driver-boundary*.ts`:

- `child_process`, `node:child_process`, `spawn`, `exec`, `execFile`, `fork`, `cross-spawn`, `execa`, `Bun.spawn`, `Deno.Command`;
- `process.kill`, `pkill`, `killall`, `setTimeout`, `setInterval`, `AbortSignal.timeout`, `timers/promises`;
- `process.env`, `process.cwd`, `process.execPath`, `node:fs`, `fs/promises`, Keychain/security access, `git --`, `supabase --`;
- unsafe true execution emissions.

No dynamic import, computed require, `eval`, `Function`, worker, cluster, network, SQL, Git, Supabase, filesystem, environment, cwd, telemetry, persistence, runner, API, UI, browser, or Avanza side effect exists in the reviewed production boundary.

## Trust Boundary Map

- Spawn-session capability: fixture-only, module-provenance checked, session bound, expiry bound, no PID/PGID/command/argv/cwd/env/credential/permission fields.
- Executable fixture authority: fixture-only, resolver-evidence linked, exact tool bound, `authoritativeLive: false`, `enablesProcessStart: false`.
- Repository fixture authority: fixture-only, cannot enable cwd, Git operation, or process start.
- Authorization link: fixture-only, exact operation/session bound, fingerprinted, `authorizationConsumed: false`, `authorizesLiveSpawn: false`.
- Request: exact kind/version/policy/session/operation/capability/link/attempt/retry/fingerprint schema.
- Plan/evidence: emitted internally, frozen, sanitized, no live authority.

## Identity Review

Confirmed identity:

- `driverKind: direct_spawn_driver_boundary`
- `driverId: ture.execution.direct-spawn-driver-boundary.fixture.v1`
- `platform: macos`
- `implementationMode: fixture_only`
- `executionModel: direct_spawn`
- `shellMode: forbidden`
- `sourceModel: injected_fixture`
- `policyVersion: 1`

The identity object is deeply frozen and fingerprinted. There is no generic identity factory and no caller-selected platform, live mode, shell mode, or policy version. Future live implementation requires a separate identity and review.

## Policy Review

Confirmed policy: `first_live_read_only_direct_spawn_v1`.

The policy is deeply frozen, exact, one-shot, no-retry, one-active-process-only, shell-forbidden, arbitrary-command forbidden, arbitrary-executable-path forbidden, arbitrary-argv forbidden, arbitrary-cwd forbidden, environment-inheritance forbidden, environment-overrides forbidden, credential-injection forbidden, stdin forbidden, bounded-output required, exact timeout/termination/observer linkage required, exact authorization linkage required for future live use, exact session/freshness required, fixture spawn forbidden, PID/PGID forbidden, signals forbidden, authorization consumption forbidden, and runner enablement forbidden.

Unknown policy state fails closed.

## Operation Registry Review

Confirmed operations:

| Operation | Tool | Argv | Repository required |
| --- | --- | --- | --- |
| `collect_git_version` | `git` | `["--version"]` | false |
| `collect_supabase_cli_version` | `supabase_cli` | `["--version"]` | false |

Each operation binds exact tool identity, exact immutable argv tuple, `workingDirectoryMode: none`, `environmentMode: empty_exact`, `environmentKeys: []`, `inheritsParentEnvironment: false`, `stdinPolicy: closed`, bounded sanitized stdout/stderr, exact output limits, UTF-8, binary reject, truncation fail-closed, exact timeout policy, parser policy, termination policy, observer policy, and `credentialRequirement: none`.

The registry and returned argv tuples are deeply frozen. Operation substitution, tool substitution, argv substitution, aliases, and generic command operations fail closed.

## Capability Provenance Review

Module-private `WeakSet` stores protect spawn sessions, executable fixture authorities, repository fixture authorities, and authorization links. There is no exported registration method. The original object is frozen before registration. Plain-object forgery, spread clones, JSON clones, structured clones, cross-type substitution, cross-session substitution, and mutation after issuance are rejected or rendered inert.

Nested trust-critical values are frozen where present. Capabilities remain fixture-only and cannot issue live spawn authority.

## Authorization-Link Review

The fixture authorization link is named with fixture/nonlive qualification and is exact-operation bound, exact-session bound, fingerprint bound, fixture-only, non-consuming, and unable to authorize live spawn. It contains no token, secret, credential, cookie, session, BankID material, raw authorization payload, or live permission. Compatibility does not equate a valid link with authority to execute.

## Request Review

The request schema is exact and fingerprinted. It requires request kind/version, request ID, boundary session, driver identity fingerprint, policy ID, operation, spawn-session capability, executable fixture authority, optional repository authority, authorization link, requested time, expiry, attempt `1`, and retry `none`.

Unknown top-level fields and nested prohibited input fail closed. Action 530 corrected plan/evidence blocking reasons so low-level validator details cannot leak outside the closed `DirectSpawnBlockingReason` vocabulary.

## Argv Review

Argv is derived only from the operation registry. It is exact, ordered, immutable, not caller supplied, never joined into a command string, never shell interpolated, never environment interpolated, and rejects response-file syntax, wildcards, empty arguments, NUL, newline, shell metacharacters, command substitution, and fullwidth shell-like punctuation.

Returned plan argv is frozen and cannot mutate future plans or registry policy.

## Shell-Denial Review

Shell denial exists at identity, policy, request, plan, result, and compatibility levels. No shell command string is constructed. No `/bin/sh`, `/bin/bash`, `/bin/zsh`, `sh -c`, `bash -c`, `zsh -c`, `cmd.exe`, or PowerShell invocation exists.

## Cwd Review

Both operations require no repository working directory and produce `workingDirectory: null`. No process cwd, repository path, executable parent, home directory, root directory, temporary directory, or caller path is used. Unexpected repository authority blocks.

## Environment Review

The environment model is exact and empty:

- `environmentMode: empty_exact`
- `environmentKeys: []`
- `inheritsParentEnvironment: false`

No `process.env`, `PATH`, `HOME`, locale, temp directory, token, credential, or caller environment override is used.

## Credential Review

Both operations require `credentialRequirement: none`. The boundary does not access Keychain, Git credentials, Supabase access tokens, service-role keys, cookies, sessions, BankID material, placeholder secrets, or cleanup actions. Action 530 strengthened unknown-field scanning to reject sensitive-looking string values, including JWT-shaped values, in untrusted unknown input.

## Stdio Review

stdin remains closed. stdout/stderr are modeled as bounded sanitized capture policies only. There is no inherited stdio, TTY, input pipe, live output stream, file redirection, callback, output destination, console passthrough, or live buffer.

## Output-Policy Review

Output limits are exact and immutable:

- stdout: 16 KiB;
- stderr: 16 KiB;
- combined: 32 KiB;
- encoding: UTF-8;
- binary output: reject;
- truncation: fail closed.

The values are included in operation and plan fingerprints. No actual output string is required or captured.

## Timeout Review

Timeout policy: `first_live_read_only_version_command_timeout_v1`.

Timeout is required and caller cannot override it. No timer is scheduled. Unknown timeout states remain fixture-only and cannot imply live elapsed time.

## Termination-Policy Review

Termination policy: `first_live_read_only_timeout_termination_required_v1`.

Fixture result values remain:

- `terminationAttempted: false`
- `signalsSent: false`
- `terminationVerifiedLive: false`

No signal, PID, PGID, kill mode, grace-period override, or termination callback is accepted.

## Observer-Policy Review

Observer policy: `first_live_read_only_no_expected_children_v1`.

The observer is linked structurally only. It is not invoked, no process capability is created, no PID/PGID is accepted, and no containment or termination evidence is generated.

## Lifecycle Review

Compatible plans end at `fixture_execution_not_started`. Blocked and ambiguous plans use fixture-qualified lifecycle/disposition values. Live-running states such as spawned, running, PID-created, completed-live, or terminated-live are absent.

## Authority Review

Only `fixture_structural_only` is reachable. Caller-supplied authority is rejected. Authorization links, complete plans, matching fingerprints, and compatibility summaries do not elevate authority. The exported type union contains a future live label, but no constructor or reachable branch emits live authority.

## Completeness Review

Completeness is derived from validation and ambiguity reasons. It covers spawn-session capability, executable authority, repository authority where required, authorization link, operation binding, output policy, timeout policy, termination policy, observer policy, freshness, and session consistency. Caller completeness is rejected. Complete fixture structure remains nonauthoritative.

## Freshness and Session Review

All time is injected through source-controlled timestamps/evaluation inputs. No ambient time is read. Capabilities, links, requests, plans, and evidence are session bound. Expired capabilities and requests reject. Cross-session and authorization-operation mismatches reject. The boundary does not claim durable replay prevention.

## Recursive-Input Review

The prohibited-input scanner is cycle safe, depth bounded, object-count bounded, array-aware, and recursively checks unknown fields. It rejects nested prohibited keys, prohibited keys inside arrays, excessive depth, excessive object count, functions/symbols, and sensitive-looking string values in unknown fields. It does not perform uncontrolled recursion.

## Evidence-Sanitization Review

Plans and evidence exclude executable path, repository path, environment, credentials, raw authorization data, PID, PGID, command strings, shell strings, live stdout/stderr, raw signal data, and arbitrary metadata. Exact internally emitted false fields are:

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

Disposition names remain fixture-qualified and no bare `ready`, `authorized`, `executable`, `started`, or `completed` status is emitted.

## Fingerprint Review

Reviewed 12 fingerprint domains: identity, policy, operation, spawn-session capability, executable fixture authority, repository fixture authority, authorization link, request, plan, evidence, compatibility, and result.

All use deterministic SHA-256 with domain-separated canonical serialization. Mutation tests cover identity, operation, tool, argv, policy, request, capabilities, authorization link, plan, evidence, and result behavior. Execution-critical fields are included through exact object fingerprinting. No secret or ambient value is included.

## Canonicalization Review

Canonical serialization sorts object keys and preserves array order. Cyclic unsupported input fails closed during safe fingerprint validation. Sparse/unsupported and malicious unknown input cannot become live execution authority. Canonicalization does not collapse operation definitions or argv vectors in tested paths.

## Compatibility Review

Compatibility was reviewed with:

- trusted resolver;
- process executor;
- live-driver design;
- process observer;
- CLI-version collector;
- credential boundary;
- authorization;
- runner.

Compatibility fields are structural and informational only. They explicitly report `enablesExecution: false`, `enablesProcessStart: false`, and `enablesPreflightRunner: false`.

## Server-Only Review

`lib/post-trade-direct-spawn-driver-boundary.ts` starts with `import "server-only";`. No API route, Trade UI file, client file, runner, or shared client-safe barrel imports the runtime boundary. The pure core contains no live authority or side effects.

## Side-Effect Review

No production direct-spawn module performs process spawn, shell invocation, PID/PGID creation, signal delivery, timeout scheduling, observer invocation, filesystem access, PATH access, environment access, cwd access, credential access, Keychain access, Git/Supabase execution, SQL, network access, persistence, telemetry, authorization consumption, runner invocation, API invocation, UI mutation, browser automation, or Avanza automation.

## Immutability Review

Identity, policy, operation registry, argv tuples, capabilities, authorization links, requests, plans, evidence, compatibility, result, and reason arrays are deeply frozen. Direct property assignment and array mutation attempts fail in tests. Repeated identical input produces deep-equal deterministic results.

## Test Review

Action 529 had 336 focused direct-spawn tests covering exact identity, policy, operations, request validation, capability provenance, clone resistance, argv rejection, output/timeout state fixtures, no-execution evidence, compatibility, fingerprints, and generated invariants.

Action 530 added 13 focused security-review tests covering production dependency absence, unsafe true emission absence, server-only isolation, API/UI unwired state, operation and argv immutability, plan argv immutability, plain/spread/JSON/structured clone rejection, cross-type substitution, cross-session substitution, closed blocking reasons, sensitive unknown string rejection, recursive scanner arrays/cycles/depth/object-count bounds, Unicode argv smuggling, operation/tool substitution, compatibility not becoming readiness, and deterministic identity/fingerprint behavior.

Focused direct-spawn tests: 349.

Broader post-trade suite: 1861 passed.

Full `npm run lint` remains blocked by unrelated generated `.netlify` artifacts. Scoped lint for the Action 529/530 source and tests passed.

## Documentation Review

Reviewed docs accurately distinguish fixture spawn-plan compatibility from live execution authority. Action 530 docs preserve the statement that no process is spawned, no version command is run, no live output is captured, no PID/PGID is created, no timeout is scheduled, no signal is sent, no termination is verified, no observer is invoked, no authorization is consumed, no credentials are accessed, no runner is enabled, and no live staging preflight can execute.

## Findings Table

| ID | Severity | Area | Finding | Evidence | Correction | Status |
| --- | --- | --- | --- | --- | --- | --- |
| DS-530-001 | Medium | Blocking reason vocabulary | Low-level validator details such as malformed fingerprint and unknown-field strings could be cast into `DirectSpawnBlockingReason` in generated plans/evidence. This did not enable execution, but weakened the closed-code fail-closed contract. | `createFixturePlan` and `validationErrors` cast raw validator errors to blocking reasons. | Added closed mapping to `request_invalid` for non-enumerated validator details and regression coverage. | Closed |
| DS-530-002 | Low | Unknown-field sensitive value scan | Recursive scanner rejected prohibited key names, but unknown fields with sensitive-looking string values were not independently rejected unless the key was prohibited. | `hasUnsafeInput` inspected keys and recursion only. | Added sensitive-string/JWT-shaped value detection for unknown input and regression coverage. | Closed |
| DS-530-003 | Low | Unicode argv smuggling | ASCII shell metacharacter rejection did not explicitly include fullwidth shell-like punctuation. | `hasUnsafeArgv` ASCII regex. | Added fullwidth semicolon, vertical bar, and ampersand rejection and regression coverage. | Closed |

Critical: none.
High: none.
Medium: one, closed.
Low: two, closed.
Informational: future live driver still requires separate implementation and review.

## Corrections Made

- Closed generated plan/evidence blocking reasons to the declared `DirectSpawnBlockingReason` vocabulary.
- Added sensitive-looking string detection for unknown untrusted input.
- Added Unicode shell-like punctuation rejection for argv validation.
- Added a dedicated Action 530 regression/security-review suite.

No live execution capability was added.

## Mandatory Security Assertions

All 66 mandatory assertions passed. False assertions: none. Uncertain assertions: none.

## Residual Risks

- A future live direct-spawn driver still needs a separate exact identity, implementation, static/security review, staging execution gate, credential boundary, observer integration, timeout/termination implementation, and final live gate.
- The fixture boundary models policy and compatibility only; it does not prove live executable existence, PATH behavior, macOS spawn behavior, CLI output format, or TOCTOU safety.

## Final Decision

`post_trade_direct_spawn_driver_boundary_first_live_staging_preflight_static_security_review_approved`

## Result Status

`post_trade_direct_spawn_driver_boundary_first_live_staging_preflight_static_security_review_completed`

## Recommended Next Action

Action 531 - Implement Credential Source Adapter Boundary, Without Live Credential or Keychain Access

## Commit / Deploy

No commit or deploy is recommended for Action 530.
