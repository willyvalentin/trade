# Action 343: Pattern Insight Static Type Spec

## Type Spec Status

- pattern_insight_static_type_status: type_spec_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is pattern insight type/spec planning only, not type implementation, persistence, runtime implementation, provider integration, news integration, Supabase persistence, scanner mutation, ranking mutation, confidence threshold mutation, deploy readiness, or main-push authorization.

## Purpose

Pattern insights are research outputs from the learning dataset. They should summarize observed performance patterns without directly mutating live ranking.

Pattern insights should help Ture identify promising and weak setup-context combinations across setups, regimes, sectors, catalysts, relative-strength profiles, confidence buckets, and data-quality profiles.

They should support future confidence calibration and recommendation quality improvements. Every pattern insight must include evidence strength and overfitting risk so research remains advisory until sample size, repeatability, and rollout safety are strong.

## Pattern Insight Unit

One pattern insight represents one observed pattern across a segment of learning rows.

It must include:

- segment definition
- sample size
- outcome metrics
- confidence metrics
- evidence strength
- recommended action type

Each pattern insight must default to mutation_allowed: false.

## Core Insight Fields

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

## Pattern Dimensions Supported

- setup_family
- confidence_bucket
- trading_window
- market_regime
- sector
- industry
- relative_strength_profile
- catalyst_type
- catalyst_freshness
- volume_liquidity_profile
- risk_reward_profile
- entry_quality_profile
- stop_quality_profile
- target_realism_profile
- data_quality_profile

## Outcome Summary Fields

- target_hit_rate
- stop_hit_rate
- no_entry_rate
- open_at_window_end_rate
- ambiguous_intrabar_rate
- average_gross_r_multiple
- median_gross_r_multiple
- expectancy_r
- max_favorable_excursion_avg_r
- max_adverse_excursion_avg_r
- sample_size
- outcome_quality

## Confidence Summary Fields

- confidence_bucket
- confidence_bucket_hit_rate
- confidence_bucket_expectancy_r
- overconfidence_gap
- underconfidence_gap
- calibration_stability_score
- confidence_sample_size
- confidence_interpretation

## Evidence Strength Levels

- insufficient_sample
- weak_signal
- moderate_signal
- strong_signal
- validated_signal

Sample-size guidance:

- under 20: insufficient_sample
- 20-50: weak_signal
- 50-100: moderate_signal
- 100+: potentially strong if stable
- validation requires repeatability across windows/regimes

## Overfitting Risk Levels

- high
- medium
- low
- unknown

Small samples increase risk. Too many dimensions increase risk. Single-symbol insights are risky. Catalyst/news-driven insights can be unstable. Regime-specific insights need separate validation.

## Recommended Action Types

- observe
- investigate
- downgrade_candidate_research
- upgrade_candidate_research
- adjust_confidence_research
- block_until_more_data
- candidate_for_shadow_calibration
- candidate_for_future_experiment

recommended_action_type must not directly mutate ranking/scanner. mutation_allowed must default false.

## Review Status

- unreviewed
- reviewed_no_action
- research_candidate
- shadow_calibration_candidate
- rejected_overfit_risk
- approved_for_future_experiment

## Anti-Leakage Requirements

- insight must be generated only from audited learning rows
- snapshot-time features must remain separated from outcomes
- post-outcome context must be labeled
- news/catalyst availability must be snapshot-time safe
- data quality exclusions must be explicit
- scanner/ranking mutation remains blocked

## Mapping To Existing Foundations

Pattern insight types should map to:

- Learning Outcome Dataset Design
- Intelligence Context Schema Draft
- Learning Dataset Static Fixture Spec
- Intelligence Context Static Fixture Spec
- Static replay result model
- Static replay summary/report pipeline
- History/Statistics foundations

The insight layer should consume existing learning and context foundations rather than duplicating recommendation, outcome, context, replay, history, or statistics records.

## Readiness Levels

- PI0: insight shape undefined
- PI1: insight fields documented
- PI2: static type spec exists
- PI3: static fixture examples designed
- PI4: local type implementation ready
- PI5: local fixture tests pass
- PI6: offline report integration ready
- PI7: shadow calibration research-ready
- PI8: controlled experiment-ready
- PI9: trusted pattern insight signal

Current pattern insight type is not yet PI9.

## Blocked Implementation Work

- no type implementation yet
- no pattern insight persistence yet
- no Supabase writes yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This pattern insight type spec does not authorize type implementation, pattern insight persistence, deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase remote reads, Supabase reads, Supabase writes, schema changes, migrations, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, learning dataset persistence, context snapshot persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 344: Runtime Ping-Only Route Implementation Plan
- Action 345: First Tiny Provider Capacity Experiment Plan
- Action 346: Existing Schema Compatibility Matrix
- Action 347: Learning Dataset Static Fixture Implementation Plan
- Action 348: Intelligence Context Static Fixture Implementation Plan
- Action 349: Pattern Insight Static Fixture Spec
