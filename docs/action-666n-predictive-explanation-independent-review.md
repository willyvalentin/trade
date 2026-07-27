# Action 666N — Predictive Explanation Foundation Independent Review

## Review identity

- Track: SPÅR 2
- Review action: Action 666N
- Review mode: read-only clean-room review; no finding remediation
- Reviewed base: `e8c233bdd7f57623ec1c5f6f99b70588ff2524fd`
- Reviewed contract: `canonical_predictive_outcome_explanation_v1`
- Reviewed taxonomy: `canonical_predictive_failure_taxonomy_v1`
- Reviewed sensitivity policy: `canonical_predictive_sensitivity_v1`
- Normative artifact count: 5
- Canonical freeze digest: `aa2b12143bee72ae2f48382470e05c0a963f5642c0f89ad832f9bc8427c5d1c8`
- Synthetic evidence only: yes
- Production-performance evidence: no

## Decision

The five normative artifacts are byte-stable and regression-clean, but the
foundation is not independently approved and is not ready for a local
checkpoint. Five major trust, provenance, temporal-evidence, taxonomy and
activation-boundary findings remain. No blocker was found because the
implementation is untracked, server-only, fixture-only and has no live
consumer.

Finding count:

| Severity | Count |
| --- | ---: |
| blocker | 0 |
| major | 5 |
| minor | 3 |
| nit | 1 |

## Findings

### 666N-MAJ-01 — Caller-controlled roots are not verified against an external trust boundary

Severity: major.

`trustReasons` validates SHA-256 shape and three internal equality relations,
but does not receive a trusted feature/context registry, trusted training-input
registry, expected root anchor, trusted context capture, or trusted shadow
evaluation result. In particular,
`feature_context_registry_root_digest`, `training_input_manifest_digest`,
`training_input_registry_root_digest`, `shadow_pair_digest` and
`shadow_evaluation_digest` are accepted after format validation only
(`lib/server/canonical-predictive-outcome-explanation.ts:555-593`).

The context capture relation is also circular: the trust binding is compared
with the capture digest supplied in the same explanation request
(`:581-585`, `:989-994`). Consequently a caller can alter context, roots,
shadow evidence or other facts, recompute the request-local digests, and
produce a new internally consistent canonical explanation. The final
explanation digest provides content addressing, not provenance.

Impact: self-consistent alternative payloads can cross the explanation trust
boundary, including capture/root drift and changed observed context.

Required future remediation: accept separately owned trusted registries and
expected roots/results, verify all roots and evidence identities before
classification, and bind the verified trust-boundary identity into the
explanation digest.

### 666N-MAJ-02 — OOS prediction and attribution are not bound to the declared candidate model

Severity: major.

The model binding validates that its caller-supplied version tuple recomputes
and that its artifact digest has SHA-256 shape (`:385-395`). Prediction
validation independently recomputes the prediction payload digest
(`:355-382`). No check proves that:

- the OOS prediction was produced by `candidate_model_identity` and
  `model_artifact_digest`;
- the prediction belongs to a verified Action 666F/H result and split;
- the feature contributions and ablations came from that artifact;
- the baseline/candidate pair and shadow evaluation digests describe those
  exact model bindings.

`CanonicalLearningPrediction` does not itself carry a model artifact identity,
and `feature_attribution_digest` is derived from caller-provided prediction,
ablation and sensitivity material (`:973-994`). A substituted prediction,
model tuple or attribution can therefore be made internally consistent by
recomputing the request-local digests.

Impact: the explanation can state what a model “predicted” without proving
which frozen model produced the OOS value or attribution.

Required future remediation: consume a verified offline-learning/shadow result
or a separately anchored model-result registry and cryptographically bind
model artifact, split, prediction, attribution, calibration and pair evidence.

### 666N-MAJ-03 — Outcome-path, cost and calibration evidence lacks authoritative temporal lineage

Severity: major.

Outcome path points contain no event/candle timestamp, completion timestamp,
evaluator input identity, provider snapshot identity, or evidence digest
(`:92-99`). Validation checks horizon uniqueness and summary parity only
(`:409-441`). It cannot prove when target/stop events occurred or that each
horizon used only candles available through its canonical completion time.

Cost/slippage and calibration buckets are self-digested request objects
(`:444-508`) rather than evidence bound to a trusted execution/cost capture or
versioned calibration cohort/policy. Removing cost evidence is accepted as
`partially_explainable` (`:997-1020`) even though the explanation contract is
supposed to bind cost/slippage evidence. A self-consistently changed cost or
bucket passes its local digest.

Impact: future outcome-path data, removed cost, changed slippage, or a replaced
calibration bucket cannot be distinguished from authoritative evidence at the
explanation boundary.

Required future remediation: bind each path point to evaluator input,
provider/candle interval and completion timestamps; bind costs to captured
execution evidence; bind calibration to a versioned cohort/period/policy and a
trusted metrics result.

### 666N-MAJ-04 — The primary success/failure classification is neither total nor exclusive

Severity: major.

The primary classifier covers only four conditional branches
(`:699-724`). Valid combinations such as a predicted-positive rejected/no-trade
negative outcome, or a predicted-negative published trade, receive no primary
correct/false-positive/false-negative classification. The builder does not
fail closed when no primary class is produced.

In addition, `correct_positive_trade` is derived solely from
`target_before_stop`, while the same explanation can simultaneously state that
cost/slippage turned gross positive R into non-positive net R (`:716-732`).
That makes the primary “correct positive trade” label materially ambiguous
under the contract’s cost-adjusted outcome semantics.

Impact: supported dispositions can be unclassified, and cost-reversed results
can carry a misleading positive primary classification.

Required future remediation: define an exclusive, exhaustive versioned primary
classification matrix across prediction, disposition and cost-adjusted
outcome, then keep path, cost, calibration and association codes as orthogonal
diagnostics.

### 666N-MAJ-05 — No default-off execution gate exists

Severity: major.

The exported builder begins by cloning and processing the request immediately
(`:806-820`). There is no default-off factory, feature flag, kill switch, or
dependency-injected execution boundary that can prove zero reads, clones and
evaluation work while disabled. Safety markers on the returned object do not
constitute an activation gate.

No live import or call site exists today, so this is not current live impact.
It is nevertheless a missing contract boundary required before the foundation
can be considered safely checkpoint-ready.

Required future remediation: provide a server-only default-off factory whose
flag and kill switch are checked before cloning, trust lookup or explanation
work, and add zero-work counters/tests.

### 666N-MIN-01 — Threshold sensitivity inputs are not model-derived or policy-bound

Severity: minor.

Feature ranges, scale and coefficient are supplied separately from the model
artifact. The calculation does not verify that the current log-odds equals the
intercept plus the supplied feature contributions, and `training_mean` is not
used in the crossing computation (`:596-660`). Threshold variants are
caller-provided values without a threshold-policy identity and are silently
deduplicated/rounded (`:662-670`).

Impact: a bounded calculation is deterministic, but its “minimum change” is
not proven to describe the frozen candidate model and policy.

### 666N-MIN-02 — Correlated-feature risk is not carried into explanations

Severity: minor.

The Action 666H learning foundation has training-window correlation
diagnostics, but the explanation input/result does not bind them and the
predictive-attribution statements contain no correlated-feature warning.
Individual coefficients, local contributions and one-feature ablations can
therefore appear more stable than the upstream evidence supports.

Impact: causal claims remain explicitly false, but local predictive
attribution may still be over-interpreted.

### 666N-MIN-03 — Duplicate sensitivity/ablation identities are not rejected

Severity: minor.

The builder checks that sensitivity feature IDs occur among contribution keys
but does not enforce uniqueness (`:951-959`). Ablations are sorted for the
digest but are not checked for duplicate family/feature pairs (`:941-987`).

Impact: duplicated diagnostics can inflate or ambiguously represent the
explanation evidence while retaining deterministic bytes.

### 666N-NIT-01 — Golden report omits per-scenario canonical explanation digests

Severity: nit.

The golden JSON is clearly marked synthetic and stores expected status and
taxonomy, but it does not freeze each successful scenario’s canonical
explanation digest. The focused test therefore proves summary parity rather
than byte-level golden explanation parity.

## Review-area matrix

| Area | Result | Evidence |
| --- | --- | --- |
| Decision/opportunity/candidate lineage | pass with trust-boundary caveat | Action 665 verifier, membership lookup and canonical lineage digest are used |
| OOS prediction/model provenance | fail | 666N-MAJ-02 |
| Feature/context/training roots | fail | 666N-MAJ-01 |
| Calibration/probability semantics | partial | logistic probability semantics pass; calibration provenance fails under 666N-MAJ-03 |
| Evidence-kind separation | pass | evidence kinds are builder-assigned and output verification rebuilds them |
| Association versus causality | pass | association names and `causal_claimed: false` are explicit |
| Sensitivity versus true cause | pass with provenance caveat | wording and flags pass; inputs are not model/policy-bound |
| Taxonomy completeness/exclusivity | fail | 666N-MAJ-04 |
| Gross/net R and cost/slippage | partial | arithmetic passes; provenance and primary-label semantics fail |
| Target/stop/horizon point-in-time safety | fail | 666N-MAJ-03 |
| No-trade/rejected opportunity cost | pass for canonical Action 665 lineage | complete opportunity set and realized candidate outcome are required |
| Threshold/numeric boundaries | partial | finite/range checks pass; 666N-MIN-01 remains |
| Correlated-feature attribution | fail | 666N-MIN-02 |
| Digest/tampering boundaries | partial | output tampering fails; self-consistent request alternatives do not |
| Self-consistent alternative payload | fail | 666N-MAJ-01 through -03 |
| Default-off/no live impact | partial | no live import; no default-off execution gate |
| External AI canonical authority | pass | hypotheses are separately typed and cannot affect ranking |
| Automatic model/parameter/threshold change | pass | all automatic-change flags are hard false and there is no mutation path |

## Threat matrix

| Threat | Result | Notes |
| --- | --- | --- |
| Changed observed fact | fail closed only for unrecomputed mismatch | self-consistent capture/root replacement remains possible |
| Changed realized outcome | partial | direct mismatch fails; separately rebuilt opportunity/evidence lacks an external expected root |
| Changed opportunity membership | partial | Action 665 internal validation is strong; explanation receives no external expected opportunity root |
| Changed OOS prediction | partial | stale digest fails; re-signed prediction/model substitution remains possible |
| Changed model/version tuple | partial | tuple inconsistency fails; a self-consistent substituted tuple is not externally anchored |
| Capture/trust-root drift | fail | roots are caller fields checked mainly for SHA format |
| Future feature/context | pass for `observed_at` | a direct timestamp after decision/cutoff is rejected |
| Future target/stop/horizon data | fail | path points have no timestamps/completion evidence |
| Removed cost/slippage | fail | accepted as partially explainable |
| Manipulated calibration bucket | partial | stale digest/range mismatch fails; self-consistent replacement passes |
| Reclassified failure reason in output | pass | canonical result rebuild detects output tampering |
| Predictive attribution relabeled observed | pass | evidence kinds are builder-controlled |
| Research hypothesis relabeled canonical | pass | hypotheses are always emitted as `research_hypothesis` |
| Threshold sensitivity presented as causal | pass | `causal_claimed` is hard false and wording rejects true-cause claims |
| Incomplete no-trade lineage | pass | Action 665 verification and explicit no-trade semantics are required |
| Recomputed explanation digest after payload tampering | partial | output-only tampering fails; self-consistent input replacement is accepted without external anchors |
| Live activation/import | pass for current tree | no live import, provider, DB, migration or writer call exists |

## Regression evidence

- Action 665A–E.1 and Action 666A–M Playwright matrix: 153/153 passed.
- Action 664 foundation standard command: 163/163 passed.
- Disposable local PostgreSQL matrix: 13/13 passed; production and external
  database interaction both false.
- TypeScript `--noEmit`: passed.
- Scoped ESLint for Action 666M: passed.
- JSON parse/parity: passed.
- `git diff --check` and untracked-artifact whitespace check: passed.
- Live-import scan: passed, zero imports from `app`, `components`, `supabase`
  and `netlify`.
- Dependency/lockfile scan: passed; `deno.lock`, package manifests and
  lockfiles unchanged.
- Migration/environment/secret scope scan: passed.

The first PostgreSQL attempt encountered no active server on the default
socket. The documented Docker-backed disposable harness was then run
successfully. This is an environment startup observation, not a product
finding.

## Remaining dependencies

Before checkpoint approval, a bounded remediation action should add:

1. externally anchored explanation trust inputs tied to the verified Action
   665 opportunity evidence and Action 666 shadow/learning results;
2. explicit candidate-model → split → prediction → attribution/calibration
   provenance;
3. timestamped evaluator/provider path, execution-cost and calibration
   evidence;
4. an exhaustive exclusive primary taxonomy matrix;
5. a true zero-work default-off execution boundary;
6. model-derived sensitivity and correlated-feature diagnostics.

No finding was remediated during this review.
