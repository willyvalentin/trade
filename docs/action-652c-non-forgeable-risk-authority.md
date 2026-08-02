# Action 652C — Non-Forgeable Risk Authority V2

## Additive successor

Action 652C closes `652B-M1` without changing any Action 652A or 652B byte.
The V1 issuer remains historical evidence and is used only to reproduce the
original attack. Consumers must use the V2 entrypoint:

```text
runAction652cExecutionIntentAdmission(gate, request)
```

The V2 request has exactly three fields:

```text
prepared
intent
admission_at
```

Issuer, authority handle, policy, limits, trust root, registry owner, capability
digest, and account or market snapshots are not request fields. Any such added
field is rejected before private authority lookup.

## Private registry runtime

The V2 module owns a private, deeply frozen synthetic registry. Its runtime is
created by a non-exported closure and registered in a private `WeakSet`.
Registry lookup requires that exact runtime reference.

The matched registry entry is read once, copied through a bounded
descriptor-based plain-data snapshot, and deeply frozen. Downstream issuance
uses only those snapshot bytes. No caller object contributes policy, limits,
membership, registry ownership, market/calendar authority, or account snapshot
data.

The private issuer creates an opaque object and records its authority in a
module-private `WeakMap`. Neither the issuer, runtime, opaque capability, nor
underlying authority handle is exported or returned. The capability is consumed
internally exactly once.

Its evidence binding includes:

- external registry owner identity and digest;
- registry membership digest and exact instrument/side set;
- policy identity, version, and digest;
- issuance instant and strict expiry;
- execution and session identity;
- cash, exposure, and open-intent snapshot identities;
- every exact quantity, notional, price-deviation, daily, cash, exposure,
  open-intent, and snapshot-age limit;
- the immutable authority snapshot digest;
- an independently reproducible capability digest.

## Temporal and forgery rules

The private capability is usable only when:

```text
issued_at <= admission_at < expires_at
```

Expiry minus one nanosecond is accepted. Exact expiry and expiry plus one
nanosecond are rejected as `private_authority_capability_expired`.

Cross-session, cross-execution, instrument, or side lookup fails before
issuance. Copied result evidence, caller-supplied handles, forged provenance,
recomputed digests, accessors, proxies, cycles, excessive structures, and
post-verification mutations cannot create a V2 admission capability.

Only an original frozen `admitted` V2 result in the private result-provenance
set, with a matching independently rebuilt terminal digest, can pass
`canAction652cProceedToManualConfirmation`.

## Synthetic interoperation

The supported chain remains:

```text
private registry admission
→ identity-bound manual confirmation
→ confirmed synthetic replay
→ Action 651C diagnostic audit
```

No real fills or performance claims are derived.

## Capability exclusions

The V2 graph adds no Avanza, broker transport, credential, BankID, cookie,
browser, CDP, live provider data, Supabase write, database persistence, process
spawn, automatic execution, real order/trade/position mutation, or production
write surface.

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
full_execution_regression_passed:false
```
