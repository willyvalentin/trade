# Action 653S non-exportable authority transaction contract

Version: `action_653s_non_exportable_authority_transaction_v5`

## Public boundary

V5 has one runtime export: `runAction653sNonExportableAuthorityInstruction`.
Its input is a closed plain-data record containing only a request version, a
fixed synthetic operation name, an idempotency key, and an observation instant.
It accepts no execution, session, destination, predecessor, authority, ticket,
grant, callback, issuer, registration, bootstrap, constructor, or factory
field. Runtime and source export inventories are checked against an explicit
allowlist.

The V4 `issueAction653lPrivateAuthorityTicket` export is retained unchanged as
historical evidence for `653R-M1`; V5 neither imports nor exposes it.

## Module-owned authority composition

The private composition boundary owns the fixed synthetic execution/session
identity and destination. It constructs the preparation, obtains the V2
external-risk decision from its private registry, issues manual confirmation,
and keeps every predecessor handle in function-local state. No handle or
authority object is accepted from the caller or returned.

The public request is descriptor-snapshotted iteratively. Proxies, accessors,
symbols, cycles, non-plain objects, callbacks, excessive depth, excessive
properties, excessive nodes, and excessive string bytes fail closed. Getters
are never invoked. Only the frozen canonical snapshot is used downstream.

All request, temporal, identity, risk, preparation, confirmation, idempotency,
and provenance validation precedes the private one-shot consumption. After a
successful consumption, only deterministic construction and freezing of plain
receipt, instruction, synthetic-replay, and diagnostic-audit handoff bytes
remains.

## Consumption and time

- Invalid, expired, conflicting, cloned, substituted, cross-session, and
  cross-destination requests consume zero confirmations.
- A valid request consumes exactly once.
- An exact duplicate returns the same bound evidence with zero new
  consumption.
- A conflicting duplicate is rejected.
- `session_expires_at - 1 ns` is accepted; the boundary and `+1 ns` are
  rejected.

## Evidence and safety

The receipt is a frozen plain-data value whose digest binds request,
preparation, handoff, risk admission, confirmation, session, execution, and the
predecessor consumption receipt. No private ticket, grant, handle, function,
symbol, accessor, special prototype, or closure can escape through any result.

Synthetic replay and the Action 651C diagnostic audit handoff remain synthetic
and diagnostic only. They are not broker evidence and are ineligible for
performance claims.

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
