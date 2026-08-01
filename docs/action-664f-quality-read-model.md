# Action 664F — Canonical Quality Read Model

Status: implemented and verified against fixtures and disposable PostgreSQL.
The read model is server-only, read-only, and has no live consumer.

## Read-only boundary

`createCanonicalEvaluationReadOnlyRepository` exposes exactly:

```text
selectCanonicalEvaluations({
  decided_at_or_after,
  decided_before,
  sample_types?,
  limit
})
```

The repository has `access: "select_only"`, an explicit column allowlist,
mandatory time bounds, and a limit between 1 and 10,000. It exposes no insert,
update, delete, upsert, RPC, migration, or schema operation.

## One-row contract

`buildCanonicalEvaluationQualityReadModel` groups input by canonical identity
and returns exactly one candidate per unique identity. A duplicated identity
produces one `conflicting` candidate and the warning
`duplicated_canonical_identity`; it is never silently counted twice.

The stored envelope is rebuilt through Action 664C, validated through Action
664D, compared with every selected normalized column, and checked against its
semantic SHA-256 before eligibility.

Action 664A primary selection is rerun over stored horizons. Exactly one of
`60m`, `30m`, or `15m` can be primary. Other horizons remain on the candidate
as diagnostics and never become recommendation rows. Duplicate horizons
produce `conflicting` plus `horizon_inflation_detected`.

## Lossless outcome evidence

Action 664B's inactive projection now preserves the existing outcome evidence
needed by the read model:

- entry-trigger state;
- target/stop state and first terminal event;
- best, worst, and current R;
- MFE and MAE.

Action 664C's additive decision context now retains ticker, setup, and session
window. Action 664E passes these values directly from the completed snapshot;
there is no heuristic fallback. Older fixture envelopes remain valid with
explicit null values and fail closed when evidence is insufficient.

## Eligibility statuses

- `eligible`
- `incomplete`
- `ambiguous`
- `non_reproducible`
- `parity_mismatch`
- `sample_type_excluded`
- `counterfactual_not_evaluable`
- `conflicting`

Reason codes are additive, sorted, and evidence-derived. The read model never
repairs a row.

## Cohorts

| Sample type | Cohort |
| --- | --- |
| `visible` | `visible_recommendation_quality` |
| `research_only` | `research_only_recommendation_quality` |
| `shadow` | `shadow_recommendation_quality` |
| `historical_synthetic` | `historical_synthetic_recommendation_quality` |
| `rejected_candidate` | `rejected_candidate_counterfactual` |
| `no_trade` | `no_trade_counterfactual` |

Only an `eligible` visible row sets
`standard_visible_quality_eligible=true`. Research, shadow, historical, no
trade, and rejected rows can never enter that denominator. No-trade without
an evaluable opportunity set is `counterfactual_not_evaluable`.

## Metrics candidate

Each candidate contains identity, sample/cohort, primary horizon, terminal
outcome, R, MFE/MAE in R where present, raw excursions,
target-before-stop status, confidence, setup/window/regime/sector/ticker,
decision timestamp/day, engine/scoring/ranking/evaluator/provider versions,
coverage/freshness, eligibility, reason codes, and separated diagnostic
horizons.

Same-candle target/stop evidence is `ambiguous`; its R result is null.
Incomplete, ambiguous, non-reproducible, parity-mismatched, excluded,
counterfactual-not-evaluable, and conflicting candidates never enter standard
quality metrics.

## Diagnostics

Diagnostics count expected rows and every eligibility status by cohort,
sample type, window, and day. They also expose unique identities, days,
tickers, parity-verified rows, reproducible rows, duplicate identities, and
horizon-inflation warnings.

The cross-cohort aggregate deliberately has:

```text
cohort: null
denominator: null
publishable: false
reason_codes:
  - aggregate_cohort_undefined
  - aggregate_denominator_undefined
```

No win rate, expectancy, or other aggregate is published in Action 664F.

## PostgreSQL evidence

The disposable PostgreSQL 16 matrix:

1. replayed all canonical `origin/main` migrations;
2. applied only local migration `20260726001000`;
3. captured completed visible and research-only bundles through Action 664E;
4. seeded shadow, historical, rejected, no-trade, and incomplete fixtures
   through the existing Action 664C → 664D readiness path;
5. read all rows through the dependency-injected read-only repository;
6. produced 12 candidates from 12 unique canonical identities;
7. retained exactly one standard visible-quality identity;
8. verified all six sample types and all named cohorts;
9. verified incomplete provider coverage, duplicate horizon, same-candle
   ambiguity, normalized parity mismatch, tampered envelope, and
   non-reproducible outcome;
10. removed the disposable container.

The four non-snapshot sample types intentionally do not pass through Action
664E because Action 664E accepts exactly one source: completed recommendation
snapshot/outcome bundles. Expanding that source boundary would violate Action
664E, so their fixture seeding uses the already verified C → D path.

No production, staging, linked Supabase, provider, scanner, collector, replay,
or learning service was contacted.

## Remaining blockers

- no production migration or capture activation has been approved;
- no authoritative production population exists;
- shadow and historical producers still need completed outcome capture
  contracts before those cohorts can become eligible;
- no-trade and rejected rows need explicit, reproducible opportunity sets;
- operational cohort ownership and denominator governance remain undefined;
- statistical aggregation and uncertainty contracts are deliberately outside
  Action 664F.

## Proposed Action 664G

Create a default-off quality-metrics computation contract over eligible
read-model candidates and golden fixtures only:

1. require an explicit named cohort and non-zero denominator;
2. compute win rate, expectancy in R, average win/loss, MFE/MAE,
   target-before-stop, confidence calibration, Brier score, and precision@K
   only where inputs exist;
3. carry sample size and uncertainty with every metric;
4. prove that diagnostic horizons and excluded cohorts cannot inflate results;
5. publish `not measurable yet` with exact reason codes instead of partial or
   mixed metrics;
6. remain disconnected from production, routes, UI, and learning jobs.
