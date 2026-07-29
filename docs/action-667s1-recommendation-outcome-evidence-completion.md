# Action 667S.1 — repository-owned outcome evidence completion

## Purpose and boundary

`repository_owned_recommendation_outcome_evidence_completion_v1` is a fully
offline, default-off, read-only diagnostic successor. It defines how a
repository-shaped recommendation outcome row can be paired with externally
verified evidence before the unchanged R.2 contract is allowed to classify the
resulting projection as `bindable`.

The completion contract never reads a database, provider, writer, persistence
surface or real outcome source. It does not infer, default or reconstruct any
missing value from the repository row. Every output preserves:

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

The closed taxonomy is:

```text
completed
incomplete
conflicting
not_point_in_time_safe
unmappable
```

Only `completed` carries a projection. Every other terminal status carries
sanitized observed-input provenance and a distinct failure identity, but no
R.2/Q.1 input.

## External authority

The public request contains only:

- completion identity;
- expected repository-row identity;
- expected evidence-bundle identity.

It cannot contain a trust root, registry payload, lineage root, observed digest,
verification status, canonical claim or completion claim. The external
authority supplies one immutable registry anchor and one read callback. The
anchor independently binds:

- registry identity, version and digest;
- expected trust-root digest;
- expected aggregate lineage-root digest.

The material returned by the callback contains the observed registry,
repository row and evidence bundle. Their canonical sanitized digests are
recomputed from the actually observed values. Caller-provided digests or
verification outcomes are not accepted.

Changing the registry, evidence bundle and their internal digests
self-consistently is insufficient: the independently supplied trust and lineage
roots still have to match. Exceptions and unsupported runtime values become
structured fail-closed results without raw payloads, exception messages or
stacks.

## Exact eighteen-gap closure

The original repository-shaped row is independently sent through the unchanged
R.2 verifier. It must produce exactly this frozen `not_bindable` gap set:

```text
completeness_proof_missing
cryptographic_lineage_missing
evaluator_identity_version_missing
external_authority_root_missing
finality_proof_missing
immutable_membership_missing
nanosecond_capture_instant_missing
nanosecond_decision_instant_missing
nanosecond_evidence_cutoff_missing
nanosecond_outcome_finalization_instant_missing
nanosecond_outcome_interval_missing
predictor_point_in_time_binding_missing
producer_owner_missing
q1_interop_material_missing
read_only_projection_missing
recommendation_decision_identity_missing
source_contract_version_missing
source_snapshot_identity_digest_missing
```

The evidence bundle must contain exactly one externally verified closure for
each code. Duplicate, absent, unknown or malformed closures keep the result
`incomplete`. The original gap list and repository-row identity/digest are
bound into both the bundle and registry.

## Evidence bundle

A completed bundle explicitly binds:

- external registry and trust-root authority;
- source snapshot identity and digest;
- producer owner, schema and source-contract versions;
- recommendation and external decision identities;
- immutable opportunity-set identity and membership digest;
- model, evaluator, outcome and explanation identities, versions and lineage;
- provider/source lineage;
- finality and completeness proof identities and digests;
- read-only projection and point-in-time evidence;
- Q.1/P.2A interoperability material;
- bundle, lineage-root and repository-row digests.

No field is derived from nearby data. The evidence must equal the corresponding
field in the completed R.2 projection.

## Nanosecond temporal boundary

All instants are canonical non-negative Unix-nanosecond strings and are compared
with `BigInt`:

```text
decision
< outcome_start
≤ outcome_end
≤ source
≤ receive
≤ finalization
≤ evaluation
≤ evidence_cutoff
```

The completed R.2 projection must bind the same decision, outcome interval,
finalization, evaluation/capture and cutoff instants. Predictor cutoff must
equal decision time and the outcome must remain invisible to the predictor.
Float, millisecond and microsecond conversion are prohibited.

## R.2 → Q.1 → P.2A → O.2A

After all S.1 checks pass, the exact completed projection is passed without
modification to the existing R.2 verifier. `completed` is impossible unless R.2
returns `bindable`.

The synthetic golden path then continues without special cases:

```text
S.1 completion: completed
R.2 projection: bindable
Q.1 admission: ready
P.2A capture: captured
O.2A join: joined
```

Predictor and label projections remain separate. The matrix contains synthetic
contract evidence only; it is not a real outcome capture, performance result,
probability statement or causal claim.

## Default-off and determinism

Disabled and kill-switch paths return prebuilt frozen terminal results before
request access, cloning, authority reads, evidence projection, R.2/Q/P/O work or
per-call digest work.

The synthetic matrix is byte-identical for UTC run A, UTC run B, Stockholm with
reversed input order and New York. No dependency, migration, lockfile, provider,
database, persistence, canonical or live integration is introduced.
