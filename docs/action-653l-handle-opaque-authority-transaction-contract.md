# Action 653L handle-opaque authority transaction contract

Version: `action_653l_handle_opaque_instruction_v4`

Status: local, default-off, synthetic-only successor. The contract neither
modifies nor replaces the published V1 implementation or the preserved V2/V3
successors.

## Boundary

The instruction successor's public request is closed to exactly four fields:

- `authority_ticket`
- `projection`
- `consumed_at`
- `observed_at`

It cannot receive preparation, risk-admission, confirmation-boundary, or
confirmation-capability handles. The ticket is an opaque, runtime-minted object:
its bytes do not authorize a cloned or self-minted object.

Only the private authority module accepts predecessor handles. At issuance it
verifies their provenance, creates one canonical plain-data projection, freezes
that projection, and stores the original handles solely in module-private
WeakMap state. The public successor never stores, recovers, or forwards those
handles.

## Atomic transaction

All fallible public validation happens before authority lookup:

1. inspect request descriptors without executing accessors;
2. iteratively snapshot the projection with bounded depth, nodes, properties,
   and string bytes;
3. reject proxies, accessors, cycles, exotic prototypes, symbols, malformed
   values, scale/unit/currency mismatches, lineage substitutions, and temporal
   violations;
4. derive the frozen request and snapshot digests.

Only then may the private transaction resolve the opaque ticket. The transaction
re-verifies private provenance and consumes confirmation once. It returns only a
frozen, independently rebuildable, provenance-bound consumption receipt.
Downstream construction uses the frozen snapshot, receipt, and derived capsule;
predecessor handles are structurally unreachable.

Invalid requests never enter the transaction. A rejected ticket or projection
does not consume confirmation, so a later valid request may use the original
ticket. An exact successful duplicate is idempotent. Conflicting and
cross-execution reuse are rejected.

## Temporal and replay policy

Consumption must be at or after confirmation and strictly before session
expiry. The instruction remains valid strictly before the earlier of session
expiry and the 30-second synthetic instruction TTL. Boundary tests cover
`−1 ns`, exact expiry, and `+1 ns`.

Only an authentic `prepared` V4 result can enter the synthetic replay gate.
The replay evidence is diagnostic and synthetic only.

## Safety invariants

```text
diagnostic_only:true
synthetic_only:true
broker_neutral:true
handle_opaque:true
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```

The implementation exposes no transport, fetch, socket, broker, Avanza,
credential, BankID, browser, CDP, provider-data, database, persistence,
process-spawn, order, trade, position, or production-write capability.
