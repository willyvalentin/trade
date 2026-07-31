# Action 667U.1 — recommendation outcome evidence admission

## Decision

`repository_owned_recommendation_outcome_evidence_admission_v1` is an
additive, synthetic-only and default-off admission boundary above the final
approved T authority:

```text
repository_owned_recommendation_outcome_evidence_issuance_v4
```

V1–V3, unknown versions and every non-`issued` T result are rejected. The
boundary does not infer missing evidence, repair input, capture a real
outcome, or provide a canonical/training/live path.

## Caller-to-snapshot boundary

The public candidate is canonical JSON text, not a caller-owned object.
Consequently an object, proxy, accessor or callback is rejected by a primitive
type check without reflection or execution. For accepted text the boundary:

1. reads the candidate string once;
2. enforces a fixed byte budget before parsing;
3. parses into boundary-owned plain data;
4. applies the existing bounded, non-recursive descriptor validator;
5. enforces a closed top-level schema;
6. deep-freezes the canonical plain-data snapshot;
7. never rereads the caller input.

Only verified snapshot bytes are used after this transition. Candidate
snapshot, authority snapshot and terminal result digests bind the exact
observed bytes.

## Issued-only ordering

The supplied T contract version and terminal status are classified before the
external admission authority is read or admission work is constructed. For
V1–V3, unknown, `incomplete`, `conflicting`,
`not_point_in_time_safe` and `unmappable` inputs:

```text
admission_request_constructed:false
t_v4_rebuild_called:false
downstream_digest_work:false
```

Default-off and kill-switch results additionally have zero candidate and
authority reads.

Only a claimed T V4 `issued` result may cross the admission-work boundary.
The expected issuer registry/trust-root anchor comes from a separately
injected canonical authority snapshot; it is not accepted from the candidate.
The boundary then rebuilds T V4 from the snapshotted request, authority anchor
and material using a boundary-owned callback. The supplied result and every
nested digest are accepted only when the independently rebuilt V4 result is
byte-equivalent and its top-level digest recomputes exactly.

## Evidence requirements

Admission additionally requires exactly the closed set of eighteen
repository-outcome completion gaps. Every closure must already be present in
the V4-verified material with a unique gap code. No defaulting, reconstruction
or inference is permitted.

V4 rebuild retains the established checks for:

- registry and trust-root authority;
- repository row, issuance and evidence-bundle identity;
- immutable opportunity-set membership;
- model, evaluator, outcome, explanation and provider/source lineage;
- nanosecond decision, source, receive, finalization and evaluation ordering;
- completeness and finality proofs;
- epoch, predecessor and rollback protection.

The admitted snapshot binds V4 result, V4 verified-snapshot bundle, authority,
candidate and eighteen-gap digests.

## Failure provenance and duplicates

Every rejection binds the candidate snapshot digest, trusted-authority
snapshot digest when read, evidence identity, closed taxonomy and sorted
reason codes. Distinct rejected observations therefore produce distinct
failure identities and terminal digests. Repeating the exact same candidate
is pure and returns byte-identical output.

## Synthetic interoperability

The focused synthetic fixture proves:

```text
T V4 admitted → S.2A completed → R.2 bindable
→ Q.1 ready → P.2A captured → O.2A joined
```

This is contract evidence only. It is not a real outcome join, performance
evidence, a probability mapping or a causal claim.

## Safety

```text
diagnostic_only:true
shadow_only:true
real_outcome_source_accessed:false
canonical_binding_ready:false
automatic_model_input_allowed:false
live_ranking_effect:false
```

The implementation adds no provider, database, writer, persistence,
migration, dependency, lockfile, deployment or live integration.
