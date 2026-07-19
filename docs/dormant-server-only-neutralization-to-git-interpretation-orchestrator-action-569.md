# Action 569 - Dormant Server-Only Neutralization-to-Git-Interpretation Orchestrator

## Summary

Action 569 implemented a dormant server-only orchestration boundary that connects the approved one-shot spawn-to-raw-completion neutralization adapter to the approved pure Git-version interpretation contract.

The orchestrator remains dormant and is reachable only from focused tests. It does not execute Git or any executable, does not create, observe, control, or terminate a process, does not inspect direct-spawn stdout before neutralization, does not accept caller-provided raw evidence or version strings, does not evaluate Git compatibility, and does not add runtime, API, UI, runner, credential, environment, network, Avanza, trading, persistence, or deployment behavior.

## Files

Production files:

- `lib/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.ts`
- `lib/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator-core.ts`

Focused tests:

- `tests/e2e/post-trade-dormant-server-only-neutralization-to-git-interpretation-orchestrator.spec.ts`

## Module Graph

```text
server-only wrapper
  -> approved neutralization adapter
  -> pure orchestration core
       -> pure Git-version parser
       -> pure raw-completion/neutralization identities and types
```

The server-only wrapper has `import "server-only";` as its first effective import and exposes one intended production entry point:

```text
orchestrateOriginalFixedReadOnlyDirectSpawnGitVersionInterpretation
```

No barrel export, runtime caller, app route, UI component, runner, observer, credential, trading, persistence, or deployment path imports the wrapper.

## Production API

The production entry point accepts only the exact original `FixedReadOnlyDirectSpawnResult` object. It accepts no raw-completion evidence, neutralization result, stdout, stderr, byte counts, Git version string, executable, argv, lifecycle category, session, purpose, platform, policy, timestamps, grammar, normalization options, compatibility rules, dependency injection, parser injection, neutralizer injection, clock, test mode, or process handle.

The wrapper captures one internal orchestration timestamp with `new Date().toISOString()` and passes the neutralization result plus timestamp to the pure result-construction core. The caller cannot supply time.

## Mandatory Ordering

Implemented order:

1. receive original direct-spawn result;
2. invoke neutralization exactly once;
3. inspect only the closed neutralization result;
4. return terminal rejection if neutralization rejected;
5. return interpretation-not-attempted when accepted raw completion is not exact zero-exit parser-eligible Git completion;
6. invoke `buildPureGitVersionInterpretation` exactly once only when eligible;
7. return accepted or rejected interpretation result;
8. deep-freeze the orchestration result.

The orchestrator does not inspect source stdout before neutralization, does not parse output directly, does not normalize output, does not run stages concurrently, and does not retry or fallback.

## Source Eligibility

The orchestrator may receive any exact original source result that the neutralizer can consume. Interpretation is attempted only when accepted raw completion evidence is exactly:

- `completionCategory:"process_created_normal_zero_exit"`;
- `toolIdentity:"git"`;
- `canonicalExecutablePath:"/usr/bin/git"`;
- `argv:["--version"]`;
- `processCreated:true`;
- `processStartedObserved:true`;
- `exitObserved:true`;
- `exitCode:0`;
- `closeObserved:true`;
- `closeCode:0`;
- no signal;
- no stream error;
- no overflow;
- valid UTF-8;
- no unexpected chunks;
- no termination request;
- `retryCount:0`;
- `fallbackAttempted:false`;
- `observedLiveProcess:false`;
- `authority:"none"`;
- `runtimeActivated:false`;
- `toctouEliminated:false`.

All other accepted neutralization categories return `neutralization_succeeded_interpretation_not_attempted`.

## Result Union

The closed result statuses are:

- `neutralization_rejected`
- `neutralization_succeeded_interpretation_not_attempted`
- `neutralization_succeeded_interpretation_rejected`
- `neutralization_succeeded_interpretation_accepted`

Every result includes identity, policy, status, deterministic reason list, orchestration timestamp, source linkage, neutralization stage summary, raw-completion fingerprints/category, interpretation stage summary, parsed version fields only when accepted, no-authority flags, and a SHA-256 result fingerprint.

The result does not embed the original direct-spawn object, child handles, raw Node errors, stacks, environment details, private provenance markers, trust tokens, mutable callbacks, parser options, or compatibility decisions.

## Reason Model

Closed orchestration reasons:

- `input_rejected`
- `production_provenance_rejected`
- `already_consumed`
- `neutralization_rejected`
- `neutralization_internal_failure`
- `raw_completion_ineligible_for_interpretation`
- `interpretation_not_attempted`
- `interpretation_rejected`
- `interpretation_internal_failure`
- `interpretation_accepted`
- `source_linkage_rejected`
- `raw_completion_linkage_rejected`
- `interpretation_linkage_rejected`
- `authority_rejected`
- `runtime_claim_rejected`
- `unexpected_internal_failure`

Neutralizer and parser reasons are retained in separate stage fields. Free-form exceptions are not exposed.

## One-Shot Inheritance

The orchestrator inherits the neutralizer's one-shot source consumption. A successful accepted interpretation, parser rejection, interpretation-not-attempted path, and neutralization failure consume or reject according to the neutralizer's existing policy. A second call with the same source produces deterministic consumed/rejected output. No reset, replay, fallback, cached source capability, or second consumption registry was added.

## Stage Validation

The core validates stage outputs before constructing the final result:

- neutralization identity, version, status, SHA-256 fingerprint, no parser invocation, dormant/server-only classification, no authority, and no live claim;
- raw-completion accepted status, fixture classification, source fingerprint linkage, no authority, no runtime activation, no CLI interpretation, and no TOCTOU claim;
- parser identity, version, source raw-completion result/evidence fingerprint linkage, session/tool/purpose/policy linkage, accepted/rejected consistency, and no authority/runtime/deployment claim.

Any inconsistency fails closed.

## Linkage And Fingerprints

The orchestration result fingerprint binds:

- orchestration identity, policy, status, reason, and timestamp;
- source direct-spawn result/evidence/observation fingerprints where available;
- session, purpose, tool, platform, policy, executable, and argv linkage from raw evidence;
- neutralization status/reason/fingerprint;
- raw-completion result/evidence fingerprints and category;
- interpretation status/reason/result/evidence fingerprints;
- parsed version and components when accepted;
- all authority, runtime, compatibility, deployment, authorization-consumption, and TOCTOU fields.

Fingerprints provide deterministic evidence linkage only. They grant no provenance or authority.

Action 571 clarification: the orchestration result does not independently expose a standalone revalidation fingerprint. Revalidation lineage is transitively bound through the verified source direct-spawn result/evidence fingerprints and the neutralizer/raw-completion source-spawn linkage.

## Timestamp Model

The production wrapper captures exactly one internal orchestration timestamp. The pure core can build deterministic test results from a supplied timestamp, but the production API does not expose a clock or timestamp parameter. Orchestration time is evidence only and does not refresh source validity.

## Authority Posture

The orchestrator and result grant no process creation, process observation, process control, termination, CLI execution, Git-version authority, Git compatibility authority, credential, network, API, UI, runner, authorization-consumption, Avanza, trading, order, position, settlement, persistence, deployment, staging, execution, or production authority.

Accepted interpretation means only that an original privately verified source was consumed once and the neutralized raw output passed the strict Git parser.

## Failure Model

Failures return closed structured results. The orchestrator does not expose raw Node errors, stack traces, filesystem paths, OS details, child-process details, environment values, source output in error text, credentials, or internal provenance state. No partial parser fields survive rejected results.

## Test Seam

Tests use the existing source-isolated direct-spawn provenance bridge harness pattern. No production provenance minting, source registration, reset, neutralizer injection, parser injection, clock injection, dependency injection, test mode, or result fabrication hook was added.

## Runtime Unreachability

Static review found no API, UI, runner, cron, observer, credential, trading, persistence, or deployment caller. The orchestrator is not wired into runtime.

## Blockers Before Compatibility Policy

- Action 570 static security and contract review;
- remediation and final re-review if findings appear;
- separate Git-version compatibility policy planning and implementation;
- separate review that parser acceptance cannot become compatibility authority.

## Blockers Before Runtime Activation

- compatibility policy and review;
- runtime activation planning gate;
- authorization review;
- observer/timeout/termination readiness review;
- explicit no-credential/no-network review;
- separate deployment approval.

## Safety Confirmation

No product-chain executable was run. No process was created, observed, controlled, or terminated by production code. No live Git version was collected. No Git compatibility decision was made. No runtime, API, UI, runner, credential, environment, network, Avanza, trading, persistence, or deployment behavior was added.

## Decision

Decision: `post_trade_dormant_server_only_neutralization_to_git_interpretation_orchestrator_ready_for_static_security_review`

Result status: `post_trade_dormant_server_only_neutralization_to_git_interpretation_orchestrator_implemented_not_activated`

Recommended next Action: Action 570 - Static Security and Contract Review of Dormant Neutralization-to-Git-Interpretation Orchestrator.
