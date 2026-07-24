# Action 381: Intelligence Context Static Fixture Implementation

## Status And Purpose

- implementation_status: intelligence_context_static_fixtures_implemented
- implementation_scope: deterministic_local_static_contract_fixtures_only
- live_collection_status: blocked
- mapper_implementation_status: blocked
- runtime_preview_status: runtime_preview_waiting_for_operator_inputs
- deployment_allowed: false
- main_push_allowed: false

Action 381 provides synthetic Intelligence Context envelopes for contract validation, Action 380 Learning Dataset compatibility, future mapper and Pattern Insight tests, missing-data and provenance checks, temporal anti-leakage checks, and future adapter planning.

This is the static fixture implementation boundary approved by Action 354. It does not authorize live collection, inference, mapping, persistence, or runtime integration.

## Approved Boundary And Type Dependencies

The implementation adds `lib/intelligence-context-static-fixtures.ts`, this document, one focused verifier and test, and minimal Actions 318-320 guard entries.

The fixture wrapper directly imports and reuses `LearningDatasetContext`, `LearningDatasetContextValue`, and `LearningDatasetProvenance` from Action 380. Those types encode the Action 336 context envelope used by Learning Dataset rows. Action 381 does not redeclare MarketRegimeContext, SectorIndustryContext, RelativeStrengthContext, CompanyNewsCatalystContext, CalendarEventContext, or DataProvenanceContext schemas.

## Deterministic Identity And Time

Fixture IDs, context IDs, recommendation/snapshot linkage, symbols, capture timestamps, effective timestamps, provider/source identifiers, freshness ages, and future-exclusion timestamps are fixed literals. Rows remain in lexical ID order and serialize in predefined property and array order. Accessors return defensive clones and deterministic ID/family retrieval.

The recommendation boundary is fixed at `2026-07-08T13:45:00.000Z`. Captured and effective context must be at or before that boundary. Facts after the boundary may appear only in `excluded_future_context` with `included_in_snapshot_context: false`.

## Fixture Coverage

Market and index fixtures cover bullish, bearish, mixed, trend, chop, elevated-volatility, low-volatility, incomplete-market, SPY/QQQ/IWM alignment, divergence, and missing-index states.

Relative fixtures cover strong and weak sector, industry, and peer labels; positive and negative relative strength; conflicting relative signals; sector-supported momentum; weak-market/strong-stock behavior; and isolated stock movement without sector support.

Company context covers positive, negative, neutral, absent, and unavailable news plus earnings, guidance, FDA, SEC, stale catalyst, and conflicting company-event evidence.

Calendar context covers CPI, FOMC, jobs report, options expiration, another high-impact event, no relevant event, pre-recommendation events, and post-recommendation facts that are explicitly excluded.

Provenance and quality fixtures cover complete, partial, low-quality, stale, conflicting, and unavailable sources. Freshness is a fixed state with a fixed age or explicit null. Null, absent, unavailable, unknown, stale, conflicting, and partial semantics remain distinct.

## Temporal Separation And Anti-Leakage

The validator checks recommendation linkage, capture/effective ordering, catalyst timing, future exclusions, finite metrics, source-quality bounds, freshness consistency, conflict evidence, market completeness, explicit missing semantics, stable ordering, and duplicate identities. Outcome keys are forbidden from context serialization. The validator verifies only; it does not calculate regime, relative strength, sentiment, freshness, confidence, or outcomes.

Malformed payloads are raw `Record<string, unknown>` values outside the valid typed fixture array. They cover missing/duplicate identity, linkage errors, late capture/effective timestamps, future news/macro leakage, embedded outcome data, malformed provenance, unsupported categories, invalid freshness, stale-as-fresh, missing conflict metadata, partial-as-complete, non-finite metrics, invalid bounds, random identity, and wall-clock timestamp attempts.

## Guarantees

- no live collection: no market, news, macro, SEC, FDA, earnings, or guidance fetch exists
- no mapper: Recommendation Snapshots are not transformed or merged into context
- no inference: sentiment, regime, strength, conflict, freshness, and confidence values are fixed literals
- no runtime: no app route, page, proxy, middleware, Netlify, migration, schema, provider, Supabase, persistence, replay, scanner, ranking, confidence, recommendation, Add Trade, broker, execution, or risk behavior changed

## Relationship To Action 380

Action 380 owns the typed context envelope and provenance shape used by Learning Dataset fixtures. Action 381 supplies compatible standalone static examples for future local contract tests. It does not map Action 381 fixtures into Action 380 rows and does not create a second learning or context persistence model.

## Intended Future Consumers And Blocked Work

Separately approved local tests may consume these fixtures for a future mapper, Pattern Insight contracts, data-quality rules, or adapter planning. Live context collection, provider/news/macro access, Supabase, persistence, schema or migration changes, replay, mapper implementation, Pattern Discovery, statistical inference, confidence calibration, scanner/ranking/recommendation mutation, deployment, and main push remain blocked.

The runtime-preview chain remains paused at `runtime_preview_waiting_for_operator_inputs`. The immutable preview candidate and preserved preview attempt are unchanged.

