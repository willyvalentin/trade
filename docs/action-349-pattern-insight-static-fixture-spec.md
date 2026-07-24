# Action 349: Pattern Insight Static Fixture Spec

## Status

- pattern_insight_static_fixture_status: fixture_spec_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is fixture specification only, not fixture implementation, pattern insight persistence, runtime work, scanner/ranking mutation, confidence threshold mutation, visible recommendation mutation, deploy readiness, or main-push authorization.

## Unrelated Execution File Isolation

These unrelated untracked execution files were inspected and isolated from the intelligence batch:

- `lib/post-trade-staging-execution-function.ts`
- `tests/e2e/post-trade-staging-execution-function-static.spec.ts`

They are not Action 349 artifacts. Their contents are not modified by this action. They are not allow-listed as pattern insight, intelligence, replay, scanner, ranking, provider, Supabase, or deployment work.

## Purpose

Pattern Insight fixtures make research outputs concrete before implementation. Fixtures connect audited learning rows and intelligence context to evidence-based insights. They must not directly affect live recommendations, live scanner behavior, ranking, confidence thresholds, visible recommendation cards, broker behavior, execution, or risk.

Every Pattern Insight fixture must keep mutation_allowed false.

## Design Principles

- deterministic IDs and labels
- fixed sample windows
- no Date.now
- no random IDs
- no provider/network/Supabase access
- audited learning rows only
- explicit evidence strength
- explicit overfitting risk
- explicit data-quality limitations
- research output only
- mutation_allowed false

## Core Fixture Scenarios

### insufficient_sample_promising_setup

- sample size below 20
- positive observed expectancy
- evidence insufficient
- evidence_strength: insufficient_sample
- recommended_action_type: block_until_more_data
- mutation_allowed: false

### weak_signal_momentum_morning

- sample size 20-50
- small positive effect
- evidence_strength: weak_signal
- recommended_action_type: observe
- mutation_allowed: false

### moderate_signal_sector_supported_momentum

- sample size 50-100
- repeatable positive effect
- evidence_strength: moderate_signal
- recommended_action_type: investigate or upgrade_candidate_research
- mutation_allowed: false

### strong_signal_relative_strength_weak_market

- sample size 100+
- stable across multiple periods
- potentially strong evidence
- evidence_strength: strong_signal
- recommended_action_type: candidate_for_shadow_calibration
- mutation_allowed: false

### validated_signal_placeholder

- repeatability demonstrated across windows/regimes
- evidence_strength: validated_signal research example
- still requires future controlled experiment
- recommended_action_type: candidate_for_future_experiment
- no direct mutation
- mutation_allowed: false

### negative_pattern_false_breakout_chop

- poor expectancy
- elevated stop-hit rate
- evidence_strength: moderate_signal or strong_signal depending on sample size
- recommended_action_type: downgrade_candidate_research
- mutation_allowed: false

### overconfident_high_confidence_bucket

- predicted confidence materially exceeds observed success
- overconfidence gap
- evidence_strength: moderate_signal
- recommended_action_type: adjust_confidence_research
- mutation_allowed: false

### underconfident_low_confidence_bucket

- outcomes outperform assigned confidence
- underconfidence gap
- evidence_strength: weak_signal or moderate_signal
- recommended_action_type: investigate
- mutation_allowed: false

### high_overfitting_single_symbol

- apparently strong result from one symbol
- high overfitting risk
- review_status: rejected_overfit_risk
- recommended_action_type: block_until_more_data
- mutation_allowed: false

### catalyst_pattern_unstable

- catalyst-supported results vary substantially
- medium/high overfitting risk
- recommended_action_type: block_until_more_data
- mutation_allowed: false

### missing_context_limited_insight

- sector/news/context incomplete
- evidence limited by data quality
- recommended_action_type: observe
- mutation_allowed: false

### anti_leakage_rejected_insight

- post-snapshot information contaminated inputs
- anti_leakage_status failed
- insight rejected
- recommended_action_type: block_until_more_data
- mutation_allowed: false

## Required Fixture Fields

Every future fixture scenario must map to these Action 343 fields:

- insight_id
- insight_version
- generated_from_dataset_version
- generated_at_label
- pattern_dimension
- segment_key
- segment_description
- sample_size
- minimum_sample_requirement
- sample_window
- setup_family
- trading_window
- market_regime
- sector
- industry
- relative_strength_profile
- catalyst_type
- confidence_bucket
- outcome_summary
- confidence_summary
- effect_direction
- evidence_strength
- stability_score
- overfitting_risk
- data_quality_notes
- anti_leakage_status
- recommended_action_type
- mutation_allowed
- blocked_reason
- review_status

## Expected Outcome And Confidence Summaries

Future fixture expectations should include qualitative or fixed expected values for:

- target_hit_rate
- stop_hit_rate
- no_entry_rate
- expectancy_r
- average_gross_r_multiple
- median_gross_r_multiple
- sample_size
- confidence_bucket_hit_rate
- overconfidence_gap
- underconfidence_gap
- calibration_stability

Expected summaries should make direction and confidence explicit while remaining research-only and mutation-safe.

## Evidence Rules

- under 20: insufficient_sample
- 20-50: weak_signal
- 50-100: moderate_signal
- 100+: potentially strong only if stable
- validated_signal requires repeatability across windows/regimes

## Overfitting Checks

- single-symbol concentration
- too many segment dimensions
- short time window
- catalyst dependence
- one-regime dependence
- unstable results across periods
- low data quality

## Mutation Safety

Every fixture must state:

- mutation_allowed: false
- no live scanner mutation
- no live ranking mutation
- no confidence-threshold mutation
- no visible recommendation mutation
- research recommendation only

## Mapping To Existing Foundations

Pattern Insight fixture specifications map to:

- Action 335 Learning Outcome Dataset
- Action 336 Intelligence Context Schema
- Action 337 Pattern Discovery Roadmap
- Action 341 Learning Dataset Fixture Spec
- Action 342 Context Fixture Spec
- Action 343 Pattern Insight Type Spec
- Action 346 Schema Compatibility Matrix
- existing static replay, History, and Statistics foundations

Future pattern insight fixture work must consume existing learning, context, static replay, History, and Statistics foundations rather than duplicate recommendation, outcome, context, replay, history, or statistics records.

## Readiness Levels

- PIF0 fixture scenarios undefined
- PIF1 scenario catalogue defined
- PIF2 required fields mapped
- PIF3 expected summaries defined
- PIF4 evidence/overfitting rules defined
- PIF5 implementation plan ready
- PIF6 local fixtures implemented
- PIF7 local validation passes
- PIF8 offline research report ready
- PIF9 shadow-calibration research ready

Current status is not PIF5 or later.

## Blocked Work

- no fixture implementation
- no persistence
- no Supabase access
- no provider/news calls
- no runtime routes
- no replay execution
- no scanner/ranking/confidence mutation
- no deploy
- no main push

This fixture spec does not authorize Pattern Insight fixture implementation, Pattern Insight persistence, deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase remote reads, Supabase reads, Supabase writes, schema changes, migrations, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, learning dataset persistence, context snapshot persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 350: Runtime Ping-Only Route Approval Gate
- Action 351: First Tiny Provider Capacity Experiment Approval Gate
- Action 352: Snapshot-to-Learning Dataset Mapper Plan
- Action 353: Learning Dataset Static Fixture Implementation Approval Gate
- Action 354: Intelligence Context Static Fixture Implementation Approval Gate
- Action 355: Pattern Insight Static Fixture Implementation Plan
