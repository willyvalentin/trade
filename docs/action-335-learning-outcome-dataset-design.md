# Action 335: Learning Outcome Dataset Design

## Dataset Design Status

- learning_outcome_dataset_design_status: design_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is dataset design only, not runtime implementation, not provider integration, not news integration, not Supabase persistence, not scanner mutation, not ranking mutation, not deploy readiness, and not main-push authorization.

## Purpose

The dataset is the bridge between recommendations and learning. Every recommendation should eventually become a learning example, including visible recommendations, hidden/research-only recommendations, and not-taken recommendations when they have valid snapshot evidence.

The dataset should support pattern discovery, confidence calibration, setup performance, regime analysis, and future recommendation improvement. The design must preserve existing snapshot/replay/history/statistics foundations and add only gap-driven structure.

## Dataset Unit Of Analysis

One dataset row should represent one recommendation snapshot evaluated over a defined outcome window.

The dataset row should be immutable once generated, except for explicit audited enrichment versions. The dataset should avoid hindsight leakage by separating snapshot-time inputs from post-snapshot outcomes.

## Snapshot-Time Input Fields

### 1. Identity

- dataset_row_id
- snapshot_id
- recommendation_id
- candidate_id
- ticker
- trading_day
- trading_window
- created_at
- source_type

### 2. Trade Plan

- direction
- entry
- stop
- target
- planned_risk
- planned_reward
- planned_r_multiple
- invalidation_logic

### 3. Setup And Confidence

- setup_family
- setup_variant
- setup_label
- numeric_confidence
- confidence_label
- confidence_components
- quality_gate_summary
- reason_text

### 4. Market Context

- SPY_context
- QQQ_context
- IWM_context
- market_regime
- volatility_regime
- trend_day_or_chop_day
- risk_on_risk_off_context

### 5. Sector / Industry Context

- sector
- industry
- peer_group
- sector_etf
- sector_relative_strength
- peer_relative_strength

### 6. Relative Strength

- stock_vs_SPY
- stock_vs_QQQ
- stock_vs_sector
- stock_vs_peer_group
- intraday_relative_strength
- multi_day_relative_strength

### 7. News / Catalyst Context

- catalyst_detected
- catalyst_type
- catalyst_timestamp
- catalyst_freshness
- headline_summary
- earnings_or_guidance_context
- analyst_or_regulatory_context
- news_volume_context

### 8. Data Provenance

- provider
- candle_interval
- provider_freshness
- missing_data_flags
- adjusted_or_unadjusted
- source_confidence
- audit_readback_status

## Outcome Fields

- outcome_window
- entry_touched
- entry_timestamp
- target_hit
- stop_hit
- target_timestamp
- stop_timestamp
- target_or_stop_first
- no_entry_triggered
- open_at_window_end
- ambiguous_intrabar_conservative_stop
- exit_reason
- exit_timestamp
- gross_price_move
- gross_r_multiple
- max_favorable_excursion_r
- max_adverse_excursion_r
- time_to_entry
- time_to_exit
- final_close_relative_to_entry
- outcome_available
- outcome_quality

## Derived Learning Fields

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

## Anti-Leakage Rules

- snapshot-time inputs must not include post-snapshot outcomes
- news/catalyst context must use only information available at snapshot time
- market regime labels must distinguish snapshot-time vs end-of-day labels
- outcome fields must not feed back into original snapshot
- calibration updates must happen only after audited dataset generation
- scanner/ranking mutation remains blocked

## Dataset Readiness Levels

- L0: dataset undefined
- L1: dataset fields defined
- L2: static design exists
- L3: static fixture examples exist
- L4: snapshot-to-outcome mapping verified locally
- L5: read-only runtime dataset generation verified
- L6: persistence/readback verified
- L7: historical sample validated
- L8: calibration research-ready
- L9: trusted intelligence dataset

Current learning outcome dataset is not yet L9.

## Existing Foundation Mapping

| Existing/partial system | How it contributes | What is still missing | Additive next step |
| --- | --- | --- | --- |
| recommendation snapshots | Provide snapshot-time recommendation evidence. | Field completeness and context consistency need audit. | Snapshot Field Inventory Against Existing Schema. |
| historical candle persistence | Provides price/volume evidence for outcome reconstruction and replay. | Coverage windows and ticker completeness need readback audit. | Historical Backfill Cost and Provider Capacity Plan. |
| replay dry-run/static replay foundation | Provides local outcome reconstruction and result modeling foundation. | Mapping from static replay result model to learning dataset fields. | Learning Dataset Static Fixture Spec. |
| History/Statistics foundations | Provide prior review/statistics surfaces and learning context. | Unified dataset keys and compatibility mapping. | Adapter/mapping plan rather than duplicate concepts. |
| confidence calibration planning | Defines calibration metrics and confidence interpretation. | Dataset fields that calculate calibration error per snapshot. | Pattern Discovery and Confidence Calibration Roadmap. |
| quality gate planning | Defines gate vocabulary for accepted/rejected recommendations. | Gate snapshots and learning feedback linkage. | Quality gate summary field mapping. |

## Do-Not-Duplicate Rules

- do not create a parallel snapshot system
- do not create duplicate outcome models if static replay result model can be extended/mapped
- do not create duplicate History/Statistics concepts
- do not create a separate unlinked learning dataset
- prefer mappings/adapters over parallel architecture
- keep backward compatibility with existing recommendation and outcome records

## Blocked Implementation Work

- no dataset persistence yet
- no Supabase writes yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This design does not authorize deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase reads, Supabase writes, dataset persistence, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 336: Intelligence Context Schema Draft
- Action 337: Pattern Discovery and Confidence Calibration Roadmap
- Action 338: Runtime Ping-Only Rollout Checklist
- Action 339: Historical Backfill Cost and Provider Capacity Plan
- Action 340: Snapshot Field Inventory Against Existing Schema
- Action 341: Learning Dataset Static Fixture Spec
