# Action 667O.2A — Failure Input Provenance Remediation

## Scope

`market_context_diagnostic_context_outcome_join_v2` is an additive,
default-off successor to the frozen O.1 contract. It closes finding `O2-001`
without rewriting the O.1 artifacts, the O.2 freeze, or the O.2 independent
review.

This Action constructs no real outcome association. All fixtures and golden
evidence are synthetic. The contract remains server-only, shadow-only and
outside canonical, training, promotion and live-ranking paths.

## Closed observed-input provenance

Every V2 result contains
`market_context_diagnostic_failure_input_provenance_v1` with exactly four
sections:

1. `registry_payload`
2. `context_handoff_payload`
3. `outcome_payload`
4. `decision_opportunity_evaluator_handoff`

Each section binds:

- a fixed namespace;
- a readable schema/version only when it matches the closed safe-version
  format;
- a canonical digest recomputed from the actually observed input;
- exactly one disposition: `absent`, `malformed`, `verified` or `rejected`;
- the expected registry/root and expected section digest when externally
  verified;
- the verifier identity/version;
- sorted, unique and sanitized reason codes.

An absent input is represented by a namespace-specific canonical sentinel. It
never disappears from provenance or the terminal digest.

## Sanitization

Rejected payload bytes are never returned. The observed digest is computed from
a recursive type-tagged projection in which scalar values and property names
are hashed. Accessors are not invoked. Cycles, unsupported runtime values,
lookup exceptions and clone failures become deterministic sanitized markers.
Exception text and stacks are not included.

The public join request remains the closed O.1 request. Caller-supplied
provenance, digests, dispositions, expected roots or verifier outcomes are
unknown fields and fail before authority access.

## Failure identity

For every non-`joined` result, `failure_identity_digest` binds:

- V2 and predecessor contract versions;
- the predecessor terminal digest;
- terminal taxonomy;
- request identity and request digest;
- expected authority binding;
- observed-input provenance digest;
- sorted terminal reason codes.

Consequently, two rejected registry, context or outcome payloads with the same
terminal taxonomy and reason codes still have different observed-input,
failure-identity and terminal-result digests.

## Independent rebuild

`market_context_diagnostic_failure_rebuild_v1` invokes the closed V2 factory
again through the dependency-injected read-only authority. It reconstructs the
sanitized projections, per-section digests, dispositions, expected bindings,
failure identity and final result digest. The verifier accepts no caller
rebuild or replay function.

A candidate with internally recomputed provenance, failure and terminal
digests is rejected unless it byte-matches this independent reconstruction.

## Compatibility and no-effect boundary

For successful synthetic `joined` results, the predecessor predictor, label and
diagnostic-association projections remain byte-identical. Their separate
digests and nanosecond temporal rules are unchanged.

O.1 failure outputs are historical predecessor evidence and are not implicitly
upgraded. Consumers must opt into the V2 contract explicitly.

Default-off and kill-switch branches return before request, authority, registry
or handoff reads. Their four absent sections use explicit sentinels.

Every result preserves:

```text
diagnostic_only: true
shadow_only: true
official_ohlcv: false
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
causal_claimed: false
live_ranking_effect: false
```

No real outcome join, provider request, database access, persistence, canonical
binding, model input, commit, push, PR or deploy is authorized by this
contract.
