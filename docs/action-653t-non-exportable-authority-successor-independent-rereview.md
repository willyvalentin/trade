# Action 653T — Non-Exportable Authority Successor Independent Re-Review

Date: `2026-07-31`

Review mode: independent, clean-room, byte-frozen, no remediation

Decision: approved

## Frozen authority

```text
preservation_ref:refs/codex-preservation/action-653s-non-exportable-authority-transaction
preservation_object:ac71ecfd7c9e160673685c910480acdc107e0384
preservation_tree:80af95b1540c0996ed8b8fc752b100b18ed03033
preservation_parent:f6bf570cc4925245e872005cab7d03ee68d208a9
normative_paths:5
normative_digest:92b071e3a30b58b66a7db923bdc8e6ccff39fe70e20027fe80ff75839093b880
```

The five-path digest was independently rebuilt before regression, after
regression, and after review. All captures were identical. No 653S normative
byte changed after review began.

## Findings

```text
blocker:0
major:0
minor:0
nit:0
```

The first draft of the adversarial evidence used invalid `action_653t_`
idempotency keys and therefore observed the contract's intended fail-closed
response. A corrected fresh-process probe used the required `action_653s_`
namespace. It demonstrated that V4-first issuance cannot select, substitute,
or poison V5 private composition. This was a review-harness correction only;
no normative byte was remediated.

## Adversarial decision

The separate suite passed `13/13`. It verified:

- `653R-M1` remains reproducible against V4 through its exported issuer, while
  V5 exports exactly one runtime operation and no ticket, grant, issuer, mint,
  factory, constructor, registration, or bootstrap surface;
- the fixture imports only the V5 module, its public operation, and plain
  result/input types;
- the request projection is a closed four-field plain-data shape and callers
  cannot choose execution, session, destination, predecessor handles, or
  authority identity;
- results and failures are frozen plain trees with no functions, closures,
  symbols, accessors, special prototypes, or private authority values;
- root and nested proxies, accessors, self-minted values, clones, and
  cross-module objects fail closed with zero proxy/getter hooks and zero
  confirmation consumption;
- request snapshotting, shape validation, lower and upper temporal bounds, and
  idempotency validation precede the private transaction; provenance checks
  precede consumption and only deterministic construction follows it;
- invalid attempts consume zero, a valid attempt consumes exactly once, and
  the plain receipt digest rebuilds independently;
- strict expiry, exact-duplicate idempotency, conflicting reuse, cross-session,
  and cross-execution rejection retain their closed behavior;
- a fresh V4-first subprocess still prepares V5 through its independently
  module-owned composition and returns one consumption;
- synthetic replay remains synthetic-only and the 651C audit remains
  diagnostic, non-performance-eligible, and independently verifiable;
- UTC, Stockholm, and New York subprocesses produce identical evidence;
- transport, broker, Avanza, credentials, browser/CDP, process, database,
  persistence, automatic-execution, trade-mutation, and write capabilities are
  absent.

## Validation

```text
Action 653S focused:14/14 passed
green predecessor/security union:212/212 passed
independent adversarial re-review:13/13 passed
TypeScript:passed
scoped ESLint:passed / zero warnings
production build:passed
golden JSON:passed
git diff and whitespace checks:passed
```

## Baseline equivalence

The preservation object adds only the five 653S paths to exact PR #75 head.
Every pre-existing broad-selection blob remains byte-identical. The prior
content-addressed broad evidence therefore remains:

```text
broad base:3451 passed / 13 failed
broad successor:3451 passed / 13 failed
selected predecessor blob drift:0/577
failure identities, order, messages:identical
```

The restricted two-spec selection was rerun in this clean-room and reproduced:

```text
restricted base:22 passed / 5 failed
restricted successor:22 passed / 5 failed
failure identities, order, messages:identical
```

The known failures are baseline-identical and scope-external. They are not
reclassified as green.

```text
full_execution_regression_passed:false
```

## PR and safety state

PR #75 remained open and draft with base
`3fc1e6e0ec1fac12d3cb528bebcd631546033378` and head
`f6bf570cc4925245e872005cab7d03ee68d208a9`. No PR, branch, deployment,
transport, credential, browser, Avanza, or database state was mutated.

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```
