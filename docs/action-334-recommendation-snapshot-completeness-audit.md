# Action 334: Recommendation Snapshot Completeness Audit

## Audit Status

- recommendation_snapshot_completeness_status: audit_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is snapshot completeness audit only, not a new snapshot implementation, not runtime implementation, not provider integration, not news integration, not Supabase persistence, not scanner mutation, not ranking mutation, not deploy readiness, and not main-push authorization.

## Purpose

A recommendation snapshot is the evidence record of what Ture believed at the time. Snapshots allow outcome evaluation without hindsight bias.

Snapshots support confidence calibration, setup performance, market regime analysis, sector context, relative strength context, and pattern discovery. They should preserve enough context to evaluate both taken and not-taken recommendations.

This audit must preserve existing snapshot architecture and identify additive gaps only. It does not authorize a parallel snapshot system or any runtime persistence changes.

## Snapshot Completeness Dimensions

### 1. Identity

- snapshot_id
- recommendation_id
- candidate_id
- ticker
- company_name if available
- source_type
- created_at
- trading_day
- trading_window

### 2. Trade Plan

- direction
- entry
- stop
- target
- planned_risk
- planned_reward
- planned_r_multiple
- position_size_input if available
- invalidation_logic

### 3. Setup Classification

- setup_family
- setup_variant
- setup_label
- setup_reason
- evidence_summary
- failure_mode_hypothesis

### 4. Confidence

- numeric_confidence
- confidence_label
- confidence_components
- confidence_explanation
- calibration_state
- uncertainty_notes

### 5. Quality Gates

- data_freshness_gate
- market_session_gate
- liquidity_gate
- spread_or_volatility_gate
- vwap_context_gate
- momentum_gate
- volume_trend_gate
- risk_reward_gate
- trade_geometry_gate
- confidence_gate
- duplicate_candidate_gate
- recommendation_limit_gate
- snapshot_persistence_gate
- learning_feedback_gate

### 6. Market Context

- market_session_state
- SPY_context
- QQQ_context
- IWM_context
- volatility_regime
- trend_day_or_chop_day
- risk_on_risk_off_context

### 7. Sector / Industry Context

- sector
- industry
- peer_group
- sector_etf
- sector_relative_strength
- peer_relative_strength

### 8. Relative Strength

- stock_vs_SPY
- stock_vs_QQQ
- stock_vs_sector
- stock_vs_peer_group
- intraday_relative_strength
- multi_day_relative_strength

### 9. News / Catalyst Context

- catalyst_detected
- catalyst_type
- catalyst_timestamp
- catalyst_freshness
- headline_summary
- earnings_or_guidance_context
- analyst_or_regulatory_context
- news_volume_context

### 10. Scan Context

- scan_run_id
- scan_window
- scan_mode
- scanner_version
- provider
- provider_freshness
- candidate_tier
- rejection_or_acceptance_reason
- ranking_inputs
- ranking_position

### 11. Data Provenance

- provider
- fetch_timestamp
- candle_interval
- candle_count_available
- missing_data_flags
- adjusted_or_unadjusted
- raw_response_reference if available
- audit_readback_status

### 12. Learning Linkage

- shadow_outcome_expected
- outcome_tracking_window
- replay_eligible
- backfill_eligible
- learning_dataset_key
- excluded_from_learning_reason if applicable

## Existing vs Missing Coverage Matrix

| Dimension | Expected fields | Existing coverage | Risk if missing | Additive next step |
| --- | --- | --- | --- | --- |
| Identity | snapshot_id, recommendation_id, candidate_id, ticker, source_type, created_at, trading_day, trading_window | partial | Outcomes and readbacks may not join cleanly across recommendation, snapshot, and replay paths. | Snapshot field inventory against actual schema/types. |
| Trade plan | direction, entry, stop, target, planned risk/reward/R, invalidation logic | existing | Outcome evaluation cannot measure plan quality without entry/stop/target geometry. | Verify all visible and research-only snapshots preserve plan fields consistently. |
| Setup classification | setup_family, variant, label, reason, evidence, failure hypothesis | needs audit | Pattern discovery cannot group similar setups reliably. | Setup taxonomy mapping against existing recommendation payloads. |
| Confidence | numeric confidence, label, components, explanation, calibration state | partial | Calibration may only evaluate labels, not why the label was assigned. | Confidence component mapping. |
| Quality gates | freshness, session, liquidity, spread/volatility, VWAP, momentum, volume, risk/reward, geometry, confidence, duplicate, limit, persistence, learning feedback | partial | Rejected and accepted candidates may be impossible to compare fairly. | Static checker for required gate fields. |
| Market context | session state, SPY/QQQ/IWM, volatility, trend/chop, risk-on/risk-off | needs audit | Recommendations may look good in isolation but fail in weak regimes. | Context enrichment schema draft. |
| Sector / industry context | sector, industry, peer group, ETF, sector and peer relative strength | needs audit | Ture may miss whether a move is sector-supported or isolated. | Sector/industry context schema draft. |
| Relative strength | stock vs SPY, QQQ, sector, peers, intraday and multi-day strength | needs audit | Ture may confuse noisy spikes with real leadership. | Relative strength feature mapping. |
| News / catalyst context | catalyst detected/type/timestamp/freshness, headline, earnings/guidance, analyst/regulatory, news volume | missing | Catalyst-backed moves and purely technical moves may be treated the same. | News/catalyst context schema draft; no API calls yet. |
| Scan context | scan run, window, mode, version, provider, freshness, tier, rejection/acceptance reason, ranking inputs/position | partial | Learning may not know why a candidate was published or rejected. | Scan context inventory across visible and rejected candidates. |
| Data provenance | provider, fetch timestamp, interval, candle count, missing flags, adjusted state, raw response reference, audit readback | partial | Data quality issues may be mistaken for model behavior. | Provenance/readback mapping. |
| Learning linkage | shadow outcome expected, tracking window, replay/backfill eligibility, dataset key, excluded reason | partial | Snapshots may be collected but not usable for learning datasets. | Snapshot-to-outcome dataset mapping and learning eligibility rules. |

## Snapshot Completeness Levels

- S0: snapshot concept absent
- S1: basic recommendation fields captured
- S2: trade plan captured
- S3: setup/confidence/gates captured
- S4: market/sector/relative-strength context captured
- S5: news/catalyst/context captured
- S6: provenance and learning linkage captured
- S7: complete enough for reliable replay/calibration
- S8: production-grade intelligence snapshot

Current snapshot completeness is not yet confidently S8.

## Do-Not-Duplicate Rules

- do not create a parallel snapshot model without auditing existing one
- do not duplicate recommendation rows as a separate unlinked snapshot system
- do not create duplicate outcome keys
- do not create duplicate confidence fields
- do not create duplicate setup taxonomy fields
- prefer additive fields/mappings/migrations only after audit
- keep backward compatibility with existing History/Statistics where possible

## Gap-Driven Next Build Candidates

- snapshot field inventory against actual schema/types
- snapshot completeness checker static helper
- snapshot-to-outcome dataset mapping
- context enrichment schema draft
- confidence component mapping
- setup taxonomy mapping
- provenance/readback mapping
- learning eligibility rules

## Runtime/Blocking Status

- no snapshot persistence changes yet
- no Supabase writes yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This audit does not authorize deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase reads, Supabase writes, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 335: Learning Outcome Dataset Design
- Action 336: Intelligence Context Schema Draft
- Action 337: Pattern Discovery and Confidence Calibration Roadmap
- Action 338: Runtime Ping-Only Rollout Checklist
- Action 339: Historical Backfill Cost and Provider Capacity Plan
- Action 340: Snapshot Field Inventory Against Existing Schema
