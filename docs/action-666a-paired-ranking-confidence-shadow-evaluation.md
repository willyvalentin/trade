# SPÅR 2 — Action 666A: Paired Ranking and Confidence Shadow Evaluation

Status: implemented as an inactive, fixture-only contract.

## Safety boundary

- `shadow_only: true`
- `live_ranking_effect: false`
- `causal_improvement_claimed: false`
- no live import, route, scanner, ranking, scoring, threshold, AI, provider,
  persistence, migration or database call
- no candidate matching by ticker, score, rank or presentation position
- no top-K reconstruction, outcome inference or implicit deduplication

The contract is implemented in
`lib/server/canonical-shadow-ranking-confidence-evaluation.ts`. It is
server-only and only imported by its fixture and test files.

## Pairing policy

Policy version:

```text
canonical_shadow_ranking_confidence_evaluation_v1
```

Each arm carries a complete, independently verifiable Action 665 opportunity
set. Pair evidence is derived from the verified source objects; the caller
cannot provide a pair-approval boolean or an arbitrary evidence digest.

The baseline and candidate must have identical:

- canonical opportunity-set identity and authoritative set digest;
- full candidate-set digest and sorted canonical membership digest;
- decision timestamp and point-in-time cutoff;
- actual outcome plus expected evaluator-lineage digest;
- provider and evaluator contracts;
- cohort and sample type;
- terminal-outcome policy;
- coverage denominator, expected coverage and observed coverage;
- trading-day list and opportunity-set inventory.

The pair digest binds both arm-binding digests and the explicitly declared
version differences. Algorithm arms may differ only in declared ranking,
scoring, threshold-policy, confidence-contract and, for an explicitly
declared engine experiment, engine versions.

## Ranking and threshold evaluation

Ranking order requires:

- exact canonical candidate membership;
- positive integer ranks;
- an explicit tie-break key for every candidate;
- no duplicate `(rank, tie-break)` pair;
- no rank gap after ties are collapsed.

Precision at 1, 3 and 5 is calculated through
`canonical_quality_metrics_v1`. Action 664 receives a deterministic total
order derived only from the explicit rank and tie-break. Diagnostic horizon
rows cannot enter the denominator.

The threshold sweep reports, per explicit threshold:

- metric coverage against full candidate membership;
- projected publish count and rate;
- projected trade count and rate;
- rejected-candidate count;
- rejected-candidate opportunity cost using Action 664's versioned
  best-positive-counterfactual-R policy;
- whether the threshold projects no-trade and whether that counterfactual is
  evaluable.

A no-trade counterfactual is evaluable only when the source opportunity set
is complete, point-in-time safe and has reproducible outcomes for every
candidate.

## Confidence policy

Brier score, fixed calibration buckets and Expected Calibration Error reuse
`canonical_quality_metrics_v1`.

Calibration is enabled only when every candidate supplies:

```text
probability_source = numeric_confidence
confidence_semantics = calibrated_probability_0_1
numeric_confidence in [0,1]
```

Score, tier, evidence strength and label remain diagnostics. They are never
converted to probability. Otherwise calibration returns
`probability_semantics_missing` while a valid ranking comparison may still
be available.

## Status contract

- `evaluable`
- `insufficient_evidence`
- `not_comparable`
- `conflicting`
- `non_reproducible`
- `probability_semantics_missing`

Invalid source digests, duplicated rank/tie-breaks and stale pair bindings
are conflicts. Shared-evidence drift and undeclared version differences are
not comparable. Missing complete outcomes are insufficient evidence.
Point-in-time unsafe or non-reproducible outcomes are non-reproducible.

## Golden fixture evidence

The synthetic fixtures contain ten candidates and cover:

- valid paired ranking and calibrated confidence;
- membership and cutoff drift;
- evaluator/provider mismatch;
- truncated arm membership;
- duplicate rank and tie-break;
- missing rejected-candidate outcome;
- incomplete explicit no-trade;
- score falsely presented as probability;
- threshold sweeps including projected no-trade;
- deterministic input reordering;
- source tampering and input immutability.

The companion report
`docs/action-666a-golden-shadow-evaluation-report.json` is synthetic
test evidence. It is not Ture performance and is not publishable as a
production scorecard.

## Future real-data blockers

1. The live producer does not yet emit inactive paired baseline/candidate
   algorithm observations over the full pre-truncation Action 665 set.
2. Candidate-arm rank, score, threshold and numeric-confidence provenance
   are not yet captured with an authorized shadow version bundle.
3. Rejected, overflow and under-threshold outcomes need a separately
   authorized evaluator capture path.
4. At least three trading days and the Action 664 publishability minimums
   are required before statistical output can become publishable.
5. No persistence, activation, live call-site or production-data evaluation
   is authorized by Action 666A.
