# Action 654A — Transport-Inert Execution Dispatch Readiness Envelope

## Status and purpose

`action_654a_transport_inert_dispatch_readiness_v1` is a local,
synthetic-only evidence contract. It evaluates whether an already prepared
Action 653 V5 instruction is internally consistent enough to produce a
readiness record. It does not dispatch, submit, route, persist, or mutate.

The contract is default-off. A disabled gate or active kill switch returns a
prebuilt inert result before inspecting the caller input. Checkpoint readiness
remains false until a separate byte-freeze and independent review completes.

## Sole predecessor authority

Only `action_653s_non_exportable_authority_transaction_v5` with state
`prepared` and terminal reason `instruction_prepared` or
`exact_duplicate_idempotent` is eligible. V1–V4 results and every non-prepared
V5 state stop before authority readback, envelope construction, or downstream
digest work.

For an eligible-looking result the implementation independently:

1. rebuilds the V5 request, receipt, instruction, replay, audit, and terminal
   digests;
2. checks cross-projection execution, risk, confirmation, receipt, session,
   replay, and audit lineage;
3. performs a private readback through the sole public V5 operation and
   compares all authority-critical projections;
4. accepts no caller handle, authority selector, callback, issuer, ticket,
   grant, endpoint, route, account, session cookie, or adapter.

The caller supplies only a V5 plain result and the readiness evaluation
instant. Neither value can select predecessor authority or a live destination.

## Snapshot boundary

The complete input is read exactly once by iterative own-property descriptor
inspection. The snapshotter rejects accessors without invoking getters and
rejects proxies, symbols, non-plain prototypes, cycles, functions, undefined
members, non-finite numbers, and structures beyond the fixed depth, node,
property, or UTF-8 byte budgets. Only a new canonical plain-data snapshot is
deep-frozen and used downstream. No iterator, callback, caller handle, or
caller-owned object is forwarded.

## Eligibility and time

Evaluation requires:

```text
instruction_created_at <= evaluated_at < instruction_expires_at
```

The instants are canonicalized and compared at nanosecond precision. At
`instruction_expires_at - 1 ns` the instruction is eligible. At the exact
boundary and at `+1 ns` it is expired. Expired and otherwise non-eligible
inputs construct no envelope and perform no downstream digest work.

## Envelope binding

`action_654a_dispatch_readiness_envelope_v1` binds:

- V5 contract and execution identity;
- instruction identity;
- risk-admission identity and digest;
- manual-confirmation capability and consumption identities;
- diagnostic-audit identity;
- idempotency identity;
- session identity, expiry, and derived session-expiry identity;
- synthetic replay identity;
- canonical evaluation instant;
- derived readiness identity and independently rebuildable readiness digest.

Every envelope hard-codes:

```text
transport_attached:false
dispatch_permitted:false
broker_submission_allowed:false
```

An exact duplicate returns the same envelope without reconstructing it. Reuse
of an idempotency identity with a different input digest is conflicting and
fails closed.

## Structural exclusion

The implementation imports only canonical hashing, temporal comparison, the
V5 operation, and Node's proxy detector. It contains no fetch, socket, HTTP,
provider, broker, Avanza, credential, BankID, browser, CDP, database,
persistence, process, order, trade, or position interface. It cannot attach a
transport or reach a live or production boundary.

All results retain:

```text
diagnostic_only:true
synthetic_only:true
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
