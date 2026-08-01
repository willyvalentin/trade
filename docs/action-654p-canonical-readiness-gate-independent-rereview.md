# Action 654P — Canonical Readiness Gate Independent Re-Review

## Decision

The five Action 654O artifacts are byte-frozen at preservation object
`07ac1549a7e0518cc1742b09ff4ff2b9372034ad`, tree
`b3027723a46fc933a8ddfbab529446ef0d648f80`, parent
`3330df9a368f7f9979ed0d4a10b2ecd44a6e2672`, and normative digest
`8826c7f6d650bb98416611f8cc07ebf454cad70f7e755a36523c6636016c9ab2`.
The digest was identical before regression, after regression, and after review.
No normative byte was modified during review.

One major finding prevents approval and checkpoint readiness.

```text
blocker:0
major:1
minor:0
nit:0
independent_rereview_approved:false
local_checkpoint_ready:false
```

## Finding 654P-M1 — malformed primitive-string identity collision

Severity: major.

The public boundary correctly rejects caller-owned objects without invoking
getters, proxy hooks, accessors, descriptors, prototypes, enumeration, or
reflection. However, malformed primitive-string evidence is converted with
`TextEncoder` before hashing. JavaScript lone-surrogate code units are replaced
with the same UTF-8 replacement sequence.

The independent suite supplied two distinct malformed strings, one containing
`U+D800` and the other `U+D801`. Both were rejected with
`gate_json_parse_failed`, but both produced the same observed-string digest and
the same failure identity. Character count, UTF-8 byte count, and reason were
also equal. Therefore the result does not bind the exact originally observed
JavaScript string and violates the requirement that different malformed inputs
have distinct failure identities.

No remediation was attempted. A future additive successor must bind a lossless
representation of the original primitive string, including unpaired UTF-16 code
units, before any lossy UTF-8 replacement.

## Verified boundaries

- `typeof` rejects objects, proxies, functions, boxed strings, and accessors
  before caller-owned property or reflection work.
- Getter and proxy hook counts are exactly zero in Action 654O.
- The canonical gate schema, field order, genuine booleans, character budget,
  UTF-8 budget, and byte-exact serialization checks are closed.
- Parser exceptions and caller text are sanitized from public results.
- The engine-owned three-field snapshot is frozen and only its primitive bytes
  are projected downstream.
- `654N-M1` remains reproducible against Action 654H and is closed at the
  Action 654O boundary.
- Action 654O imports no V5 operation. Plain V5 results do not establish
  readiness authority.
- Disabled, killed, malformed, and substituted attempts consume nothing.
- A valid composition establishes one V5 and one readiness; exact duplicates
  remain idempotent and conflicting reuse fails closed.
- Transport flags remain immutable false. No dispatch, submission, fill,
  broker, credential, provider, browser/CDP, database, persistence, process, or
  production-write capability is reachable.
- Synthetic replay and diagnostic audit interoperability remain synthetic-only
  and performance-ineligible.

## Validation

```text
Action 654O focused/adversarial:12/12 passed; 1 probe-only skipped
Action 654P independent review:11/11 passed, including finding reproduction
Action 654H/654I/654O/654P union:53 passed; 5 probe-only skipped
Relevant predecessor/security union:259 passed; 5 probe-only skipped
TypeScript:passed
scoped ESLint:passed with zero warnings
golden JSON and git diff-check:passed
UTC/Stockholm/New York/reverse-order determinism:passed
restricted baseline:22 passed / 5 failed, identical
broad content-addressed baseline:3451 passed / 13 failed, identical
production compilation:passed
production build type-check:known scope-external hb307cCanaryRouteBuildMarker failure
full_execution_regression_passed:false
```

The build failure is in byte-unchanged
`app/api/hb307c/ping/route.ts` and is not classified as success. The Action 654O
successor imports none of the broad or restricted failing live-fill surfaces.

## Safety flags

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
