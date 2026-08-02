# Action 651B — diagnostic execution quality independent review

## Decision

Independent approval is denied and the local checkpoint is not ready. The
review found two major issues in the frozen Action 651A implementation. No
normative byte was remediated after review started.

```text
blocker:0
major:2
minor:0
nit:0
```

## Frozen scope

Base:

```text
ff34b3884ee84777af44e380c0fb7e66bc99e9e1
```

The five normative paths and their individual SHA-256 values are recorded in
`action-651b-diagnostic-execution-quality-freeze-manifest.json`. The combined
digest was independently rebuilt as SHA-256 over path-sorted
`<sha256><two spaces><path>\n` records:

```text
before regression:
29ab1879041034f8ccaf9a49dd2272c5b05ff1f42c3941e0914503b37fc518f3

after regression:
29ab1879041034f8ccaf9a49dd2272c5b05ff1f42c3941e0914503b37fc518f3

after independent review:
29ab1879041034f8ccaf9a49dd2272c5b05ff1f42c3941e0914503b37fc518f3
```

The golden report contains the expected deterministic identity:

```text
action_651a_audit_1edeb10da455650c79b1b1a37c19fea96103ae909c64e31ecd8ec679ce80c1ee
```

This evidence file, the freeze manifest and the adversarial review suite are
self-excluded from the five-path normative digest.

## Findings

### 651B-M1 — failure provenance collides across execution lineages

Severity: `major`

The failure-provenance evidence digest is calculated from only
`failure_kind` and `source_reason`. Two independently provenance-valid
preparations with different execution and lineage identities therefore produce
the same failure evidence digest for the same missing-confirmation failure:

```text
action_651a_failure_817761f98dfcc62290104ef6d9624da23988c9e712feef4cf525ae9b0e04fe25
```

The enclosing lineage and audit digests differ, but the claimed
failure-provenance identity itself is not execution-, handoff-, session-,
idempotency-, replay- or terminal-bound. This contradicts the contract's
failure-provenance binding claim and fails the collision review.

Remediation was intentionally not performed in Action 651B.

### 651B-M2 — accessor-backed diagnostic observations execute during validation

Severity: `major`

An accessor-backed `confirmed_price.price_micros` observation is read twice.
The audit executes caller-controlled accessor code instead of rejecting the
descriptor without observation, and it can continue with values returned by
that code. This creates a post-gate caller-code execution and
time-of-check/time-of-use surface before the diagnostic observation is accepted.

Capability proxies and cyclic values fail closed, outputs are deeply frozen,
and disabled/kill-switch paths remain zero-work. Those controls do not close
the enabled-path accessor surface.

Remediation was intentionally not performed in Action 651B.

## Independent review matrix

The self-excluded adversarial suite executed 11 tests:

```text
passed:9
failed:2
```

The two failures are exactly `651B-M1` and `651B-M2`. The passing controls
independently rebuilt the five-path freeze digest, golden audit identity,
lineage digest, complete audit digest and terminal digest; exercised exact,
minus-one-nanosecond, plus-one-nanosecond, reversed and extreme instants;
reproduced missed, late, expired and conflicting confirmation; verified
integer-micros price separation and synthetic slippage; rejected capability
proxies and cyclic values; proved deep-frozen output; proved default-off and
kill-switch zero-work; and confirmed the closed import/effect surface.

The inherited 650S/650U suites additionally cover provenance-backed preparation,
confirmation request, capability, session, handoff, canonical payload,
idempotency, correlation, one-shot consumption and replay identity, including
clone, substitution and self-consistently recomputed structural tampering.
Result price/timestamp mutation without a matching digest is detected by the
independent audit rebuild. The full independent terminal rebuild matched.

## Regression

```text
Action 651A focused:
12 passed / 0 failed

Action 650S/650U security union:
66 passed / 0 failed

Actions 519–533:
1802 passed / 0 failed

TypeScript:
passed

scoped ESLint:
passed / 0 warnings

production build:
passed

git diff --check, JSON and whitespace checks:
passed
```

The production build used only non-secret local placeholders for the public
build-time Supabase variables. No provider request, credential read, browser,
CDP, database write, live execution or deployment occurred.

## Base/successor equivalence

Exact base `ff34b3884ee84777af44e380c0fb7e66bc99e9e1` and the frozen successor
were run with identical selections. Counts, failing test identities, failure
messages and ordering are byte-for-byte equivalent:

```text
broad base:
3451 passed / 13 failed

broad successor:
3451 passed / 13 failed

restricted live-fill base:
22 passed / 5 failed

restricted live-fill successor:
22 passed / 5 failed
```

The failing source remains tracked at the exact base bytes. Action 651A has no
import edge to the failing live-fill surfaces. The baseline is equivalent, but
it is not green:

```text
full_execution_regression_passed:false
```

## Capability exclusion

The Action 651A import graph is limited to the local Action 650S/650U synthetic
successor graph. Static inspection and runtime effect evidence found no Avanza,
broker transport, credential, cookie, BankID, browser, CDP, live provider data,
Supabase write, database persistence, process spawn, automatic execution, real
order/trade/position mutation or performance-claim surface.

No dependency, migration or lockfile changed. The preexisting unrelated
`deno.lock` remains outside this worktree scope and byte-identical at:

```text
f64e6c85125fef56a6969fba1ef61249e47562a5ea56ad19b4437070d18f9c0c
```

## Machine-readable disposition

```text
action_651b_execution_quality_foundation_frozen:true
action_651b_lineage_and_identity_verified:true
action_651b_nanosecond_timing_boundaries_verified:true
action_651b_synthetic_price_projection_verified:true
action_651b_failure_identity_verified:false
action_651b_default_off_zero_work_verified:true
action_651b_live_capability_exclusion_verified:true
action_651b_baseline_equivalence_verified:true
action_651b_independent_review_approved:false
action_651b_local_checkpoint_ready:false
action_651b_full_execution_regression_passed:false

real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
