# Action 666BZ — Provenance-Bound Hook-Free Observation Verification

`canonical_provenance_bound_observation_verification_v1` is an additive,
server-only successor to the frozen BX/BY evidence. It does not change BX,
BY, BV, or PR #72.

## Private provenance boundary

Every accepted capsule is minted internally from a canonical BX primitive
observation, deep-frozen, and registered in a module-private `WeakMap`.
Verification performs a private `WeakMap.get` before any property, prototype,
key, descriptor, iterator, or serialization access to the candidate.

Unknown objects, proxies, clones, cross-session objects, functions, and
primitives are rejected as `untrusted_observation_container`. The rejection
does not enumerate or inspect the candidate and explicitly sets
`content_identity_claimed:false`.

For a recognized capsule, verification occurs only after provenance succeeds.
It checks the frozen capsule and observation against the private canonical
observation bytes, observation digest, and capsule digest captured when the
capsule was minted.

## Lossless binding

The capsule retains BX type tags, complete value digests,
`bounded_observation_digest`, and observation digest. BigInt signs and values,
IEEE-754 number edges, strings, booleans, `null`, and `undefined` therefore
remain distinguishable.

## Safety

The harness is default-off and kill-switch controlled before request reads,
capsule minting, provenance checks, property reads, canonical-byte rebuilds,
or digest work.

No database, PostgreSQL, writer, persistence, provider, migration,
dependency, lockfile, live import, training, model change, promotion, or
external-AI canonical authority is introduced. Golden evidence is synthetic
and not publishable.
