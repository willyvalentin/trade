# Action 342: Intelligence Context Static Fixture Spec

## Fixture Spec Status

- intelligence_context_static_fixture_status: fixture_spec_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is intelligence context fixture planning only, not fixture implementation, schema implementation, migration, runtime implementation, provider integration, news integration, Supabase persistence, scanner mutation, ranking mutation, deploy readiness, or main-push authorization.

## Purpose

Context fixtures make Ture's broader intelligence layer concrete before implementation. Fixtures should prove how market regime, sector/industry, relative strength, company news/catalysts, calendar events, and provenance attach to recommendation snapshots.

Fixtures should support future learning dataset fixtures and pattern discovery. Fixtures must remain anti-leakage safe and deterministic.

## Fixture Design Principles

- deterministic timestamps
- no Date.now
- no random IDs
- no provider calls
- no news API calls
- no Supabase reads/writes
- snapshot-time context separated from post-outcome context
- available_at_snapshot_time must be explicit for catalysts
- missing context must be explicit
- each fixture should define expected context completeness
- no scanner/ranking mutation
- no confidence threshold mutation

## Core Context Fixture Scenarios

### supportive_bull_regime_sector_strength

- SPY/QQQ aligned positive
- sector ETF positive
- stock shows relative strength
- no major catalyst
- high context completeness

### weak_market_strong_stock_relative_strength

- market weak
- stock outperforming indexes and sector
- useful for relative strength setups

### sector_supported_momentum

- stock movement supported by sector/industry
- peer group confirmation

### isolated_stock_spike_no_sector_support

- stock moves without sector/peer support
- should flag noisy/isolated move risk

### catalyst_fresh_earnings_gap

- earnings/guidance catalyst
- available at snapshot time
- high news freshness

### stale_catalyst_risk

- old catalyst
- move may be late/chasing
- catalyst_freshness stale

### macro_event_chop_day

- CPI/FOMC/jobs day
- high volatility or chop risk
- useful for regime caution

### options_expiration_noise

- options expiration context
- possible noisy moves

### missing_news_context

- price context available
- news context missing
- context completeness degraded

### missing_sector_mapping

- ticker has missing sector/industry mapping
- learning still possible but context limited

### provenance_low_confidence

- provider/source freshness uncertain
- missing fields present
- should lower context confidence

### anti_leakage_news_after_snapshot

- news exists after snapshot time
- must not be considered snapshot-time catalyst

## Required Fixture Object Coverage

For each fixture define expected coverage for:

- MarketRegimeContext
- SectorIndustryContext
- RelativeStrengthContext
- CompanyNewsCatalystContext
- CalendarEventContext
- DataProvenanceContext
- ContextSnapshotEnvelope

## Expected Context Labels

Each fixture should define these expected labels:

- market_regime_label
- sector_support_label
- relative_strength_label
- catalyst_support_label
- calendar_risk_label
- data_provenance_label
- context_completeness_label
- anti_leakage_status
- learning_context_eligibility
- missing_context_reasons

## Anti-Leakage Validation Cases

- catalyst after snapshot time must not be marked available_at_snapshot_time
- end-of-day trend/chop classification must not be used as snapshot-time regime unless explicitly marked post_outcome
- future relative strength must not be used as pre-trade context
- later sector move must not be used as snapshot-time sector support
- context enrichment versions must be auditable

## Mapping To Existing Foundations

Fixtures should map to:

- Intelligence Context Schema Draft
- Recommendation Snapshot Completeness Audit
- Learning Outcome Dataset Design
- Learning Dataset Static Fixture Spec
- Pattern Discovery Roadmap
- existing History/Statistics foundations

Prefer context envelopes/adapters over parallel architecture. Do not duplicate recommendation or outcome records.

## Readiness Levels

- CF0: context fixture scenarios undefined
- CF1: context fixture scenario list defined
- CF2: required context object coverage defined
- CF3: expected context labels defined
- CF4: anti-leakage validation cases defined
- CF5: static fixture implementation ready
- CF6: fixture tests pass locally
- CF7: mapped to learning dataset fixture plan
- CF8: ready for local context mapper implementation

Current intelligence context fixtures are not yet CF8.

## Blocked Implementation Work

- no context fixture implementation yet
- no context persistence yet
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

This context fixture spec does not authorize context fixture implementation, deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase remote reads, Supabase reads, Supabase writes, context persistence, dataset persistence, schema changes, migrations, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 343: Pattern Insight Static Type Spec
- Action 344: Runtime Ping-Only Route Implementation Plan
- Action 345: First Tiny Provider Capacity Experiment Plan
- Action 346: Existing Schema Compatibility Matrix
- Action 347: Learning Dataset Static Fixture Implementation Plan
- Action 348: Intelligence Context Static Fixture Implementation Plan
