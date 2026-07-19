# Action 564 - Dormant Server-Only Spawn-to-Raw-Completion Neutralization Adapter

## Scope

Action 564 implements a dormant server-only neutralization adapter that bridges one original production-valid fixed direct-spawn result into the approved pure raw process completion evidence contract. It does not execute Git, create or observe a process, transfer a child handle, terminate a process, parse Git output, invoke the pure Git-version parser, or activate runtime, API, UI, runner, cron, credential, network, Avanza, trading, persistence, or deployment behavior.

## Module Graph

```text
lib/post-trade-dormant-server-only-fixed-read-only-direct-spawn-adapter.ts
  owns private original-object spawn result provenance
  owns one-shot consume bridge for raw-completion neutralization

lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter.ts
  import "server-only"
  consumes original direct-spawn result through the boundary-specific bridge
  invokes the pure mapping core

lib/post-trade-dormant-server-only-spawn-to-raw-completion-neutralization-adapter-core.ts
  pure mapping and raw-builder invocation
  imports no server-only wrapper and no process primitive
  cannot verify production provenance by itself

lib/post-trade-pure-raw-process-completion-evidence-contract-core.ts
  approved pure raw-completion builder
```

No route, API handler, UI component, runner, cron, observer, credential module, Git parser, Avanza module, trading module, persistence module, or deployment path imports the neutralizer.

## Production API

There is one safe production entry point:

`neutralizeOriginalFixedReadOnlyDirectSpawnToRawCompletion({ directSpawnResult })`

The production API accepts only the original `FixedReadOnlyDirectSpawnResult` object. It accepts no caller-supplied raw lifecycle object, metadata, output text, byte counts, category, timestamp, executable, argv, tool, platform, policy, session, purpose, authority flags, parser options, dependency injection, clock, test mode, or process handle.

## Direct-Spawn Provenance Bridge

The direct-spawn server-only module now owns private module-local provenance:

- a `WeakMap` from original direct-spawn result to original spawn observation;
- a `WeakSet` for original direct-spawn evidence;
- a `WeakSet` for one-shot raw-completion neutralization consumption.

It exposes only the boundary-specific consume operation:

`consumeOriginalFixedReadOnlyDirectSpawnForRawCompletionNeutralization(...)`

It does not export a generic verifier, `WeakSet`, token, symbol, brand, reset, minting helper, generic consume function, replay state, child handle, or live provenance marker.

## One-Shot Model

Only one neutralization consume attempt is available per original direct-spawn result. Consumption happens before neutralization output construction. A second call returns `already_consumed`. Clones, reconstructions, copied fingerprints, copied output/lifecycle fields, JSON clones, structured clones, missing provenance, and authority-bearing inputs fail closed.

If mapping or the pure builder rejects after consumption, the source remains consumed. There is no retry, fallback, reset, or replay API.

## Supported Source States

Action 564 supports exact mapping for these direct-spawn terminal states:

- spawn failure before process creation;
- normal zero exit;
- normal non-zero exit;
- signal termination;
- asynchronous child-process error;
- stdout overflow;
- stderr overflow;
- combined overflow.

The following states are explicitly rejected until their source facts can be represented without contradiction in the pure raw-completion contract:

- stdout stream error;
- stderr stream error;
- invalid output encoding;
- unexpected stream chunk;
- close without exit;
- internal terminal state with process death unconfirmed.

Unsupported states fail closed and are not converted into accepted `malformed_completion_evidence`.

## Source-To-Target Mapping

The mapper derives every raw field from the consumed source object or closed policy:

- source contract identity/version/result fingerprint;
- revalidation result/evidence/observation fingerprints;
- session, purpose, tool, platform, policy, executable, argv;
- spawn attempt identity;
- source timestamps and neutralization timestamp;
- process attempted/created/started, spawn error, exit, signal, close, terminal category, lifecycle state, one-shot settlement, retry/fallback facts;
- stdout/stderr byte counts and retained canonical UTF-8 text where allowed;
- overflow and termination facts;
- false security posture for shell, PATH lookup, inherited environment, credentials, network, observer authority, CLI interpretation, authorization consumption, runtime activation;
- `authority:"none"`;
- `toctouEliminated:false`.

Missing or contradictory facts fail closed. The mapper does not invent missing output, timestamps, or lifecycle facts.

## Raw-Output Transfer

Retained text is transferred only when byte counts exactly match UTF-8 encoding. Overflow categories retain no output text and preserve byte counts. Invalid UTF-8 and binary output are rejected in this first neutralizer because the current direct-spawn close evidence cannot be represented in the pure contract without changing terminal-state semantics.

No trim, newline normalization, Git parsing, logging, replacement decoding, or output repair occurs.

## Timestamp Model

The production caller supplies no time. The direct-spawn bridge captures one internal server-side `consumedAt` timestamp when the consume attempt starts. The mapper copies source terminal timestamps from the direct-spawn evidence and uses `consumedAt` as the neutral evidence timestamp. Timestamps are evidence only and do not refresh stale source authority.

## Pure Builder Model

The neutralizer invokes `buildPureRawProcessCompletionEvidence(...)` with the mapped closed record. It does not manually construct an accepted raw evidence object. If the builder rejects, the neutralizer returns `raw_completion_builder_rejected` and does not retry, repair, or fall back to malformed evidence.

## Neutral Classification

The pure output remains:

- `provenanceClassification:"fixture_synthetic"`;
- `fixtureLiveClassification:"fixture_only_not_live_observation"`;
- `observedLiveProcess:false`;
- `authority:"none"`;
- `toctouEliminated:false`.

The server-only adapter verifies private live source provenance, but that private provenance is deliberately not transferred into the pure output. Fingerprints preserve linkage only.

## Git-Parser Separation

Action 564 does not import or invoke the pure Git-version parser. Neutralization success does not imply parse success. Parser acceptance, if performed in a future action, grants no live provenance, compatibility authority, runtime activation, staging readiness, deployment readiness, or execution authority.

## Fail-Closed Reasons

The neutralizer uses a closed reason vocabulary including:

- `input_rejected`;
- `production_provenance_rejected`;
- `already_consumed`;
- `source_contract_identity_rejected`;
- `source_result_fingerprint_rejected`;
- `source_revalidation_linkage_rejected`;
- `session_rejected`;
- `purpose_rejected`;
- `tool_rejected`;
- `platform_rejected`;
- `policy_rejected`;
- `executable_rejected`;
- `argv_rejected`;
- `source_state_rejected`;
- `source_lifecycle_rejected`;
- `source_output_rejected`;
- `source_encoding_rejected`;
- `source_termination_rejected`;
- `source_authority_rejected`;
- `source_live_claim_rejected`;
- `stale_or_expired`;
- `mapping_rejected`;
- `raw_completion_builder_rejected`;
- `unexpected_internal_failure`.

No raw Node errors, paths, stacks, system details, credentials, or output payloads are embedded in reasons.

## Test Seam

Focused tests use a source-isolated harness to exercise the real direct-spawn bridge code without executing Git or creating a process. Core mapping tests use synthetic immutable direct-spawn results built from existing reviewed core helpers. No production minting, reset, dependency injection, clock injection, process handle, or runtime caller was added.

## Runtime Unreachability

Static review confirms no application route, API handler, UI, runner, cron, observer, credential module, Git parser, raw contract, Avanza module, trading module, persistence module, or deployment path imports the neutralizer.

## Absent Authorities

The adapter and output grant no process creation authority, process-handle authority, observer authority, termination authority, CLI execution authority, Git-version authority, compatibility authority, credential authority, network authority, API/UI/runner authority, authorization-consumption authority, trading/Avanza/order/position/settlement authority, persistence authority, or deployment authority.

## Remaining Blockers

Before parser orchestration or runtime activation, the neutralizer needs a separate static/security review, remediation if required, final re-review, explicit parser-orchestration approval, explicit runtime activation approval, and explicit deployment approval.

## Decision

Decision: `post_trade_dormant_server_only_spawn_to_raw_completion_neutralization_adapter_ready_for_static_security_review`

Result status: `post_trade_dormant_server_only_spawn_to_raw_completion_neutralization_adapter_implemented_not_activated`
