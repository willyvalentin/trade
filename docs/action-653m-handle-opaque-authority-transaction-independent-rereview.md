# Action 653M — Handle-Opaque Authority Transaction Independent Re-Review

Date: 2026-07-30

Review mode: independent, byte-frozen, no remediation

Decision: approved

## Authority and freeze

The review used only:

```text
preservation_ref:
refs/codex-preservation/action-653l-handle-opaque-authority-transaction

preservation_object:
b8f523209ded5ae55dc8d66cbc3497df13230cd8

preservation_tree:
cbe754c5bc5663f9e58f82f218965a6c34d479b0

normative_digest:
e52b05f8e352676819ab64df8a93dec780dcb1062e0e8fc059de5cc7f90b961a
```

The digest was independently rebuilt before regression, after regression, and
after the separate review. All three captures were identical. No normative
653L byte changed after review began.

## Findings

```text
blocker:0
major:0
minor:0
nit:0
```

The V2 `653I-M1` and V3 `653K-M1` paths were reproduced by static and dynamic
review evidence. They remain historical predecessor findings and are not V4
regressions.

## Independent review result

The separate suite passed `10/10`.

It verified:

- the V4 public input has only an opaque ticket, frozen plain projection, and
  two time values; no predecessor handle field exists;
- all preparation, risk, confirmation-boundary, and confirmation-capability
  handles remain in the private authority module;
- descriptor-safe bounded snapshotting and all plain validation precede the
  private transaction;
- the transaction performs private WeakMap lookup, provenance verification,
  and exactly one confirmation consumption;
- only a frozen, provenance-bound receipt leaves the transaction;
- cloned and self-minted tickets/capsules are rejected without consumption;
- cross-session, cross-execution, and cross-handoff substitutions consume zero,
  while a later valid request consumes exactly once;
- exact duplicate success is idempotent and conflicting reuse is rejected;
- session expiry is strict at `−1 ns / boundary / +1 ns`;
- revocable caller proxies execute zero traps at the opaque ticket boundary;
- only provenance-valid prepared evidence reaches synthetic replay and the
  651C audit remains diagnostic and non-performance-eligible;
- transport, broker, Avanza, credential, browser, CDP, process, database,
  persistence, automatic-execution, and write capabilities are absent.

## Validation

```text
Action 653L focused:13/13 passed
green predecessor/security union:202/202 passed
independent re-review:10/10 passed
TypeScript:passed
scoped ESLint:passed / zero warnings
production build:passed
JSON and git diff checks:passed
```

The historical independent V2/V3 review failures are retained as expected
reproductions. They are not included in the green V4 successor union.

## Baseline equivalence

The frozen successor adds five isolated paths to the exact 653K authority tree.
Every one of the 577 broad-selection predecessor blobs remains byte-identical.
The preserved content-addressed broad results therefore remain:

```text
broad base:3451 passed / 13 failed
broad successor:3451 passed / 13 failed
failure identities, order, and messages:identical
```

A fresh broad collection was attempted but Actions 376–379 require external
materialization preconditions absent from this isolated worktree. It was not
substituted for the preserved content-addressed evidence.

The restricted two-spec selection was rerun and reproduced:

```text
restricted base:22 passed / 5 failed
restricted successor:22 passed / 5 failed
failure identities, order, and messages:identical
```

The five known failures remain baseline-identical and scope-external.

```text
full_execution_regression_passed:false
```

## Safety decision

```text
real_broker_submission:false
avanza_live_access:false
credential_access:false
automatic_execution:false
trade_mutation:false
production_write:false
```

No PR, branch, deployment, live transport, credential, browser, Avanza, or
database state was mutated.
