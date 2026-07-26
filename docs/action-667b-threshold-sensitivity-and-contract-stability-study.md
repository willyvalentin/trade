# Action 667B — Threshold Sensitivity and Contract Stability Study

## Result

`market_context_intelligence_v1` passed the offline contract-stability study.
No threshold was changed.

- Versioned leaf thresholds: 21
- Boundary cases: 63
- Boundary positions per threshold: directly below, exact, directly above
- Sensitivity sweeps: 10
- Conservative invariants: 6 passed, 0 failed
- Excessive local-churn thresholds: 0
- Thresholds with no observable contract effect: 2
- Production or historical provider data: none

The full deterministic report is produced by
`buildMarketContextSensitivityStudyReport()` in
`lib/market-context-intelligence-lab/sensitivity-study-v1.ts`. Its checked
machine-readable summary is
`docs/evidence/action-667b-market-context-sensitivity-report.json`.

Evidence digest:

```text
sha256:64c636219a3f204e7b9f2dc73b221ba345f127370134afdf51512e42191487ef
```

## Boundary method

Each numeric leaf in `MARKET_CONTEXT_LAB_THRESHOLDS` receives three generated
inputs:

1. threshold minus a dimension-appropriate epsilon
2. threshold exactly
3. threshold plus the same epsilon

Epsilon is 0.01 minutes for freshness and 0.0001 for ratios and percentage
points. Every boundary result records:

- regime classification
- separate dimensions
- sector classifications
- confidence label and evidence strength
- top-level and context-prefixed reason codes
- provider freshness states
- sector rankability and rank

Each adjacent transition records classification, confidence, evidence,
dimension, reason-code, sector-context, rankability, and freshness changes.

Local churn is considered excessive only if a three-point local boundary
produces more than one terminal-classification, confidence, evidence, or
rankability transition. An expected inclusive/exclusive boundary produces at
most one such transition.

## Boundary findings

Nineteen thresholds have one bounded transition and no threshold has excessive
local churn.

Seven thresholds change the terminal regime at their expected boundary:

- `freshness_minutes.multi_day`
- `minimum_coverage.essential_index`
- `minimum_coverage.breadth`
- `trend.directional_return_pct`
- `trend.directional_momentum_pct`
- `volatility_pct.elevated_upper_bound`
- `breadth.broad_lower_bound`

Three thresholds change confidence/evidence:

- `freshness_minutes.multi_day`
- `minimum_coverage.essential_index`
- `minimum_coverage.breadth`

Two thresholds change sector rankability:

- `freshness_minutes.sector_medium`
- `minimum_coverage.sector`

These transitions are fail-closed: staleness or insufficient coverage reduces
evidence or removes rankability. None increases evidence.

## Unclear threshold semantics

Two declared thresholds have no observable v1 contract effect:

- `freshness_minutes.intraday`
- `freshness_minutes.sector_short`

The current engine sorts and time-bounds these points but does not compare
their individual point ages with the declared freshness values. The thresholds
must not be silently removed, repurposed, or wired into classification.

Recommendation: keep the current threshold version unchanged. Before any
historical shadow comparison, decide in a separate reviewed version whether
these are:

- future reserved metadata, which should be documented as inactive; or
- enforceable point-age limits, which requires a new threshold version and
  side-by-side comparison.

This is a semantic review finding, not evidence for an automatic threshold
change.

## Sensitivity sweeps

| Sweep | Points | Terminal transitions | Terminal churn | Observable churn |
| --- | ---: | ---: | ---: | ---: |
| signed trend evidence | 9 | 2 | 0.250000 | 0.500000 |
| risk-state scenarios | 5 | 4 | 1.000000 | 1.000000 |
| volatility | 8 | 1 | 0.142857 | 0.428571 |
| breadth | 8 | 1 | 0.142857 | 0.285714 |
| SPY/QQQ agreement | 3 | 1 | 0.500000 | 0.500000 |
| intraday/multi-day agreement | 3 | 1 | 0.500000 | 1.000000 |
| sector relative strength | 9 | 0 | 0.000000 | 0.750000 |
| sector acceleration | 7 | 0 | 0.000000 | 0.333333 |
| essential-index freshness | 8 | 1 | 0.142857 | 0.142857 |
| essential-index coverage | 7 | 1 | 0.166667 | 0.166667 |

The risk sweep intentionally walks through five categorically different
market states, so its ratio is not a local-threshold churn signal. Sector
relative-strength churn changes sector evidence while leaving the terminal
market regime unchanged, which is the intended separation of concerns.

## Stability invariants

All invariants pass:

1. stale data or worse coverage never increases evidence strength
2. future data never changes classification
3. an incomplete sector universe never becomes rankable
4. input order never changes the output
5. conflicting context never silently becomes neutral
6. stronger positive evidence never degrades the trend dimension when other
   inputs are fixed

The permutation invariant uses a dependency-free seeded generator and 32
complete input permutations in the report. The test suite additionally checks
64 generated permutations.

## Timestamp and ordering study

The timestamp suite covers:

- equivalent UTC and explicit-offset decision instants
- Europe/Stockholm DST start on 2026-03-29
- Europe/Stockholm DST end on 2026-10-25
- a North American DST-offset equivalence
- identical duplicate timestamps
- conflicting duplicate timestamps in reversed input order
- out-of-order candles
- future points expressed with an offset
- invalid timestamps

All comparisons use absolute instants. Future and invalid points are excluded
and counted. Duplicate selection is deterministic because equal timestamps use
a canonical metric key rather than array order.

## Numeric input domain

The suite covers zero, sub-epsilon differences, negative returns/momentum,
and large finite moves.

`NaN`, positive infinity, and negative infinity are outside the valid contract
domain. Action 667B makes their rejection explicit with deterministic errors
prefixed:

```text
market_context_intelligence_v1_non_finite_numeric_input:
```

This does not change a threshold. Non-finite values were never valid market
measurements and no valid v1 fixture changes output.

## Version policy

### New threshold version required

A new threshold version is mandatory for:

- any numeric threshold change
- any inclusive/exclusive comparison change
- any unit, horizon, freshness clock, or coverage-denominator change
- binding an existing threshold to a different dimension or terminal
  classification

Threshold values must never change silently.

### Contract minor version required

A backward-compatible minor evolution is required for:

- optional additive inputs
- additive output metadata
- new reason codes that do not reinterpret existing values

Readers must ignore unknown additive fields.

### Contract major version required

A major version is required for:

- removed or renamed inputs, outputs, dimensions, or terminal labels
- changed requiredness or nullability
- changed ranking semantics
- changed point-in-time or leakage rules
- reinterpretation of an existing field
- any ability to affect live ranking, scoring, universe, prompts, or publishing

### Evidence and comparison requirements

Every candidate version must provide:

- deterministic golden and boundary fixtures
- sensitivity and invariant results
- SHA-256 evidence digest
- side-by-side shadow comparison against the prior version on an approved
  dataset
- coverage and missingness comparison
- stability by trading day

Required rollback metadata:

- `previous_context_version`
- `previous_threshold_version`
- `candidate_evidence_digest`
- `rollback_reason`
- `approved_by`
- `approved_at`

## Canonical-binding readiness gate

Current status: `not_ready`.

Passed:

- stable contract and thresholds
- green leakage controls
- explicit freshness, coverage, missingness, and provider timestamps
- full context, threshold, study, adapter, and digest metadata
- `shadow_only: true`
- `live_ranking_effect: false`

Pending:

- independent review that the inactive adapter shape is compatible with Spår
  2's canonical envelope, without directly importing untracked Spår 2 files
- an explicitly approved historical shadow comparison

The adapter remains inactive:

- no capture
- no persistence
- no database relation
- no canonical binding
- no live consumer

## Recommended checkpoint

Recommended next action:

```text
Action 667C — Independent Contract and Threshold Freeze Review
```

It should review the two inactive freshness semantics, independently reproduce
the evidence digest, confirm the version policy, and issue a freeze/no-freeze
decision. It must not start historical evaluation, canonical binding, capture,
persistence, or live integration without separate authorization.
