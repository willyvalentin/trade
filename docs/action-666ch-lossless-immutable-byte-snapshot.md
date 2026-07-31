# Action 666CH — Lossless Immutable Byte Snapshot Contract

## Boundary

`canonical_lossless_immutable_byte_snapshot_v1` accepts a canonical JSON
string or an exact `Uint8Array` backed by a fixed ordinary `ArrayBuffer`.
Primitive booleans are the only enable/kill-switch options. No callback,
reader, factory, trust hook, evidence object, or coercion surface exists.

Captured typed-array and ArrayBuffer intrinsics verify the internal slots,
exact prototypes, fixed backing storage, detachment state, and view length
without property enumeration or caller hooks. Proxies, subclasses,
cross-realm-like substitutions, detached buffers, resizable buffers, and
SharedArrayBuffer-backed views fail closed.

## One immutable copy

An accepted byte view is copied exactly once with the captured typed-array
`set` intrinsic into a module-owned, fixed ordinary `ArrayBuffer`. Offset and
length views copy only their visible bytes. Hashing, fatal UTF-8 decoding,
parsing, canonical validation, and identity construction use only that
private snapshot. Shared/growable memory is rejected before byte reads,
copying, decoding, or request-specific digest work.

Canonical strings are immutable primitives and are encoded once into an
owned fixed byte snapshot before the same downstream verification.

## Lossless raw-byte evidence

Before UTF-8 decoding, the contract binds:

```text
canonical_raw_byte_observation_v1
input domain
exact byte length
SHA-256 over exact raw bytes
canonical raw-byte observation digest
```

Fatal UTF-8 failure retains that observation. Consequently `0xff` and
`0xfe` have different raw observations, terminal identities, failure
identities, and readback digests while exposing only the sanitized reason
`raw_bytes_invalid_utf8`.

## Authority and safety

Valid canonical bytes remain integrity-only. Serialized provenance, trust,
and admission are always false, including after self-consistent public digest
replacement. Outputs are synthetic, shadow-only, and not publishable.

Default-off and kill-switch paths return before input validation, snapshots,
byte reads, hashing, decoding, parsing, or digest work. There is no database,
provider, persistence, writer, live consumer, training, model change, or
promotion capability.
