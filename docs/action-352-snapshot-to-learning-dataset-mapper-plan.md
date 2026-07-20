# Action 352: Snapshot-to-Learning Dataset Mapper Plan

## Plan Status

- snapshot_to_learning_dataset_mapper_plan_status: mapper_plan_ready
- mapper_implementation_allowed: false
- learning_dataset_persistence_allowed: false
- deploy_readiness: false
- main_push_allowed: false
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is mapper planning only. It does not implement a mapper, generate persisted learning rows, alter schema, authorize runtime work, authorize deployment, or authorize a main push.

## Purpose

The future Snapshot-to-Learning Dataset mapper should convert existing recommendation architecture into learning-ready rows. Ture should learn from every evaluated recommendation snapshot, including visible and research-only recommendations, without treating executed trades as the only learning source.

The mapper plan exists to:

- preserve one learning row per evaluated recommendation snapshot
- avoid duplicate recommendations, outcomes, or learning identities
- separate snapshot-time features from outcome-time fields
- prepare future static fixture implementation and offline learning analysis
- reuse existing recommendation snapshots, outcomes, replay helpers, History, Statistics, and learning diagnostics rather than duplicating them

It explicitly builds on Action 334, Action 335, Action 340, Action 341, Action 346, and Action 347.

## Mapper Input Contract

Future inputs should adapt existing types where possible and stay explicit when optional context is missing.

- recommendation_snapshot: the existing snapshot object captured at recommendation time
- recommendation_identity: recommendation id, snapshot id, batch id, scan run id, ticker, side, visibility, and source linkage
- trade_plan: entry, stop, target, risk geometry, horizon/window intent, and plan metadata
- setup_and_confidence: setup family, setup labels, score, confidence value, confidence bucket, tier, and strategy labels where available
- quality_gate_summary: sanitizer/gate outcomes, rejection reasons, completeness status, and eligibility notes
- optional_context_snapshot_envelope: market, sector, industry, relative strength, catalyst/news, and calendar context that was available at snapshot time
- evaluated_outcome: one already evaluated outcome object for a fixed horizon/window
- data_provenance: provider/source/timestamp lineage for snapshot, context, and outcome fields
- mapper_version: deterministic mapper contract version

Missing optional context must remain explicit. In other words, missing optional context must remain explicit. The evaluated_outcome input must be produced separately from snapshot creation, and outcome data must not be used to fill snapshot-time fields.

## Mapper Output Contract

Future learning rows should be organized into these groups:

- identity
- snapshot_time_inputs
- trade_plan
- setup_and_confidence
- quality_gates
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
- missing_context_reasons
- mapper_version

## Identity And Linkage Rules

- one learning row per recommendation_snapshot_id plus outcome window/version
- recommendation identity preserved
- snapshot identity preserved
- outcome identity preserved where existing
- source scan/run linkage preserved
- no random IDs
- no duplicate row for same snapshot/outcome version
- deterministic learning_row_key

The deterministic learning_row_key should be derived from stable existing identity fields such as recommendation_snapshot_id, recommendation_id when present, batch_fingerprint, scan_run_id, outcome_horizon, outcome_window, outcome_version, and mapper_version. It must not use time-of-run, Date.now, Math.random, generated UUIDs, or persistence-side IDs.

## Snapshot-Time Versus Outcome-Time Separation

Snapshot-time fields:

- recommendation geometry
- setup
- confidence
- quality gates
- context available at recommendation time
- catalyst availability at snapshot time
- provenance known at snapshot time

Outcome-time fields:

- target/stop/no-entry/open-at-window-end
- realized gross R
- MFE/MAE
- outcome window
- ambiguity handling
- derived learning labels

Outcome fields must never influence snapshot-time fields. Derived learning labels may consume evaluated outcomes, but they must remain in outcome_fields or derived_learning_fields and cannot rewrite source snapshot values.

## Mapping Matrix

The mapping type values are direct | normalized | derived | optional | missing.

| target learning field/group | source object/field | mapping type | anti-leakage requirement | compatibility classification from Action 346 | fallback behavior |
| --- | --- | --- | --- | --- | --- |
| recommendation identity | recommendation_identity.recommendation_id | direct | snapshot-time identity only | compatible_existing_snapshot_identity | null only for research_only with snapshot linkage |
| snapshot identity | recommendation_snapshot.snapshot_fingerprint or recommendation_snapshot_id | direct | fixed before outcome evaluation | compatible_existing_snapshot_identity | excluded if no snapshot linkage |
| ticker/direction | recommendation_snapshot.ticker and side/direction | normalized | snapshot-time only | compatible_existing_trade_plan | excluded if missing ticker or direction |
| timestamps/window | recommendation_snapshot.created_at, trading_day, scan_window | normalized | source timestamp must be snapshot-time | compatible_existing_scan_metadata | unknown window with missing_context_reasons |
| entry/stop/target | trade_plan.entry, stop, target | direct | plan geometry from snapshot only | compatible_existing_trade_plan | excluded if concrete prices missing |
| setup family | setup_and_confidence.setup_family/setup_type | normalized | no outcome-derived setup rewrite | adapter_required_existing_setup_labels | unknown setup with missing_context_reasons |
| confidence value/bucket | setup_and_confidence.score/confidence/bucket/tier | normalized | confidence captured before outcome | adapter_required_existing_confidence_fields | unknown confidence bucket |
| quality gates | quality_gate_summary.gates/reasons/completeness | normalized | gate results from snapshot/build time | compatible_existing_quality_gates | limited eligibility if incomplete |
| market regime | optional_context_snapshot_envelope.market_regime | optional | regime timestamp must be <= snapshot timestamp | future_context_adapter_required | unknown market regime |
| sector/industry | optional_context_snapshot_envelope.sector_industry | optional | mapping version timestamp must be auditable | adapter_required_existing_ticker_profile | missing_sector_mapping reason |
| relative strength | optional_context_snapshot_envelope.relative_strength | optional | later relative strength excluded | future_context_adapter_required | unknown relative_strength |
| catalyst/news | optional_context_snapshot_envelope.news_catalyst | optional | later news excluded; missing news is not no catalyst | future_context_adapter_required | missing_news_context reason |
| calendar event | optional_context_snapshot_envelope.calendar_event | optional | event availability must be snapshot-time safe | future_context_adapter_required | unknown calendar_event |
| provenance | data_provenance.provider/source/timestamps | normalized | provenance split by snapshot/context/outcome source | compatible_existing_provider_audit | uncertain provenance lowers eligibility |
| outcome classification | evaluated_outcome.status/classification | direct | outcome-time only | compatible_existing_outcome_record | pending row if outcome missing |
| R metrics | evaluated_outcome.best_r/worst_r/realized_r | direct | outcome-time only | compatible_existing_outcome_record | null metrics with incomplete outcome |
| derived labels | derived labels from snapshot plus evaluated_outcome | derived | output-only labels cannot rewrite snapshot | new_learning_row_derivation_only | label unavailable until outcome complete |
| learning eligibility | anti_leakage_status plus completeness/provenance/outcome | derived | eligibility derived after separation checks | new_learning_row_derivation_only | full, limited, or excluded |

## Missing-Data Behavior

- never silently invent context
- use null/unknown only where contract allows
- populate missing_context_reasons
- learning eligibility may be full, limited, or excluded
- missing news is not equivalent to no catalyst
- missing sector mapping is explicit
- uncertain provenance lowers eligibility
- missing outcome prevents completed learning row

Soft context gaps should produce limited learning eligibility where the recommendation snapshot, trade plan, and evaluated outcome are otherwise usable. Hard gaps such as missing ticker, missing direction, missing concrete entry/stop/target, missing snapshot linkage, invalid risk geometry, or missing evaluated outcome should exclude completed learning-row generation.

## Anti-Leakage Validation Rules

- snapshot timestamps precede or equal all snapshot-time source timestamps
- later news excluded
- later regime labels excluded
- later relative strength excluded
- outcome timestamps remain outcome-only
- derived labels consume outcomes but cannot rewrite source snapshot
- mapper version auditable
- enrichment version auditable

The mapper must make anti_leakage_status explicit. A row can be full, limited, or excluded depending on whether context provenance proves snapshot-time availability.

## Adapter-First And No-Duplicate Rules

- reuse existing snapshot/result/outcome types
- prefer adapters over parallel models
- preserve static replay result compatibility
- preserve History/Statistics compatibility
- no duplicate recommendation tables
- no duplicate outcome records
- no duplicate confidence fields
- no duplicate provider provenance concepts
- no learning row without snapshot linkage

Future implementation should adapt the existing schema and runtime result shapes defined or audited by Actions 334, 335, 340, 341, 346, and 347. It should not create a second recommendation model, a second outcome model, a second confidence taxonomy, or a detached learning identity system.

## Future Allowed Implementation Files

When separately approved, future implementation may add only:

- `lib/snapshot-to-learning-dataset-mapper.ts`
- optionally one focused pure validation helper
- focused fixtures/tests
- one implementation result doc

No app/api, provider, Supabase, migration, scanner, ranking, proxy, middleware, or Netlify files may change.

## Future Validation Requirements

- deterministic mapping
- stable serialization
- same inputs produce same row
- duplicate-key detection
- all Action 341 scenarios mappable
- missing-context scenarios handled
- anti-leakage fixture rejected or limited correctly
- no provider/Supabase/runtime imports
- no writes
- no mutation of input objects

The future mapper test suite should also prove no env reads, no network calls, no Supabase reads, no Supabase writes, no provider calls, no news API calls, no runtime imports, no app/api imports, and no scanner/ranking/confidence mutation.

## Readiness Levels

- LM0 mapper need undefined
- LM1 input/output contracts documented
- LM2 field mapping matrix defined
- LM3 identity/linkage rules defined
- LM4 missing-data rules defined
- LM5 anti-leakage validation defined
- LM6 implementation plan ready
- LM7 implementation approval granted
- LM8 local mapper implemented
- LM9 local fixture validation complete
- LM10 offline learning-row generation ready

Current status is LM6. Mapper implementation is not authorized.

## Blocked Work

- no mapper implementation
- no learning-row generation
- no dataset persistence
- no Supabase access
- no schema or migration changes
- no runtime routes
- no provider/news calls
- no replay execution
- no scanner/ranking/confidence mutation
- no deploy
- no main push

This mapper plan does not authorize fixture implementation, mapper implementation, learning-row generation, learning dataset persistence, Supabase reads, Supabase writes, schema changes, migrations, runtime route changes, provider calls, news API calls, replay execution, scanner mutations, ranking mutations, confidence threshold changes, deploys, main pushes, recommendation mutation, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 353: Learning Dataset Static Fixture Implementation Approval Gate
- Action 354: Intelligence Context Static Fixture Implementation Approval Gate
- Action 355: Pattern Insight Static Fixture Implementation Plan
- Action 356: Runtime Ping-Only Route Implementation Readiness Review
- Action 357: First Tiny Provider Capacity Experiment Implementation Readiness Review
- Action 358: Snapshot-to-Learning Dataset Mapper Implementation Approval Gate
