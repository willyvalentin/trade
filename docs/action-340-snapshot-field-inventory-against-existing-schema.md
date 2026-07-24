# Action 340: Snapshot Field Inventory Against Existing Schema

## Inventory Status

- snapshot_field_inventory_status: inventory_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is field inventory only, not schema implementation, migration, runtime implementation, provider integration, news integration, Supabase persistence, scanner mutation, ranking mutation, deploy readiness, or main-push authorization.

## Purpose

Ture must not duplicate existing snapshot/recommendation/outcome systems. Existing schema/types/docs must be inventoried before adding fields.

The goal is to determine what is already captured, what is partial, and what is missing. This supports Action 334 snapshot completeness and Action 335 learning outcome dataset design without creating parallel architecture.

## Source Surfaces To Inspect

- Supabase migrations and schema docs
- recommendation-related TypeScript types
- recommendation generation helpers
- snapshot helpers
- history/statistics helpers
- outcome/replay helpers
- static replay model files
- scan run / provider audit files
- tests referencing recommendation/snapshot/outcome fields

## Inventory Method

- local source inspection only
- no Supabase remote reads
- no provider calls
- no migrations
- no runtime imports
- no schema changes
- conservative classification
- unknown fields must be marked needs_audit rather than guessed

## Existing Field Inventory Table

| field group | ideal field from Action 334/335 | likely existing field/source | likely file/module | coverage | confidence | notes | additive next step |
| --- | --- | --- | --- | --- | --- | --- | --- |
| identity | snapshot_id, recommendation_id, candidate_id, ticker, source_type, created_at, trading_day, trading_window, dataset_row_id | recommendation/snapshot IDs, ticker, batch/window/day metadata appear likely present | `supabase/migrations/20260528000000_create_recommendation_snapshots.sql`, `lib/recommendation-snapshot.ts`, `lib/recommendation-history.ts` | partial | medium | Snapshot and batch concepts exist, but exact dataset row identity mapping still needs schema audit. | Build concrete schema compatibility matrix and join-key map. |
| trade_plan | direction, entry, stop, target, planned_risk, planned_reward, planned_r_multiple, invalidation_logic | entry/stop/target/direction appear in recommendation and outcome paths | `lib/trade-planning-snapshot.ts`, `lib/recommendation-plan-reference.ts`, `lib/recommendation-outcome-tracker.ts` | existing | medium | Core plan geometry is likely captured, but planned R fields and invalidation wording need audit. | Map plan fields from snapshot payloads to Action 335 dataset fields. |
| setup_classification | setup_family, setup_variant, setup_label, setup_reason, evidence_summary, failure_mode_hypothesis | setup/tier/reason concepts likely exist in recommendation payloads and diagnostics | `lib/recommendation-decision-stack.ts`, `lib/recommendation-output-enrichment.ts`, `lib/recommendation-build-diagnostics.ts` | partial | low | Setup taxonomy may be implicit rather than normalized. | Add setup taxonomy compatibility audit before new fields. |
| confidence | numeric_confidence, confidence_label, confidence_components, confidence_explanation, calibration_state, uncertainty_notes, confidence_bucket | confidence/tier/calibration helpers exist | `lib/recommendation-calibration.ts`, `lib/recommendation-tier-performance.ts`, `lib/recommendation-learning-insights.ts` | partial | medium | Confidence may be split across score, tier, and labels. | Create confidence field adapter design, avoiding duplicate confidence columns. |
| quality_gates | freshness, session, liquidity, spread/volatility, VWAP, momentum, volume, risk/reward, geometry, duplicate, limit, persistence, learning feedback | gate and QA concepts likely exist in scanner and diagnostics files | `lib/scanner-output-qa.ts`, `lib/recommendation-intake-quality.ts`, `lib/recommendation-sample-quality.ts` | partial | medium | Individual gate names may not align one-to-one with Action 334 vocabulary. | Build static checker against concrete candidate/build diagnostics. |
| market_context | SPY_context, QQQ_context, IWM_context, market_regime, volatility_regime, trend_day_or_chop_day, risk_on_risk_off_context | scan-window/session context exists; full regime context needs audit | `lib/intraday-scan-window.ts`, `lib/day-trade-scan-orchestration.ts`, `lib/daily-learning-review.ts` | partial | low | Index/regime fields may not be persisted with snapshots. | Map context schema draft fields to existing scan/run metadata. |
| sector_industry_context | sector, industry, peer_group, sector_etf, sector_relative_strength, peer_relative_strength | symbol metadata foundation exists | `supabase/migrations/20260702000000_create_symbol_metadata.sql`, `lib/symbol-metadata` candidates need audit | partial | low | Sector/industry may exist as metadata but not snapshot-time context. | Audit symbol metadata read/write surfaces and History/Statistics usage. |
| relative_strength_context | stock_vs_SPY, stock_vs_QQQ, stock_vs_sector, stock_vs_peer_group, intraday_relative_strength, multi_day_relative_strength | relative strength may be derived in scanner/ranking, but persistence needs audit | `lib/scanner-candidate-ranking.ts`, `lib/real-scanner-candidate-generation.ts`, `lib/recommendation-output-enrichment.ts` | needs_audit | low | Avoid assuming runtime ranking signals are persisted. | Inspect candidate payload shape and ranking input fields locally. |
| news_catalyst_context | catalyst_detected, catalyst_type, catalyst_timestamp, catalyst_freshness, headline_summary, earnings/guidance, analyst/regulatory, news_volume_context | no clear news/catalyst persistence surfaced in local filename scan | needs_audit | missing | low | News/catalyst provider work remains blocked. | Keep as future context adapter; no news API calls yet. |
| scan_context | scan_run_id, scan_window, scan_mode, scanner_version, provider, provider_freshness, candidate_tier, rejection/acceptance_reason, ranking_inputs, ranking_position | scan run, batch, scheduled attempts, build diagnostics exist | `supabase/migrations/20260528002000_create_recommendation_scan_runs.sql`, `lib/recommendation-scan-run.ts`, `lib/scheduled-scan-attempts.ts`, `lib/recommendation-build-diagnostics.ts` | partial | high | Good candidate for adapter-based mapping. | Inventory exact scan run fields and selected-to-built diagnostics. |
| data_provenance | provider, fetch_timestamp, candle_interval, candle_count_available, missing_data_flags, adjusted_or_unadjusted, raw_response_reference, audit_readback_status, source_confidence | provider/budget/profile and historical storage foundations exist | `lib/provider-budget-guard.ts`, `lib/provider-plan-profile.ts`, `supabase/migrations/20260709000000_create_historical_candle_storage.sql` | partial | medium | Provenance exists in pockets; snapshot linkage needs audit. | Map provider/audit fields without duplicating provider audit concepts. |
| learning_linkage | shadow_outcome_expected, outcome_tracking_window, replay_eligible, backfill_eligible, learning_dataset_key, excluded_from_learning_reason, learning_eligibility_status | learning/backfill/replay helpers exist | `lib/grow-max-learning-mode.ts`, `lib/learning-acceleration-mode.ts`, `lib/recommendation-batch-learning-insights.ts`, `lib/recommendation-batch-backfill.ts` | partial | medium | Linkage exists conceptually, but unified dataset keys need proof. | Design snapshot-to-learning-row mapper after schema compatibility matrix. |
| outcome_fields | outcome_window, entry_touched, target_hit, stop_hit, timestamps, target_or_stop_first, no_entry, exit_reason, gross_r_multiple, MFE/MAE, outcome_quality | recommendation outcome migrations and tracker/evaluation helpers exist | `supabase/migrations/20260528001000_create_recommendation_outcomes.sql`, `lib/recommendation-outcome-tracker.ts`, `lib/recommendation-outcome-evaluation-runner.ts`, `lib/recommendation-outcome-coverage.ts` | existing | medium | Outcome model is a strong existing foundation; exact field parity needs audit. | Prefer outcome adapters over duplicate outcome model. |
| derived_learning_fields | setup_success_label, confidence_calibration_error, overconfidence_flag, regime_fit_label, sector_support_label, target_realism_label, recommendation_should_have_been_filtered | learning insight and daily review helpers exist | `lib/recommendation-learning-insights.ts`, `lib/recommendation-outcome-learning-insights.ts`, `lib/daily-learning-review.ts` | partial | medium | Derived fields may be computed read-only rather than persisted. | Keep derived learning fields as computed until persistence proof exists. |

## Existing Source File Candidates

### Schema/Migrations

- `supabase/migrations/20260528000000_create_recommendation_snapshots.sql`
- `supabase/migrations/20260528001000_create_recommendation_outcomes.sql`
- `supabase/migrations/20260528002000_create_recommendation_scan_runs.sql`
- `supabase/migrations/20260528003000_create_recommendation_batches.sql`
- `supabase/migrations/20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql`
- `supabase/migrations/20260702000000_create_symbol_metadata.sql`
- `supabase/migrations/20260709000000_create_historical_candle_storage.sql`

### Lib Helpers

- `lib/recommendation-snapshot.ts`
- `lib/recommendation-history.ts`
- `lib/recommendation-generator.ts`
- `lib/recommendation-scan-run.ts`
- `lib/recommendation-build-diagnostics.ts`
- `lib/recommendation-outcome-tracker.ts`
- `lib/recommendation-outcome-evaluation-runner.ts`
- `lib/recommendation-outcome-coverage.ts`
- `lib/recommendation-outcome-snapshot-canonicalization.ts`
- `lib/recommendation-learning-insights.ts`
- `lib/recommendation-outcome-learning-insights.ts`
- `lib/daily-learning-review.ts`
- `lib/replay-with-signal-package-result-model.ts`
- `lib/replay-with-signal-package-static-simulation.ts`
- `lib/replay-with-signal-package-static-summary.ts`
- `lib/provider-budget-guard.ts`
- `lib/provider-plan-profile.ts`
- `lib/scanner-candidate-ranking.ts`
- `lib/real-scanner-candidate-generation.ts`

### App Surfaces

- `app/api/recommendations/evaluate-outcomes/route.ts`
- `app/api/recommendations/generate/route.ts`
- `app/api/automation/run-scan/route.ts`
- `components/recommendations/RecommendationCard.tsx`
- `components/recommendations/RecommendationDetailsModal.tsx`
- `components/history/HistoryTab.tsx`
- `components/statistics/StatisticsDashboard.tsx`

### Tests

- `tests/e2e/recommendation-build-diagnostics.spec.ts`
- `tests/e2e/recommendation-batch-backfill.spec.ts`
- `tests/e2e/daily-learning-review.spec.ts`
- `tests/e2e/learning-acceleration-mode.spec.ts`
- `tests/e2e/replay-with-signal-package-result-model.spec.ts`
- `tests/e2e/replay-with-signal-package-static-summary.spec.ts`
- `tests/e2e/action-334-recommendation-snapshot-completeness-audit.spec.ts`
- `tests/e2e/action-335-learning-outcome-dataset-design.spec.ts`

### Docs

- `docs/action-334-recommendation-snapshot-completeness-audit.md`
- `docs/action-335-learning-outcome-dataset-design.md`
- `docs/action-336-intelligence-context-schema-draft.md`
- `docs/action-337-pattern-discovery-and-confidence-calibration-roadmap.md`
- `docs/recommendation-snapshots-500-production-triage.md`
- `docs/historical-candle-storage-migration-verification.md`

## Gap Summary

### Fields Likely Already Covered

- core recommendation/snapshot identity fields
- trade plan geometry for entry/stop/target/direction
- recommendation outcome fields and horizon uniqueness
- scan run and batch linkage foundations
- static replay result model foundations

### Fields Likely Partial

- confidence labels, numeric score, and calibration fields
- quality gate detail and normalized gate vocabulary
- market/session context
- scan context rejection/acceptance reasons and ranking inputs
- data provenance linkage from provider/candles to recommendation snapshot
- learning linkage for visible and research-only examples
- derived learning labels

### Fields Likely Missing

- normalized news/catalyst context
- full sector/industry snapshot-time context
- peer-group relative strength context
- explicit setup family/variant taxonomy if not already normalized

### Fields Requiring Schema Audit

- exact recommendation_snapshots columns and payload fields
- exact recommendation_outcomes columns and horizon uniqueness coverage
- exact recommendation_scan_runs and recommendation_batches columns
- historical_candles and historical_candle_fetch_runs compatibility

### Fields Requiring Type Audit

- recommendation payload TypeScript shape
- scan candidate/ranking diagnostics shape
- learning acceleration research-only sample metadata shape
- static replay result model fields
- daily learning review aggregate fields

### Fields Requiring History/Statistics Compatibility Audit

- HistoryTab assumptions about recommendation/outcome records
- StatisticsDashboard assumptions about closed trades and recommendations
- daily learning review visible/research-only split assumptions
- recommendation card/detail display mapping assumptions

## Do-Not-Duplicate Rules

- do not create duplicate snapshot IDs
- do not create parallel recommendation records
- do not create unlinked learning dataset rows
- do not create duplicate outcome fields if existing result/outcome model can be mapped
- do not create duplicate confidence fields
- do not create duplicate provider audit fields
- prefer adapters/mappers over parallel architecture
- preserve existing History/Statistics compatibility

## Additive Next Build Candidates

- snapshot field inventory script against concrete files
- snapshot completeness static checker
- snapshot-to-learning-row mapper design
- existing schema compatibility matrix
- migration proposal only after concrete gap proof
- context field adapter design
- outcome field adapter design

## Runtime/Blocking Status

- no schema changes yet
- no migrations yet
- no Supabase writes yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This inventory does not authorize deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase remote reads, Supabase reads, Supabase writes, schema changes, migrations, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 341: Learning Dataset Static Fixture Spec
- Action 342: Intelligence Context Static Fixture Spec
- Action 343: Pattern Insight Static Type Spec
- Action 344: Runtime Ping-Only Route Implementation Plan
- Action 345: First Tiny Provider Capacity Experiment Plan
- Action 346: Existing Schema Compatibility Matrix
