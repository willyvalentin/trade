# Action 664H — Default-Off Scorecard Assembly and Version Comparison

Status: inactive, fixture-only readiness contract.

This action does not calculate a production baseline, assess a real Ture model,
promote a version, or connect to a live consumer. Its scorecards accept only a
completed `canonical_quality_metrics_v1` result.

## Versions

- scorecard: `canonical_quality_scorecard_v1`
- metrics: `canonical_quality_metrics_v1`
- comparison: `canonical_quality_version_comparison_v1`
- shadow gate: `canonical_shadow_model_change_gate_v1`
- rollback metadata: `canonical_quality_rollback_metadata_v1`

## Scorecard contract

Every scorecard freezes:

- one explicit cohort and half-open UTC decision period;
- engine, scoring, ranking, evaluator, and provider versions derived from the
  included 664G identity evidence;
- a digest of the sorted per-identity version evidence and ranking evidence;
- full Git commit and build identity;
- the complete 664G metrics result;
- coverage, reproducibility, and data-quality counts;
- required metric publication status;
- generated-at;
- `automatic_promotion_allowed=false`.

The denominator identity is calculated from the sorted set of eligible
canonical identities. Complete ranking opportunity-set identities receive a
separate digest. The scorecard semantic digest is SHA-256 over canonical JSON
with sorted object keys. The digest includes all semantic fields except itself.

The assembler has no caller-supplied version override. Empty, missing, or mixed
version evidence is rejected. Coverage rates are derived from the exclusive
`eligible`, `missing`, `incomplete`, `ambiguous`, `conflicting`, and `excluded`
counts, whose sum must equal `expected`; rates are never accepted from callers.
Empty denominator, undefined required metrics, or non-publishable required
metrics produces `not_publishable` unless missing evidence makes the result
`conflicting`. Contradictory cohort, policy, coverage, period, version, build,
or denominator evidence produces `conflicting`.

## Additive 664G comparison evidence

664G now returns
`canonical_quality_comparison_evidence_v1` alongside its aggregate metrics.
It contains only deterministically ordered, already-eligible identity
observations, their version tuples, complete ranking opportunity-set
observations, and decision-bound counterfactual opportunity-set observations.
It does not accept raw read-model rows at 664H assembly time.

This evidence is necessary because a trading-day-clustered delta interval
cannot be recovered safely from two aggregate confidence intervals.

## Comparability gate

A comparison is `comparable` only when both scorecard digests verify and the
following are exactly equal:

- cohort;
- metrics policy;
- evaluator and provider contracts;
- period;
- denominator identity;
- ranking opportunity-set identity.

There is no caller-supplied comparability override. The comparison derives a
`canonical_pair_bound_comparability_evidence_v1` object that includes both
scorecard digests and the exact cohort, period, policy, denominator,
opportunity-set, evaluator/provider, coverage, and reproducibility evidence.
That evidence object and its digest are part of the comparison digest.

Both scorecards must be publishable and meet the comparison minimums of 20
identities, five trading days, four tickers, 95% coverage, and 99%
reproducibility. Otherwise the result is `not_comparable` or
`insufficient_evidence`; delta values remain `null`.

Comparisons report candidate minus baseline for:

- expectancy R;
- win rate;
- Brier score and Expected Calibration Error;
- precision@1, precision@3, and precision@5;
- no-trade/rejection opportunity cost for an explicit counterfactual cohort.

Expectancy, Brier, and ECE delta intervals use a deterministic 1,000-iteration
trading-day-clustered bootstrap. Proportion deltas use a conservative
difference of Wilson intervals, labeled
`conservative_wilson_interval_difference_v1` rather than as a single-sample
Wilson interval. Same seed and semantically identical inputs produce
byte-identical results.

`candidate_improvement` is an advisory evidence classification. Every
comparison states `causal_improvement_claimed=false`. Missing paired identity
or opportunity-set evidence emits explicit reason codes and can never be
silently described as causal.

## Shadow-only model-change gates

| Gate | Versioned threshold |
| --- | ---: |
| Canonical identities | at least 100 |
| Trading days | at least 20 |
| Tickers | at least 20 |
| Coverage | at least 95% |
| Reproducibility | at least 99% |
| Expectancy delta lower bound | at least -0.05 R |
| Win-rate delta lower bound | at least -0.05 |
| Brier delta upper bound | at most +0.01 |
| ECE delta upper bound | at most +0.02 |
| Precision@5 delta lower bound | at least -0.05 |
| No-trade opportunity-cost delta | at most 0 R |
| Missing rate | at most 2% |
| Incomplete rate | at most 2% |
| Ambiguous rate | at most 1% |

Gate outputs are `pass`, `fail`, or `not_evaluable`. The overall result is
`advisory_pass`, `advisory_hold`, or `advisory_reject`. None of these states
activates, promotes, deploys, or writes a model version.

The no-trade gate accepts only a full, digest-verified comparison produced by
the same pair-bound main comparability gate. Period, policy, denominator,
opportunity set, evaluator, provider, coverage, and reproducibility must all
pass. A mismatch is `not_evaluable`, never an advisory pass or an inferred
zero.

## Rollback metadata

The immutable readiness object contains:

- previous and candidate engine/scoring/ranking/evaluator/provider versions;
- explicit change reason;
- sorted full evidence digests;
- kill-switch owner, defaulting to `UNASSIGNED`;
- explicit rollback-trigger categories;
- `no_automatic_promotion=true`.

## Golden evidence

The local report
`docs/action-664h-golden-version-comparison.json` is synthetic test evidence,
not Ture performance.

Its paired visible A/B fixture has 120 identities, 30 days, 20 tickers, and 30
complete opportunity sets. Candidate-minus-baseline values are:

- expectancy: +0.50 R;
- win rate: +0.10;
- Brier: -0.10;
- ECE: -0.20;
- precision@1: 0;
- precision@3: +0.333333333333;
- precision@5: +0.20.

Separate fixtures cover identical scorecards, cohort/policy/denominator
conflicts, insufficient samples, mixed expectancy/calibration tradeoffs,
regression, input-order determinism, digest tampering, and an undefined
denominator.

## Live boundary and remaining blockers

No route, generator, scanner, ranker, scorer, snapshot/outcome writer,
publisher, migration, or UI imports this contract. There is no automatic
promotion code.

Before any real review:

1. canonical capture must remain default-off until separately approved;
2. real shadow scorecards need sufficient paired identities and opportunity
   sets;
3. a separately reviewed no-trade counterfactual scorecard is required;
4. evaluator/provider compatibility evidence needs an owned registry;
5. kill-switch ownership must replace the placeholder.

## Recommended checkpoint

Action 664I should be a read-only Intelligence Foundation Checkpoint and
Independent Review Package. It should freeze A–H contract digests, rerun the
complete synthetic matrix, review threat/failure cases, reconcile dependencies
with other tracks, and issue a binary readiness decision. It must not activate
capture, compute a production baseline, or promote a model.
