# Scoped macOS Process Observer Boundary

## Purpose

Action 525 adds a deterministic, source-controlled, fixture-only scoped macOS process-observer boundary for a future first-live read-only staging preflight. It models future process observation without observing real processes.

The boundary exists to keep future live-process work separated from structural policy design. It can validate fixture structure, classify modeled fixture relationships, and produce sanitized fixture evidence. It cannot observe a live process tree, enumerate processes, send signals, terminate processes, start processes, enable the preflight runner, persist evidence, or consume authorization.

## Trust Boundary

Trusted source-controlled artifacts:

- Exact observer identity.
- Exact observer policy registry.
- Fixture-only capability factories.
- Strict request and fixture validators.
- Pure classification functions.
- Sanitized containment and termination evidence builders.
- Deterministic fingerprint domains.
- Compatibility summaries.

Fixture-only artifacts:

- Process-instance capabilities.
- Process-group capabilities.
- Observation requests.
- Fixture snapshots.
- Fixture adapter results.
- Containment and termination-verification evidence.

Never caller selectable:

- Observer identity.
- Platform.
- Implementation mode.
- Source model.
- Policy version.
- Authority classification.
- Completeness classification.
- Process-start or runner enablement.
- Containment or termination proof.

Every Action 525 result is:

```text
fixtureOnly: true
observedLive: false
authoritativeLive: false
provesContainment: false
provesTermination: false
enablesProcessStart: false
enablesPreflightRunner: false
```

## Observer Identity

Exact observer ID: `ture.execution.scoped-macos-process-observer.fixture.v1`

Exact identity fields:

- `observerKind: scoped_macos_process_observer`
- `platform: macos`
- `implementationMode: fixture_only`
- `sourceModel: injected_fixture`
- `policyVersion: 1`

A future live observer must use a different exact identity and must be implemented in a separate reviewed action.

## First-Live Policy

Exact policy ID: `first_live_read_only_no_expected_children_v1`

The policy is fail-closed:

- One active process only.
- No retries.
- No children expected.
- No descendants expected.
- Exact boundary session required.
- Exact process-instance capability required.
- Process-group capability required where applicable.
- Fresh same-session evidence required.
- Complete parent, direct-child, descendant, and process-group fixture structure required.
- Detached descendants are not allowed.
- Process-group escape is not allowed.
- Browser, GUI, URL opener, credential helper, daemon candidate, and unknown children are not allowed.
- Fixture evidence cannot prove containment or termination.
- Fixture evidence cannot enable process start or the runner.

No expected-child approval or allowlist is introduced by Action 525.

## Capability Scope

The observer accepts only opaque capabilities produced by fixture-only factories.

Process-instance capability:

- No raw PID.
- No raw PPID.
- No process name.
- No executable name.
- No command line.
- Session-bound.
- Expiring.
- Fingerprinted.
- Fixture-only.

Process-group capability:

- No raw PGID.
- Linked to the process-instance capability.
- Session-bound.
- Expiring.
- Fingerprinted.
- Fixture-only.

Raw PIDs and process-group IDs are excluded because they would cross the trust boundary as ambient operating-system authority. The public boundary models only opaque fixture references and sanitized fingerprints.

## Observation Model

The fixture relationship model uses `fixture_process_node_*` references, never operating-system PIDs.

Modeled concepts:

- Parent state.
- Direct-child state.
- Descendant state.
- Process-group membership.
- Detached descendants.
- Process-group escape.
- Browser, GUI, URL opener, credential helper, daemon, generic, and unknown semantic classifications.
- Daemonization patterns.
- Unknown-child handling.
- Graph integrity.
- Completeness and freshness.

All direct children are also descendants for aggregate policy assessment. Any modeled child or descendant blocks under the first-live policy unless it is incomplete or ambiguous, in which case the result remains non-authoritative and non-enabling.

## Structural Versus Live Semantics

| Property | Fixture observer after Action 525 |
| --- | --- |
| Validates fixture structure | Yes |
| Classifies modeled relationships | Yes |
| Observes live processes | No |
| Enumerates process tree | No |
| Proves containment | No |
| Proves termination | No |
| Sends signals | No |
| Starts processes | No |
| Enables live runner | No |
| Consumes authorization | No |

A structurally compatible fixture means only that the supplied fixture matched the source-controlled policy and no modeled violation was present. It does not mean any real process had no children, remained contained, terminated, avoided detached descendants, avoided process-group escape, avoided browser/helper processes, or is ready for live execution.

## Evidence Sanitization

Sanitized evidence excludes:

- Raw PID, PPID, PGID, UID.
- Process names.
- Executable names.
- Executable paths.
- Full command lines.
- Arbitrary process queries.
- Raw process listings.
- Environment values.
- Credentials, tokens, secrets, cookies, session material, private keys, BankID artifacts.
- Caller-provided `contained`, `terminated`, `safe`, authority, completeness, runner enablement, process-start permission, or signal permission.

Containment evidence uses `compatible_fixture`, `blocked_fixture`, or `ambiguous_fixture`; it never uses live-safety wording such as `contained`.

Termination-verification evidence uses modeled states such as `modeled_exited`; it never claims live termination.

## Authority And Completeness

Authority and completeness are separate.

Authority for Action 525 is always `fixture_structural_only`.

Completeness may be `complete_fixture_structure`, but complete fixture structure is not live completeness and does not create live authority. Missing or contradictory fixture structure blocks or becomes ambiguous.

## Fingerprints

All fingerprints use deterministic SHA-256 with canonical object-key ordering.

Domain separators:

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

Security-relevant field changes alter the relevant fingerprint. Fingerprints do not include secrets, raw process identifiers, raw process-group identifiers, or environment values.

## Compatibility

The observer is structurally compatible with:

- Process executor contracts.
- macOS live-driver design.
- Trusted executable and repository resolver boundary.
- CLI-version collector contracts.
- Credential boundary contracts.
- Authorization boundary contracts.
- Runner contracts.

Fixture compatibility does not enable process execution, direct spawn, credential cleanup, CLI-version collection, authorization issue/consumption, or preflight runner execution.

## Future Work

A future live observer requires a new action, static security review, dependency review, macOS API selection review, raw identifier containment review, authority review, completeness review, termination-verification review, staging-only validation, and final live gate approval.

Action 525 selects no live mechanism and imports no live observer dependency.

## Prohibitions

Action 525 does not inspect live process trees, enumerate real processes, use `ps`, use `pgrep`, send signals, terminate processes, start processes, spawn/fork processes, inspect PATH, inspect executable locations, inspect the filesystem, resolve repositories, inspect ownership/provenance/architecture/Rosetta state, read environment values, access credentials, access Keychain, run Git, run Supabase, run version commands, execute SQL, deploy, persist evidence, write to Supabase, consume authorization, create authorization, wire API/UI/runner/runtime behavior, wire browser automation, or wire Avanza automation.
