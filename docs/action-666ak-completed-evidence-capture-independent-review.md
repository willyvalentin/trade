# Action 666AK — Independent Review of Completed Evidence Capture

## Decision

```text
action_666ak_capture_foundation_frozen: true
action_666ak_independent_review_approved: false
action_666ak_local_checkpoint_ready: false
```

The five normative Action 666AJ artifacts are byte-frozen at:

```text
e724666d1576a2b3208344f6b6ce4f7d6cee7c93c55284d279e64f3eaacbd550
```

Finding counts:

```text
blocker: 0
major: 1
minor: 0
nit: 0
```

No normative artifact was changed after the independent review began.

## Regression evidence

- Action 666AJ focused capture/interop suite: 12/12 passed.
- Relevant Action 665/666 suite: 233/233 passed.
- Action 664 foundation standard command: 163/163 passed, including both
  disposable local PostgreSQL matrices.
- TypeScript: passed.
- Scoped ESLint: passed with zero warnings.
- Golden and manifest JSON parsing/parity: passed.
- `git diff --check` and explicit untracked-file whitespace scan: passed.
- Input-order determinism, byte-identical retry, tampering rejection, and
  deep-frozen input immutability: passed.
- Migration, dependency, lockfile, environment, secret, provider/DB-call,
  persistence, write, and live-import containment: passed.
- Normative digest before regression, after regression, and after review:
  byte-identical.

## Findings

### 666AK-M1 — Collision failures omit the observed lookup binding

Severity: **major**

The successful previous-binding snapshot correctly binds `absent` and
`matching` observations. A mismatching proposal or experiment binding,
however, is omitted from `observedEntries`; only the generic
`previous_binding_semantic_collision` reason survives. The generic failure
result contains the capture request identity/digest and reason codes, but not
the observed conflicting binding identity or semantic digest.

The capture-identity lookup has the same provenance gap. It queries with the
canonical capture identity and fails closed when the returned semantic digest
differs, but neither the observed digest nor an observed lookup projection is
bound into the conflicting result. An absent binding and a matching binding are
also not distinguished in the successful capture evidence.

Consequently, for one byte-identical capture request:

- two different conflicting previous-binding digests produce the same
  `conflicting` result;
- two different conflicting capture-binding digests produce the same
  `conflicting` result; and
- capture-binding observations can change between `absent` and `matching`
  without changing the capture digest.

This remains fail-closed for bundle construction and prevents semantic
overwrite. It is nevertheless a major audit/replay provenance defect because
the terminal evidence cannot independently rebuild which external read-only
binding was actually evaluated. It directly violates the Action 666AK trust
requirement that previous/capture lookup observations be request-bound and that
different observed bindings not collapse to the same terminal digest.

Required future remediation:

- define a versioned, sanitized lookup-observation projection for proposal,
  experiment, and capture bindings;
- bind request identity, lookup namespace/type, requested binding identity,
  observed status, and observed semantic digest into every terminal result;
- add a terminal result digest for `captured`, `conflicting`, and `incomplete`;
- preserve sanitized exception classifications without backend messages or
  stack traces;
- add negative tests proving two different observed collision digests cannot
  share terminal evidence and that independent rebuild rejects tampering.

## Review areas without findings

- `captured | conflicting | incomplete` is exact and exclusive for capture
  operation results.
- The proposal registry is held by a recognized external authority; the
  request's expected root is only cross-checked and cannot authorize a
  caller-supplied registry.
- Caller assertions such as `verified`, `complete`, `comparable`,
  `out_of_sample`, `point_in_time_safe`, and `reproducible` are rejected.
- Action 664 quality/protected metrics, Action 665 complete opportunity
  membership and outcome lineage, and Action 666 shadow, learning, and
  explanation evidence are replayed by the existing canonical upstream
  verifier.
- Cohort, period, baseline/candidate versions, metric inventories, full
  membership, outcome/evaluator lineage, provider/context provenance,
  point-in-time evidence, source namespace digests, external roots, and bundle
  digest are cross-bound.
- Explicit completion time cannot precede verified upstream evidence.
- Stable capture identity plus the read-only capture-binding lookup prevents
  semantic overwrite.
- `captured` feeds the Action 666AC adapter directly and produces `mapped`
  without adapter special cases or caller eligibility flags.
- Missing producer outputs remain `incomplete`; verified contradictions,
  authority substitutions, and semantic drift remain `conflicting`.
- Lookup exceptions have versioned, structured, sanitized reason codes and do
  not expose exception messages or stack traces.
- Previous- and capture-binding dependencies expose read methods only.
- Input ordering is canonical, input remains immutable, and result tampering
  fails independent rebuild.
- Default-off and kill-switch paths return before authority access, request
  reads, cloning, registry lookup, upstream verification, previous/capture
  lookup, input digesting, or bundle construction.
- There is no persistence, writer, provider, database, migration, route,
  scanner, UI, ranking, training, parameter-change, or promotion call-site.
- Golden evidence is explicitly synthetic and not publishable as Ture
  performance.

## Recommended bounded next Action

Action 666AL should remediate only `666AK-M1`, add lookup-observation and
terminal-result provenance tests, then produce an additive refreeze and
independent re-review. It must not add persistence, producer integration,
activation, commit, push, or PR changes.
