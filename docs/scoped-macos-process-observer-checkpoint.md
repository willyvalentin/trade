# Action 525 Checkpoint - Scoped macOS Process Observer Boundary

## Scope Implemented

Action 525 implemented a source-controlled fixture-only scoped macOS process-observer boundary for the future first live read-only staging preflight. It models observation requests, opaque capabilities, fixture snapshots, relationship classification, sanitized containment evidence, sanitized termination-verification evidence, compatibility summaries, deterministic fingerprints, and an inert future observer plan.

No live process observation or process execution exists.

## Files Created

- `lib/post-trade-scoped-macos-process-observer-core.ts`
- `lib/post-trade-scoped-macos-process-observer.ts`
- `tests/e2e/post-trade-scoped-macos-process-observer.spec.ts`
- `docs/scoped-macos-process-observer-boundary.md`
- `docs/scoped-macos-process-observer-checkpoint.md`

## Files Modified

- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Observer Identity

Exact observer identity:

- observer ID: `ture.execution.scoped-macos-process-observer.fixture.v1`
- platform: `macos`
- implementation mode: `fixture_only`
- source model: `injected_fixture`
- policy version: `1`

## Observer Policy

Exact policy ID: `first_live_read_only_no_expected_children_v1`

Policy outcome:

- one active process only
- no retry
- no children expected
- no descendants expected
- no detached descendants
- no process-group escape
- no browser, GUI, URL opener, credential helper, daemon, or unknown child
- exact same-session capabilities
- complete fixture structure required
- fixture evidence cannot prove containment
- fixture evidence cannot prove termination
- fixture evidence cannot enable process start
- fixture evidence cannot enable the preflight runner

## Capability Types

Process-instance capability:

- opaque fixture capability
- no PID or PPID
- no process name
- no executable name or path
- no command line
- session-bound
- expiry-bound
- SHA-256 fingerprinted

Process-group capability:

- opaque fixture capability
- no PGID
- linked to the process-instance capability
- session-bound
- expiry-bound
- SHA-256 fingerprinted

## Request Contract

The request requires:

- exact request kind/version
- exact observer identity fingerprint
- exact policy ID
- exact operation `observe_scoped_process_lifecycle`
- exact attempt `1`
- retry policy `none`
- expected-child policy `no_children_expected`
- one process-instance capability
- one linked process-group capability
- same boundary session
- injected time for freshness

It rejects arbitrary PID, PPID, PGID, UID, process name, executable name, executable path, command line, process query, global enumeration, caller-provided authority, caller-provided completeness, containment proof, termination proof, process-start permission, signal permission, and runner enablement.

## Relationship Model

Fixture process nodes use `fixture_process_node_*` references only. They are not PIDs.

The model validates:

- node uniqueness
- edge uniqueness
- missing references
- cycles
- self-parenting
- multiple parent assignments
- direct children
- transitive descendants
- process-group membership
- detached descendants
- process-group escape
- daemonization indicators

## Authority Model

Action 525 authority is always:

`fixture_structural_only`

The observer cannot create `live_non_authoritative` or `live_authoritative` results.

## Completeness Model

Completeness is derived from fixture structure and policy requirements. It can be complete, incomplete by domain, incomplete in multiple domains, contradictory, or unsupported.

Complete fixture structure does not imply live completeness or live authority.

## Evidence Schemas

Containment evidence always states:

```text
fixtureOnly: true
observedLive: false
authoritativeLive: false
provesContainment: false
```

Termination-verification evidence always states:

```text
fixtureOnly: true
observedLive: false
authoritativeLive: false
provesTermination: false
terminationVerifiedLive: false
```

Result evidence always states:

```text
enablesProcessStart: false
enablesPreflightRunner: false
```

## Fingerprint Domains

- `ture:scoped-macos-process-observer:identity:v1`
- `ture:scoped-macos-process-observer:policy:v1`
- `ture:scoped-macos-process-observer:process-instance-capability:v1`
- `ture:scoped-macos-process-observer:process-group-capability:v1`
- `ture:scoped-macos-process-observer:request:v1`
- `ture:scoped-macos-process-observer:fixture:v1`
- `ture:scoped-macos-process-observer:containment-evidence:v1`
- `ture:scoped-macos-process-observer:termination-evidence:v1`
- `ture:scoped-macos-process-observer:compatibility:v1`
- `ture:scoped-macos-process-observer:result:v1`

## Compatibility Outcomes

- Process executor: structurally compatible.
- Live-driver design: structurally compatible but not live-driver enabling.
- Trusted resolver: compatible and not a resolver replacement.
- CLI-version collector: compatible and does not run version commands.
- Credential boundary: compatible and no credential access.
- Authorization: compatible and no issue or consumption.
- Runner: structurally compatible but not live-runner enabling.

## Tests

Added `tests/e2e/post-trade-scoped-macos-process-observer.spec.ts` with 314 tests covering identity, policy, capabilities, requests, fixture flags, graph validation, parent state, child/descendant classifications, group membership, detached descendants, process-group escape, browser/GUI/opener/helper classifications, daemonization, completeness, freshness, evidence sanitization, fingerprints, compatibility, prohibited APIs, prohibited imports, server-only boundary, immutability, and end-to-end fixture scenarios.

## Validation

Validation run for this action:

- `./node_modules/.bin/tsc --noEmit`
- Action 525 scoped lint
- `npx playwright test tests/e2e/post-trade-scoped-macos-process-observer.spec.ts --reporter=dot`
- broader post-trade static/model suites
- `git diff --check`
- quiet `.env.local` diff guard
- `find docs -type f -size 0`
- informational repository-wide `npm run lint`

## Safety Confirmation

No live process observation exists.

No process execution exists.

No runner, API, UI, runtime, browser, or Avanza wiring exists.

No process tree was inspected. No process was enumerated. No raw PID or process-group ID was looked up. No `child_process`, shell, signal handling, process start, process termination, filesystem inspection, PATH inspection, environment read, credential access, Git command, Supabase command, SQL, persistence, authorization consumption, deployment, browser automation, or Avanza automation occurred.

## Decision

`post_trade_scoped_macos_process_observer_first_live_staging_preflight_ready_for_static_security_review`

## Result Status

`post_trade_scoped_macos_process_observer_first_live_staging_preflight_added_no_live_observation`

## Recommended Next Action

Action 526 - Perform Static and Security Review of Scoped macOS Process Observer Boundary.

## Commit / Deploy

No commit or deploy is recommended for Action 525.
