# Action 654R — Lossless UTF-16 Successor Independent Re-Review

## Decision

The five Action 654Q artifacts are byte-frozen at preservation object
`5eb06cb7f1b6c476665ee8a127097600a2130a95`, tree
`30f4511952a555fb8e91179a602b1dcd8121ff91`, parent
`56b76fe478cb64ff51aa065391623ca51e5a716f`, and normative digest
`4e39e092355845c23bcc67b58e63c1e466c2a8a3c4e84779536c2d12924b85fd`.
The digest remained identical before regression, after regression, and after
review. No normative byte was modified.

One major finding prevents approval and checkpoint readiness.

```text
blocker:0
major:1
minor:0
nit:0
independent_rereview_approved:false
local_checkpoint_ready:false
```

## Finding 654R-M1 — incomplete fail-before-work budget boundary

Severity: major.

Action 654Q exports `maximum_code_units:128` and
`maximum_code_unit_bytes:224`, but no separately named or enforced total
observation budget. The tighter byte limit also shadows the code-unit boundary:
127 and 128 ASCII code units are rejected by the byte budget, while only 129
reaches the code-unit-budget reason. Therefore the three required code-unit,
encoded-byte, and total-budget boundaries cannot each be independently rebuilt
at `−1 / exact / +1`.

More importantly, an oversized input stops content observation and JSON
parsing but calls `budgetRejected`, which performs one failure digest and one
terminal digest. Its effects report:

```text
observation_digest_operations:0
parser_invocations:0
failure_digest_operations:1
terminal_digest_operations:1
```

This violates the required oversized-input zero-downstream-work boundary and
the stronger instruction to stop before digest work. No remediation was
performed. A future additive successor needs three explicit, jointly coherent
budgets and an inert oversized result constructed without digest operations.

## Verified properties

- Iteration uses exact JavaScript UTF-16 code units and independently rebuilds
  the versioned, domain-separated big-endian frame.
- `U+D800`, `U+D801`, other lone high/low surrogates, valid pairs, isolated
  pair members, and separated sequences have distinct observation, failure,
  and terminal digests.
- Composed/decomposed Unicode and case variants remain distinct. No
  normalization, case folding, `TextEncoder`, replacement identity, or code
  point iteration occurs.
- `654P-M1` reproduces against Action 654O and is closed by Action 654Q.
- Malformed in-budget strings bind lossless observation digests and sanitized
  terminal reasons without exposing caller text.
- Objects, proxies, boxed strings, functions, accessors, and callbacks are
  rejected with zero caller hooks.
- Primitive capture count is one. The parsed three-field snapshot is
  engine-owned and frozen; only its verified booleans reach Action 654H.
- `654N-M1` remains closed. Invalid compositions consume nothing; a valid
  composition establishes one V5 instruction and one readiness result.
- Runtime/source exports stay closed. Transport, dispatch, submission, fill,
  credential, provider, browser/CDP, database, persistence, process, and write
  capabilities remain absent.

## Validation

```text
Action 654Q focused/adversarial:14 passed; 2 probe-only skipped
Action 654R independent review:11/11 passed, including finding reproduction
Relevant predecessor/security union:284 passed; 7 probe-only skipped
TypeScript:passed
scoped ESLint:passed with zero warnings
golden JSON and diff/whitespace checks:passed
UTC/Stockholm/New York/reverse-order determinism:passed
export/capability/dependency scans:passed
broad content-addressed baseline:3451 passed / 13 failed, identical
restricted content-addressed baseline:22 passed / 5 failed, identical
production compilation:passed
production build type-check:known scope-external hb307cCanaryRouteBuildMarker failure
full_execution_regression_passed:false
```

The build failure is in byte-unchanged
`app/api/hb307c/ping/route.ts`; it is not classified as success. The five-path
successor changes no broad/restricted baseline blob.

## Safety flags

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
