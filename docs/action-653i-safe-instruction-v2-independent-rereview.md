# Action 653I — Safe Instruction V2 Independent Re-Review

## Decision

The five Action 653H normative artifacts remain byte-frozen at:

```text
851bd4f9e091759410fb70ca986ecde991a0ac72be922e2c5e255297e6264cac
```

The digest was identical before regression, after regression, and after the
independent review. No normative remediation occurred.

The re-review is not approved because one major finding remains:

```text
blocker:0
major:1
minor:0
nit:0
```

## 653I-M1 — Caller-owned data is read after the snapshot boundary

Severity: `major`

The V2 request is captured at the immutable snapshot boundary, but the
successor subsequently passes original caller-provided handles to two
property-reading verifier functions before consumption:

```text
lib/action-653h-safe-instruction-successor.ts:1192
canAction652cProceedToManualConfirmation(handles.risk_admission)

lib/action-653h-safe-instruction-successor.ts:1205
verifyAction650uManualConfirmationCapability(
  handles.confirmation_capability
)
```

The Action 652C gate reads status, authority, terminal-digest, and predecessor
result fields after its WeakSet provenance check. The Action 650U verifier
reads and hashes capability fields. These are caller-owned object-data reads
after the snapshot at line 1150, so the closed
`post_snapshot_caller_reads_zero` invariant and the stronger
`verified_snapshot_only_downstream` claim are not true.

The authentic predecessor values are currently deeply frozen and the review
did not reproduce a post-snapshot mutation exploit. The issue is therefore
major rather than blocker. Remediation must split opaque provenance checks
from data validation and perform all data validation against the frozen
snapshot while retaining original objects only as identity handles for the
final non-consuming-or-single-consuming predecessor boundary.

No remediation was performed during this review.

## Verified closed findings and controls

- The exact V1 nested-getter attack executes a getter in V1 and executes it
  zero times in V2.
- The exact V1 substituted-risk attack consumes the confirmation in V1.
  V2 rejects it with zero consumption, leaves the capability reusable, and
  the following correct attempt consumes exactly once.
- Descriptor inspection is iterative and bounded.
- Accessors, proxies, cycles, symbols, malformed shapes, and budget excess
  fail closed.
- Full local lineage, parity, temporal, idempotency, schema, destination, and
  terminal construction precede the Action 650U consume call.
- No fallible Action 653H validation or hashing occurs after a successful
  consumption.
- Exact duplicate is idempotent; conflict and cross-execution reuse consume
  zero additional confirmations.
- Strict confirmation and instruction expiry remain closed at
  minus-one/boundary/plus-one nanosecond.
- Provenance-only synthetic replay and Action 651C diagnostic-audit
  interoperability remain intact.
- No broker, Avanza, credential, BankID, browser, CDP, transport, provider,
  socket, process, database, persistence, or write capability was found.

## Regression and baseline equivalence

```text
Action 653H focused:13/13 passed
Actions 650–653 predecessor/security union:163/163 passed
Combined frozen regression:176/176 passed
Independent re-review:9 passed / 1 failed

broad base:3451 passed / 13 failed
broad successor:3451 passed / 13 failed
broad failure identity/order/messages:identical

restricted base:22 passed / 5 failed
restricted successor:22 passed / 5 failed
restricted failure identity/order/messages:identical
```

The known baseline failures remain scope-external and identical, so
`full_execution_regression_passed:false`.

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

Because `653I-M1` is open, independent re-review approval and local checkpoint
readiness are both false.
