# Action 654T — Fail-Fast String Budget Independent Re-Review

## Decision

The five Action 654S artifacts are byte-frozen at preservation object
`5656fc8bd37bb042bac58ed65bbd117b5cf07db4`, tree
`d607d5ab8983501329b51be5d96d5824ce3115e6`, parent
`649a373609dcb718398e0b3a556811ba7dbf9395`, and normative digest
`ce662b25e7f3cda25a1f9a6011b06fc5a82cab76921241e9f17e4b433704cb0e`.
The digest remained identical before regression, after regression, and after
review. No normative byte was modified.

Two major findings prevent approval and checkpoint readiness.

```text
blocker:0
major:2
minor:0
nit:0
independent_rereview_approved:false
local_checkpoint_ready:false
```

## Finding 654T-M1 — byte-budget matrices are not exact ±1 boundaries

Severity: major.

The private review matrix labels its rows `offset:-1/0/1`, but the offset is
applied to UTF-16 code-unit count for every policy. The independently rebuilt
framed-observation values are `142 / 144 / 146` bytes around maximum `144`, not
the required `143 / 144 / 145`. The conservative-total values are
`1016 / 1024 / 1032` bytes around maximum `1024`, not
`1023 / 1024 / 1025`.

All three reasons are reachable and their rejecting rows are zero-work, but
the observation-byte and total-byte matrices do not prove their exact
budget-unit `−1 / boundary / +1` semantics. No remediation was performed.

## Finding 654T-M2 — test policies are reachable through production exports

Severity: major.

The runtime export inventory includes
`readAction654sPrivateBoundaryMatrixForReview`. Its exported body constructs
the private code-unit, observation-byte, total-byte, and unsafe-arithmetic test
policies and passes them into the same internal execution path. The policies
cannot be supplied or mutated by the caller and do not expose live authority,
but the test-policy execution surface is reachable from the production module
export inventory. This fails the required separation that test policies cannot
reach production exports. No remediation was performed.

## Verified properties

- The production policy is private, frozen, non-caller-supplied, and contains
  exactly `maximum_code_units`, `maximum_observation_bytes`, and
  `maximum_total_bytes`.
- Production validation orders code-unit, framed-observation, and conservative
  total checks before lossless observation and parsing.
- Safe multiplication and addition fail closed on unsafe arithmetic.
- Budget rejections are bounded plain data with no failure identity, no
  cryptographic input-binding claim, and zero observation, failure, terminal,
  parser, serialization, capsule, readiness, V5, consumption, transport, or
  mutation work.
- `654R-M1` reproduces against Action 654Q and is closed by Action 654S.
- Lossless big-endian UTF-16 identity remains collision-free across lone
  surrogates, pairs, separated units, and normalization-distinct strings.
- The hook-free primitive boundary, private readiness provenance, invalid-zero
  and valid-single consumption behavior, and synthetic-only interoperability
  remain intact.
- Transport, dispatch, broker submission, fill, credential, provider,
  browser/CDP, database, persistence, process, and write capabilities remain
  absent.

## Validation

The final validation results are recorded in the preservation manifest and the
Action report. The inherited broad and restricted failure matrices remain
content-addressed and equivalent. The known unchanged
`hb307cCanaryRouteBuildMarker` build failure is scope-external and is not
classified as success.

## Safety flags

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
