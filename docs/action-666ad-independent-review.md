# Action 666AD — Independent Review of the Improvement Adapter Foundation

## Decision

```text
action_666ad_improvement_adapter_foundation_frozen: true
action_666ad_independent_review_approved: false
action_666ad_local_checkpoint_ready: false
```

The five normative Action 666AC artifacts are byte-frozen at:

```text
253863ccb5ae9d6a1abf8729a29e1b61f4ed3c6991831b1f549846025293098e
```

Finding counts:

```text
blocker: 0
major: 1
minor: 1
nit: 0
```

No normative artifact was changed after the review began.

## Regression evidence

- Action 666AC focused adapter/harness suite: 17/17 passed.
- Relevant Action 665/666 suite: 216/216 passed.
- Action 664 foundation standard command: 163/163 passed, including both
  disposable local PostgreSQL matrices.
- TypeScript: passed.
- Scoped ESLint: passed with zero warnings.
- Golden and manifest JSON parsing/parity: passed.
- `git diff --check` and explicit untracked-file whitespace scan: passed.
- Input-order determinism and deep-frozen input immutability: passed.
- Migration, dependency, lockfile, environment, secret, provider/DB-call,
  persistence, and live-import containment: passed.
- Normative digest before regression, after regression, and after review:
  byte-identical.

## Findings

### 666AD-M1 — Failed replay evidence is not bound to the evaluated input

Severity: **major**

`replayFailure` hashes only replay version, status, the adapter result, safety
flags, and the digest-algorithm label. For `conflicting`, `unmappable`, and
`input_digest_mismatch`, the adapter result contains no bundle identity,
observed bundle digest, expected digest, or adapter version. Consequently, two
different bundles that reach the same failure status and reason codes produce
the same `replay_digest`.

The initial digest comparison does not close this boundary because
`expected_bundle_digest` is supplied in the replay request. A caller can change
envelope-level input, recompute that expected digest, and still obtain a replay
result that is byte-identical to a different failed input whenever the
classification and reason codes coincide. The golden matrix records bundle
digests separately, but the replay contract itself does not bind them.

This is fail-closed for proposal creation, but it is not sufficient
content-addressed evidence for deterministic audit/reconciliation or
self-consistent tampering analysis.

Required future remediation:

- bind adapter version, bundle identity, observed bundle digest, and the
  verified expected-input binding into every adapter/replay result, including
  all failures;
- ensure the replay digest covers that provenance;
- add negative tests proving distinct failed inputs cannot share replay
  evidence merely because their reason codes match;
- explicitly define whether the expected digest is only an integrity check or
  an independently owned trust anchor.

### 666AD-m1 — Dependency exceptions are misclassified as bundle-shape failures

Severity: **minor**

The public adapter wraps the complete projection, including calls to the
dependency-injected previous-binding lookup, in one broad `catch`. Any lookup
exception is therefore returned as:

```text
status: unmappable
reason: completed_improvement_bundle_shape_unmappable
```

That reason is inaccurate for an operational/read-boundary failure and weakens
the documented distinction between missing producer data, semantic conflict,
and dependency availability. The behavior remains fail-closed and performs no
write, so this is not a blocker or major.

Required future remediation:

- validate runtime shape separately;
- catch previous-binding lookup failures at that boundary;
- return an explicit, stable dependency/read-boundary reason without
  suggesting that producer bundle shape was invalid.

## Review areas without findings

- `mapped | conflicting | unmappable` is type-exclusive and every adapter path
  terminates fail-closed.
- Top-level and producer-binding caller authority fields are rejected, while
  canonical upstream claims are independently replayed.
- Action 664 quality comparison/metrics, Action 665 opportunity membership and
  outcome lineage, and Action 666 shadow, learning, and explanation evidence
  use the existing canonical upstream verifier rather than summary flags.
- Cohort, period, full membership, outcome coverage, metric inventory,
  baseline/candidate versions, row stability, and evidence root are
  cross-bound.
- Explicit instants and canonical upstream temporal evidence enforce the
  point-in-time boundary.
- The proposal registry authority requires the recognized externally frozen
  authority object and rejects substituted roots.
- The previous-binding dependency exposes lookup methods only; no write method
  is present.
- Duplicate experiment identities and prior proposal/experiment semantic
  collisions fail closed.
- Default-off and kill-switch checks occur before request reads, registry
  lookup, previous-binding lookup, upstream verification, cloning, or proposal
  construction.
- Successful replay is deterministic and input-order invariant; inputs remain
  immutable.
- No persistence, provider, database, migration, live route, UI, scanner, or
  ranking call-site imports the foundation.
- Automatic training, parameter, threshold, model, and promotion effects are
  structurally false.
- Golden evidence is explicitly synthetic and not publishable as Ture
  performance.

## Recommended bounded next Action

Action 666AE should remediate only `666AD-M1` and `666AD-m1`, add focused
failure-provenance and lookup-exception tests, rerun Action 664–666, and produce
a new refreeze plus independent re-review. No producer integration, persistence,
activation, commit, push, or PR update should be included.
