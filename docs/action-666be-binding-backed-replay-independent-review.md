# Action 666BE — Binding-Backed Replay Independent Review

Review status: **not approved**

This is a clean-room review of the five frozen Action 666BD normative
artifacts. No normative artifact was changed during the review. All evidence
is synthetic, fixture-only, shadow-only, and not publishable as performance.

## Scope and frozen identity

- Base and HEAD:
  `371d60c25f56b8053bb669fef37d2c9787aa428a`
- Normative artifact count: 5
- Canonical normative digest:
  `5d6fbd664cb5718b38ec0709bb6ed7089843a3200ddbad89b954b7ee67ad1757`
- Digest algorithm:
  `sha256_over_lexicographically_sorted_path_nul_sha256_lf_v1`
- Admission contract:
  `canonical_improvement_binding_snapshot_admission_v1`
- Replay contract:
  `canonical_binding_backed_improvement_replay_v1`
- External snapshot:
  `canonical_external_improvement_binding_snapshot_v1`
- AX store:
  `canonical_improvement_binding_store_v1`

## Findings

### 666BE-M1 — Unbounded recursive external snapshot inspection is not fail-closed

Severity: **major**

The untrusted snapshot boundary recursively walks arbitrary caller/external
plain data in `plainDataReasons` without a depth or node budget. A disposable
clean-room adversarial test supplied a valid snapshot plus a 20,000-level
plain-object branch. The replay call threw:

```text
RangeError: Maximum call stack size exceeded
```

The exception originated in the recursive `visit` call before the snapshot
could be classified into a sanitized, digest-bound terminal result. This
breaks the foundation's stated fail-closed result contract and prevents an
independent failure-result rebuild for that input. The same boundary also
lacks an explicit total-node or inventory-size limit, leaving avoidable
resource-exhaustion exposure when the default-off harness is explicitly
enabled for offline replay.

Required future remediation is bounded, non-recursive plain-data validation
with versioned depth/node/inventory limits, a sanitized structured reason
code, deterministic forensic binding, and positive/negative rebuild tests.
No remediation was made in Action 666BE.

## Review conclusions

### External snapshot authority

- The expected proposal-registry root is constrained by the separately
  recognized capture authority and its frozen registry manifest.
- The admission authority is read once.
- Accessors, symbols, custom prototypes, and cycles are rejected before
  cloning; verified snapshot bytes are cloned and deep-frozen.
- Mutation after the authority callback cannot alter admitted bytes.
- Self-consistent alternative snapshot/root replacement is rejected.
- Finding `666BE-M1` prevents full approval of the arbitrary external
  plain-data boundary.

### Snapshot and AX store

- Snapshot and entry schemas are closed.
- Entry inventory ordering and digest are checked.
- Duplicate identities, lookup-key conflicts, and cross-type collisions fail
  closed.
- Publication sequence, epoch, predecessor, cutoff, effective instant, and
  lookup `as_of` are checked with explicit nanosecond instants.
- The AX store is constructed from the admitted frozen projection and exposes
  only the existing read-only lookup adapters.
- No caller-supplied lookup result is accepted.

### Binding-backed replay

- AJ → AC → V → AQ receives actual AX lookup adapters.
- Admission, AX snapshot/store observation, and AQ result digests are bound in
  the terminal lineage.
- Normal, collision, incomplete, authority-conflict, and point-in-time fixture
  paths rebuild independently and deterministically.
- Different previous/capture collision snapshots produce distinct forensic
  identities.
- Finding `666BE-M1` identifies an external-input class that escapes this
  terminal rebuild guarantee.

### Default-off and effects

Focused tests verify disabled and kill-switch modes perform zero request
reads, snapshot reads/clones, authority callbacks/verifications, store
construction/rebuild, lookups, stage execution/rebuild, and digest work.

The frozen terminal safety contract remains:

```text
live_impact:false
automatic_training_allowed:false
automatic_model_change_allowed:false
automatic_promotion_allowed:false
external_ai_canonical_truth_authority:false
```

No writer, persistence, provider/DB access, migration, dependency change,
lockfile change, live import, or production configuration was found.

## Regression evidence

- Action 666BD focused: `21/21` passed.
- Relevant Action 665/666: `298/298` passed.
- Action 664 foundation: `163/163` passed.
- Disposable PostgreSQL matrix: `13/13` passed.
- TypeScript: passed.
- Scoped ESLint: passed with zero warnings.
- JSON/golden parity: passed.
- Production build: passed.
- `git diff --check`, including intended untracked files: passed.
- Cross-process golden determinism: passed; both processes produced
  `e085d14c63e89c7c65649e6b5dfd5d32239177b695dd8c4fe5d3cc835d53e887`.
- Pre-/post-regression normative digest parity: passed.
- The separate adversarial depth review test failed as documented in
  `666BE-M1`; it was review evidence, not part of the frozen regression suite.

## Decision

```text
blocker: 0
major: 1
minor: 0
nit: 0
independent_review_approved: false
local_checkpoint_ready: false
```

The foundation is frozen successfully but is not ready for checkpointing.
The next bounded Action should remediate only `666BE-M1`, then create an
additive refreeze and a separate independent re-review.
