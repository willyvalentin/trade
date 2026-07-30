# Action 653A — Broker-Neutral Execution Instruction Envelope

## Scope

Action 653A is a local, default-off contract that turns an admitted Action 652C
intent plus a consumed Action 650U manual confirmation into an immutable,
broker-neutral instruction. The only destination is
`action_653a_synthetic_replay_only`. The instruction is evidence for synthetic
replay; it is not a transport request, broker order, real fill, or performance
claim.

The normative contract version is
`action_653a_broker_neutral_execution_instruction_v1`. Its closed result
taxonomy is:

```text
prepared
blocked
expired
conflicting
unmappable
```

Only a provenance-valid `prepared` result can pass
`canAction653aProceedToSyntheticReplay` and the pure
`replayAction653aPreparedInstruction` gate.

## Admission and identity binding

The enabled contract accepts exactly six fields: the provenance-backed
preparation, Action 652C risk admission, Action 650U confirmation boundary and
capability, confirmation-consumption instant, and observation instant. It
derives every instruction field from those verified predecessors. A caller
cannot provide a destination, schema version, submission identity, payload,
unit, scale, currency, authority, account, endpoint, or transport field.

The terminal envelope binds:

- execution, lifecycle, preparation trace, handoff identity, handoff digest,
  canonical payload digest, and preparation provenance;
- Action 652C admission identity and independently rebuildable terminal digest;
- Action 650U request, capability, one-shot consumption, session, and receipt
  digests;
- instrument, side, integer quantity, integer price micros, integer notional
  micros, explicit scales, units, and SEK currency;
- idempotency and derived submission-intent identities;
- instruction schema, synthetic-only destination, creation instant, strict
  expiry, terminal reason, rejected-input digests, and envelope digest.

Risk admission must be `admitted`. Its execution, handoff, session, payload,
idempotency, and manual-confirmation gate must match the preparation and
confirmation exactly. Automatic execution and caller-created or cloned
predecessor objects fail closed.

## Temporal and consumption policy

All temporal decisions use canonical nanosecond instants. Instruction creation
equals the confirmation consumption instant. Instruction expiry is the earlier
of session expiry and creation plus 30 seconds. Validity is strict:

```text
observed_at < instruction_expires_at
```

Therefore expiry minus one nanosecond is accepted; exact expiry and expiry plus
one nanosecond are `expired`. Confirmation consumption also retains Action
650U's one-shot and strict session-expiry semantics.

An exact duplicate using the same capability, predecessor object identities,
and request digest returns the same immutable result. Changed input after
consumption is `conflicting`; cross-execution reuse is rejected.

## Immutable hostile-input boundary

When enabled, the root request is inspected once through property descriptors.
The implementation rejects proxies, accessors without executing getters,
cycles back to the root, symbols, missing or extra fields, descriptor
exceptions, malformed instants, and unproven nested predecessor handles.
Verified predecessor objects are already frozen and provenance-backed. Only
derived plain-data projections are used in the instruction and terminal
evidence.

Failures contain sanitized observed-input digests and a lineage-bound failure
digest. Raw rejected objects are never retained in a result.

When disabled or when the kill switch is active, the contract returns a shared
frozen result before request inspection, cloning, provenance lookup, authority
work, confirmation consumption, or digest work.

## Structural exclusions

The implementation exports no submitter, transport, request, socket, fetch,
provider, account, persistence, or database interface. It has no broker URL,
credential, cookie, BankID, browser, CDP, live market-data, or account field.
It performs no order, trade, position, database, or production mutation.

The fixed safety posture is:

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```

## Synthetic interoperability

The focused matrix verifies the local chain:

```text
652C admitted
→ Action 650U identity-bound manual confirmation
→ 653A prepared broker-neutral instruction
→ 653A synthetic replay gate
→ independently instantiated equivalent synthetic replay evidence
→ 651C diagnostic audit
```

The 651C audit remains diagnostic-only, synthetic-only, ineligible for
performance use, and explicitly not real-broker evidence. A fresh equivalent
fixture is used for the audit because Action 650U capabilities are intentionally
one-shot.

Equivalent UTC spellings, Europe/Stockholm, America/New_York, and reversed
request construction produce identical instruction, envelope, submission
identity, and synthetic replay evidence digests.
