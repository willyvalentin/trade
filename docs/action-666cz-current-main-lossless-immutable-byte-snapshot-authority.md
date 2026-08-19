# Action 666CZ — current-main lossless immutable byte snapshot authority

## Authority and base

This fresh current-main successor is bound to protected main commit
`7280f5a6a7317f495dd8ffccdd8df609203026f5`, tree
`944a9fe64992f115a514070e3a0ff6e5df26c5a1`, after ordinary delivery of
PR #118 / Action 666CY and successful exact-main CI run `32277517623`.
Historical PR #72 remains non-authority design context only.

## Private authority boundary

`canonical_lossless_immutable_byte_snapshot_authority_v2` wraps only the
delivered 666CY direct byte boundary. A harness can become ready solely when
`enabled === true` and `kill_switch_engaged === false`. Disabled and killed
paths inspect no request and perform no predecessor or authority work.

For an accepted raw request the harness executes 666CY synchronously. Only an
exact `completed` execution whose terminal is `integrity_only` may produce
private snapshot evidence. The evidence binds the raw-byte observation,
terminal identity, public readback digest and the exact current-process scope.
The evidence object does not carry a reusable capability.

Every canonical authority result is recursively frozen and registered before
publication in a module-private weak registry against a frozen session object.
Verification first recognizes the exact harness and exact result shell, then
requires session identity, rebuilds from the supplied raw request and finally
requires exact deep equality. Copies, clones, public reconstruction,
cross-harness substitution and self-consistent digest replacement grant no
authority.

## Integrity-only public readback

The harness may project a registered canonical result into a bounded public
readback. That projection binds the source terminal and readback digests but
fixes `provenance_verified:false`, `verifier_authority_granted:false`,
`trusted:false` and `admitted:false`. Persisted bytes therefore cannot preserve
module-private result-shell or harness-session identity and cannot recreate the
runtime authority.

## Containment and delivery

Reflection, weak-registry, freezing, hashing, exact comparison and scratch
array operations used by this layer are captured at module initialization.
Scratch arrays are null-prototyped. Public entries return closed, recursively
frozen results and never expose caller-controlled exception text.

The implementation is server-only, synthetic-only, default-off,
provider-free, database-free, runtime-unwired and consumer-free. It adds no
route, callback, dependency reader, persistence, migration, ranking effect,
training, promotion, broker or production capability.

Five normative artifacts are hash-pinned in a fail-closed manifest. Action
660J owns provider-free CI registration. Delivery requires exact-head CI,
independent review, explicit operator approval, ordinary protected PR merge and
successful exact-main CI. An automatic Netlify preview is non-production only.
No production deployment is authorized.
