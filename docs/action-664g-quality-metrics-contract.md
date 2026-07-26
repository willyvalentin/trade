# Action 664G — Quality Metrics Computation Contract

Status: implemented and verified using synthetic golden fixtures only.

The policy version is:

```text
canonical_quality_metrics_v1
```

No value in the golden scorecard represents Ture's real recommendation
performance.

## Denominator policy

Every computation requires one explicit named cohort. Inputs from other
cohorts are counted diagnostically and excluded. Only candidates with
`eligibility_status="eligible"` and `cohort_quality_eligible=true` enter
standard metrics.

The denominator contains unique canonical identities. If an identity occurs
more than once, every occurrence of that identity is excluded and
`duplicated_identity_excluded_from_denominator` is emitted. Diagnostic
horizons are counted only in diagnostics and never create observations.

Undefined cohort or an empty semantic denominator returns
`not_measurable_yet`, `value=null`, and `denominator=0`.

## Metric result contract

Every metric returns:

- policy version and metric name;
- `measurable`, `not_publishable`, or `not_measurable_yet`;
- value or explicit null;
- numerator and denominator;
- identity, trading-day, and ticker counts;
- confidence interval when defined;
- sorted reason codes.

No NaN, Infinity, label-to-probability conversion, or implicit zero
denominator is permitted.

## Terminal outcome policy

- `target_before_stop` is a win;
- `stop_before_target` is a loss;
- no-entry is excluded from the win/loss denominator and reported separately;
- same-candle ambiguity is excluded from wins/losses and reported separately;
- expectancy includes finite R results for eligible recommendation
  identities, including explicit no-entry `0R`;
- incomplete, ambiguous, non-reproducible, parity-mismatched, and conflicting
  rows cannot enter standard performance metrics.

## Confidence calibration

Only numeric confidence with explicit `probability_0_1` semantics is accepted.
Categorical confidence labels are never converted to probabilities.

Versioned fixed buckets are:

```text
[0.0, 0.2)
[0.2, 0.4)
[0.4, 0.6)
[0.6, 0.8)
[0.8, 1.0]
```

The contract calculates Brier score, bucket coverage, observed bucket rate,
average probability, Wilson intervals per populated bucket, and Expected
Calibration Error. Missing probability semantics makes the entire calibration
result `not_measurable_yet`.

## Ranking quality

Precision is defined for `K = 1, 3, 5`. It requires explicit complete
opportunity sets, a stable ranking version, unique positive integer ranks,
outcomes for every candidate, and rejected/not-selected candidates.

No rank, outcome, or opportunity set is reconstructed. Any missing component
makes every precision@K result `not_measurable_yet`.

## Counterfactual cohorts

No-trade and rejected-candidate opportunity sets are evaluated only in their
named counterfactual cohorts. Opportunity cost is the average best positive R
available per complete, evaluable opportunity set. Counterfactual rows never
enter visible win rate.

## Statistical uncertainty

Proportions use a deterministic 95% Wilson score interval.

Expectancy, continuous R metrics, Brier score, ECE, and opportunity cost use
1,000 iterations of a seeded, trading-day-clustered bootstrap. Trading days
are sampled as complete clusters with replacement. Canonical sorting plus the
explicit seed makes results independent of input order.

Publishability minima are versioned:

- proportions: 10 identities;
- continuous metrics: 8 identities;
- calibration: 10 identities;
- at least 3 trading days;
- at least 3 tickers;
- at least 2 ranking or counterfactual opportunity sets.

A value may remain visible diagnostically below these limits, but its status
is `not_publishable`.

## Golden evidence

The synthetic scorecard is
`docs/action-664g-golden-quality-scorecard.json`.

It includes:

- a 20-identity visible cohort over five trading days and four tickers;
- an identical but isolated research-only cohort;
- two diagnostic horizons per recommendation identity;
- measurable recommendation performance, Brier score, ECE, and precision@5;
- deliberately non-publishable precision@1 and precision@3;
- measurable no-trade opportunity cost in a separate cohort;
- explicit `not_measurable_yet` examples for missing probability semantics,
  incomplete ranking evidence, and missing no-trade opportunity sets.

## Live boundary

The implementation is a pure deterministic TypeScript domain module. It has
no database, Supabase, provider, scanner, collector, route, UI, writer,
learning-job, or production-data dependency. No existing live consumer
imports it.

## Remaining blockers

- no production capture or baseline population is approved;
- opportunity-set persistence is not implemented;
- shadow and historical cohorts lack completed eligible production samples;
- counterfactual outcome producers are not connected;
- cohort ownership and scorecard review governance remain undefined;
- publication thresholds have only synthetic evidence and need governance
  review before activation.

## Proposed Action 664H

Create a default-off, fixture/local-only canonical scorecard assembly and
comparison contract:

1. accept only versioned 664G metric results;
2. compare two engine/version cohorts without mixing denominators;
3. report deltas with uncertainty and explicit insufficient-sample status;
4. enforce model-change gates and rollback metadata;
5. produce no UI or production baseline;
6. remain disconnected from live capture, ranking, learning, and deployment.
