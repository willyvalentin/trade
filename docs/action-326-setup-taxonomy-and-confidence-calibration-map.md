# Action 326: Setup Taxonomy and Confidence Calibration Map

setup_taxonomy_confidence_calibration_status: map_ready

## A. Map Status

- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is setup/confidence roadmap planning only, not runtime change, deploy
readiness, scanner mutation, ranking mutation, or confidence threshold mutation.
It does not authorize production deploy, main push, runtime route additions,
proxy or middleware changes, provider calls, Supabase access, replay execution,
synthetic outcome persistence, scanner changes, ranking changes, confidence
threshold changes, recommendation mutation, Learning Acceleration changes, Add
Trade changes, or broker/execution/risk changes.

It does not authorize scanner changes, ranking changes, or confidence threshold
changes.

This is not deploy readiness.

## B. Purpose

Ture needs a clear setup taxonomy so recommendations are understandable,
comparable, and learnable. Setup labels should help the user understand what
kind of trade idea Ture found and help the learning system compare similar ideas
later.

Setup taxonomy should make recommendations understandable, comparable, and learnable.

Confidence should not just be a score; it should express evidence strength and expected outcome reliability.
Current confidence should be treated as uncalibrated or partially calibrated
until historical outcome evidence proves it.

Confidence must eventually be calibrated against target/stop-first outcomes,
no-entry outcomes, open-at-window-end outcomes, and R-multiple distributions.
This supports the product promise: fewer, clearer, higher-quality recommendations.

## C. Setup Taxonomy

### 1. momentum_continuation

- description: price moving with strength in the direction of the planned trade
- required evidence: price moving with strength, volume confirmation, trend/VWAP support
- helpful confirming evidence: clean higher highs/lows, strong candle closes, sector or market alignment
- common failure mode: late chase entries after most of the move is already done
- confidence sensitivity: should be downgraded when entry drift is high or target distance is too far
- learning metrics to track later: target hit rate, stop hit rate, average gross R, late-entry failure rate, follow-through by window

### 2. vwap_reclaim

- description: price reclaims VWAP after weakness and starts to hold above it
- required evidence: VWAP reclaim, confirmation from volume/momentum, coherent long-side geometry
- helpful confirming evidence: retest holds, improving relative volume, strong close above VWAP
- common failure mode: false reclaim / chop
- confidence sensitivity: should be downgraded when reclaim is thin, late, or lacks volume confirmation
- learning metrics to track later: reclaim hold rate, target hit rate after reclaim, stop hit rate from failed reclaim, best/worst R

### 3. opening_drive

- description: early session directional move with strong participation
- required evidence: early session directional move, strong volume, clear continuation structure
- helpful confirming evidence: clean first candles, market/session alignment, limited spread expansion
- common failure mode: volatile fakeout
- confidence sensitivity: should be downgraded when volatility is high, spread is wide, or entry is far from support
- learning metrics to track later: opening-window hit rate, fakeout rate, no-entry rate, open-at-window-end rate

### 4. pullback_to_support

- description: trend remains intact while price pulls back into support, VWAP, or structure
- required evidence: trend intact, pullback into support/VWAP/structure, valid entry/stop geometry
- helpful confirming evidence: lower volume pullback, support retest, momentum recovery
- common failure mode: support fails
- confidence sensitivity: should be downgraded when support is unproven or momentum does not return
- learning metrics to track later: support hold rate, stop hit rate, average R after pullback, entry-not-triggered rate

### 5. breakout_continuation

- description: price breaks an important intraday level and confirms continuation
- required evidence: important intraday level break, volume expansion, continuation confirmation
- helpful confirming evidence: retest hold, trend alignment, clean target space
- common failure mode: failed breakout
- confidence sensitivity: should be downgraded when breakout lacks volume, target is too close, or spread/volatility is unstable
- learning metrics to track later: breakout follow-through rate, failed-breakout stop rate, target-too-far rate, best R by window

### 6. reversal_from_exhaustion

- description: extended move loses momentum and reversal evidence appears
- required evidence: extended move loses momentum, reversal evidence appears, risk can be tightly defined
- helpful confirming evidence: exhaustion candle, volume climax, failed continuation attempt, VWAP/structure reclaim
- common failure mode: catching falling knife / fighting trend
- confidence sensitivity: should require stronger evidence than continuation setups and should be downgraded when trend remains forceful
- learning metrics to track later: reversal confirmation hit rate, adverse excursion, stop hit rate, overconfidence gap

### 7. range_break

- description: clear range compression resolves into expansion
- required evidence: clear range compression then expansion, defined range boundary, valid risk geometry
- helpful confirming evidence: volume expansion, retest hold, low false-break history for ticker/setup
- common failure mode: whipsaw
- confidence sensitivity: should be downgraded when range is unclear or expansion lacks volume
- learning metrics to track later: whipsaw rate, target hit rate, average gross R, no-entry rate

### 8. news_or_catalyst_momentum

- description: catalyst-backed momentum with unusual volume
- required evidence: catalyst-backed momentum, unusual volume, tradable spread/liquidity
- helpful confirming evidence: sustained volume, clear headline/catalyst context, strong continuation structure
- common failure mode: headline volatility / spread/liquidity issues
- confidence sensitivity: should be downgraded when spread/liquidity issues appear or headline volatility makes stops unreliable
- learning metrics to track later: catalyst follow-through rate, spread/volatility failure rate, target/stop-first outcomes, R distribution

## D. Confidence Model

Confidence components:

- data_quality_confidence
- setup_quality_confidence
- momentum_confirmation
- volume_confirmation
- vwap_context_confirmation
- liquidity_confidence
- trade_geometry_quality
- risk_reward_quality
- market_session_fit
- historical_setup_performance
- shadow_outcome_feedback

Current confidence should be treated as uncalibrated or partially calibrated until historical outcome evidence proves it.
Confidence labels should map to user-facing clarity but remain evidence-backed.

## E. Confidence Labels

### Low

- what it should mean to the user: weak or early idea, probably not suitable as a visible primary recommendation
- evidence required: minimal structure with incomplete or mixed confirmation
- what should prevent it from being assigned: invalid geometry, missing critical fields, or severe stale data should block rather than produce Low
- historical calibration: could be upgraded only if similar setups show reliable positive expectancy in outcomes

### Medium

- what it should mean to the user: usable idea with some evidence but meaningful uncertainty
- evidence required: valid geometry, acceptable data freshness, at least one clear setup signal, and no blocking quality gate
- what should prevent it from being assigned: contradictory momentum/volume, weak risk/reward, or poor session fit
- historical calibration: could be upgraded or downgraded by setup-specific hit rate and R expectancy

### High

- what it should mean to the user: strong candidate with multiple confirming evidence sources
- evidence required: valid geometry, good data quality, setup quality, momentum/volume confirmation, session fit, and viable risk/reward
- what should prevent it from being assigned: missing confidence components, unproven setup family, stale data, or weak follow-through history
- historical calibration: should require confirmed setup and confidence-bucket performance, not only current score

### Very High / Strong

- what it should mean to the user: rare, highly supported recommendation with unusually coherent evidence
- evidence required: high-quality setup, strong confirmation, clean geometry, good liquidity, strong session fit, and favorable historical calibration
- what should prevent it from being assigned: any missing critical evidence, stale data, weak risk/reward, duplicate uncertainty, or uncalibrated overconfidence
- historical calibration: should be downgraded if outcomes show overconfidence gap or poor R expectancy for that setup/window

## F. Calibration Loop

Future loop:

1. recommendation generated
2. snapshot saved
3. shadow outcome tracked
4. replay/backfill evaluates outcome
5. outcome categorized
6. R multiple calculated
7. setup family performance updated
8. confidence bucket performance reviewed
9. future confidence/ranking adjusted only after safe rollout

Future confidence/ranking adjusted only after safe rollout.

## G. Calibration Metrics

- target_hit_rate_by_setup
- stop_hit_rate_by_setup
- no_entry_rate_by_setup
- open_at_window_end_rate_by_setup
- average_gross_r_multiple_by_setup
- confidence_bucket_hit_rate
- confidence_bucket_expectancy
- confidence_bucket_overconfidence_gap
- confidence_bucket_underconfidence_gap
- setup_failure_modes
- window_specific_performance

## H. Current Blocked Work

- no confidence threshold changes yet
- no scanner/ranking mutation yet
- no automatic calibration update yet
- no Supabase synthetic outcome persistence yet
- no runtime replay route yet
- no provider refetch path yet
- no deploy
- no main push

## I. Recommended Next Actions

- Action 327: Learning/Backfill Runtime Rollout Plan
- Action 328: Product UX Surface Map
- Action 329: Recommendation Engine Gate Test Plan
- Action 330: Confidence Calibration Static Metric Spec
