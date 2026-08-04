# Action 667P.1 — Diagnostic decision/outcome handoff capture foundation

## Status and scope

This Action defines a synthetic-only, default-off producer-side contract for
the outcome handoff consumed by
`market_context_diagnostic_context_outcome_join_v2`.

It does not capture a real outcome, call a provider, persist data, access a
database, bind canonically, train a model, or affect live ranking.

## Versioned contracts

- `diagnostic_decision_outcome_handoff_capture_v1`
- `diagnostic_decision_outcome_handoff_bundle_v1`
- `diagnostic_outcome_source_registry_v1`
- `diagnostic_outcome_source_authority_v1`
- `diagnostic_outcome_capture_failure_provenance_v1`

The closed terminal taxonomy is:

1. `captured`
2. `incomplete`
3. `conflicting`
4. `not_point_in_time_safe`
5. `unmappable`

Every enabled request returns exactly one status, sorted unique reason codes
and a deterministic terminal capture digest.

## Owner-separated authority

The public request contains only a capture identity, period/cohort and source
record identities. It cannot supply an expected root, trusted payload,
observed digest, verifier result or verification disposition.

The externally injected authority supplies a frozen registry anchor and
read-only source lookup functions. The registry binds:

- producer identity and version;
- decision, opportunity-set, evaluator/outcome, provider/context and
  cost/slippage namespaces;
- source identities, schema versions and payload digests;
- verifier identities and versions;
- expected trust root;
- nanosecond validity interval.

Registry bytes must be internally valid and match the injected anchor. A
self-consistent caller replacement therefore cannot authorize itself.

## Bundle and temporal boundary

A captured bundle binds the capture identity/version, period, cohort, source
registry/root, all source payload digests and one lossless
`market_context_diagnostic_outcome_bundle_handoff_v1`.

The implementation requires exact integer-nanosecond ordering:

```text
decision
< outcome interval start
<= outcome interval end
<= outcome completion
<= evaluation/capture
```

Decision-source time and the latest finalized predictor bucket may not exceed
the decision instant. Provider/source time may not exceed capture. The full
capture must also lie within the source registry's effective interval.
Naive or malformed timestamps fail closed.

Outcome values only appear in the outcome handoff. They are never projected
into a decision-time predictor payload.

## Failure provenance

Enabled terminal results bind canonical, sanitized observed-input digests for
the actual registry and each source payload. Sections declare one of
`absent`, `malformed`, `verified` or `rejected`, plus expected identity/digest,
trust root, verifier identity/version and sorted reason codes.

Raw rejected payloads and exception text are not emitted. Different rejected
bytes produce different provenance, failure and terminal digests even when
taxonomy and reasons are identical.

## O.2A interoperability

Synthetic validation constructs:

```text
captured P.1 handoff
→ externally anchored O.2A authority registry
→ market_context_diagnostic_context_outcome_join_v2
→ joined diagnostic result
```

No bypass flag exists. Non-captured results have no outcome handoff and cannot
become `joined`.

## Default-off boundary

Disabled and kill-switch calls return frozen, precomputed sentinel results
before request, registry, source, clone, bundle, digest or O.2A work. No caller
input is inspected on those paths.

All results preserve:

```text
diagnostic_only: true
shadow_only: true
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
causal_claimed: false
live_ranking_effect: false
```

## Limitations

- All fixtures and evidence are synthetic.
- No real outcome or performance evidence is produced.
- This is not a persistence or capture activation.
- The implementation imports no Action 665/666 code.
- Canonical binding remains not ready.
