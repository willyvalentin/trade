# Action 330: Confidence Calibration Static Metric Spec

confidence_calibration_metric_spec_status: metric_spec_ready
branch: dev/safe-post-recovery-work
rollback deploy protected: 6a501645908e4100088b7396
clean base commit: 512a0c5

This is confidence calibration metric planning only, not runtime change, deploy readiness, ranking mutation, scanner mutation, threshold mutation, or confidence implementation.

This is not deploy readiness.

## Purpose

Confidence should become evidence-backed, not just a label. Calibration should show whether Low/Medium/High/Very High recommendations behave as expected across outcomes.

Ture should detect overconfidence, underconfidence, setup-specific weakness, and window-specific weakness. Calibration should support fewer, better recommendations and user trust.

Calibration must remain offline/static until safe learning/backfill runtime exists.

## Confidence Inputs

- numeric_confidence
- confidence_label
- setup_family
- trading_window
- direction
- planned_entry
- planned_stop
- planned_target
- planned_risk
- planned_reward
- quality_gate_statuses
- setup_evidence_components
- market_session_context
- data_freshness_status
- snapshot_id
- recommendation_id

## Outcome Inputs

- entry_touched
- target_hit
- stop_hit
- no_entry_triggered
- open_at_window_end
- ambiguous_intrabar_conservative_stop
- gross_r_multiple
- max_favorable_excursion_r
- max_adverse_excursion_r
- time_to_entry
- time_to_exit
- exit_reason
- outcome_window
- shadow_outcome_available

## Calibration Metrics

### 1. confidence_bucket_hit_rate

- purpose: measure target-hit frequency by confidence bucket
- formula idea: target_hit count divided by evaluated outcomes for each confidence_label or numeric confidence band
- interpretation: higher confidence buckets should generally show stronger hit rates than lower buckets
- minimum sample size note: diagnostic only under 20 samples per bucket
- risk of misuse: can overreward tiny samples or unusually easy market windows

### 2. confidence_bucket_stop_rate

- purpose: measure stop-hit frequency by confidence bucket
- formula idea: stop_hit count divided by evaluated outcomes for each confidence bucket
- interpretation: higher confidence should not also produce higher stop rates without explanation
- minimum sample size note: compare only after enough stop/target opportunities exist
- risk of misuse: stop rate alone ignores target distance and entry behavior

### 3. confidence_bucket_no_entry_rate

- purpose: detect whether recommendations are too hard to trigger
- formula idea: no_entry_triggered count divided by evaluated outcomes for each confidence bucket
- interpretation: high no-entry rate suggests entries may be too aggressive or unrealistic
- minimum sample size note: diagnostic only until each bucket has at least 20 samples
- risk of misuse: no-entry can be acceptable if the plan is intentionally selective

### 4. confidence_bucket_expectancy_r

- purpose: measure expected R outcome by confidence bucket
- formula idea: average gross_r_multiple for each bucket
- interpretation: higher confidence should generally show better expectancy over time
- minimum sample size note: weak signal under 50 samples per bucket
- risk of misuse: outliers can dominate early averages

### 5. confidence_bucket_average_mfe_r

- purpose: measure average favorable movement by confidence bucket
- formula idea: average max_favorable_excursion_r per bucket
- interpretation: higher confidence should usually create more favorable excursion
- minimum sample size note: compare after enough triggered and non-triggered cases are labeled consistently
- risk of misuse: MFE can look strong even when exits are poorly calibrated

### 6. confidence_bucket_average_mae_r

- purpose: measure average adverse movement by confidence bucket
- formula idea: average max_adverse_excursion_r per bucket
- interpretation: higher confidence should not systematically expose worse adverse movement
- minimum sample size note: interpret with stop rate and entry trigger behavior
- risk of misuse: MAE can punish volatile but profitable setups if viewed alone

### 7. confidence_bucket_overconfidence_gap

- purpose: detect confidence buckets that promise more than outcomes support
- formula idea: expected bucket quality minus observed hit rate or expectancy rank
- interpretation: positive gap indicates overconfidence and should trigger review
- minimum sample size note: no adjustment below moderate sample size
- risk of misuse: can cause premature downranking during temporary regime shifts

### 8. confidence_bucket_underconfidence_gap

- purpose: detect low/medium confidence ideas that outperform their label
- formula idea: observed hit rate or expectancy rank minus expected bucket quality
- interpretation: positive gap indicates possible underconfidence or missed setup strength
- minimum sample size note: requires enough examples across comparable windows
- risk of misuse: can overpromote noisy low-confidence winners

### 9. setup_family_hit_rate

- purpose: measure target-hit frequency by setup family
- formula idea: target_hit count divided by evaluated outcomes for each setup_family
- interpretation: some setup families should earn higher confidence only if outcomes support it
- minimum sample size note: setup-level conclusions need separate thresholds
- risk of misuse: setup labels may be noisy until taxonomy is stable

### 10. setup_family_expectancy_r

- purpose: measure R expectancy by setup family
- formula idea: average gross_r_multiple for each setup_family
- interpretation: setup families with negative expectancy need review before promotion
- minimum sample size note: weak signal under 50 samples per setup
- risk of misuse: one large winner or loser can distort a small setup family

### 11. setup_family_failure_mode_rate

- purpose: classify repeated setup-specific failure patterns
- formula idea: failure mode count divided by evaluated outcomes for each setup_family
- interpretation: recurring stop-first, no-entry, or open-at-window-end patterns should guide review
- minimum sample size note: failure modes need consistent labeling before use
- risk of misuse: vague failure labels can create false precision

### 12. window_specific_hit_rate

- purpose: measure target-hit frequency by trading window
- formula idea: target_hit count divided by evaluated outcomes for each trading_window
- interpretation: morning, midday, and power-hour behavior should be calibrated separately
- minimum sample size note: window-specific conclusions need their own sample thresholds
- risk of misuse: market regime can dominate a short window sample

### 13. window_specific_expectancy_r

- purpose: measure R expectancy by trading window
- formula idea: average gross_r_multiple for each trading_window
- interpretation: weak windows should not be treated like strong windows
- minimum sample size note: compare only after enough observations across multiple days
- risk of misuse: can overfit to a short calendar period

### 14. calibration_sample_size

- purpose: expose whether a calibration conclusion has enough evidence
- formula idea: count evaluated outcomes by bucket/setup/window/metric segment
- interpretation: small samples are diagnostic only
- minimum sample size note: this metric defines whether other metrics are actionable
- risk of misuse: ignoring sample size makes calibration look more certain than it is

### 15. calibration_stability_score

- purpose: estimate whether a metric is stable across days/windows
- formula idea: compare variance of metric values across multiple slices
- interpretation: stable metrics are better candidates for future calibration
- minimum sample size note: requires multiple independent windows or trading days
- risk of misuse: stability can be overstated when data is correlated

### 16. ambiguity_rate

- purpose: measure how often outcomes are ambiguous or conservatively resolved
- formula idea: ambiguous_intrabar_conservative_stop count divided by evaluated outcomes
- interpretation: high ambiguity means outcome labels should be used cautiously
- minimum sample size note: track immediately, but interpret with candle granularity
- risk of misuse: ambiguity can bias against otherwise good setups

### 17. invalid_geometry_rate

- purpose: detect recommendation plans that should never reach evaluation
- formula idea: invalid geometry count divided by candidate or snapshot count
- interpretation: any non-trivial invalid geometry rate indicates a quality gate problem
- minimum sample size note: should be monitored even at small counts
- risk of misuse: mixing research-only soft gaps with hard invalid geometry can mislead

### 18. data_quality_failure_rate

- purpose: measure how often missing/stale/bad data blocks reliable calibration
- formula idea: data quality failure count divided by candidates, snapshots, or outcomes
- interpretation: high data failure means calibration should pause until inputs improve
- minimum sample size note: track continuously across every batch
- risk of misuse: data failures should not be interpreted as setup failures

## Confidence Interpretation Rules

- High confidence should not mean certainty.
- Very High / Strong should require both strong evidence and historical support.
- Low confidence can still work but should not dominate the feed.
- If High confidence underperforms Medium confidence, calibration is suspect.
- If confidence buckets have small samples, no adjustment should be made.
- If no-entry rate is high, entries may be too aggressive or triggers unrealistic.
- If stop rate is high, setup/risk geometry may be weak.
- If open-at-window-end is common, target/stop expectations may be poorly calibrated.

## Minimum Sample Guidance

- less than 20 samples: diagnostic only
- 20-50 samples: weak signal
- 50-100 samples: moderate signal
- 100+ samples: stronger calibration signal
- setup/window-specific conclusions need separate sample thresholds

## Blocked Work

- no automatic confidence adjustment yet
- no scanner/ranking mutation yet
- no threshold changes yet
- no confidence threshold changes yet
- no production replay route yet
- no Supabase synthetic outcome writes yet
- no provider refetch path yet
- no deploy
- no main push

Scanner/ranking mutation is blocked. Confidence threshold changes are blocked.

## Recommended Next Actions

- Action 331: Recommendation Card Content Hierarchy Spec
- Action 332: History/Statistics Learning Surface Spec
- Action 333: Execution Agent Boundary Refresh
- Action 334: First Static Gate Helper Extraction Plan
- Action 335: Confidence Calibration Static Fixture Plan

This metric spec does not authorize production deploy, main push, runtime route, proxy or middleware, scanner changes, ranking changes, threshold changes, confidence threshold changes, provider calls, Supabase reads, Supabase writes, replay execution, synthetic outcome persistence, recommendation mutation, or live ranking mutation.
