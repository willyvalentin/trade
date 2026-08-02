# Action 652B — Execution Risk-Envelope Admission Independent Review

## Decision

Review completed at `2026-07-30T10:29:51Z` against:

```text
base:7120c0cc9467a0106c4c9da84312b7f4d7ef4774
branch:codex/action-652a-execution-risk-envelope-admission
normative_paths:5
normative_digest:0b227fe371b5ce9059635ed05df5b345f8da6121eac95313323ba36a3a085d6f
```

The normative digest matched before regression, after regression, and after
the independent review. No normative byte was remediated or otherwise changed.

```text
blocker:0
major:1
minor:0
nit:0

independent_review_approved:false
local_checkpoint_ready:false
```

## Finding 652B-M1 — Admission caller can self-issue the external authority

Severity: `major`

The admission module publicly exports
`createAction652aExternalRiskAuthority(input)`. Its input contains the complete
policy, snapshot, market authority, calendar authority, limits, and digests.
The function validates plain-data shape and self-consistency, then registers
the newly created handle directly in the private authority-provenance set.
It requires no independently issued owner capability, anchored trust-root
identity, signature, or pre-existing external-policy provenance.

Market and calendar digests are copied from the supplied input. They become
covered by the newly computed envelope digest, but are not independently
rebuilt or authenticated against an external trust root.

The self-excluded Action 652B adversarial suite reproduced both consequences:

1. An externally supplied policy with `maximum_quantity_units:4` rejected the
   five-unit intent.
2. The same admission caller reconstructed the visible authority input, changed
   `maximum_quantity_units` to `999999`, recomputed the public policy digest,
   called the exported issuer, and received a provenance-valid handle.
3. Admission returned `admitted`, and
   `canAction652aProceedToManualConfirmation` returned `true`.
4. A separately caller-minted handle containing literal
   `caller-selected-market-digest` and `caller-selected-calendar-digest` was
   also admitted and projected those values as authority evidence.

This defeats the required separation between execution-intent callers and the
externally owned risk-policy authority. The impact remains bounded to the local
synthetic/manual-confirmation successor because no live broker, transport, or
write capability exists, but the risk-admission decision itself can be bypassed.

Required future remediation, not performed in this review:

- introduce an additive successor whose issuer consumes a non-caller-buildable,
  externally provisioned owner/trust-root capability;
- independently authenticate policy, snapshot, market, session, and calendar
  authority before adding admission provenance;
- keep raw limit/authority construction outside the admission-caller surface;
- rerun the adversarial self-issuance cases and require fail-closed results.

## Verified controls

Apart from 652B-M1, the review verified:

- the enabled request, including the authority graph, is captured through a
  bounded descriptor-based single-read snapshot before verification;
- the snapshot is deeply frozen, and post-verification mutation does not alter
  result projections or terminal evidence;
- getters are rejected without execution, and proxies, cycles, excessive
  strings, nodes, properties, and depth fail closed with sanitized evidence;
- execution, lifecycle, preparation, handoff, payload, idempotency, session,
  instrument, and side identities are bound;
- quantity, limit price, and notional use explicit integer values, scale, and
  units; notional is recomputed with bounded integer arithmetic;
- negative values, signed-128 overflow, unit mismatch, scale mismatch, and
  notional mismatch are rejected;
- quantity, notional, and price decisions were independently exercised at
  minus-one, boundary, and plus-one cases;
- daily count/notional, cash, exposure, and open-intent snapshot checks remain
  closed;
- policy, intent, session, snapshot-age, snapshot-expiry, and finalized-at
  boundaries use nanosecond comparisons;
- two different rejected intents in the same execution lineage produce
  different observed-intent and failure-provenance digests;
- `rejected`, `incomplete`, `conflicting`, and
  `not_point_in_time_safe` results all fail the manual-confirmation gate;
- the valid synthetic chain reaches the existing manual-confirmation-bound
  replay and produces an `audited` Action 651C result;
- disabled and kill-switch paths return before request traversal, authority
  reads, and digest work.

## Regression evidence

```text
Action 652A focused:12/12 passed
Action 652B adversarial review:6/6 passed, including two expected M1 reproductions
Action 650S/650U security union:66/66 passed
Action 651A/651C/independent re-review:34/34 passed
Actions 519–533 content-addressed evidence:1802/1802 preserved
TypeScript:passed
scoped ESLint:passed with zero warnings
production build:passed
JSON, diff, and whitespace checks:passed
```

The fresh historical direct-filename comparison used the same 14 files on exact
base and successor:

```text
base:114 passed / 25 failed
successor:114 passed / 25 failed
failure test identity:equal
failure order:equal
normalized failure message:equal
affected tracked source bytes:equal
```

The fresh restricted matrix matched its exact-base evidence:

```text
base:22 passed / 5 failed
successor:22 passed / 5 failed
failure identity, order, and normalized message:equal
```

The content-addressed exact-base broad evidence remains:

```text
base:3451 passed / 13 failed
full_execution_regression_passed:false
```

A fresh common-set successor broad run could not reach test execution because
historical Actions 376–379 collect-time verifiers require a Git-clean candidate
and reject the intentionally untracked 652A/652B review artifacts. It reported
zero collected tests rather than a comparable `3451/13` result. No historical
file was altered to bypass that gate. Therefore fresh broad equivalence is not
claimed, and `action_652b_baseline_equivalence_verified` remains false.

## Capability exclusion

Static import and invocation inspection plus runtime effect evidence found no
edge from Action 652A to Avanza, broker transport, credential, cookie, BankID,
browser, CDP, live provider data, Supabase writes, database persistence,
process spawning, automatic execution, real order/trade/position mutation, or
production writes.

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
full_execution_regression_passed:false
```
