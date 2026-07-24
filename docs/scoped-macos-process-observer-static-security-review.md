# Scoped macOS Process Observer Static/Security Review

## Executive Summary

Action 526 reviewed the Action 525 scoped macOS process observer boundary. The reviewed boundary remains deterministic, fixture-only, server-only at the runtime boundary, and unable to inspect live processes, enumerate processes, accept raw PID/PGID authority, start processes, terminate processes, prove live containment, prove live termination, enable the runner, consume authorization, or persist evidence.

The review found three correctable trust-semantics defects. They were fixed in source and covered by new regression tests before approval:

- capability provenance was structurally cloneable;
- prohibited process-identifier keys were only scanned at the top level;
- direct graph relationships could imply a child without requiring that child in the direct-child observation set.

Final review decision: approved.

## Reviewed Commit/Worktree State

Reviewed as an in-progress local worktree for Action 526. No commit or deploy was performed or recommended.

## Files Reviewed

- `lib/post-trade-scoped-macos-process-observer-core.ts`
- `lib/post-trade-scoped-macos-process-observer.ts`
- `tests/e2e/post-trade-scoped-macos-process-observer.spec.ts`
- `docs/scoped-macos-process-observer-boundary.md`
- `docs/scoped-macos-process-observer-checkpoint.md`
- `docs/ture-agent-dev-chat-3-continuation-summary.md`

## Architecture Summary

The implementation models a scoped macOS process observer as fixture-only structural evaluation. It accepts source-controlled fixture capabilities, a scoped request, and an injected fixture graph. It returns sanitized structural evidence and compatibility metadata. It does not create a live observer, live resolver, process runner, shell command path, direct macOS process API, authorization consumer, database path, API route, UI route, or runtime runner path.

## Trust-Boundary Map

- Capability factory boundary: issues module-private trusted fixture capabilities.
- Request boundary: requires exact observer identity, exact policy, matching trusted capabilities, freshness, and no retry.
- Fixture boundary: requires fixture-only, non-live, nonauthoritative evidence and matching request/capability/session identifiers.
- Graph boundary: derives descendants and direct children from relationships, rejects contradictions, unknown semantics, detachments, process-group escapes, daemonization, and missing modeled child evidence.
- Evidence boundary: returns only sanitized labels and structural classifications.
- Server boundary: imports `server-only`, exports fixture-only metadata and injected fixture adapter wiring only.

## Export Inventory

67 exported const/type/function surfaces were reviewed across the core and server modules. The public exports include identity, policy, capability/request/fixture/result types, fixture builders, validators, fingerprint helpers, an injected fixture adapter builder, and server-only boundary constructors. No export provides live process lookup, raw PID/PGID translation, process enumeration, signals, process start, termination, PATH/filesystem inspection, environment access, Git/Supabase commands, SQL, authorization consumption, API wiring, UI wiring, or runner activation.

## Dependency Review

Production observer modules import only:

- `node:crypto` for deterministic SHA-256 fingerprints;
- the source-controlled boundary session constant;
- `server-only` in the server boundary.

No prohibited production imports or calls were found after corrections: no `child_process`, macOS process APIs, process enumeration tools, shell helpers, filesystem APIs, network APIs, workers, timers, environment reads, Git/Supabase/version commands, SQL, or persistence.

## Identity Review

Observer identity is exact and fingerprinted:

- `observerKind: scoped_macos_process_observer`
- `observerId: ture.execution.scoped-macos-process-observer.fixture.v1`
- `platform: macos`
- `implementationMode: fixture_only`
- `sourceModel: injected_fixture`
- `policyVersion: 1`

The identity is immutable and domain-separated from other fingerprints.

## Policy Review

Policy identity is exact:

- `first_live_read_only_no_expected_children_v1`
- operation: `observe_scoped_process_lifecycle`
- platform: `macos`
- retry policy: `none`
- expected-child policy: `no_children_expected`

No policy merging, inheritance, or caller override path exists. Browser, GUI, URL opener, credential helper, unknown child, detached descendant, process-group escape, and daemonization indicators fail closed. Fixture evidence cannot prove containment, cannot prove termination, cannot start processes, and cannot enable the runner.

## Capability Review

Two capability types were reviewed:

- process-instance fixture capability;
- process-group fixture capability.

Corrections made in Action 526 add module-private `WeakSet` runtime provenance for both capability types. This means a caller can no longer clone the public fields and rehash the object into a trusted capability. Process and group capabilities remain noninterchangeable, exact-session-bound, expiry-bound, fingerprinted, fixture-only, and non-live.

## Request Review

Requests require exact identity, policy, operation, boundary session, trusted process capability, trusted process-group capability, freshness, no retry, and `no_children_expected`. Unknown fields, sensitive material, raw process identifiers, forbidden control semantics, and cloned capabilities are rejected.

## Fixture Review

Fixtures are required to be:

- fixture-only;
- not observed live;
- not authoritative live;
- session-bound;
- request-bound;
- capability-bound;
- fresh within the modeled window;
- sanitized.

The recursive prohibited-key scan now rejects raw process/control claims nested in request, fixture, or capability-shaped inputs while allowing legitimate fixture schema fields such as modeled completeness.

## Graph Review

Graph validation checks node references, relationship edges, duplicate refs, duplicate edges, cycles, depth, semantic classifications, group mismatch, and derived descendants. Action 526 added direct-child relationship consistency so a child edge from the parent must appear in `childObservationSet.directChildNodeRefs`; otherwise the fixture is marked incomplete.

## Classification Review

Parent, direct child, descendant, process-group, detachment, escape, semantic, daemonization, and termination classifications fail closed or ambiguous. Complete no-child fixtures can be structurally compatible only as fixture evidence, never live authority.

## Authority Review

Authority is fixed to `fixture_structural_only`. Callers cannot elevate fixture output to live authority. Fixture compatibility cannot become live readiness.

## Completeness Review

Completeness is derived from graph, observation-set completeness, parent state, descendant state, process-group state, and ambiguity/blocking reasons. Incomplete empty child evidence remains ambiguous and does not mean zero children.

## Freshness Review

Capabilities, requests, and fixture windows use injected timestamps and exact ISO strings. Expiry is enforced without `Date.now`, ambient clocks, timers, or runtime observation.

## Session Review

Capabilities, requests, fixtures, and results are bound to the exact boundary session. Cross-session substitutions and mismatched capability links fail validation.

## Containment-Evidence Review

Containment evidence is sanitized and fixture-only:

- `provesContainment: false`
- `liveContainmentChecked: false`
- `runnerStartAuthorized: false`
- `signalsSent: false`

It does not contain raw PID/PGID/process names/paths/command lines.

## Termination-Evidence Review

Termination evidence is sanitized and fixture-only:

- `provesTermination: false`
- `terminationVerifiedLive: false`
- `credentialCleanupVerifiedLive: false`
- `signalsSent: false`

It cannot prove live termination or credential cleanup.

## Fingerprint Review

Ten fingerprint domains were reviewed: identity, policy, process-instance capability, process-group capability, request, fixture, containment evidence, termination evidence, compatibility, and result. Canonicalization is key-order stable and domain-separated. Fingerprints cover session binding, policy binding, request binding, evidence posture, compatibility posture, and result posture. The review found no remaining fingerprint omission after corrective tests covered result changes for blocked vs compatible evidence.

## Compatibility Review

Compatibility is informational only for:

- process executor;
- live-driver design;
- trusted resolver;
- CLI-version collector;
- credential boundary;
- authorization;
- runner.

Compatibility does not enable live execution, process start, runner execution, authorization consumption, credential access, or command execution.

## Server-Only Review

The server boundary imports `server-only`. It is not imported by the API validation route or Trade UI. The core remains pure/static and contains no runtime live observer.

## Side-Effect Review

The observer boundary performs no live process observation, process enumeration, process start, process termination, signals, filesystem/PATH inspection, environment reads, credential reads, Git/Supabase/version commands, SQL, persistence, authorization consumption, API wiring, UI wiring, runner wiring, browser automation, or Avanza automation.

## Test Review

314 existing Action 525 tests were reviewed. Action 526 added 18 focused security-review regression tests covering clone resistance, noninterchangeability, recursive prohibited-key rejection, direct-child graph completeness, nonauthoritative evidence, incomplete empty child evidence, semantic fail-closed behavior, compatibility non-enablement, fingerprint posture, live-claim rejection, prohibited implementation dependencies, prohibited live-proof semantics, and API/UI unwired status.

## Documentation Review

Action 525 documentation was consistent with fixture-only behavior. Action 526 documentation records the defects found, corrections made, and remaining no-live/no-run boundaries.

## Findings Table

| ID | Severity | Area | Finding | Evidence | Correction | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F-526-001 | High | Capability provenance | Public capability fields plus fingerprint/provenance string were cloneable, so structural clones could validate as trusted capabilities. | Static review of `validateProcessInstanceCapability` and `validateProcessGroupCapability`. | Added module-private `WeakSet` provenance registration in capability factories and validator checks. | Resolved |
| F-526-002 | High | Raw process input rejection | Raw process/control keys were checked only at the top level. Nested payloads could carry PID/PGID/command/path-like claims until unknown-field checks caught only some cases. | Static review of `hasProhibitedProcessInput`. | Replaced top-level check with recursive traversal and regression tests for request, fixture, process capability, and group capability inputs. | Resolved |
| F-526-003 | Medium | Graph completeness | A direct child edge from parent to child could be omitted from `childObservationSet.directChildNodeRefs`, weakening modeled direct-child completeness semantics. | Static review of `validateGraph`. | Added derived direct-child consistency validation and regression test. | Resolved |
| F-526-004 | Informational | Runtime readiness | The observer is structurally compatible with future layers but is not live-ready and must not be used as proof of containment or termination. | Architecture and compatibility review. | Documented as residual risk/future gate. | Accepted |

Critical findings: zero.
High findings: 2 resolved.
Medium findings: 1 resolved.
Low findings: zero.
Informational findings: 1 accepted.

## Corrections Made

- Added private runtime provenance registries for process-instance and process-group capabilities.
- Required validators to reject capability clones with untrusted runtime provenance.
- Added recursive prohibited-process/control-key scanning.
- Added direct-child edge-to-observation-set consistency checks.
- Added `tests/e2e/post-trade-scoped-macos-process-observer-security-review.spec.ts` with 18 security regression tests.

## Residual Risks

- The observer remains fixture-only and cannot establish live process containment or termination.
- A future live resolver/observer adapter still requires a separate design, implementation, static/security review, and live gate.
- Compatibility evidence is not readiness evidence and must remain non-enabling.
- Fingerprints are deterministic integrity signals, not secrets or live authority tokens.

## Security Assertions

All 35 mandatory assertions passed after corrections:

1. The observer cannot inspect live processes: true.
2. The observer cannot enumerate processes: true.
3. The observer cannot accept arbitrary PID: true.
4. The observer cannot accept arbitrary process-group ID: true.
5. The observer cannot send signals: true.
6. The observer cannot start processes: true.
7. The observer cannot terminate processes: true.
8. The observer cannot read PATH: true.
9. The observer cannot inspect the filesystem: true.
10. The observer cannot read environment values: true.
11. The observer cannot access credentials: true.
12. The observer cannot run Git: true.
13. The observer cannot run Supabase: true.
14. The observer cannot execute SQL: true.
15. The observer cannot persist evidence: true.
16. The observer cannot consume authorization: true.
17. The observer cannot enable the runner: true.
18. The observer cannot enable process start: true.
19. Fixture evidence cannot prove containment: true.
20. Fixture evidence cannot prove termination: true.
21. Fixture evidence cannot become authoritative live evidence: true.
22. Incomplete child evidence cannot mean no child: true.
23. Incomplete descendant evidence cannot mean no descendant: true.
24. Detached descendants fail closed: true.
25. Process-group escapes fail closed: true.
26. Browser/GUI/opener/helper children fail closed: true.
27. Unknown children fail closed: true.
28. Daemonization indicators fail closed: true.
29. Authority is not caller controlled: true.
30. Completeness is not caller controlled: true.
31. Capabilities are session and expiry bound: true.
32. Fingerprints cover all trust-critical fields: true.
33. Server-only runtime exports remain client inaccessible: true.
34. Compatibility cannot become readiness: true.
35. No live runtime wiring exists: true.

No failed or uncertain assertions remain.

## Final Decision

Approved.

Decision:

`post_trade_scoped_macos_process_observer_first_live_staging_preflight_static_security_review_approved`

Result status:

`post_trade_scoped_macos_process_observer_first_live_staging_preflight_static_security_review_completed`

Recommended next action:

Action 527 - Implement Trusted Live Resolver Adapter Boundary, Without Live Filesystem or PATH Resolution.

Commit/deploy recommendation:

No commit or deploy is recommended for Action 526.
