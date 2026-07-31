# Action 666BV — Non-forgeable snapshot issuance V2

## Scope

`canonical_non_forgeable_binding_snapshot_issuance_v2` is an additive,
server-only successor above PR #72. It does not alter the published BQ
implementation or review bytes and has no live call site, writer, persistence,
database, provider, migration, dependency or lockfile effect.

The contract closes the two Action 666BU findings while preserving the complete
`V2 → BD → AX → AJ → AC → V → AQ` synthetic replay.

## External issuer authority

The V2 implementation exports no general authority factory. An external reader
returns one signed envelope. The envelope is bounded before cloning, read
exactly once, verified with a pinned Ed25519 public key, checked against
source-controlled anchor/root and session identities, snapshotted to plain
data, deep-frozen and marked with private runtime provenance.

Only the verified frozen snapshot is used to construct the predecessor
authority. A caller may replace the reader bytes, recompute internal digests or
substitute a predecessor authority, but cannot create a valid signature for an
alternative root. Cross-session envelopes are rejected by the signed session
identity.

The committed synthetic fixture contains only the public key and a detached
signature. The private signing key is not part of the repository or runtime.
This models the future external owner boundary; it is not production key
management.

## Closed nested request and bounded processing

Every raw request passes the existing source-controlled iterative validator
before cloning, semantic projection, full serialization or downstream work.
The policy binds maximum depth, nodes, keys, array length, individual UTF-8
string bytes and total observed UTF-8 bytes.

After cloning, the entire nested key/type/array inventory is reduced to a
versioned schema digest. That digest must match the externally signed expected
schema before `end_to_end_request`, `completed_capture_request` or any other
semantic field is dereferenced.

Cycles, accessors, proxies, non-plain prototypes, symbols, unsupported values,
budget failures, clone failures and unexpected exceptions produce sanitized
terminal evidence. The observation binds the request material available within
budget, rejection stage, counters, validation projection, request digest when
available, nested schema digest when available and a canonical observation
digest. Semantically different invalid inputs therefore remain distinct and
independently rebuildable.

## Safety and interpretation

Default-off and kill-switch modes return before dependency access, request
reads, validation, cloning, authority reads, signature verification, semantic
projection, predecessor execution or digest work.

All golden inputs are synthetic and not publishable as performance:

```text
shadow_only: true
live_ranking_effect: false
live_impact: false
persistence_performed: false
automatic_training_allowed: false
automatic_model_change_allowed: false
automatic_promotion_allowed: false
external_ai_canonical_truth_authority: false
synthetic_evidence: true
not_publishable: true
```
