# Action 666CB — Private Atomic Observation Authority

`canonical_private_atomic_observation_authority_v1` closes `666CA-M1`
without changing BZ, CA, BX, BV, or PR #72.

## Private atomic authority

Capsule creation and the module-private WeakMap are implementation details.
No capsule mint or generic provenance factory is exported. The sole primitive
observation operation mints, registers, verifies, projects evidence, and
discards the capsule atomically. Only a deeply frozen plain evidence/result
projection crosses the module boundary; the capsule never does.

The private verifier checks WeakMap provenance before reading the capsule.
It rebuilds the frozen observation against private canonical bytes,
observation digest, and capsule digest.

## Persisted readback

Readback accepts a canonical JSON string or genuine `Uint8Array` bytes. It
does not accept caller objects as evidence. Byte extraction uses captured
typed-array intrinsics; unknown objects and Proxies fail brand validation
without enumeration or caller hooks.

JSON is parsed into plain data, checked against an exact closed schema, checked
for canonical serialization parity, and verified by rebuilding the evidence
digest. Missing, additional, renamed, malformed, reordered, or tampered fields
fail closed.

## Safety

The harness is default-off and kill-switch controlled before observation,
capsule minting, provenance checks, readback, parsing, or digest work. The
foundation is fixture-only and server-only. It introduces no database,
PostgreSQL, writer, persistence, provider, migration, dependency, lockfile,
live import, training, model change, promotion, or external-AI authority.
