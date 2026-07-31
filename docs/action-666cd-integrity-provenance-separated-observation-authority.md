# Action 666CD — Integrity/Provenance Separation Contract

## Boundary

`canonical_integrity_provenance_separation_v2` separates two claims that must
never be conflated:

- canonical SHA-256 verifies deterministic byte integrity;
- private runtime provenance proves that the current process minted and
  verified an observation through the private CB capsule boundary.

A public digest is not an authority credential.

## Runtime evidence

The atomic runtime operation may return deep-frozen plain evidence with
`provenance_verified: true` only after CB's private in-process capsule and
WeakMap check succeeds. Its scope is explicitly `current_process_only`.
Capsules and WeakMap provenance are never exported or returned.

The runtime result also supplies a canonical serialization envelope. That
envelope intentionally excludes private provenance and contains:

```text
integrity_verified: true
provenance_verified: false
authority_status: integrity_only
trusted: false
admitted: false
```

Serialization never preserves or upgrades private runtime provenance.

## Readback taxonomy

Readback has a closed terminal taxonomy:

```text
integrity_only
malformed
non_canonical
digest_mismatch
input_rejected
```

Even a closed-schema, canonical payload with a valid recomputed public digest
is only `integrity_only`. Equality, schema validation, or SHA-256
recomputation cannot produce trusted, admitted, or provenance-verified
evidence.

Malformed JSON, noncanonical field ordering, stale/mismatched digests, and
non-string/non-`Uint8Array` input are distinguished. Exact accepted bytes are
bound to the observed input digest and terminal identity. Failure results
also bind reason, exact observed bytes when safely available, and a
deterministic failure identity.

## Hook-free input handling

Readback accepts only strings or genuine `Uint8Array` values. Unknown
objects, clones, substitutions, Proxies, and accessors are rejected before
enumeration. Caller hooks and caller-controlled exception text are neither
executed nor exposed.

## Durable trust

A durable readback could regain trusted provenance only through a separately
owned external authority with an independently pinned anchor and verified
attestation. Action 666CD does not introduce that authority, callback,
upgrade path, database, persisted trust store, or live producer.

## Safety

The foundation is server-only, fixture-only, default-off, and disconnected
from live consumers. It performs no persistence, writes, provider or database
access, training, parameter changes, model changes, promotion, or live
ranking effects. Synthetic golden evidence is not publishable performance.
