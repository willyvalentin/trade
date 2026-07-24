# Action 329: Recommendation Engine Gate Test Plan

recommendation_engine_gate_test_plan_status: test_plan_ready
branch: dev/safe-post-recovery-work
rollback deploy protected: 6a501645908e4100088b7396
clean base commit: 512a0c5

This is gate test planning only, not gate implementation, runtime change, deploy readiness, scanner mutation, ranking mutation, or threshold mutation.

This is not deploy readiness.

## Purpose

Quality gates need tests before Ture can be trusted as a recommendation engine. Tests should prevent weak/noisy/stale/unsafe recommendations from reaching the user.

The test plan supports the product promise: fewer, clearer, higher-quality recommendations. Tests should be staged before connecting replay/backfill output to ranking, and every stage should preserve no-effect safety until a later approved implementation plan exists.

## Test Strategy Levels

1. Static fixture tests
   - pure in-memory inputs
   - no provider/Supabase
   - fastest/safest

2. Unit tests for gate helpers
   - only after gate helpers are identified or extracted
   - no runtime/network

3. Integration tests with mock provider data
   - mock candles/provider responses only
   - no live provider calls

4. Read-only runtime tests
   - only after runtime rollout checklist exists
   - no writes

5. Historical replay validation
   - after safe read-only replay route exists
   - no scanner/ranking mutation

6. Calibration validation
   - after enough outcomes exist
   - offline first

## Gate-by-Gate Test Plan

### 1. data_freshness_gate

- gate name: data_freshness_gate
- minimum fixture scenarios: fresh candle timestamp, stale candle timestamp, missing data timestamp
- expected pass case: candidate uses deterministic fresh market data for the active window
- expected fail case: candidate uses stale or missing critical price data
- boundary cases: timestamp exactly at freshness cutoff, pre-window timestamp, post-window timestamp
- required assertions: gate_status, blocker_reason, warning_reason, candidate_visible, recommendation_allowed, no_effect_flags, audit_metadata
- test level to start with: static fixture tests
- implementation risk: medium, because freshness can silently admit stale plans

### 2. market_session_gate

- gate name: market_session_gate
- minimum fixture scenarios: official window, outside official window, closing transition, market holiday label
- expected pass case: candidate belongs to an allowed market session/window
- expected fail case: candidate appears outside an allowed recommendation window
- boundary cases: open boundary, midday boundary, power-hour boundary, post-close boundary
- required assertions: gate_status, blocker_reason, warning_reason, candidate_visible, recommendation_allowed, audit_metadata
- test level to start with: static fixture tests
- implementation risk: medium, because bad session labels can create noisy recommendations

### 3. liquidity_gate

- gate name: liquidity_gate
- minimum fixture scenarios: high liquidity, low liquidity, missing volume/liquidity metadata
- expected pass case: candidate has enough liquidity for realistic entry/exit
- expected fail case: candidate lacks liquidity or has missing critical liquidity evidence
- boundary cases: exactly at liquidity floor, just below liquidity floor, missing volume but known large-cap ticker
- required assertions: gate_status, blocker_reason, warning_reason, candidate_visible, recommendation_allowed, confidence_discount_applied
- test level to start with: static fixture tests
- implementation risk: medium, because poor liquidity makes valid-looking setups unsafe

### 4. spread_or_volatility_gate

- gate name: spread_or_volatility_gate
- minimum fixture scenarios: normal spread/volatility, excessive spread, excessive volatility, missing spread proxy
- expected pass case: spread and volatility are compatible with the plan geometry
- expected fail case: spread/volatility makes entry/stop/target unreliable
- boundary cases: exactly at spread ceiling, just above spread ceiling, large candle with valid geometry
- required assertions: gate_status, blocker_reason, warning_reason, candidate_visible, recommendation_allowed, confidence_discount_applied
- test level to start with: static fixture tests
- implementation risk: medium, because volatile names can look attractive but punish execution

### 5. vwap_context_gate

- gate name: vwap_context_gate
- minimum fixture scenarios: long above VWAP, long below VWAP, short below VWAP, missing VWAP context
- expected pass case: VWAP context supports direction or is explicitly not required by setup
- expected fail case: VWAP context contradicts the directional thesis
- boundary cases: price exactly at VWAP, VWAP reclaim, VWAP rejection
- required assertions: gate_status, blocker_reason, warning_reason, confidence_discount_applied, tier_change_allowed, audit_metadata
- test level to start with: static fixture tests
- implementation risk: low-medium, because VWAP should guide confidence without becoming a brittle rule

### 6. momentum_gate

- gate name: momentum_gate
- minimum fixture scenarios: confirmed momentum, weak momentum, reversal momentum, missing momentum evidence
- expected pass case: candidate momentum supports the proposed direction
- expected fail case: momentum is absent or contradicts the direction
- boundary cases: flat momentum, momentum deceleration, gap-and-fade candidate
- required assertions: gate_status, blocker_reason, warning_reason, confidence_discount_applied, tier_change_allowed
- test level to start with: static fixture tests
- implementation risk: medium, because weak momentum is a common source of false recommendations

### 7. volume_trend_gate

- gate name: volume_trend_gate
- minimum fixture scenarios: rising relative volume, fading volume, missing volume trend, abnormal single candle spike
- expected pass case: volume confirms the setup enough for the session/window
- expected fail case: volume does not support follow-through or is missing when required
- boundary cases: exactly at relative volume threshold, just below threshold, early-session thin data
- required assertions: gate_status, warning_reason, confidence_discount_applied, tier_change_allowed, audit_metadata
- test level to start with: static fixture tests
- implementation risk: low-medium, because volume can confirm but should not overrule all other evidence

### 8. risk_reward_gate

- gate name: risk_reward_gate
- minimum fixture scenarios: valid risk/reward, target too close, stop too far, missing target
- expected pass case: plan has acceptable reward relative to risk
- expected fail case: reward/risk is structurally too weak for publication
- boundary cases: exactly at minimum R/R, just below minimum R/R, asymmetric entry range
- required assertions: gate_status, blocker_reason, candidate_visible, recommendation_allowed, confidence_discount_applied, audit_metadata
- test level to start with: static fixture tests
- implementation risk: high, because weak risk/reward directly harms recommendation quality

### 9. trade_geometry_gate

- gate name: trade_geometry_gate
- minimum fixture scenarios: valid long geometry, valid short geometry, inverted stop/target, missing entry range
- expected pass case: direction, entry, stop, and target form a coherent plan
- expected fail case: concrete prices are missing or geometrically invalid
- boundary cases: stop equals entry, target equals entry, entry_low/entry_high range edge
- required assertions: gate_status, blocker_reason, candidate_visible, recommendation_allowed, no_effect_flags, audit_metadata
- test level to start with: static fixture tests
- implementation risk: high, because invalid geometry should never reach a user

### 10. confidence_gate

- gate name: confidence_gate
- minimum fixture scenarios: high confidence with strong evidence, low confidence with weak evidence, missing confidence components
- expected pass case: confidence label and score match the evidence profile
- expected fail case: candidate claims high confidence without enough supporting evidence
- boundary cases: exact confidence bucket boundary, evidence conflict, missing one major component
- required assertions: gate_status, warning_reason, confidence_discount_applied, tier_change_allowed, audit_metadata
- test level to start with: static fixture tests
- implementation risk: high, because overconfident weak recommendations damage trust

### 11. duplicate_candidate_gate

- gate name: duplicate_candidate_gate
- minimum fixture scenarios: unique candidate, same ticker duplicate, same snapshot duplicate, same ticker opposite side
- expected pass case: candidate is unique within the scan/window
- expected fail case: duplicate candidate would create repeated visible cards
- boundary cases: same ticker with updated timestamp, duplicate hidden/research row, duplicate retained row
- required assertions: gate_status, blocker_reason, candidate_visible, recommendation_allowed, audit_metadata
- test level to start with: static fixture tests
- implementation risk: medium, because duplicates make the product feel noisy and unreliable

### 12. recommendation_limit_gate

- gate name: recommendation_limit_gate
- minimum fixture scenarios: below visible limit, exactly at visible limit, above visible limit, mixed tier candidates
- expected pass case: the visible recommendation count stays within the planned window limit
- expected fail case: lower-quality candidates are blocked when the limit is reached
- boundary cases: tie at final slot, research-only candidate after limit, retained visible card
- required assertions: gate_status, warning_reason, candidate_visible, recommendation_allowed, tier_change_allowed, audit_metadata
- test level to start with: static fixture tests
- implementation risk: medium, because the product promise depends on limited high-quality cards

### 13. snapshot_persistence_gate

- gate name: snapshot_persistence_gate
- minimum fixture scenarios: complete snapshot payload, missing snapshot payload, visible snapshot, research-only snapshot
- expected pass case: candidate has enough snapshot metadata for later learning/outcome evaluation
- expected fail case: missing critical snapshot fields prevent learning traceability
- boundary cases: recommendation_id absent for research-only, snapshot_fingerprint duplicate, metadata gap recorded
- required assertions: gate_status, blocker_reason, warning_reason, no_effect_flags, audit_metadata
- test level to start with: static fixture tests
- implementation risk: high, because learning requires durable, traceable snapshots

### 14. learning_feedback_gate

- gate name: learning_feedback_gate
- minimum fixture scenarios: no prior outcomes, positive prior setup feedback, negative prior setup feedback, insufficient sample size
- expected pass case: learning feedback is advisory and does not mutate ranking without approval
- expected fail case: learning feedback attempts to mutate live ranking or thresholds too early
- boundary cases: low sample size, conflicting horizons, research-only outperforming visible
- required assertions: gate_status, warning_reason, confidence_discount_applied, tier_change_allowed, no_effect_flags, audit_metadata
- test level to start with: static fixture tests
- implementation risk: high, because premature learning integration can distort live ranking

## Fixture Design Principles

- deterministic timestamps
- no Date.now
- no random data
- explicit market session labels
- explicit stale/fresh data cases
- explicit valid/invalid geometry
- explicit duplicate candidates
- explicit confidence buckets
- explicit missing snapshot cases
- no provider calls
- no Supabase writes

## Assertions To Standardize

- gate_status: pass | warn | fail | unknown
- blocker_reason
- warning_reason
- candidate_visible
- recommendation_allowed
- confidence_discount_applied
- tier_change_allowed
- no_effect_flags
- audit_metadata

## What Not To Do Yet

- do not implement gate threshold changes
- do not mutate scanner/ranking
- do not add API routes
- do not connect static replay to live ranking
- do not persist synthetic outcomes
- do not deploy
- do not push main

Scanner/ranking mutation is blocked.

## Recommended Next Actions

- Action 330: Confidence Calibration Static Metric Spec
- Action 331: Recommendation Card Content Hierarchy Spec
- Action 332: History/Statistics Learning Surface Spec
- Action 333: Execution Agent Boundary Refresh
- Action 334: First Static Gate Helper Extraction Plan

This test plan does not authorize production deploy, main push, runtime route, proxy or middleware, scanner changes, ranking changes, threshold changes, provider calls, Supabase reads, Supabase writes, replay execution, synthetic outcome persistence, recommendation mutation, or live ranking mutation.
