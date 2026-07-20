# Action 336: Intelligence Context Schema Draft

## Schema Draft Status

- intelligence_context_schema_status: schema_draft_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is context schema planning only, not runtime implementation, not provider integration, not news integration, not Supabase persistence, not scanner mutation, not ranking mutation, not deploy readiness, and not main-push authorization.

## Purpose

Context is what lets Ture distinguish real opportunity from isolated price noise. Context objects should attach to recommendation snapshots and learning outcome dataset rows.

Context should support pattern discovery, confidence calibration, and better future recommendations. Context must be timestamped and anti-leakage safe. Existing snapshot/replay/history/statistics foundations must be preserved.

## Schema Design Principles

- snapshot-time context must only include data known at or before recommendation time
- outcome/eod context must be separate from snapshot-time context
- every context object needs source/provenance fields
- every context object should have freshness and confidence indicators
- context should be additive, not a parallel recommendation system
- missing context must be explicit, not silently ignored
- context should support later feature extraction

## Context Object Overview

Future context objects:

1. MarketRegimeContext
2. SectorIndustryContext
3. RelativeStrengthContext
4. CompanyNewsCatalystContext
5. CalendarEventContext
6. DataProvenanceContext
7. ContextSnapshotEnvelope

## MarketRegimeContext Fields

- context_timestamp
- trading_day
- trading_window
- SPY_direction
- QQQ_direction
- IWM_direction
- index_alignment
- volatility_regime
- breadth_proxy
- risk_on_risk_off
- trend_day_or_chop_day
- session_phase
- regime_confidence
- source
- freshness
- missing_fields

## SectorIndustryContext Fields

- ticker
- sector
- industry
- peer_group
- sector_etf
- industry_proxy
- sector_direction
- industry_direction
- sector_relative_strength
- peer_relative_strength
- sector_volume_context
- context_confidence
- source
- freshness
- missing_fields

## RelativeStrengthContext Fields

- ticker
- context_timestamp
- stock_vs_SPY
- stock_vs_QQQ
- stock_vs_IWM
- stock_vs_sector_etf
- stock_vs_peer_group
- intraday_relative_strength
- multi_day_relative_strength
- relative_volume
- relative_strength_label
- source
- freshness
- missing_fields

## CompanyNewsCatalystContext Fields

- ticker
- catalyst_detected
- catalyst_type
- catalyst_timestamp
- catalyst_freshness
- headline_summary
- source_count
- news_volume_context
- earnings_or_guidance_context
- analyst_or_regulatory_context
- legal_or_event_risk
- catalyst_confidence
- available_at_snapshot_time
- source
- freshness
- missing_fields

## CalendarEventContext Fields

- trading_day
- earnings_day
- earnings_proximity
- macro_event_day
- macro_event_type
- fomc_cpi_jobs_context
- options_expiration_context
- holiday_or_short_session
- sector_event_context
- event_risk_label
- source
- freshness
- missing_fields

## DataProvenanceContext Fields

- provider
- provider_request_id
- fetched_at
- source_timestamp
- adjusted_or_unadjusted
- interval
- row_count
- missing_data_flags
- source_confidence
- raw_response_reference
- audit_readback_status
- retention_policy

## ContextSnapshotEnvelope Fields

- context_snapshot_id
- snapshot_id
- recommendation_id
- ticker
- trading_day
- trading_window
- created_at
- market_regime_context
- sector_industry_context
- relative_strength_context
- company_news_catalyst_context
- calendar_event_context
- data_provenance_context
- anti_leakage_status
- context_completeness_score
- missing_context_reasons
- learning_eligible

## Anti-Leakage Rules

- do not use news published after snapshot time as snapshot-time context
- do not use end-of-day regime classification as entry-time regime unless explicitly marked
- do not use outcome movement to label pre-trade context
- do not use future sector move as snapshot-time sector context
- keep enrichment versions audited
- scanner/ranking mutation remains blocked

## Readiness Levels

- CXT0: context undefined
- CXT1: context domains defined
- CXT2: schema draft exists
- CXT3: static fixtures exist
- CXT4: mapping to snapshots designed
- CXT5: read-only runtime enrichment verified
- CXT6: persistence/readback verified
- CXT7: learning dataset integration verified
- CXT8: confidence calibration research-ready
- CXT9: trusted intelligence context signal

Current context schema is not yet CXT9.

## Do-Not-Duplicate Rules

- do not create parallel recommendation records
- do not create unlinked context tables before mapping existing snapshots
- do not duplicate provider audit concepts
- do not duplicate outcome/replay records
- prefer envelope/mapping/adapters over parallel architecture
- preserve existing History/Statistics compatibility

## Blocked Implementation Work

- no context persistence yet
- no Supabase writes yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This draft does not authorize deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase reads, Supabase writes, context persistence, dataset persistence, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 337: Pattern Discovery and Confidence Calibration Roadmap
- Action 338: Runtime Ping-Only Rollout Checklist
- Action 339: Historical Backfill Cost and Provider Capacity Plan
- Action 340: Snapshot Field Inventory Against Existing Schema
- Action 341: Learning Dataset Static Fixture Spec
- Action 342: Intelligence Context Static Fixture Spec
