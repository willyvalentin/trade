# Action 666H — Learning trust, split isolation and numeric safety

Action 666H remediates the three major, three minor and one nit findings from
the historical Action 666G review. The engine remains server-only, in-memory,
fixture-only, shadow-only, default-off and kill-switched. It has no live
producer, provider, database, persistence or promotion call-site.

## Owned trust boundary

`canonical_trusted_feature_context_registry_v1` is external to the training
request. It defines each feature's stable ID, numeric type, unit, permitted
range, source namespace, capture-evidence type, timestamp semantics,
availability policy and allowed sample/cohort combinations. Regime, sector and
provider are first-class registered contexts with the same capture boundary.

The request carries no caller-declared `availability` flag and cannot add or
rename a feature. Every value has canonical capture evidence whose payload is
bound into a frozen training-input manifest.

`canonical_frozen_training_input_manifest_v1` binds:

- canonical decision identity and complete row digest;
- feature and context capture-evidence digests;
- label digest;
- decision, opportunity-set, scan, evaluator, provider and outcome lineage;
- the trusted feature/context root;
- cohort and sample type.

`canonical_frozen_training_input_registry_v1` is supplied through a separate
trust boundary with expected roots owned outside the training request. The
fixture registry is version-controlled synthetic evidence. A future real
capture must use a separately owned trust source; the caller that asks for
training must not create, replace or approve its own expected roots.

The feature root, manifest digest and training-input registry root are explicit
parts of dataset, candidate-model, shadow-binding and result evidence.

## Canonical overlap graph and splits

`canonical_learning_overlap_graph_v1` binds every training row to:

- canonical decision identity;
- scan-run identity;
- opportunity-set identity and digest;
- evaluator-input identity;
- provider snapshot, timestamp and point-in-time cutoff;
- outcome interval and completion timestamp.

Graph edges connect rows that share a scan, opportunity set, evaluator input,
provider snapshot or overlapping outcome interval. Complete connected
components cannot occur on both sides of a split.

Purge is derived from actual outcome completion and overlap components.
Complete trading days are removed when any row on that day is unsafe. Embargo
begins after the latest test-window outcome completion and uses the explicit
versioned embargo duration. Missing or noncanonical interval evidence returns
`not_trainable`; no duration or timestamp is inferred.

## Numeric safety

Trusted feature ranges constrain raw inputs and canonical R has an explicit
absolute bound. The engine checks raw values, means, variances, standardized
values, linear predictors, sigmoid values, errors, gradients, weights, loss
and attribution intermediates.

An overflow or other non-finite intermediate is caught at the public contract
boundary and returned as `non_reproducible` with a specific reason code.
Near-zero variance uses the deterministic training-window baseline scale and
emits `near_zero_variance_feature:<feature>`. No NaN or Infinity is serialized.

## True no-work default-off

Feature flag and kill switch are checked before reading or cloning the
request, looking up a registry, building a dataset, iterating a model or
creating predictions. Disabled results use the explicit evidence class
`not_inspected_default_off` and report zero for all execution counters.

## Attribution semantics and correlation

Logistic standardized coefficients and local contributions are explicitly
`log_odds_target_before_stop`. Total probability change from the intercept is
reported separately as `probability_delta`; it is not decomposed into additive
feature probability changes.

Linear coefficients and contributions use
`r_target_before_stop_cost_adjusted`.

`canonical_training_window_correlation_diagnostic_v1` computes deterministic
Pearson diagnostics from each training window only. Strongly correlated pairs
emit
`strong_feature_correlation_predictive_attribution_unstable`.

Individual coefficients and single-feature ablations can be unstable when
features are correlated even if their joint prediction is stable. Neither
correlation, coefficient, contribution nor ablation is a causal estimate.
Every artifact retains `causal_effect_claimed: false` and
`automatic_promotion_allowed: false`.

## Scope

All evidence remains synthetic and not publishable. External AI may summarize
frozen results but cannot create registry entries, capture evidence, labels,
trust anchors, model artifacts or promotion decisions.
