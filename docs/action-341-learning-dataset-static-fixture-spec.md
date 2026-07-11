# Action 341: Learning Dataset Static Fixture Spec

## Fixture Spec Status

- learning_dataset_static_fixture_status: fixture_spec_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is learning dataset fixture planning only, not fixture implementation, schema implementation, migration, runtime implementation, provider integration, news integration, Supabase persistence, scanner mutation, ranking mutation, deploy readiness, or main-push authorization.

## Purpose

Static fixtures make the future learning dataset concrete before runtime or persistence work. Fixtures should represent one recommendation snapshot evaluated over an outcome window.

Fixtures should test anti-leakage, missing context, outcome classification, confidence calibration, and pattern discovery assumptions. Fixtures must be additive to existing snapshot/replay/static replay foundations and must not duplicate existing result or outcome concepts.

## Fixture Design Principles

- deterministic timestamps
- no Date.now
- no random IDs
- no provider calls
- no Supabase reads/writes
- no news API calls
- snapshot-time inputs separated from outcomes
- context available_at_snapshot_time must be explicit
- missing context must be explicit
- each fixture has expected learning labels
- no scanner/ranking mutation
- no confidence threshold mutation

## Core Fixture Scenarios

### clean_target_hit_momentum_continuation

- complete snapshot-time context
- strong relative strength
- sector support
- no major news catalyst
- target hit
- positive R multiple

### stop_hit_false_breakout

- breakout setup
- weak sector support
- poor market regime
- stop hit
- negative R multiple

### no_entry_overextended_setup

- setup looks interesting but entry never touched
- no_entry_triggered
- useful for entry realism analysis

### open_at_window_end_slow_grind

- entry touched
- no target/stop by outcome window end
- open_at_window_end
- useful for target/time calibration

### catalyst_backed_target_hit

- company news/catalyst detected
- catalyst available at snapshot time
- target hit
- useful for catalyst-supported performance

### catalyst_false_spike_stop_hit

- catalyst/news present but move fails
- stop hit
- useful for headline volatility risk

### strong_market_weak_stock_filter_candidate

- market regime supportive but stock relative strength weak
- should have been filtered or downgraded

### weak_market_strong_stock_relative_strength

- market weak but stock shows relative strength
- useful for relative strength pattern discovery

### missing_context_learning_limited

- core trade plan exists
- sector/news/context missing
- learning_eligibility_status limited
- missing_context_reasons populated

### ambiguous_intrabar_conservative_stop

- target and stop touched in same candle
- conservative stop outcome
- useful for intrabar ambiguity handling

## Fixture Fields Required

Each fixture should define these required groups:

- identity
- trade_plan
- setup_and_confidence
- quality_gate_summary
- market_context
- sector_industry_context
- relative_strength_context
- news_catalyst_context
- calendar_event_context
- data_provenance
- outcome_fields
- derived_learning_fields
- anti_leakage_status
- learning_eligibility_status

## Expected Labels Per Fixture

Each fixture should define these expected labels:

- setup_success_label
- confidence_bucket
- confidence_calibration_error
- overconfidence_flag
- underconfidence_flag
- regime_fit_label
- sector_support_label
- catalyst_support_label
- relative_strength_support_label
- entry_quality_label
- stop_quality_label
- target_realism_label
- recommendation_should_have_been_filtered
- learning_eligibility_status
- excluded_from_learning_reason

## Anti-Leakage Validation Cases

- news after snapshot time must not be used as snapshot-time catalyst
- end-of-day regime must not be used as entry-time regime unless marked post_outcome
- outcome fields must not appear in snapshot-time fields
- future relative strength must not appear in snapshot-time context
- enrichment_version must be auditable

## Mapping To Existing Foundations

Fixtures should map to:

- existing recommendation snapshots
- static replay result model
- static replay simulation engine
- static summary/report/golden snapshots
- History/Statistics foundations
- future learning outcome dataset

Prefer adapters/mappers over parallel architecture. Do not duplicate existing result/outcome concepts.

## Readiness Levels

- LF0: fixture scenarios undefined
- LF1: fixture scenario list defined
- LF2: fixture field groups defined
- LF3: expected labels defined
- LF4: static fixture implementation ready
- LF5: fixture tests pass locally
- LF6: mapped to existing snapshot/replay objects
- LF7: ready for local mapper implementation
- LF8: ready for read-only runtime dataset generation later

Current learning dataset fixtures are not yet LF8.

## Blocked Implementation Work

- no fixture implementation yet if not explicitly planned
- no dataset persistence yet
- no Supabase writes yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no schema changes
- no migrations yet
- no deploy
- no main push

This fixture spec does not authorize fixture implementation, deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase remote reads, Supabase reads, Supabase writes, dataset persistence, fixture persistence, schema changes, migrations, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 342: Intelligence Context Static Fixture Spec
- Action 343: Pattern Insight Static Type Spec
- Action 344: Runtime Ping-Only Route Implementation Plan
- Action 345: First Tiny Provider Capacity Experiment Plan
- Action 346: Existing Schema Compatibility Matrix
- Action 347: Learning Dataset Static Fixture Implementation Plan
