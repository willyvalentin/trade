# Action 653H — Safe Instruction Successor Contract

## Scope

Action 653H is an additive V2 successor to Action 653A. It creates a local,
broker-neutral, synthetic-only instruction after Action 652C risk admission
and identity-bound Action 650U manual confirmation. It does not change the
published Action 653A/653B artifacts or PR #73.

The successor is diagnostic and structurally non-sendable. It has no broker,
Avanza, credential, BankID, browser, CDP, provider, socket, database,
persistence, process-spawn, trade-mutation, or production-write interface.

## Iterative descriptor snapshot

The request boundary uses
`action_653h_iterative_descriptor_snapshot_v1`.

- The default-off and kill-switch gates return before request inspection,
  cloning, provenance checks, or digest work.
- The root shape is closed and inspected through property descriptors.
- Prepared execution, risk admission, and confirmation capability are copied
  iteratively into newly allocated null-prototype plain-data objects.
- The confirmation boundary is reduced to a descriptor-verified plain
  projection; its function is treated as an opaque provenance handle and is
  never invoked by the snapshotter.
- Accessors are rejected without executing getters.
- proxies, symbols, cycles, non-plain values, excessive depth, excessive
  nodes, excessive properties, and excessive string bytes fail closed with a
  sanitized witness digest.
- Only the new plain-data snapshot is iteratively deep-frozen. No recursive
  freeze or traversal helper is called on caller-owned input.
- All validation, identities, digests, and terminal construction use the
  immutable snapshot bytes. Original objects are retained only as opaque
  provenance handles for the predecessor WeakMap/WeakSet checks and the final
  Action 650U consumption boundary.

Snapshot budgets are versioned and closed:

```text
maximum_depth:48
maximum_nodes:6144
maximum_properties:32768
maximum_string_bytes:1048576
```

## Pre-consumption validation

Policy
`action_653h_all_fallible_validation_before_consumption_v1` requires every
fallible Action 653H check to finish before one-shot confirmation consumption:

- preparation, risk-admission, capability, and boundary provenance;
- execution, lifecycle, preparation, handoff, payload, session, risk, and
  idempotency lineage;
- semi-automatic mode and admitted risk status;
- exact quantity, limit-price, and notional parity;
- fixed units, scales, SEK currency, schema, and synthetic destination;
- canonical consumed/observed instants;
- strict confirmation and instruction expiry;
- duplicate, conflict, and cross-execution identity.

An invalid attempt records
`manual_confirmation_consumptions:0`. A valid attempt preconstructs the
complete frozen terminal from verified snapshot bytes, performs Action 650U
consumption once, then follows a no-fail path that only registers provenance,
caches the exact idempotent terminal, and returns it.

Exact duplicate input returns the same terminal object. Conflicting or
cross-execution reuse is rejected without another consumption.

## M1 and M2 closure

The Action 653G unfrozen nested-accessor attack is rejected with exactly zero
getter executions. The substituted, provenance-valid risk-lineage attack is
rejected before consumption. The same capability remains unconsumed and a
subsequent correct request consumes it exactly once.

## Synthetic interoperability

Only a provenance-backed `prepared` V2 result can reach
`action_653h_synthetic_replay_only`. Clones and digest substitutions fail
closed. The resulting evidence remains synthetic-only and interoperates with
the independently verified Action 651C diagnostic audit. It is not real fill
evidence and is not performance eligible.

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
full_execution_regression_passed:false
```
