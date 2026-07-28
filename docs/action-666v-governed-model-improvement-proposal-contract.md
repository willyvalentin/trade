# Action 666V — Governed Model-Improvement Proposal and Experiment Contract

## Scope and safety boundary

`canonical_model_improvement_proposal_v1` is an offline, server-only,
fixture-only decision-support contract. It converts already verified canonical
evidence into either a bounded research status or a preregistered shadow
experiment candidate. It does not train a model, change code or configuration,
execute an experiment, promote a model, publish a recommendation, or call a
provider or database.

Every output is permanently marked:

```text
shadow_only: true
live_ranking_effect: false
automatic_training_allowed: false
automatic_parameter_change_allowed: false
automatic_promotion_allowed: false
experiment_execution_allowed: false
external_ai_canonical_decision_authority: false
causal_claimed: false
synthetic_evidence: true
not_publishable: true
```

The factory is default-off and the default kill switch is engaged. Both gates
are checked before any request is read, cloned, looked up, validated, or built.
There is no live call-site.

## Evidence boundary

The contract accepts only a reference to a separately trusted,
version-controlled synthetic post registry. A versioned authority manifest
binds the allowed registry root, the feature/context root, the training-input
root, and `canonical_model_improvement_upstream_verifier_v1`. Its manifest
digest is frozen in a different code-owned boundary. The factory caller passes
registry bytes and the already-created opaque authority; there is no
caller-supplied `expected_root` parameter. A caller that changes registry
bytes, posts, and its proposed manifest/root consistently is rejected against
the independently frozen manifest digest before the request is read.

The request cannot supply comparability booleans, proposal status, evidence
values, or its own trust root. The external boundary pins all of:

- proposal registry root;
- Action 666H feature/context registry root;
- Action 666H frozen training-input registry root.

Each trusted post contains the sufficient canonical verifier inputs, versioned
projection metadata, section digests, and one combined evidence root for:

1. Action 664 quality metrics and pair-bound version comparison;
2. Action 665 complete opportunity-set inventory, denominator, membership, and
   outcome lineage;
3. Action 666 paired shadow evaluation;
4. the frozen Action 666 offline-learning result and OOS binding;
5. a canonical Action 666 explanation cohort and failure-taxonomy patterns.

The proposal engine replays the Action 664 comparison, verifies pair-bound
evidence and uncertainty, verifies every Action 665 opportunity set and its
outcome lineage, rebuilds the Action 666 paired shadow result, rebuilds the
frozen learning result against its independent registries, and rebuilds every
canonical explanation. Fields such as `comparable`, `complete`,
`out_of_sample`, and `reproducible` are projections of those verifier results;
caller assertions and standalone digest literals are not evidence.

Every proposal evidence source is a `(namespace, digest)` pair. The namespace
must match exactly one verified canonical section digest. Valid SHA-256 values
from another section, duplicate source claims, and missing required sources are
conflicts.

All temporal comparisons use
`canonical_model_improvement_explicit_instant_policy_v1`. It accepts only
explicit RFC 3339 offsets, preserves up to nanosecond precision, normalizes
offset-equivalent instants before comparison, and checks periods, decision
cutoffs, provider observations, evaluator/outcome intervals, and completion
times. Lexical ordering and caller-supplied point-in-time booleans are not
authoritative.

The quality section additionally binds
`canonical_model_improvement_metric_inventory_v1`: one closed primary metric,
the complete secondary and protected sets, and exactly one verified result
object per metric. Each metric binds value, delta, uncertainty, denominator,
cohort, period, upstream comparison digest, and its applicable regression or
non-inferiority boundary. Missing, extra, duplicate, or substituted metrics are
conflicts.

The learning section carries
`canonical_model_improvement_row_stability_v1`. Its immutable rows are projected
from verified OOS linear-model predictions and bind decision, opportunity set,
trading day, ticker, regime, split, cohort, metric contribution, and prediction
digest. Split effects, uncertainty, direction, stable-split count, and
day/ticker/regime diversity are recomputed from those rows. Duplicate rows,
orphaned fields, or cross-split decision overlap fail closed.
The shadow section binds both complete baseline and candidate version tuples,
which must exactly match the preregistered plan.

Changing any section, model artifact, denominator, opportunity set, explanation,
feature registry, training root, experiment plan, or proposal candidate changes
the relevant digest. A self-consistent caller replacement of the learning trust
roots remains conflicting because the expected roots live outside the post.

## Evidence classes and causal boundary

Evidence remains in the closed, non-interchangeable classes:

```text
observed_pattern
predictive_association
ablation_evidence
counterfactual_sensitivity
research_hypothesis
approved_experiment_candidate
```

Every item has `causal_claimed: false`. A research hypothesis has no canonical
status authority. `approved_experiment_candidate` is derived by the engine only
after all gates pass; callers may not put it into candidate evidence. Approval
means only that an offline shadow experiment is sufficiently specified for a
later human authorization. It is not permission to execute or promote.

External AI may later phrase a research hypothesis from verified facts, but may
not provide evidence values, set proposal status, approve an experiment, modify
canonical truth, choose labels, or control promotion.

## Proposal and status policy

The closed proposal types cover feature addition/removal/transformation,
regularization and model hyperparameters, ranking and calibrated-confidence
thresholds, regime abstention, no-trade/selectivity, stop/target/horizon
research, provider/data quality, and explicit `no_change`.

The engine derives one status:

- `proposal_ready`: all gates pass and a complete preregistered plan is bound;
- `research_only`: the hypothesis is retained but one or more approval gates
  fail;
- `insufficient_evidence`: minimum sample or complete opportunity/outcome
  lineage is absent;
- `conflicting`: identity, digest, trust, taxonomy, or plan evidence conflicts;
- `non_reproducible`: shadow or learning evidence cannot be rebuilt;
- `not_point_in_time_safe`: any required evidence crosses its decision cutoff;
- `no_change`: canonical evidence explicitly supports retaining the baseline.

No missing value is inferred, and no score, tier, label, or evidence-strength
field is converted into a probability.

## Experiment approval gates

`canonical_model_improvement_policy_v1` requires, for the synthetic contract:

- at least 20 canonical identities, five trading days, four tickers, and two
  regimes;
- at least three walk-forward splits and three stable splits, with at least
  75% effect-direction stability;
- quality-eligible rows and zero incomplete, ambiguous, or conflicting rate;
- complete Action 665 membership and reproducible outcome lineage;
- point-in-time-safe evidence;
- frozen, reproducible, out-of-sample Action 666 learning evidence;
- calibrated probability semantics for confidence metrics;
- positive cost-adjusted expectancy and no calibration regression;
- no protected metric below its preregistered non-inferiority floor;
- a canonical hypothesis inventory and deterministically recomputed
  single-hypothesis, Holm, or policy-allowed Benjamini–Hochberg correction,
  with adjusted primary p-value at most 0.05;
- a complete `canonical_model_experiment_preregistration_v1` plan.

An asserted in-sample/OOS classification that disagrees with the rebuilt
learning result is `conflicting`. Insufficient data never becomes a zero-value
result. An uncontrolled multiple-testing process cannot be an approved
experiment candidate.

## Locked experiment plan

The plan identity and semantic digest both lock every preregistered field:

- baseline and candidate engine/scoring/ranking/threshold/confidence/evaluator/
  provider tuples;
- exact change-set digest;
- primary, secondary, and protected metrics;
- non-inferiority floors;
- explicit cohort and period;
- chronological trading-day walk-forward plus locked holdout;
- purge and embargo requirement;
- minimum identities, days, tickers, and regimes;
- stop conditions;
- previous and candidate rollback versions;
- rollback trigger categories and a required kill-switch owner placeholder;
- evidence-root, total metric-inventory, hypothesis-inventory,
  multiple-testing-family, and multiple-testing-result digests;
- `preregistered: true` and `no_automatic_promotion: true`.

Plan tampering invalidates its identity or semantic digest before a proposal can
be produced. A mandatory dependency-injected previous-binding lookup rejects an
existing proposal or experiment identity with different semantics. Registry-wide
proposal and experiment identities are unique across trusted posts.

## Multiple testing and no-change

`canonical_model_improvement_hypothesis_inventory_v1` binds stable hypothesis
identity, family, selection group, raw p-value, direction, metric, cohort, and
preregistration identity. Adjusted p-values and canonical order are outputs,
never caller authority. Inventory, method, adjusted results, and selection risk
are digest-bound.

`no_change` uses `canonical_model_improvement_no_change_policy_v1` semantics:
the same point-in-time, lineage, minimum-sample, row-stability, OOS,
data-quality, calibration, protected-metric, and multiple-testing gates execute
before the baseline may be retained. A signed
`verified_evidence_supports_no_change` boolean does not exist.

## Synthetic golden evidence

The golden report covers stable OOS improvement, in-sample-only improvement,
calibration regression, cost-eroded edge, regime association, insufficient
days/tickers, conflicting explanations, missing outcomes, feature trust drift,
multiple-testing risk, no-change, protected-metric regression, duplicate
proposal identity, plan tampering, missing probability semantics, and a
point-in-time violation.

These fixtures prove contract behavior only. They do not measure or claim
Ture's actual recommendation performance and are not publishable.

## Future producer dependencies

Real evidence cannot use this foundation until separately owned, immutable
producers persist:

- version-comparable Action 664 scorecards and protected metric uncertainty;
- full Action 665 opportunity-set inventories with outcome completion;
- paired Action 666 shadow observations over identical opportunity sets;
- frozen training input and model artifacts from governed capture;
- canonical explanation cohorts over a declared period;
- an independently owned proposal registry and human experiment authorization.

That future integration must remain default-off, shadow-only, and separately
reviewed. This Action does not implement it.

## Action 666X remediation closure

Action 666X.1 closes 666W-M1, M2, m1, m2, and n1. Action 666X.2 closes M3–M7
through exact metric-set equality, full experiment identity and previous
bindings, deterministic hypothesis adjustment, a non-bypassable no-change
policy, and canonical row-derived split/diversity evidence. The separate
Action 666X refreeze and clean-room re-review are the authority for checkpoint
readiness; this documentation alone is not approval.
