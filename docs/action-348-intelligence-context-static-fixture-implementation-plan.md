# Action 348: Intelligence Context Static Fixture Implementation Plan

## Implementation Plan Status

- intelligence_context_fixture_implementation_plan_status: fixture_implementation_plan_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is intelligence context fixture implementation planning only, not fixture implementation, provider integration, news integration, runtime implementation, Supabase persistence, schema implementation, migration, scanner mutation, ranking mutation, deploy readiness, or main-push authorization.

## Purpose

Action 342 defined what context fixtures should represent. This action defines how those fixtures may later be implemented locally.

Future deterministic fixtures must make market regime, sector/industry, relative strength, company news/catalysts, calendar events, provenance, and context envelopes testable. Future fixture implementation must attach to existing recommendation and learning foundations rather than create parallel records.

## Relationship To Existing Work

- Action 336 Intelligence Context Schema Draft defines the context envelope and field model that future fixtures should represent.
- Action 342 Intelligence Context Static Fixture Spec defines the required scenario coverage and expected context labels.
- Action 346 Existing Schema Compatibility Matrix defines adapter-first compatibility and migration constraints.
- Action 341 Learning Dataset Static Fixture Spec defines the learning scenarios that context fixtures should support.
- Action 347 Learning Dataset Static Fixture Implementation Plan defines the local-only learning fixture implementation boundary that context fixtures must align with.
- Existing recommendation snapshot, replay, History, and Statistics foundations remain the source-aligned surfaces for future fixture mapping.

Context fixture implementation must use adapters and envelopes around these foundations. It must not duplicate recommendation snapshots, replay records, History/Statistics summaries, learning rows, or provider provenance structures.

## Allowed Future Implementation Files

When separately approved later, future implementation may add only:

- `lib/intelligence-context-static-fixtures.ts`
- optionally one small pure helper:
  - `lib/intelligence-context-static-fixture-validation.ts`
- focused documentation
- focused Playwright test

No app/api, app page, proxy, middleware, Netlify, migration, provider, or Supabase files may change.

## Future TypeScript Fixture Shape

Future fixture rows should use a deterministic TypeScript shape with:

- fixture_id
- fixture_version
- description
- snapshot_timestamp
- symbol
- market_regime_context
- sector_industry_context
- relative_strength_context
- company_news_catalyst_context
- calendar_event_context
- data_provenance_context
- context_snapshot_envelope
- expected_context_labels
- expected_missing_context_reasons
- anti_leakage_expectation
- learning_context_eligibility

The shape should model Action 336 context envelopes and keep unavailable or missing context explicit.

## Required Fixture Scenarios

Future implementation must carry forward all 12 Action 342 scenarios:

1. supportive_bull_regime_sector_strength
2. weak_market_strong_stock_relative_strength
3. sector_supported_momentum
4. isolated_stock_spike_no_sector_support
5. catalyst_fresh_earnings_gap
6. stale_catalyst_risk
7. macro_event_chop_day
8. options_expiration_noise
9. missing_news_context
10. missing_sector_mapping
11. provenance_low_confidence
12. anti_leakage_news_after_snapshot

## Deterministic Fixture Requirements

- fixed timestamps
- fixed IDs
- fixed symbols
- no Date.now
- no random IDs
- no runtime timezone dependency
- no environment reads
- no network
- no provider imports
- no news API imports
- no Supabase imports
- no app/api imports
- no scanner/ranking imports
- stable array ordering
- immutable fixture objects where practical

## Anti-Leakage Implementation Rules

- catalyst timestamps after snapshot must remain unavailable at snapshot time
- future regime labels must not appear in snapshot-time context
- future sector performance must not be included
- future relative-strength values must not be included
- enrichment version and source timestamp must be auditable
- post-outcome context must be separately labeled
- missing context must never be silently imputed

## Adapter-First Rules

- context fixtures should model the Action 336 envelope
- future mappers should attach context to recommendation snapshots
- avoid parallel recommendation records
- avoid duplicate learning rows
- avoid duplicate outcome records
- avoid duplicate provider provenance structures
- prefer small adapters over new persistence architecture
- preserve History/Statistics compatibility

## Validation Requirements

Future fixture implementation must validate:

- all 12 fixtures exist
- IDs are unique and deterministic
- all timestamps are valid and fixed
- context object coverage matches expected scenario
- missing context reasons are explicit
- anti-leakage expectations pass
- unavailable catalyst/news is not treated as snapshot-time context
- no forbidden imports
- no mutations
- stable deterministic serialization

## Future Implementation Readiness Levels

- CIF0: implementation plan missing
- CIF1: file boundaries defined
- CIF2: fixture type shape defined
- CIF3: scenario mappings defined
- CIF4: deterministic rules defined
- CIF5: anti-leakage validation defined
- CIF6: adapter-first mapping defined
- CIF7: local implementation approved
- CIF8: local fixture implementation complete
- CIF9: local fixture validation complete

Current status is not CIF7. Implementation is not authorized.

## Current Blocked Work

- no context fixture implementation yet
- no context mapper implementation yet
- no provider calls yet
- no news API calls yet
- no Supabase reads/writes yet
- no context persistence yet
- no learning dataset persistence yet
- no schema changes yet
- no migrations yet
- no runtime routes yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This implementation plan does not authorize context fixture implementation, context mapper implementation, runtime route changes, provider calls, news API calls, Supabase remote reads, Supabase reads, Supabase writes, context persistence, learning dataset persistence, schema changes, migrations, replay execution, scanner mutations, ranking mutations, confidence threshold changes, deploys, main pushes, recommendation mutation, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 349: Pattern Insight Static Fixture Spec
- Action 350: Runtime Ping-Only Route Approval Gate
- Action 351: First Tiny Provider Capacity Experiment Approval Gate
- Action 352: Snapshot-to-Learning Dataset Mapper Plan
- Action 353: Learning Dataset Static Fixture Implementation Approval Gate
- Action 354: Intelligence Context Static Fixture Implementation Approval Gate
