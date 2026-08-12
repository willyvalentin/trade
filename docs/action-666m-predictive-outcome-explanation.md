# Action 666M/O — Predictive Outcome Explanation Contract

## Scope and safety

`canonical_predictive_outcome_explanation_v1` is server-only, synthetic,
offline and default-off. It has no live consumer, database, provider,
persistence or model-promotion path. Every successful result states:

```text
shadow_only: true
live_ranking_effect: false
automatic_promotion_allowed: false
automatic_parameter_change_allowed: false
automatic_threshold_change_allowed: false
automatic_model_change_allowed: false
causal_claimed: false
synthetic_evidence: true
not_publishable: true
```

An external AI may summarize already classified evidence in a separately
governed future layer. It cannot create facts, labels, digests, taxonomy,
thresholds or promotion decisions.

## External trust boundary

The caller request contains only:

- a synthetic/offline evidence-class marker;
- a trusted explanation-input identity;
- the expected trusted post digest.

It does not supply trust roots or canonical evidence. A server-owned
`canonical_explanation_trusted_input_registry_v1` is dependency-injected into
the factory together with an expected root anchor. Registry posts bind:

- Action 665 opportunity membership and decision lineage;
- feature/context registry root;
- training-input manifest identity/digest and registry root;
- decision-time context capture;
- baseline and candidate model tuples;
- candidate model artifact;
- Action 666 OOS prediction, attribution, ablations and calibration;
- shadow pair and shadow evaluation;
- outcome/evaluator/provider path evidence;
- execution cost/slippage evidence.

Changing a post and recalculating its local digest changes the registry root.
It cannot retain the externally expected root. The verified registry root,
post identity and post digest are included in the canonical explanation
digest.

The fixture registry is version-controlled synthetic evidence. It is not
production key management. A future real producer requires a separately owned
registry and root-authority boundary.

## Model-bound prediction and attribution

`canonical_explanation_model_result_post_v1` binds the candidate model identity
and exact artifact digest to:

- training roots and split identity;
- canonical feature order;
- raw and standardized feature values;
- training means and scales;
- standardized coefficients and log-odds contributions;
- model intercept;
- OOS prediction identity and digest;
- ablations and calibration evidence;
- shadow pair/evaluation digests.

The explanation engine reconstructs standardized values, contributions,
log-odds and logistic probability. Prediction, attribution or model drift is
`non_reproducible` or `conflicting`.

## Temporal outcome, cost and calibration evidence

Every horizon point preserves:

- event/candle timestamp;
- interval identity;
- evaluator-input identity;
- provider snapshot identity;
- observation cutoff;
- canonical and horizon completion timestamps;
- point-in-time eligibility;
- canonical evidence digest.

Only one canonical primary horizon is allowed; other completed horizons remain
diagnostic. Event and completion timestamps are checked against decision,
cutoff and evaluator completion evidence.

`canonical_explanation_cost_capture_v1` binds gross R, transaction cost,
slippage and net R to the evaluator input, provider snapshot, capture identity
and observation time. Cost evidence is mandatory because the primary
classification uses net R.

`canonical_explanation_calibration_evidence_v1` binds the bucket to an explicit
cohort, period, calibration policy, denominator identity/count and trusted
metrics-result digest.

## Total and exclusive taxonomy

`canonical_predictive_primary_classification_policy_v1` defines all eight
combinations of:

```text
predicted positive/negative
× published/not published
× net positive/non-positive
```

Exactly one primary code is required:

- `correct_positive_trade`
- `correct_rejection_or_no_trade`
- `false_positive`
- `false_negative`
- `correct_positive_override`
- `correct_rejection_override`
- `false_positive_override`
- `false_negative_override`

A target-before-stop trade whose costs make net R non-positive is a
`false_positive`, never an unqualified correct positive.

Path, cost, reward/risk, calibration, regime, sector and sensitivity codes are
orthogonal secondary diagnostics. Duplicate primary or secondary identities
fail closed.

## Predictive evidence boundary

Evidence is emitted in five non-interchangeable classes:

- `observed_fact`: verified outcome and captured decision-time context;
- `canonical_derived_fact`: exclusive primary classification and secondary
  diagnostics;
- `predictive_attribution`: frozen-model log-odds contributions and ablations;
- `counterfactual_sensitivity`: bounded alternatives, not a true cause;
- `research_hypothesis`: explicitly non-canonical follow-up ideas.

Regime, sector, volatility and liquidity are association-only. Predictive
attribution is not a causal effect.

### Canonical research-hypothesis ordering

Research hypotheses use
`canonical_predictive_research_hypothesis_v1`. Each hypothesis has a stable
identity derived from the canonical decision identity, explained candidate
identity, opportunity-set identity and its exact statement. Array position is
never identity.

Trusted posts clone the caller payload and sort a new defensive copy by
canonical hypothesis identity and semantic digest. The caller array and its
members are never sorted or mutated, including when they are deep-frozen.
Empty lists are valid. Two or more unique hypotheses therefore replay
deterministically regardless of input order. A malformed hypothesis, an
identical duplicate identity, or conflicting bytes under one identity is
rejected with an explicit structured reason code before evidence is built.

These records remain `research_hypothesis` evidence only. They cannot become
observed or canonical-derived facts, do not affect classification or ranking,
and retain `causal_claimed:false` and
`research_hypotheses_affect_ranking:false`.

## Model-derived sensitivity and correlation

`canonical_predictive_sensitivity_v1` uses only the verified candidate model’s
feature ranges, means, scales, coefficients, intercept and contributions.
Current log-odds must reproduce the OOS prediction. Threshold variants are
bound to `canonical_explanation_threshold_policy_v1`; duplicates or precision
drift are rejected rather than rounded or deduplicated.

Training-window correlation diagnostics are bound to the trusted model result.
When a pair crosses the frozen correlation threshold, attribution and
one-feature ablation statements warn that individual values may be unstable
even if joint prediction remains stable. No causal claim is made.

## True no-work default-off

`createCanonicalPredictiveExplanationEngine` defaults to `enabled:false` and
also requires an explicit false kill switch. Disabled or kill-switched
factories expose:

```text
build: null
explain: null
```

The gate is evaluated before request access, cloning, trust/registry lookup,
digest work, classification, sensitivity and output creation. Exact execution
counters remain zero in both disabled modes.

## Golden evidence

`docs/action-666m-golden-predictive-explanation-report.json` is synthetic test
evidence only. It records each successful scenario’s canonical explanation
digest and full result-byte digest. Tests rebuild every scenario and require
exact parity. Nothing in the report is Ture production performance.
