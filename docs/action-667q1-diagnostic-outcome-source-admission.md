# Action 667Q.1 — Diagnostic outcome source admission

## Purpose

`market_context_diagnostic_outcome_source_admission_v1` is a default-off,
read-only and diagnostic-only admission contract. It determines whether a
future externally owned outcome source can present an immutable, verifiable
handoff to the already versioned P.2A capture and O.2A join contracts.

This Action uses synthetic fixtures only. It does not connect to, read from or
capture any real outcome source.

## Authority boundary

The public request contains only an admission identity, expected source
identity, period and cohort. It cannot carry a trusted registry, expected root,
observed digest, verifier disposition or readiness assertion.

The dependency-injected authority owns:

- the expected registry identity, version and digest;
- exactly one atomic `read_admission_material` callback;
- the observed registry and observed source payload.

The observed material is canonicalized into closed plain data before it is
validated. Registry and source-payload digests are recomputed from the observed
bytes. Unknown fields, accessors, functions, symbols, cycles, unexpected
prototypes and other unsupported runtime values fail closed with sanitized
reason codes.

Default-off and kill-switch results are precomputed frozen sentinels. Both
return before request inspection, authority lookup, source reads, verification
or per-call digest construction.

## Required source binding

An admissible source binds:

- externally anchored registry identity and digest;
- producer, schema and contract versions;
- complete decision and opportunity-set identity;
- outcome and evaluator identity;
- provider, evaluator and outcome lineage;
- exact nanosecond decision, outcome-window, finalization, capture and cutoff
  instants;
- observed source-payload identity and digest;
- explicit finality and completeness evidence;
- a read-only/no-persistence access policy;
- predictor/context digests that remain separated from the later outcome;
- the standard P.2A capture request, P.2A registry anchor and immutable P.2A
  authority material.

The temporal invariant is:

```text
decision
< outcome_start
<= outcome_end
<= outcome_finalization
<= capture
<= cutoff
```

The predictor cutoff must equal the decision instant and
`outcome_visible_to_predictor` must remain `false`.

## Terminal taxonomy

```text
ready
incomplete
conflicting
not_point_in_time_safe
unmappable
```

Only `ready` contains a handoff. Every other terminal result contains
canonical observed-input provenance and a failure identity that binds the
actual rejected observation. Absent sections use an explicit sentinel.
Different rejected payloads cannot collapse to the same failure or result
digest.

## P.2A and O.2A interoperability

The ready handoff contains the existing
`DiagnosticDecisionOutcomeCaptureRequestV2` and
`DiagnosticOutcomeAuthorityMaterialV2` contracts without translation or
semantic compression. The synthetic interoperability fixture passes that
handoff to the standard P.2A capture function and then passes the resulting
standard outcome bundle to the standard O.2A join function.

No bypass flag, alternative verifier or special-case join path exists.

## Diagnostic boundary

Every result preserves:

```text
diagnostic_only: true
shadow_only: true
read_only: true
official_ohlcv: false
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
probability_claimed: false
causal_claimed: false
live_ranking_effect: false
```

The contract makes no performance, probability, outcome-explanation or causal
claim. It creates no persistence, database, provider, capture, canonical,
training, publication or live-ranking path.

## Synthetic matrix

The checked machine-readable evidence covers:

- admissible/ready source;
- incomplete outcome;
- source binding conflict;
- externally anchored registry drift;
- opportunity membership drift;
- evaluator/outcome lineage drift;
- outcome at a forbidden temporal boundary;
- unfinalized outcome;
- distinct rejected payloads with the same reason;
- duplicate admission/outcome identities;
- disabled and kill-switch zero-work;
- standard P.2A and O.2A interoperability;
- canonical/reversed input order and UTC, Stockholm and New York
  determinism.

## Authorization status

```text
real_outcome_source_accessed: false
real_outcome_capture_performed: false
real_outcome_join_performed: false
canonical_binding_ready: false
automatic_model_input_allowed: false
live_ranking_effect: false
```
