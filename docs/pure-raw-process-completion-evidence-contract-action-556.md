# Action 556 - Pure Raw Process Completion Evidence Contract

## Summary

Action 556 implements a pure, fixture-only, authority-free raw process completion evidence contract between the approved dormant fixed direct-spawn lifecycle boundary and a future separately reviewed Git-version interpretation boundary.

No executable was run. No Git version was collected or interpreted. No process was observed. No process handle was created or transferred. No credentials, environment values, filesystem, network, Supabase, Avanza, trading, order, position, settlement, persistence, runtime/API/UI/runner, commit, push, merge, or deployment behavior occurred.

## Contract Identity

- Contract kind: `pure_raw_process_completion_evidence_contract`
- Contract id: `ture.execution.pure-raw-process-completion-evidence-contract.fixture.v1`
- Contract version: `1`
- Boundary id: `ture.execution.raw-process-completion-evidence.fixture-boundary.v1`
- Source spawn contract id: `ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1`
- Source spawn contract version: `1`
- Fixture/live classification: `fixture_only_not_live_observation`
- Authority: `none`

## Schema

The contract accepts only an exact closed input shape covering identity/linkage, process creation, completion, output, termination, lifecycle, and security posture fields. Unknown fields, inherited fields, accessors, symbol keys, exotic prototypes, functions, malformed timestamps, malformed fingerprints, non-finite byte counts, unsupported enum values, unsupported kind/version, authority claims, production-live claims, retry/fallback claims, runtime activation claims, and TOCTOU-elimination claims fail closed.

The result is deeply frozen and deterministic:

- `accepted_fixture_raw_completion_evidence`
- or `blocked_fail_closed`

Accepted evidence includes SHA-256 fingerprints for identity, policy, evidence, and result. Fingerprints bind lifecycle fields, output representation, termination state, authority posture, and TOCTOU posture. Fingerprints do not create authority or provenance.

## Completion Categories

Closed completion categories:

- `spawn_failed_before_process_creation`
- `process_created_normal_zero_exit`
- `process_created_non_zero_exit`
- `process_created_signal_termination`
- `child_process_error`
- `stdout_stream_error`
- `stderr_stream_error`
- `stdout_output_limit_exceeded`
- `stderr_output_limit_exceeded`
- `combined_output_limit_exceeded`
- `invalid_output_encoding`
- `unexpected_stream_chunk`
- `process_close_without_exit`
- `internally_terminal_process_death_unconfirmed`
- `malformed_completion_evidence`

`malformed_completion_evidence` is representable only as a fail-closed category. It does not produce accepted evidence.

## Consistency Rules

The validator fails closed on contradictory evidence, including:

- `processCreated:false` with `processStartedObserved:true`.
- Spawn error mixed with ordinary successful completion.
- Normal close category without `closeObserved:true`.
- Non-terminal evidence.
- Exit code and signal both populated.
- Termination signal without termination request.
- Death confirmation without approved confirmation source.
- Overflow flags with the wrong category.
- Stream-error flags with the wrong category.
- `settledExactlyOnce:false`.
- Retry or fallback.
- Any authority, runtime, credential, network, CLI interpretation, production-live, or TOCTOU-elimination claim.

The contract does not silently normalize contradictions.

## Output Representation

Action 556 chooses canonical UTF-8 text only. This matches the approved direct-spawn wrapper, which decodes bounded output with fatal UTF-8 validation before exposing text.

Rejected alternative: byte-safe encoded representation plus decoding evidence. That model is useful if a future boundary needs to carry raw undecoded bytes, but it is larger than needed now and would create parser pressure around encoded byte payloads.

The contract does not repair invalid UTF-8, replace malformed bytes, trim output, normalize output, infer a Git version, or treat stderr as harmless.

## Bounds

The reviewed direct-spawn bounds are preserved:

- stdout max: 16 KiB.
- stderr max: 16 KiB.
- combined max: 32 KiB.

The contract rejects byte-count mismatches, component counts above limits without matching overflow state, combined counts above limits without matching combined overflow state, retained text after overflow categories, and UTF-8-invalid evidence that also exposes trusted text.

## Provenance Classification

The pure builder never claims production-live observation. Accepted evidence remains `fixture_synthetic` and `fixture_only_not_live_observation`; `observedLiveProcess` is always false. Caller declarations cannot upgrade evidence to live provenance. No production-private provenance marker, symbol, token, brand, hash, or copied fingerprint creates live status.

A future server-only neutralization boundary is still required before actual spawn lifecycle evidence may enter this raw completion contract.

## Authority Model

The contract grants no:

- spawn authority;
- process-handle authority;
- observer authority;
- termination authority;
- credential authority;
- CLI-version authority;
- authorization-consumption authority;
- network authority;
- API/UI/runner authority;
- trading authority;
- Avanza authority;
- order, position, or settlement authority;
- persistence authority;
- deployment authority.

No lifecycle state or fingerprint is a reusable capability.

## Relationship To Direct-Spawn Evidence

Action 550-553 direct-spawn evidence remains the source lifecycle model. Action 556 does not consume production direct-spawn results directly and does not modify the direct-spawn adapter. It defines the pure evidence contract that a future separately reviewed neutralization boundary may use to transform actual direct-spawn lifecycle evidence into parser-safe raw completion evidence.

## Why No Live Observer Was Added

Action 555 concluded that the fixed `git --version` direct-spawn boundary already owns process creation, stdout/stderr data listeners, stream errors, child error, exit, close, overflow, fixed internal-fatal termination request, listener cleanup, and immutable lifecycle evidence. Adding a separate live observer before freezing raw evidence would duplicate listener and settlement ownership and introduce child-handle transfer risk.

## Blockers Before Git-Version Interpretation

Before Git-version interpretation can begin:

1. Action 557 must statically/security review this pure contract.
2. A future neutralization boundary must be designed, implemented, and reviewed if actual direct-spawn evidence will enter this contract.
3. Parser preconditions must require terminal raw completion evidence, zero exit where applicable, confirmed close, no signal termination, no overflow, no stream error, valid bounded UTF-8, exact session/tool/path/policy linkage, and explicitly reviewed stderr handling.
4. Runtime activation must remain separately blocked.

## Runtime Unreachability

The new contract is a pure core only. It has no server-only wrapper and is not imported by API, UI, runner, cron, observer, direct-spawn runtime, credential, network, Avanza, trading, persistence, or deployment paths.

## Decision

Decision: `post_trade_pure_raw_process_completion_evidence_contract_ready_for_static_security_review`

Result status: `post_trade_pure_raw_process_completion_evidence_contract_action_556_implemented_fixture_only`

Recommended next Action: Action 557 - Static Security and Contract Review of Pure Raw Process Completion Evidence Contract.
