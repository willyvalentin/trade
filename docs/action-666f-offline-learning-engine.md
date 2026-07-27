# Action 666F — Offline learning and predictive attribution contract

The engine is server-only, default-off, in-memory and fixture-based. It reads
no filesystem, provider, database or production source and has no live
call-site. Every included result is synthetic, shadow-only and not publishable.

## Canonical evidence boundary

One training row represents one quality-eligible Action 664 read-model
identity. It is bound to its canonical decision identity, one Action 665
opportunity-set identity and digest, decision timestamp and explicit
point-in-time cutoff. Action 666 supplies the shadow evaluation version and
the eventual paired-evaluation boundary.

Rows are conflict-first:

- duplicate canonical or quality identities conflict before training;
- cohort and sample type must match the explicitly selected cohort;
- contradictory decision, opportunity-set or coverage lineage conflicts;
- non-reproducible rows produce `non_reproducible`;
- ineligible, ambiguous, no-entry and incomplete labels are excluded;
- insufficient identities, trading days, tickers, positive/negative outcomes
  or regimes produce `not_trainable`, never an empty model.

Diagnostic horizons remain nested diagnostics on the single canonical row and
are not read as features or additional samples.

## Feature and label contracts

`canonical_point_in_time_feature_schema_v1` is an explicit allowlist. Every
feature must be finite, have a source and carry an observation timestamp no
later than the row cutoff or decision. Names indicating outcomes, labels,
future/post-decision evidence, MFE, MAE or realized results are forbidden.

The versioned labels are:

- binary `target_before_stop`, with target-first as 1 and stop-first as 0;
- `canonical_r_cost_adjusted`, derived from canonical R minus the explicit
  versioned transaction-cost assumption.

Actual outcomes remain labels only. They can never enter the feature map.

## Deterministic reference models

The engine trains two transparent dependency-free models:

1. L2-regularized logistic regression for target-before-stop probability.
2. L2-regularized linear regression for cost-adjusted canonical R.

Feature order is canonical. Each walk-forward training window fits its own
population z-score means and scales using training identities only. Training
uses a named seed, fixed iteration count, explicit learning rate and L2
regularization, with no clock-dependent or environment-dependent defaults.
All numerical results are checked for finiteness.

Validation uses expanding trading-day walk-forward splits. The policy binds
initial training days, test length, step, purge, embargo and the 60-minute
outcome horizon. No random split exists, and a canonical identity cannot occur
on both sides of a split.

## What the engine can learn

The models can estimate repeatable predictive associations between
decision-time features and the two versioned labels. They can reveal that a
feature improves or degrades held-out fixture prediction, that an association
changes by market regime, or that a feature useful in early training days
fails later walk-forward tests.

“Why” has two precise predictive meanings:

- `predictive_association`: the standardized fitted coefficient and
  deterministic held-out ablation loss change;
- `local_prediction_contribution`: the feature's standardized contribution to
  one model prediction.

Neither is a causal estimate. Confounding, selection effects and regime drift
remain possible, so every attribution carries `causal_effect_claimed: false`.

## Calibration and attribution

Logistic predictions have explicit target-before-stop probability semantics.
The engine emits synthetic out-of-sample Brier and fixed-bucket calibration
evidence. Scores, tiers, labels and contextual evidence are never converted
into probability.

For both models, attribution includes standardized coefficients, local
prediction contributions and deterministic feature ablation using the
training-window standardized baseline of zero. Fixture evidence includes a
true synthetic signal, an engineered interaction, irrelevant noise, an
in-sample-spurious feature and a regime-conditioned signal.

## Shadow-only binding

Candidate model identities, artifact digests and out-of-sample prediction
digest are bound to
`canonical_shadow_ranking_confidence_evaluation_v1`, the complete
opportunity-set inventory and evaluator/provider contracts. This creates an
offline input boundary for a future Action 666 paired evaluation; it creates
no ranking producer, candidate matching, persistence or live call-site.

`shadow_only`, `live_ranking_effect: false`,
`automatic_promotion_allowed: false` and
`causal_improvement_claimed: false` are mandatory output invariants.

## Future models and external intelligence

A future boosted-tree or ensemble implementation can join only by implementing
the same dataset, split, artifact, attribution, calibration, reproducibility
and shadow-binding contracts under a new explicit family and implementation
version. It must not reuse these linear coefficients as hidden defaults.

An external LLM may later summarize already frozen evidence or propose
research hypotheses above this boundary. It must not create or alter training
labels, infer missing point-in-time features, bypass chronological validation,
rewrite model artifacts or control promotion. Promotion remains a separately
reviewed human and policy decision.

## Production gaps

Real training is not possible until future inactive producers can supply
sufficient canonical quality-eligible rows, full opportunity-set lineage,
decision-time feature snapshots under a governed allowlist, stable regime and
sector definitions, and reproducible outcomes across enough days and tickers.
No such producer integration is included in Action 666F.
