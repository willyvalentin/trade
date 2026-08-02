# Action 661J.5Q.1 bounded invocation plan

## Status and boundary

`action_661j5q1_certification_selected_bounded_invocation_plan_v1` is an
additive, default-off planning successor above the merged P.1 runtime-selection
authority. It creates an immutable decision record only. A plan is not runtime
authority, cannot execute a runner, and carries no privileged capability.

The public request surface accepts exactly seven arguments: an explicit enabled
flag, repository root, primitive request identity, primitive request value,
creation boundary, expiry boundary, and deterministic evaluation boundary. It
does not accept admission, certification, selection, runner, receipt, capsule,
authority, callback, provider, or verified-result objects.

## Verification order

1. Return the frozen off result before observing any other argument.
2. Validate exact argument count and primitive types without traversing caller
   objects.
3. Require a lowercase closed request identity of at most 128 UTF-8 bytes.
4. Require an NFC-normalized control-free request string of 1 through 512 UTF-8
   bytes.
5. Require safe-integer creation, expiry, and evaluation times, a TTL from 1 to
   300 seconds, and `created <= evaluated < expires`.
6. Invoke P.1 internally once and verify its exact receipt object through P.1's
   module-private provenance before reading selection bindings.
7. Bind the certified 28/28 inventory, admission and selection identities,
   certification/freeze/recovery commitments, certified runtime family, exact
   runner identity, and Q.1 planning policy.
8. Hash the captured request locally and discard its raw value before building
   public evidence.
9. Establish one private plan provenance entry and return a deeply frozen,
   closed-schema plain-data plan.

Invalid primitive requests are rejected before P.1 and therefore consume no
certification read or runtime-selection operation. Distinct validation stages
and bounded observations feed sanitized failure identities; raw request text,
repository paths, exceptions, and provider messages do not.

## Request and time semantics

The canonical request digest is SHA-256 over canonical JSON containing only the
encoding version and the captured primitive request. The public plan contains
that digest, request byte length, a separately domain-separated request-identity
digest, and the creation/evaluation/expiry boundaries. It never contains the
raw request or request identity.

Time is explicit input rather than ambient wall-clock state. This keeps plan
identity stable across processes and time zones. These boundaries are planning
evidence only; they do not grant execution and must be re-evaluated by any
future separately certified invocation authority.

## Identity, duplication, and conflicts

The request-identity digest indexes private issuance state. Repeating identical
canonical bytes returns the same frozen result. Reusing that identity with a
different request, runtime binding, policy, or time boundary fails closed as
`invocation_identity_conflict`. Clones, serialized copies, recomputed digests,
and substituted profile fields lack private provenance.

## Capability exclusions

The implementation imports only `node:crypto` and P.1. It has no filesystem,
network, subprocess, Docker, PostgreSQL, migration, provider, database,
credential, environment-secret, writer, persistence, deployment, or production
capability. Default-off performs no digest, selection, admission, filesystem, or
planning work.
