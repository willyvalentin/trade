# Action 568 - Dormant Neutralization-to-Git-Interpretation Orchestration Architecture

## Architecture Summary

Action 568 plans the smallest safe dormant server-only orchestration boundary for connecting the approved one-shot neutralization adapter to the approved pure Git-version interpretation contract in a future separately reviewed implementation.

The planned orchestrator is not implemented in this action.

## Current Chain

```text
server-only live resolver
  -> dormant live composition
  -> immediate pre-spawn revalidation
  -> fixed dormant direct spawn
  -> original production-valid direct-spawn result
  -> dormant server-only neutralization
  -> pure raw-completion evidence
  -> pure Git-version interpretation contract
```

Today, the last two arrows are not owned by a single orchestrator. The neutralizer can produce raw-completion evidence. The parser can interpret approved raw-completion evidence. No boundary currently coordinates these stages, returns a closed orchestration result, or grants compatibility.

## Boundary Responsibilities

The future orchestrator has exactly one responsibility: order and link neutralization and parsing without increasing authority.

It must:

- accept only the original production-valid direct-spawn result;
- pass that object directly to `neutralizeOriginalFixedReadOnlyDirectSpawnToRawCompletion`;
- invoke `interpretPureGitVersionFromRawCompletion` only when neutralization accepted exact `process_created_normal_zero_exit` raw completion;
- return a frozen closed result union;
- preserve source, neutralization, raw-completion, and interpretation fingerprints;
- grant no authority.

It must not:

- mint, verify, or reset original-object provenance;
- clone or serialize the direct-spawn result;
- inspect stdout before neutralization;
- accept caller parser inputs;
- execute Git;
- spawn, observe, or terminate a process;
- read credentials, environment, filesystem, network, API, UI, runner, Avanza, trading, persistence, or deployment state.

## Exact Ordering Contract

The ordering invariant is:

```text
original direct-spawn object
  -> neutralizer consumes original object exactly once
  -> neutralizer returns immutable raw-completion result
  -> orchestrator gates parser eligibility
  -> parser receives immutable raw-completion result only
  -> orchestrator returns immutable no-authority result
```

Neutralization failure is terminal. Parser rejection is terminal. Neither failure permits retry, fallback, source repair, reconstructed evidence, or altered parser settings.

## Source Eligibility Policy

The architecture selects option C:

- accept the exact original production-valid direct-spawn result at the production API boundary;
- delegate source-state support to the neutralizer;
- attempt interpretation only for `process_created_normal_zero_exit`;
- return `interpretation_not_attempted` for other accepted neutral categories.

This preserves the neutralizer's private provenance bridge and narrows the parser boundary before output grammar checks.

## Result Union

The planned union:

```text
neutralization_rejected
neutralization_succeeded_interpretation_not_attempted
neutralization_succeeded_interpretation_rejected
neutralization_succeeded_interpretation_accepted
```

The result must include contract identity, result version, orchestration boundary id, source direct-spawn result/evidence/observation fingerprints, neutralization fingerprint, raw-completion result/evidence fingerprints, parser result/evidence fingerprints where attempted, parsed version only when accepted, deterministic reasons, timestamp evidence, and no-authority flags.

The result must not embed original direct-spawn references, child handles, process details beyond approved fingerprints, raw Node errors, or caller-provided parser material.

## Reason Precedence

Failure precedence is intentionally narrow:

1. malformed orchestrator input;
2. neutralizer production provenance rejection;
3. neutralizer duplicate consumption;
4. neutralizer fail-closed source or mapping rejection;
5. neutralizer internal failure;
6. raw completion category ineligible for parser;
7. parser linkage or authority rejection;
8. parser grammar/security rejection;
9. parser internal failure;
10. accepted interpretation.

Unknown internal failures must map to `unexpected_internal_failure` without exposing sensitive details.

## Linkage Graph

```text
directSpawn.resultFingerprint
directSpawn.evidence.evidenceFingerprint
directSpawn.observationFingerprint
accepted revalidation lineage through direct-spawn result/evidence fingerprints
  -> neutralization.resultFingerprint
  -> rawCompletion.resultFingerprint
  -> rawCompletion.evidence.evidenceFingerprint
  -> parser.resultFingerprint
  -> parser.evidence.evidenceFingerprint
  -> orchestration.resultFingerprint
```

Every edge binds session, purpose, tool `git`, platform `macos`, executable `/usr/bin/git`, argv `["--version"]`, policy ids, contract ids, and versions. Fingerprints prove deterministic linkage only; they are not authority.

Action 572 clarification: the Action 569-571 orchestrator keeps `sourceRevalidationFingerprint` null and does not add a standalone revalidation-fingerprint field. Revalidation lineage is transitive through the accepted direct-spawn result/evidence fingerprints and neutralizer/raw source-spawn linkage.

## Time Model

The future orchestrator may capture one internal server-only orchestration timestamp. It must preserve neutralization and parser timestamps exactly and must not accept caller-supplied time. Time is evidence only and cannot refresh stale source evidence or extend any validity window.

## Authority Lattice

Reachable authority remains:

```text
none
```

The planned orchestrator must not convert compatibility, completeness, parser acceptance, fingerprints, review approval, or successful neutralization into:

- process authority;
- observer authority;
- CLI-version authority;
- compatibility authority;
- runtime/runner authority;
- credential authority;
- deployment authority.

## API Closure

The production entry point should accept only:

```ts
Readonly<{ directSpawnResult: FixedReadOnlyDirectSpawnResult }>
```

or an even narrower single-argument direct-spawn result form if implementation review prefers it. It must not accept raw evidence, parser input, stdout, version strings, parser policy, clock, dependency injection, test mode, or process handles.

## Architecture Recommendation

Preferred future architecture: a new dormant server-only orchestrator module imports the server-only neutralization adapter and the pure Git-version parser.

Rejected alternatives:

- parser inside neutralizer;
- parser inside direct-spawn adapter;
- pure helper accepting direct-spawn results;
- generic caller-supplied pipeline;
- runtime runner orchestration.

## Review Readiness

The architecture is ready only for Action 569 planning-to-implementation. It is not orchestration-ready, Git-version-ready, compatibility-ready, staging-ready, execution-ready, observer-ready, credential-ready, Avanza-ready, deployment-ready, or production-ready.

## Decision

Decision: `post_trade_dormant_neutralization_to_git_interpretation_orchestration_boundary_plan_ready`

Result status: `post_trade_dormant_neutralization_to_git_interpretation_orchestration_action_568_planning_gate_completed`
