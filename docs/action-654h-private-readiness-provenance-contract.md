# Action 654H — Private Non-Reconstituting Readiness Provenance

## Purpose and status

`action_654h_private_non_reconstituting_readiness_v2` is an additive,
default-off, synthetic-only successor to Action 654A. It closes `654G-M1` by
removing V5 plain-result readback from the readiness authority boundary. PR
#78 and the Action 654A/654B artifacts remain historical and byte-unchanged.
This local successor is not checkpoint-ready until a separate freeze and
independent review approves its bytes.

## Closed public operation

The sole runtime export is
`runAction654hPrivateReadinessComposition(gate, input)`. Its input is a closed
plain-data request containing only:

```text
request_version
operation
idempotency_key
observed_at
evaluated_at
```

It accepts no V5 result, ticket, grant, authority, capsule, handle, callback,
issuer, mint, factory, registrar, session selector, execution selector, or
destination selector. Therefore a copied, serialized, recomputed, or otherwise
self-consistent V5 result is not evidence and stops before digest, V5, capsule,
or readiness work. The successor contains no `rebuildAndVerifyV5` path and
does not call V5 from readback, verification, restoration, or reconstitution.

## Private atomic composition

After the closed request and nanosecond time boundaries are fully validated,
the implementation calls the Action 653 V5 operation exactly once using
module-derived original input. A newly established V5 result is immediately
projected into a new, deep-frozen plain snapshot. A lexical private function
mints an empty opaque capsule whose provenance is held only by a module-private
`WeakMap`. The classifier receives that capsule directly, retrieves only the
frozen snapshot, and constructs the readiness envelope without a V5 call.

The capsule, its provenance table, and all mint/classification functions are
non-exported. No capsule or predecessor authority escapes through the public
result. The V5 plain result returned for diagnostic readback cannot be supplied
to this operation and cannot recover either the capsule or authority.

The composition ordering is:

```text
closed plain request validation
  → strict time validation
  → one private V5 establishment
  → immutable private lineage snapshot
  → private capsule lookup
  → no-fail readiness construction
```

Invalid public input never reaches V5 and consumes no confirmation or
execution authority. A valid new composition establishes V5 exactly once and
classifies readiness exactly once. Exact duplicate input returns the stored
envelope without a new V5 invocation, capsule, classification, or consumption;
conflicting reuse fails before V5.

## Snapshot and temporal boundaries

Caller input is copied through iterative own-property descriptor inspection.
Accessors are rejected without getter execution. Proxies, cycles, symbols,
callbacks, iterators, non-plain prototypes, non-finite numbers, and structures
outside fixed depth/node/property/string budgets fail closed. Only the newly
created canonical snapshot is deep-frozen and used downstream.

Both instants are canonicalized at nanosecond precision. They must satisfy:

```text
confirmed_at <= observed_at <= evaluated_at < session_expires_at
```

`session_expires_at - 1 ns` is accepted. The exact expiry boundary and `+1 ns`
are rejected with zero V5, capsule, digest, readiness, or consumption work.

## Bound readiness evidence

The private readiness envelope binds V5 contract/result provenance,
execution, instruction, risk admission, manual confirmation and consumption,
diagnostic audit, idempotency, session/expiry, synthetic replay, and canonical
evaluation identities. Its readiness identity, envelope digest, and terminal
digest are deterministic and independently rebuildable.

Every envelope and result hard-codes:

```text
transport_attached:false
dispatch_permitted:false
broker_submission_allowed:false
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```

The implementation contains no endpoint, account, credential, route, adapter,
fetch, socket, provider, browser/CDP, database, persistence, process, broker,
order, trade, position, fill, or production-write capability. Synthetic replay
and diagnostic audit evidence remain explicitly synthetic/non-performance
evidence.
