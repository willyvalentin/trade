# Action 563 - Live Spawn-to-Raw-Completion Neutralization Architecture

## Architecture Summary

Action 563 selects a dormant server-only neutralization boundary as the next architectural step between the approved live direct-spawn lifecycle evidence and the approved pure raw-completion contract.

The boundary is not implemented in this action.

```text
approved live chain
  server-only live resolver
    -> dormant composition
    -> immediate pre-spawn revalidation
    -> fixed direct spawn
    -> original private direct-spawn result

future Action 564 boundary
  original direct-spawn result
    -> boundary-specific one-shot consume bridge
    -> exact terminal-state neutralization
    -> pure raw-completion input

approved pure chain
  pure raw-completion evidence
    -> pure Git-version interpretation
```

The future boundary must not connect to runtime callers. It is a trust-preserving conversion boundary only.

## Boundary Identity And Authority

The future neutralizer must have its own exact server-only identity distinct from:

- `ture.execution.dormant-server-only-fixed-read-only-direct-spawn-adapter.server.v1`;
- `ture.execution.pure-raw-process-completion-evidence-contract.fixture.v1`;
- `ture.execution.pure-git-version-interpretation-contract.fixture.v1`.

Its authority classification must remain `none`. It may consume private direct-spawn provenance for the single purpose of producing neutral structural evidence, but that provenance must not be copied into pure output or exported to callers.

## Original-Object Provenance Requirements

The future neutralizer must accept only the original direct-spawn result object. It must reject any object that is not the original value registered by the direct-spawn module for the neutralization purpose. The direct-spawn module should own the private consume bridge and mark the object consumed before the neutralizer builds target evidence.

No generic `isTrusted` function, brand, token, symbol, signature, reset, minting helper, or WeakSet access should be exported.

## One-Shot Semantics

The direct-spawn result may be consumed for neutralization exactly once. A second consume attempt must fail closed with a deterministic reason. Repeated validation of already neutralized pure output may be allowed by pure contracts, but it must not refresh or recreate private live provenance.

Concurrent consumption attempts must deterministically produce one success at most. All other attempts must block.

## Eligible State Recommendation

The recommended implementation target is complete deterministic terminal-state mapping for every live state that carries exact source evidence. The initial implementation must explicitly enumerate supported states and unsupported states.

Required mappings include:

- ordinary zero-exit close -> `process_created_normal_zero_exit`;
- non-zero close -> `process_created_non_zero_exit`;
- signal termination -> `process_created_signal_termination`;
- spawn exception before process creation -> `spawn_failed_before_process_creation`;
- child process error -> `child_process_error`;
- stdout/stderr stream errors -> matching stream-error categories;
- stdout/stderr/combined overflow -> matching overflow categories;
- invalid stdout/stderr encoding or binary output -> `invalid_output_encoding`;
- unexpected stream chunk -> `unexpected_stream_chunk`;
- close without exit -> `process_close_without_exit`;
- internal terminal with unconfirmed process death -> `internally_terminal_process_death_unconfirmed`.

Unknown, contradictory, unavailable, or insufficiently evidenced source states must block in the neutralizer and must not be relabeled as `malformed_completion_evidence`.

## Source-To-Target Mapping Rules

The future implementation must map source fields into the pure raw-completion input with no caller-controlled override:

- source identity, version, result fingerprint, policy fingerprint, revalidation fingerprints, session, purpose, tool, platform, executable, argv, and spawn attempt identity must be preserved;
- process lifecycle booleans must map to process-created, started, exit, signal, close, terminal, and settlement fields;
- stdout/stderr text may transfer only when retained, UTF-8-valid, non-binary, and byte-count compatible;
- output faults must map to exact error categories with retention restrictions;
- termination facts must map to requested signal, request outcome, process death confirmation, and confirmation source;
- security fields must remain false for shell, PATH, inherited environment, credentials, network, observer authority, CLI interpretation, authorization consumption, and runtime activation;
- `authority` must be `none`;
- `toctouEliminated` must be false.

## Timestamp And Freshness Linkage

The neutralizer should copy approved source timestamps and capture an internal neutralization timestamp. It must validate source freshness before consumption. The neutralization timestamp cannot refresh expired source authority; it only records when the conversion attempt occurred.

All timestamps used by downstream evidence must participate in fingerprints.

## Pure Contract Compatibility

The future neutralizer must build a `RawProcessCompletionEvidenceInput` accepted by `buildPureRawProcessCompletionEvidence`. It must not alter the pure contract. Because the pure contract currently classifies input as `fixture_synthetic` and `fixture_only_not_live_observation`, neutralized output must remain pure-compatible and non-live, even though it is linked to a privately consumed live-side source result.

## Parser Separation

The neutralizer must not import the Git parser and must not interpret `stdoutText`. The parser must remain a separate pure boundary. Parser success remains semantic evidence only and cannot reconstruct private live provenance or grant process, observer, runner, deployment, API, UI, credential, Avanza, trading, persistence, or production authority.

## Architecture Options

| Option | Authority Expansion | Provenance | Reviewability | Decision |
| --- | --- | --- | --- | --- |
| A. Dormant server-only neutralization adapter consuming original spawn evidence | Low if consume bridge is specific and one-shot | Strong | High | Recommended |
| B. Direct-spawn wrapper internally emits both live lifecycle and pure raw-completion evidence | Higher coupling; risks mixing spawn and pure output authority | Strong | Medium | Not selected |
| C. Closed spawn-plus-neutralization orchestrator | Low replay risk but broadens orchestration surface | Strong | Medium | Defer |
| D. Generic serialized conversion utility | High replay risk | Weak | Low | Reject |
| E. Neutralization combined with Git parsing | Blurs conversion and interpretation | Mixed | Low | Reject |

## Next Action Selection

Recommended next Action:

`Action 564 - Implement Dormant Server-Only Spawn-to-Raw-Completion Neutralization Adapter`

Do not implement runtime activation, parser orchestration, observer activation, credentials, network, API/UI/runner wiring, Avanza behavior, trading behavior, persistence, deployment, or production behavior in Action 564.

## Review Gates Before Activation

Action 564 must be followed by independent static/security review, remediation if needed, final re-review, separate parser orchestration approval, separate runtime activation approval, and separate deployment approval. No Action 563 approval implies live neutralization readiness or execution readiness.
