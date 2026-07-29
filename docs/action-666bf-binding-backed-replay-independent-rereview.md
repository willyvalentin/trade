# Action 666BF — Independent clean-room re-review

Date: 2026-07-29
Branch: `codex/action-666bd-governed-binding-snapshot-admission`
Base/HEAD: `371d60c25f56b8053bb669fef37d2c9787aa428a`
Successor normative digest:
`9d667a7a76bcad15f68bf3069cdc87558d6763f6c212ca36a57c9ec2613b7ac4`

## Decision

```text
independent_rereview_approved: true
local_checkpoint_ready: true

blocker: 0
major: 0
minor: 0
nit: 0
```

Approval is limited to the frozen, local, synthetic and default-off
Action 666BD/BF foundation. It does not authorize a commit, push, PR,
publisher, persistence, provider or database connection, activation,
promotion or deployment.

## Historical finding disposition

`666BE-M1` is closed.

The snapshot boundary now uses
`canonical_bounded_snapshot_validator_v1` with the source-controlled
`canonical_bounded_snapshot_budget_policy_v1`. Traversal uses an
explicit stack and completes a bounded validation before clone,
deep-freeze, full canonical serialization, full snapshot digest or AX
store construction. A 20,000-level input returns a deterministic,
sanitized `snapshot_validation_budget_exceeded` result and does not
throw `RangeError`.

The closed policy binds fixed limits for depth, nodes, own keys, array
length, per-string UTF-8 bytes and total UTF-8 bytes. UTF-8 accounting
includes property keys and values; attacker-sized property keys use a
bounded path representation. The policy version, policy digest,
budget kind, counters and first rejected path are bound to the bounded
failure projection, admission result, lineage and terminal replay
digest.

## Clean-room review

### Traversal and exception boundary

- The validator is iterative; no recursive traversal is used on an
  untrusted snapshot.
- Ancestor tracking detects cycles while allowing repeated,
  non-cyclic references to fail or clone according to the later
  canonical boundary.
- Prototype, own-key and descriptor access is guarded. Proxy or
  descriptor exceptions are converted to closed reason codes without
  exception messages or stack traces.
- Data properties are read from descriptors. Accessor descriptors are
  rejected even when both accessor functions are `undefined`; getters
  and setters are never invoked.
- Array length is obtained from a guarded data descriptor rather than
  property access.
- Symbol keys, unsupported primitives and non-plain prototypes fail
  closed.

### Budgets and forensic projection

- Every budget is source-controlled and caller-independent.
- Exact-boundary and plus-one tests cover depth, nodes, keys, arrays,
  individual UTF-8 strings and aggregate UTF-8 bytes.
- The ordinary synthetic snapshot uses depth 2 and 35 nodes, leaving a
  documented margin below depth 128 and 131,072 nodes.
- A bounded failure explicitly sets
  `full_snapshot_digest_computed:false` and
  `full_snapshot_digest:null`.
- `bounded_observation_digest` covers only request identity, external
  authority/root evidence, immutable policy, reason, first bounded
  rejection path and counters. It is not represented as a full
  payload digest.
- Different bounded observations and tampered policy/path/counters are
  rejected by an independent full result rebuild.

### Preserved authority, store and replay boundaries

- The external authority remains owner-controlled, read once and
  cryptographically bound. Self-consistent caller replacement remains
  rejected.
- Verified snapshot bytes are cloned and frozen only after bounded
  validation.
- Epoch, predecessor, effective-time, cutoff and rollback checks remain
  fail-closed.
- The AX surface remains read-only and exposes no writer, append,
  update, delete, approve, rotate or persistence operation.
- AJ capture, AC mapping, V proposal and AQ replay continue to use the
  observed AX lookups. Admission, store, stage and terminal results
  rebuild independently.
- Default-off and kill-switch paths return before request reads,
  snapshot reads, clones, authority work, lookup/store construction,
  stage execution or digest work.

### Threat matrix outcome

The following cases passed without `RangeError` or unsanitized
exceptions: 20,000 levels; exact and excessive depth/nodes; wide
object; excessive array; excessive value and key strings; aggregate
string exhaustion; cycle; accessor; throwing proxy; non-plain
prototype; symbol; unsupported value; recomputed failure tampering;
changed policy; changed rejection path; and changed counters.

No path to live imports, writes, persistence, provider/database calls,
migrations, dependency or lockfile changes was found. Golden evidence
remains synthetic and not publishable.

## Verification evidence

```text
Action 666BD/BF focused: 27/27 passed
Relevant Action 665/666: 304/304 passed
Action 664 foundation: 163/163 passed
Disposable PostgreSQL matrix: 13/13 passed
TypeScript: passed
Scoped ESLint: passed with zero warnings
JSON/golden parity: passed in independent processes
Production build: passed
git diff --check plus untracked whitespace check: passed
Stage and terminal independent rebuild: passed
Default-off zero-work: passed
Security/scope scans: passed
```

The successor normative digest was identical before the final
regression, after it, and after this review. The predecessor BE
manifest, review and threat matrix remained byte-identical.

## Remaining external dependencies

No live dependency was added. A future operational integration would
still require a separately authorized, real snapshot publisher,
owner-controlled authority source and explicit activation decision.
Those remain outside this foundation and outside Action 666BF.
