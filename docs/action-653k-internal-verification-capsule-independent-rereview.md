# Action 653K — Internal Verification Capsule Independent Re-Review

## Decision

The five Action 653J normative artifacts remain byte-frozen at:

```text
64187d25340f2ada9194209d7a59446a6d35c04f6bfd98d7d80af439184282a9
```

The digest was identical before regression, after regression, and after the
independent review. No normative remediation occurred.

The independent re-review is not approved:

```text
blocker:0
major:1
minor:0
nit:0
```

## 653K-M1 — The V3 snapshot boundary still forwards caller handles

Severity: `major`

Action 653J creates and freezes its plain-data snapshot in
`captureBoundary`. After that function returns, the exported issuer recovers
the original caller handles and performs seven distinct identity, verification,
lookup, or consumption operations on them:

```text
consumptionRecords.get(capabilityHandle)
hasAction650sPreparedExecutionProvenance(handles.prepared)
canAction652cProceedToManualConfirmation(handles.risk_admission)
getAction650uManualConfirmationConsumptionState(capabilityHandle)
verifyAction650uManualConfirmationCapability(capabilityHandle)
handles.confirmation_boundary
consumeAction650uManualConfirmation(...)
```

The Action 652C and Action 650U verifier functions read object fields after
their private provenance checks. The Action 650U consumption function also
reads capability fields. Consequently:

- caller-owned reads after snapshot are not zero;
- caller-handle forwarding is not zero;
- `653I-M1` is reproduced in V2 and remains open in V3.

The focused Action 653J proxy test replaces the request handles only after
`issueAction653jInternalVerificationCapsule` returns. At that point the
verifier calls and confirmation consumption have already completed. The
replacement proxies correctly observe zero later hooks, but this does not
exercise or prove the interval between snapshot creation and consumption.

The authentic predecessor handles are currently deeply frozen and backed by
private runtime provenance. No mutable TOCTOU exploit or live capability was
reproduced, so this is major rather than blocker.

No remediation was performed during this review.

## Independently verified controls

- The five-path normative digest and every preservation byte match.
- Descriptor inspection is iterative and bounded.
- Nested accessors execute exactly zero getters.
- Proxies, cycles, malformed graphs, and budget excess fail closed.
- Capsule clones, self-minted capsules, and substituted capsule bytes fail
  private `WeakMap` provenance.
- Capsule and instruction bytes are frozen and digest-bound.
- Local lineage, parity, expiry, capsule, instruction, and result construction
  precede the predecessor consume call.
- A substituted-lineage attempt consumes zero and leaves the capability usable.
- A correct following attempt consumes exactly once.
- Exact duplicate is idempotent; conflict consumes zero additional times.
- Strict expiry remains closed at minus-one, boundary, and plus-one nanosecond.
- Provenance-only synthetic replay and Action 651C audit interoperability pass.
- Broker, Avanza, credential, BankID, browser, CDP, transport, process,
  database, persistence, and write capabilities remain absent.

## Regression and baseline equivalence

```text
Action 653J focused:13/13 passed
Actions 650–653 predecessor/security union:176/176 passed
Combined frozen regression:189/189 passed
Independent re-review:9 passed / 1 failed
TypeScript:passed
scoped ESLint:passed with zero warnings
production build:content-addressed Action 653J evidence preserved
JSON and diff checks:passed

broad base:3451 passed / 13 failed
broad successor:3451 passed / 13 failed
broad selected tracked blob drift:0/577
broad failure identity/order/messages:identical

restricted base:22 passed / 5 failed
restricted successor:22 passed / 5 failed
restricted failure identity/order/messages:identical
```

The known baseline failures remain scope-external and identical.
`full_execution_regression_passed` remains `false`.

## Safety flags

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
full_execution_regression_passed:false
```

Because `653K-M1` is open, independent re-review approval and local checkpoint
readiness are both false.
