# Action 666D — Shadow provenance and trust-boundary remediation

This package remains server-only, default-off, in-memory and fixture-only. It
has no producer, provider, database, persistence, migration, scanner or live
consumer integration. Every result is synthetic contract evidence and is not
Ture performance.

## Version and difference-set provenance

`canonical_shadow_version_tuple_v1` binds, for each arm, the complete engine,
scoring, ranking, threshold-policy, setup-taxonomy, confidence, evaluator and
provider tuple. Empty versions fail closed. The evaluator derives the sorted
exact difference set as
`canonical_shadow_version_difference_set_v1`; caller declarations must equal
that set exactly, including explicit engine-change intent.

The baseline tuple digest, candidate tuple digest and difference-set digest are
bound into:

- baseline and candidate arm identities;
- canonical pair identity and pair semantic digest;
- evaluation identity and evaluation semantic digest;
- final `canonical_shadow_evaluation_result_v1` evaluation digest.

Changing any bound version therefore changes the pair and evaluation evidence
even when candidate ordering and outcomes are byte-identical. Confidence
probability semantics remain explicit: score, tier, label and market-context
evidence never become probability.

## Frozen-fixture trust boundary

Observation payloads no longer carry a self-declared trusted-fixture signal.
`trusted_paired_shadow_fixture_registry_v1` is a separate registry which binds:

- stable fixture identity;
- exact completed-bundle digest;
- complete baseline and candidate version tuples;
- entry digests and a canonical sorted registry-root digest.

The replay harness also requires an external
`trusted_paired_shadow_fixture_anchor_v1` containing the expected registry
root. A fixture is accepted only when registry entries, root, external anchor,
bundle digest and both version tuples all verify. Recomputing a modified
bundle's internal digest, supplying an unknown fixture, changing an entry,
replacing the registry or supplying the wrong root fails closed. This is a
local fixture integrity mechanism, not production key management.

## Dependency-injected result verification

After adapter mapping, the harness independently rebuilds the canonical
evaluation from the mapped input. Before a replay digest or evaluated status
can be created, it verifies:

- safety flags and evaluation status;
- baseline, candidate and pair identities;
- pair semantic digest;
- both complete version tuples and the exact difference set;
- evaluation identity, semantic digest and evaluation digest;
- the complete result payload, including metrics, displacement, threshold and
  no-trade/counterfactual evidence.

Any mismatch returns `rejected`, omits the untrusted evaluation result, sets
`evaluation_result_verified: false` and leaves `replay_digest` null. Only a
verified canonical result receives a replay digest. Disabled execution remains
the first gate and returns before trust verification, adapter, evaluator or
replay digest construction.

## Negative evidence

Focused tests cover unknown and modified fixtures, changed manifests and trust
roots, an internally re-digested fixture under the unchanged external anchor,
pair/semantic/evaluation digest tampering, arm identity and version provenance
tampering, metrics and no-trade evidence tampering, and a self-consistent
alternate evaluation whose internal digests were recomputed. They also cover
baseline/candidate reversal, missing probability semantics, membership,
cutoff, evaluator/provider and no-trade drift, input-order determinism,
byte-identical retry and deep immutability.

## Remaining producer dependencies

Real shadow evaluation is still not possible until an inactive future producer
can emit completed, point-in-time-safe baseline/candidate observations with:

- full Action 665 pre-truncation opportunity-set evidence;
- exact full rankings and unique tie-breaks for both arms;
- complete version tuples at decision time;
- joinable reproducible outcomes for every opportunity-set candidate;
- explicit no-trade evidence and complete counterfactual coverage where used;
- an operationally governed fixture/evidence publication boundary distinct
  from this local synthetic registry.

No such integration is implemented or activated by Action 666D.
