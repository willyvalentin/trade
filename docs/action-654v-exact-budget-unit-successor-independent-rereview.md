# Action 654V — Exact Budget Unit Successor Independent Re-Review

## Decision

The five Action 654U artifacts are byte-frozen at preservation object
`e44ae65667ea24a8b1797c15b0c510408cded929`, tree
`c30f8752138a2f99238c47b091f9134e1845c8da`, parent
`de319405869af7df8d9fe3fae459f7e12c95dae6`, and normative digest
`9948ffb3a94f1744bfc9ca74dfbabd0a8c8edbd38cdc13531b2e2940399af351`.
The digest remained identical before regression, after regression, and after
review. No normative byte was modified.

```text
blocker:0
major:0
minor:0
nit:0
independent_rereview_approved:true
local_checkpoint_ready:true
```

## Exact and reachable cost proofs

The independent rebuild verified exact integer costs at `maximum − 1`,
`maximum`, and `maximum + 1` for code units, observation bytes, and total bytes.
Configured limits and observed integer costs are separate fields.

The distinct runtime projection truthfully binds adjacent reachable costs:

```text
code units:        127 / 128 / 129
observation bytes: 382 / 384 / 386
total bytes:       1976 / 1984 / 1992
```

Neither the implementation nor golden evidence relabels `382/384/386` as
`383/384/385`, or `1976/1984/1992` as `1983/1984/1985`. The first code-unit
rejection at 129 performs no observation or total work.

## Export and policy boundary

The current production runtime inventory contains exactly
`runAction654uExactBudgetUnitPrivatePolicy`. The historical
`readAction654sPrivateBoundaryMatrixForReview` reproduces only against frozen
Action 654S and is absent from the 654U implementation and runtime exports.

No production export exposes a policy, factory, matrix, evaluator, counter, or
test-only helper. The production source imports no fixture or test module. The
flat primitive policy record is module-owned and frozen; caller policy
arguments, clones, accessors, and proxies reject without inspection and with
all work counters zero.

## Fail-fast, lineage, and safety

- Primitive capture and length occur once before safe-integer budget checks.
- Code-unit, observation-byte, and total-byte checks precede observation,
  digest, parsing, capsule, readiness, V5, and consumption work.
- Oversized rejection is bounded plain data, has no failure or terminal
  identity, and claims no cryptographic input binding.
- `654T-M1` and `654T-M2` reproduce against Action 654S and close in Action
  654U. The relevant predecessor/security union retains the closures of
  `654R-M1`, `654P-M1`, and `654N-M1`.
- Big-endian lossless UTF-16 identity remains collision-free for lone
  surrogates, pairs, separated units, and normalization-distinct strings.
- Private readiness provenance preserves invalid-zero and valid-single
  consumption behavior.
- Transport, dispatch, submission, fill, credentials, provider, browser/CDP,
  database, persistence, process, and write capabilities remain absent.

The inherited broad and restricted baseline matrices remain content-addressed
and equivalent. The unchanged `hb307cCanaryRouteBuildMarker` build failure is
scope-external and is not classified as success.

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
full_execution_regression_passed:false
```
