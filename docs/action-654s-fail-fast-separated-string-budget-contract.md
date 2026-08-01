# Action 654S — Fail-Fast Separated String Budget Contract

## Scope

Action 654S is an additive, synthetic-only successor to the frozen Action 654Q
lossless UTF-16 gate. It closes `654R-M1` without modifying Action 654Q, Action
654R, or published PR #78 bytes. It cannot dispatch, submit, fill, persist, or
mutate a trade.

## Private policy

The module-owned production policy is frozen, non-exported, and has exactly
three fields:

```text
maximum_code_units:128
maximum_observation_bytes:384
maximum_total_bytes:1984
```

No public input accepts a policy. Extra arguments are rejected without
inspection. The argumentless review matrix uses fixed, private policies solely
to make each budget reason independently reachable at `−1 / exact / +1`.

## Ordered boundary

The operation captures only a primitive string and reads its primitive
`length` once. It then checks code units, calculates the framed observation
upper bound with safe integer arithmetic, checks observation bytes, calculates
the parser/snapshot plus fixed-contract total upper bound, and checks total
bytes. Only an in-budget input may allocate the UTF-16 frame, iterate code
units, hash, parse JSON, serialize canonically, mint a private capsule, invoke
V5, classify readiness, or consume confirmation.

Unsafe multiplication or addition fails closed as a budget rejection.

## Budget rejection

A budget rejection is bounded plain data, not a normal failure identity. It
contains the policy version, one closed reason, a bounded observed length, its
unit, and the relevant maximum. It sets
`cryptographic_input_binding_claimed:false`, returns no observation, failure,
or terminal digest, and reports every downstream work counter as zero.

## In-budget identity

In-budget strings retain lossless big-endian UTF-16 code-unit observation with
versioned and domain-separated framing. Lone surrogates, valid pairs,
separated units, and canonically equivalent but code-unit-distinct sequences
remain distinct. No UTF-8 replacement, normalization, or case folding occurs.

The canonical gate schema remains exactly `version`, `enabled`, and
`kill_switch_active` in that order with genuine booleans. Its engine-owned
snapshot is frozen before the private Action 654H composition boundary.

## Safety

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
