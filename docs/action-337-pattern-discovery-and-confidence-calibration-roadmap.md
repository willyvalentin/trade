# Action 337: Pattern Discovery and Confidence Calibration Roadmap

## Roadmap Status

- pattern_discovery_confidence_calibration_status: roadmap_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is pattern discovery and calibration roadmap planning only, not runtime implementation, provider integration, news integration, Supabase persistence, scanner mutation, ranking mutation, confidence threshold mutation, deploy readiness, or main-push authorization.

## Purpose

Ture should become smarter by discovering which conditions produce good recommendations and which conditions only look attractive before outcome data arrives.

Pattern discovery should connect setup, confidence, market regime, sector/industry, relative strength, catalysts, and outcomes. Calibration should identify overconfidence and underconfidence by comparing confidence labels with realized outcome quality.

Pattern discovery should produce research insights first, not immediate live ranking changes. Scanner/ranking mutation remains blocked until evidence is strong, anti-leakage checks pass, and rollout is safe.

## Pattern Dimensions

Each pattern dimension defines what it represents, the expected learning question, an example pattern insight, and the risk of misuse.

### setup_family

- represents: the recurring recommendation setup family, such as momentum continuation, reversal, breakout, pullback, or range fade
- expected learning question: which setup families produce reliable expectancy after entry
- example pattern insight: pullback continuation works better than raw breakout during choppy midday sessions
- risk of misuse: overfitting a broad setup label without confirming entry quality and regime

### confidence_bucket

- represents: the recommendation confidence tier or bucket assigned at snapshot time
- expected learning question: whether higher confidence buckets actually outperform lower buckets
- example pattern insight: Medium confidence outperforms High confidence in power hour because High is overextended
- risk of misuse: treating confidence as truth instead of a calibration hypothesis

### trading_window

- represents: morning, midday, power hour, or other official scan window
- expected learning question: which windows have better target follow-through and lower stop risk
- example pattern insight: morning recommendations trigger often but midday recommendations have cleaner target realism
- risk of misuse: changing live timing from a small number of unusual trading days

### market_regime

- represents: broad index, volatility, breadth, trend/chop, and risk-on/risk-off context at snapshot time
- expected learning question: which setups work in trend days versus chop days
- example pattern insight: breakout setups underperform when SPY and QQQ are diverging
- risk of misuse: using end-of-day regime labels as if they were known at recommendation time

### sector

- represents: the ticker's sector context and sector-level movement
- expected learning question: which sectors support or suppress recommendation follow-through
- example pattern insight: technology names outperform only when sector relative strength is positive
- risk of misuse: assuming sector labels alone explain outcomes without ticker-specific context

### industry

- represents: narrower industry or peer-group context
- expected learning question: whether peer movement confirms the individual ticker setup
- example pattern insight: semiconductor breakouts need peer-group confirmation to sustain target movement
- risk of misuse: sparse industry samples can look decisive before enough outcomes exist

### relative_strength_profile

- represents: stock strength versus SPY, QQQ, IWM, sector ETF, and peers
- expected learning question: whether recommendations with confirmed relative strength perform better
- example pattern insight: long ideas with positive stock-versus-sector strength have higher entry-triggered target hit rates
- risk of misuse: using future relative strength movement that was not available at snapshot time

### catalyst_type

- represents: news, earnings, analyst, regulatory, macro, product, legal, or event catalyst category
- expected learning question: which catalyst types improve expectancy or increase stop risk
- example pattern insight: earnings-related catalysts have stronger morning follow-through than analyst-note catalysts
- risk of misuse: catalyst labels can be noisy and should not override price structure

### catalyst_freshness

- represents: how fresh the catalyst was at recommendation snapshot time
- expected learning question: whether fresh catalysts sustain movement better than stale catalysts
- example pattern insight: catalysts less than two hours old produce stronger entry follow-through
- risk of misuse: stale/fresh labels must be based on publication time known before the recommendation

### volume/liquidity_profile

- represents: relative volume, liquidity, spread risk, and tradability context
- expected learning question: whether higher participation improves entry and target reliability
- example pattern insight: high relative volume reduces no-entry outcomes but can increase adverse excursion after overextension
- risk of misuse: volume spikes can be exhaustion, not confirmation

### risk_reward_profile

- represents: planned entry, stop, target geometry and reward-to-risk structure
- expected learning question: which R geometry creates realistic outcomes
- example pattern insight: 2.5R targets rarely hit during midday even when best R is positive
- risk of misuse: improving target hit rate by making targets trivial without preserving expectancy

### entry_quality_profile

- represents: entry distance, drift, trigger semantics, and price freshness
- expected learning question: whether entries are too early, too late, or too far from reference price
- example pattern insight: slightly stale entries have more adverse movement even when setup score is high
- risk of misuse: treating missed entries as failures when the plan intentionally avoided chase risk

### stop_quality_profile

- represents: stop placement relative to structure, volatility, and expected noise
- expected learning question: whether stops are too tight or too loose for the setup and regime
- example pattern insight: tight stops underperform during high-volatility trend days
- risk of misuse: widening stops without understanding downside tail risk

### target_realism_profile

- represents: target distance, target timing, and follow-through realism
- expected learning question: whether targets are reachable within evaluated horizons
- example pattern insight: many recommendations reach +0.6R but fail target, suggesting target distance review
- risk of misuse: lowering targets without preserving risk-adjusted edge

### data_quality_profile

- represents: completeness, freshness, source confidence, gaps, and provenance quality
- expected learning question: whether missing or stale context correlates with weaker outcomes
- example pattern insight: missing provider timestamp increases unknown or adverse classifications
- risk of misuse: confusing data-quality artifacts with true market behavior

## Outcome Metrics For Pattern Discovery

- target_hit_rate
- stop_hit_rate
- no_entry_rate
- open_at_window_end_rate
- ambiguous_intrabar_rate
- average_gross_r_multiple
- median_gross_r_multiple
- max_favorable_excursion_r
- max_adverse_excursion_r
- time_to_entry
- time_to_exit
- expectancy_by_group
- sample_size
- stability_score
- overconfidence_gap
- underconfidence_gap

## Calibration Questions

- Do High confidence recommendations outperform Medium?
- Are Very High recommendations rare and actually superior?
- Are Low confidence recommendations too common?
- Which setup families are overconfident?
- Which regimes make confidence unreliable?
- Which sectors produce false breakouts?
- Which catalyst types improve expectancy?
- Which trading windows have the best/worst calibration?
- Are targets too ambitious?
- Are stops too tight?
- Are entries too early or too late?

## Pattern Discovery Stages

### Stage 0: Static roadmap only

- current state
- no runtime
- no persistence
- no ranking mutation

### Stage 1: Static fixture exploration

- use deterministic fixtures
- validate formulas and groupings

### Stage 2: Offline historical dataset analysis

- use exported/read-only historical dataset
- no live mutation

### Stage 3: Read-only dashboards/reports

- History/Statistics/dev reports
- no ranking mutation

### Stage 4: Calibration research candidates

- identify possible rule adjustments
- require sample-size thresholds

### Stage 5: Shadow calibration

- compute alternate confidence/ranking without affecting live recommendations

### Stage 6: Controlled recommendation engine experiment

- feature flag
- rollback plan
- no automatic deploy

### Stage 7: Production-grade calibration

- only after strong evidence and safety rollout

## Minimum Evidence Rules

- no pattern conclusion with tiny sample sizes
- less than 20 samples: diagnostic only
- 20-50: weak signal
- 50-100: moderate signal
- 100+: stronger signal
- context-specific patterns require separate sample thresholds
- never mutate ranking from one-off examples
- ambiguous/noisy data must be excluded or downweighted
- anti-leakage rules must pass

## Pattern Insight Output Format

Future pattern insight shape:

- insight_id
- pattern_dimension
- segment_key
- sample_size
- outcome_summary
- confidence_summary
- effect_direction
- evidence_strength
- risk_of_overfitting
- recommended_action_type: observe | investigate | downgrade_candidate | upgrade_candidate | adjust_confidence_research | block_until_more_data
- mutation_allowed: false by default

## Blocked Implementation Work

- no pattern persistence yet
- no Supabase writes yet
- no runtime routes yet
- no provider calls yet
- no news API calls yet
- no replay execution yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This roadmap does not authorize deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase reads, Supabase writes, pattern persistence, context persistence, dataset persistence, snapshot persistence changes, candle persistence, news persistence, raw response persistence, fetch-run persistence, synthetic outcome persistence, replay execution, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 338: Runtime Ping-Only Rollout Checklist
- Action 339: Historical Backfill Cost and Provider Capacity Plan
- Action 340: Snapshot Field Inventory Against Existing Schema
- Action 341: Learning Dataset Static Fixture Spec
- Action 342: Intelligence Context Static Fixture Spec
- Action 343: Pattern Insight Static Type Spec
