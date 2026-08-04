# Action 667R.2 — repository-owned recommendation outcome projection

## Status and boundary

`repository_owned_recommendation_outcome_projection_successor_v1` is an
offline, default-off, read-only diagnostic contract. It projects a fully
verified repository-owned recommendation outcome into the existing Q.1 source
payload without reading a database or a real outcome source.

Every terminal result binds these immutable safety properties:

```text
diagnostic_only: true
shadow_only: true
read_only: true
real_outcome_source_accessed: false
canonical_performance_eligible: false
automatic_model_input_allowed: false
automatic_training_allowed: false
automatic_promotion_allowed: false
causal_claimed: false
live_ranking_effect: false
```

The closed result taxonomy is:

```text
bindable
not_bindable
conflicting
not_point_in_time_safe
unmappable
```

`bindable` means only that the synthetic or future externally observed source
has enough verified identity, authority, temporal, membership, finality,
completeness, lineage and read-only evidence to enter Q.1. It does not make the
source canonical, training eligible, live eligible or performance evidence.

## Authority model

The public request names only the projection identity and expected source
snapshot identity. It cannot carry an authority root, registry payload,
observed digest, verifier outcome or disposition. The expected registry
identity/version/digest comes from the dependency-injected external authority.
The authority is read exactly once after both default-off guards.

The registry binds:

- the externally controlled authority-root digest;
- projection and source-snapshot identities;
- the digest of the actually observed input;
- the fixed verifier identity and successor version.

The observed material, registry and projection input receive separate
canonical provenance dispositions and digests. Absent inputs use an explicit
sentinel. Exceptions and unsupported runtime values are reduced to structured,
sanitized reasons. Raw rejected payloads and exception text never enter output.
Consequently two different rejected payloads with the same taxonomy and reason
codes have different failure identities.

## Required projection

No value is inferred, defaulted from neighboring data or reconstructed from a
millisecond timestamp. A bindable input requires:

- producer owner plus source schema/contract versions;
- external authority-root digest and immutable source snapshot identity/digest;
- recommendation and external decision identities;
- complete immutable opportunity-set identity and membership digest;
- outcome identity plus evaluator identity/version;
- source, evaluator, outcome, provider and context lineage;
- decimal Unix-nanosecond decision, outcome-window, finalization, capture and
  evidence-cutoff instants;
- finality and completeness proof identities/digests;
- an immutable read-only projection identity/digest;
- predictor cutoff and context/predictor digests proving the later outcome was
  not visible at decision time;
- complete P.2A capture request, external registry anchor and authority
  material needed by Q.1.

The exact temporal condition is:

```text
decision
< outcome_start
≤ outcome_end
≤ outcome_finalization
≤ capture
≤ evidence_cutoff
```

All comparisons use `BigInt` over canonical integer strings. There is no
floating-point, millisecond or microsecond conversion.

## Current repository-shaped rows

The fixtures reproduce the field shape of existing recommendation evaluation
rows using synthetic identities and values only. Those rows carry familiar
fields such as an outcome ID, recommendation ID, horizon, evaluation status,
evaluation timestamp and snapshot fingerprint. They do not prove the external
authority, nanosecond decision/capture/finalization instants, immutable
opportunity membership, evaluator identity/version, finality, completeness,
cryptographic lineage or read-only projection.

They therefore terminate as `not_bindable`. Exact missing-field reason codes
are deterministic and sorted. The projection never treats a familiar row shape
as authority.

## Synthetic successor and interoperability

The complete synthetic fixture projects to a Q.1-compatible payload. That
payload passes:

```text
R.2 projection: bindable
Q.1 admission: ready
P.2A capture: captured
O.2A join: joined
```

There are no interoperability exceptions or caller safety claims. Predictor
and label digests remain separate at O.2A. This is synthetic contract evidence,
not a real outcome capture or join and not publishable performance evidence.

## Mutation, determinism and zero-work

Verified projections and results are plain-data clones and recursively frozen.
Mutating the source material after verification cannot alter an existing
result; a subsequent projection rejects the digest drift. Independent
verification reconstructs observed projections, provenance, failure identity
and terminal digest from the request plus external authority rather than
accepting a caller rebuild function.

Disabled and kill-switch paths return precomputed frozen terminal results
before request access, cloning, authority reads, projection, Q/P/O work or
digest work. Golden evidence is reproducible under UTC, Stockholm with reversed
fixture order and New York.

## Explicit exclusions

This Action performs no database or provider access, persistence, writer,
migration, dependency change, real outcome capture, real join, canonical
binding, automatic model input, training, promotion, deployment or live
ranking. The normalized and replay trees remain external, read-only and outside
Git.
