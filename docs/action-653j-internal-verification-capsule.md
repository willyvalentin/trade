# Action 653J — Internal Verification-Capsule Successor

## Scope

Action 653J is an additive, local-only V3 successor to the byte-frozen Action
653H implementation. It prepares a broker-neutral instruction for synthetic
replay only. It does not modify Action 653A, 653H, 653I, PR #73, or any live
execution surface.

The gate is default-off. Disabled and kill-switch evaluation returns before
request descriptor inspection, cloning, provenance verification, digesting, or
confirmation consumption.

## Initial authority boundary

The initial authority boundary performs the following bounded sequence:

1. Inspect the exact request property descriptors once.
2. Reject accessors, proxies, cycles, non-plain values, and budget overflow
   without executing getters.
3. Build and deep-freeze a new canonical plain-data snapshot.
4. Acquire each caller handle from its data descriptor once.
5. Invoke each required predecessor provenance verifier once.
6. Perform all lineage, parity, identity, destination, and nanosecond temporal
   checks using only the frozen snapshot.
7. Prebuild the immutable capsule, instruction, terminal evidence, and digests.
8. Consume manual confirmation as the final fallible boundary operation.
9. Register only the handle-free capsule and already-frozen result in private
   `WeakMap`/`WeakSet` runtime provenance.

No caller handle is stored in the capsule or its private runtime state. Capsule
materialization, lineage projection, result verification, duplicate result
return, synthetic replay, and audit interoperability operate only on immutable
capsule/snapshot-derived bytes. Expected post-boundary caller-owned reads are
exactly zero.

## Capsule bindings

The internal capsule binds:

- capsule contract and policy versions;
- descriptor witness and canonical snapshot digests;
- private runtime-provenance binding digest;
- execution and lifecycle identities;
- preparation trace and handoff identities/digests;
- risk-admission identity and terminal digest;
- confirmation request, capability, and predicted consumption digests;
- session and idempotency identities;
- quantity, price, notional, units, scale, and currency;
- strict confirmation and instruction expiry;
- submission-intent identity and synthetic-only destination;
- instruction and capsule digests.

Capsule provenance is private and non-cloneable. A copied or self-consistently
edited capsule is not admitted by the private runtime registry.

## Consumption and replay

All fallible V3 validation completes before one-shot confirmation consumption.
An invalid attempt consumes zero times and leaves the same capability available
to a later correct attempt. A correct attempt consumes exactly once. Exact
duplicate input returns the original terminal result; conflicting and
cross-execution reuse is rejected without a second consumption.

Only a provenance-backed `prepared` result reaches Action 653J synthetic
replay. Replay evidence remains diagnostic and synthetic. Action 651C audit
interoperability does not imply real fills, execution quality, causality, or
performance eligibility.

## Structural exclusions

The implementation has no broker or Avanza transport, provider, URL, account,
credential, cookie, BankID, browser, CDP, socket, fetch, process, database, or
persistence interface. It performs no order, trade, position, database, or
production mutation and cannot enable automatic execution.

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
full_execution_regression_passed:false
```
