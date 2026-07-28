# Action 666W — Independent Review of Governed Improvement Proposals

## Decision

```text
action_666w_improvement_foundation_frozen: true
action_666w_independent_review_approved: false
action_666w_local_checkpoint_ready: false
```

The five Action 666V artifacts are byte-frozen at:

```text
62f29e5ff9366b9c4877964deb47b679f07953130eb8487e3b276a19777af6a2
```

The regression and containment evidence is green, but the clean-room review
found seven major trust/provenance/governance gaps. No finding was remediated in
this Action.

Finding counts:

```text
blocker: 0
major: 7
minor: 2
nit: 1
```

## Positive controls

- The implementation is server-only, default-off, and kill-switched by
  default.
- Disabled and kill-switched factories expose no build function and perform no
  request or proposal work.
- Outputs hard-code shadow-only, synthetic, non-publishable, non-causal, and
  no-automatic-change semantics.
- Direct request objects cannot supply status or comparability overrides.
- One-sided section, plan, result, and registry digest tampering fails closed.
- Candidate evidence cannot directly contain
  `approved_experiment_candidate`; that class is derived only by the engine.
- Action 664/665/666 fixture regressions, PostgreSQL matrices, TypeScript,
  scoped ESLint, JSON parity, and containment checks pass.
- The five normative artifact bytes did not change during regression or
  review.

## Major findings

### 666W-M1 — Proposal registry trust anchor is caller-self-authorizable

Severity: **major**

`CanonicalModelImprovementTrustBoundary` contains the registry and all three
expected roots, and the enabled factory accepts that complete object from its
caller. Validation proves internal equality, but not that the expected proposal
root came from an independently owned frozen source. The public post and
registry builders allow an alternative payload, post, registry, and matching
expected root to be rebuilt together.

The existing negative test changes only `expected_registry_root_digest` while
retaining the old registry. It does not exercise the combined self-consistent
replacement.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:358-364`
- `lib/server/canonical-model-improvement-proposal.ts:811-848`
- `lib/server/canonical-model-improvement-proposal.ts:863-902`
- `lib/server/canonical-model-improvement-proposal.ts:1552-1592`
- `tests/e2e/action-666v-governed-model-improvement-proposal.spec.ts:290-309`

Required future boundary: an expected proposal-registry root supplied by a
separately owned frozen manifest/registry authority, not by the same factory
caller that supplies registry bytes.

### 666W-M2 — Upstream Action 664–666 evidence is asserted, not replay-verified

Severity: **major**

The quality, opportunity-set, shadow, learning, and explanation sections
validate versions, formats, flags, counts, and locally recomputed section
digests. They do not invoke the existing canonical verifiers or carry enough
source payload to rebuild:

- the Action 664 pair-bound comparison and protected metric results;
- the full Action 665 candidate membership and outcome-lineage graph;
- the Action 666 baseline/candidate arm roles and paired evaluation;
- the frozen learning result, OOS status, and model artifact;
- the explanation cohort from canonical explanation results.

Consequently, a self-consistent trusted post can assert `comparable`,
`complete_membership`, `out_of_sample`, `reproducible`, or a favorable metric
without proving those claims at this boundary. The fixture's comparison digest
is also a standalone literal not found in the Action 664 canonical evidence.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:905-1085`
- `lib/server/canonical-model-improvement-proposal-fixtures.ts:193-338`

Required future boundary: projection adapters or verifier inputs that rebuild
each referenced Action 664–666 result and compare its canonical identity and
digest before proposal gating.

### 666W-M3 — Preregistered metric and safeguard set is not complete

Severity: **major**

Plan validation checks that each metric remaining in
`plan.protected_metrics` exists in quality evidence with the same floor. It does
not require the plan's protected set to equal the complete protected evidence
set. Removing one protected metric therefore passes while at least one remains.
Primary and secondary metric identifiers are otherwise free-form and are not
bound to an explicit metric-result inventory.

This leaves protected regression and changed-primary-metric threats dependent
on registry trust rather than plan completeness.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:293-333`
- `lib/server/canonical-model-improvement-proposal.ts:1238-1273`

Required future boundary: exact set equality for primary, secondary, and
protected metrics; versioned metric taxonomy; and digest binding to each
underlying metric result and uncertainty object.

### 666W-M4 — Experiment identity and cross-post semantic collision boundary are incomplete

Severity: **major**

The plan semantic digest covers the full plan, but `plan_identity` omits
secondary/protected metrics, non-inferiority floors, validation design, sample
minimums, stop conditions, and rollback metadata. Those fields can therefore
change while retaining the same experiment identity. There is no previous
binding lookup or registry-wide uniqueness check for proposal or plan
identities; only trusted-post identity uniqueness and within-post proposal
cardinality are checked.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:781-808`
- `lib/server/canonical-model-improvement-proposal.ts:881-900`
- `lib/server/canonical-model-improvement-proposal.ts:1449-1461`

Required future boundary: bind every preregistered field to experiment identity,
and require a previous-binding/registry-wide collision check for proposal and
experiment identities.

### 666W-M5 — Multiple-testing evidence is not arithmetically reproducible

Severity: **major**

Validation checks finite probabilities, adjusted >= raw, method version, and a
digest. It does not bind the tested hypothesis inventory, selection family, or
individual raw p-values, and does not recompute Holm/BH/single-hypothesis
adjustment. `selection_process_preregistered` is an asserted boolean.

An internally consistent but incorrectly adjusted favorable p-value can pass
the approval gate.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:276-290`
- `lib/server/canonical-model-improvement-proposal.ts:1163-1181`
- `lib/server/canonical-model-improvement-proposal.ts:1404-1411`

Required future boundary: a canonical hypothesis inventory plus deterministic
method-specific adjustment and selection-risk computation.

### 666W-M6 — `no_change` bypasses required evidence-quality gates

Severity: **major**

`no_change` is returned after point-in-time, reproducibility, complete
opportunity lineage, and sample minimum checks, but before walk-forward
stability, `in_sample_only`, data-quality rates, and multiple-testing/selection
checks. It can therefore be labeled
`verified_evidence_supports_no_change` with evidence that would be
`research_only` for every change proposal.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:1331-1350`
- `lib/server/canonical-model-improvement-proposal.ts:1352-1415`

Required future boundary: a separate versioned no-change policy or all
applicable evidence-quality gates before the verified no-change status.

### 666W-M7 — Split stability and coverage diversity are not derived from canonical rows

Severity: **major**

Stable split count is derived from a signed `direction` string, not from the
effect value or a verified per-split metric result. The split metric and cohort
are not required to equal the plan's primary metric/cohort. Day, ticker, regime,
and identity inventories prove unique counts but are not linked to the
per-identity canonical evidence or per-split results.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:1029-1054`
- `lib/server/canonical-model-improvement-proposal.ts:1352-1361`
- `lib/server/canonical-model-improvement-proposal-fixtures.ts:161-231`
- `lib/server/canonical-model-improvement-proposal-fixtures.ts:270-304`

Required future boundary: derive direction and stability from verified
split-level metrics and bind every split to canonical identity/day/ticker/regime
inventories and the preregistered cohort/metric.

## Minor findings

### 666W-m1 — Period and point-in-time semantics are not parsed

Severity: **minor**

Period ordering is a lexical string comparison, while point-in-time safety is
largely an asserted boolean. The proposal layer does not parse timestamps or
verify evidence intervals/cutoffs.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:956-969`
- `lib/server/canonical-model-improvement-proposal.ts:1284-1294`

### 666W-m2 — Evidence-item source digests are not namespace-bound

Severity: **minor**

Evidence items are canonicalized and digested, but each class's
`source_digests` is not checked against the corresponding canonical section
digest inventory. An item can cite an unrelated valid SHA while remaining
internally valid.

Evidence:

- `lib/server/canonical-model-improvement-proposal.ts:1129-1158`

## Nit

### 666W-n1 — Trust-root test name overstates its attack coverage

Severity: **nit**

The test named as a self-consistent replacement changes only the expected root,
not registry bytes plus the matching root. Rename or extend it in a future
remediation Action.

Evidence:

- `tests/e2e/action-666v-governed-model-improvement-proposal.spec.ts:215-220`
- `tests/e2e/action-666v-governed-model-improvement-proposal.spec.ts:290-309`

## Review-area disposition

| Area | Result |
|---|---|
| External trust roots/caller authority | Major finding M1 |
| Action 664 metrics binding | Major finding M2 |
| Complete Action 665 opportunity sets | Major finding M2 |
| Paired shadow/learning provenance | Major finding M2 |
| Explanation cohort/taxonomy | Major finding M2 |
| OOS vs in-sample | Direct gate passes; provenance remains M2 |
| Walk-forward/holdout/selection leakage | Major findings M5/M7 |
| Multiple testing | Major finding M5 |
| Stability/diversity | Major finding M7 |
| Cost/calibration protection | Direct gates pass; source verification remains M2 |
| Non-inferiority/protected regressions | Major finding M3 |
| no_change | Major finding M6 |
| Status classification | Exclusive output; no_change policy gap M6 |
| Proposal/experiment identity | Major finding M4 |
| Change-set/metrics preregistration | Major finding M3 |
| Stop/rollback metadata | Present; identity binding gap M4 |
| Kill owner/no auto promotion | Pass |
| Duplicate identities | Within-post pass; cross-post gap M4 |
| Alternative self-consistent plans | Major findings M1/M4 |
| Default-off/live impact | Pass |
| External AI authority | Pass |
| Causal claims | Pass |

## Regression evidence

```text
Action 665/666 including Action 666V: 185/185 passed
Action 664 foundation: 163/163 passed
Disposable PostgreSQL matrices: passed as part of Action 664
TypeScript: passed
Scoped ESLint: passed
JSON parity: passed (16 golden scenarios)
git diff/check including explicit untracked-file whitespace checks: passed
Live import/migration/dependency/secret/lockfile scope: passed
```

## Required next Action

Run a bounded Action 666X remediation covering only:

1. externally owned proposal trust anchor;
2. Action 664–666 verifier-backed evidence projections;
3. exact experiment metric/safeguard-set binding;
4. full experiment identity and previous-binding collision boundary;
5. deterministic multiple-testing evidence;
6. versioned no-change gates;
7. canonical split/diversity derivation;
8. the two minor and one nit findings above.

Do not integrate producers or live consumers in that remediation.
