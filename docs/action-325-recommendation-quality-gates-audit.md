# Action 325: Recommendation Quality Gates Audit

recommendation_quality_gates_audit_status: audit_ready

## A. Audit Status

- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is recommendation quality gate audit planning only, not runtime change,
deploy readiness, scanner mutation, or ranking mutation. It does not authorize
production deploy, main push, runtime route additions, proxy or middleware
changes, provider calls, Supabase access, replay execution, synthetic outcome
persistence, scanner changes, ranking changes, recommendation mutation,
Learning Acceleration changes, Add Trade changes, or broker/execution/risk
changes.

It does not authorize scanner changes or ranking changes.

## B. Purpose

The recommendation engine must reject weak/noisy/stale/unsafe recommendations
before they reach the user. Gates protect the product promise: limited,
high-quality, actionable recommendations.

Gates protect limited, high-quality, actionable recommendations.

Quality gates should help Ture feel quiet and intelligent, not noisy. They
should reduce user analysis by blocking or discounting low-quality ideas before
those ideas become visible cards.

The gates should eventually connect to learning/backfill outcomes and confidence
calibration, but this action does not connect static replay output to live
ranking.

Gates should eventually connect to learning/backfill outcomes and confidence calibration.

## C. Quality Gates

### 1. data_freshness_gate

- purpose: ensure recommendations are based on current, trustworthy market data
- protects against: stale quotes, stale candles, delayed reference prices, and misleading intraday context
- expected pass idea: latest provider data is recent enough for the scan window and the plan reference price is coherent
- expected fail idea: market data timestamp is missing, stale, or outside the tolerated freshness window
- evidence needed: provider timestamp, first/last candle time, quote timestamp, reference freshness classification, and skipped-stale diagnostics
- current readiness: partial
- next audit step: trace freshness checks from provider intake through candidate validation and visible-card publication

### 2. market_session_gate

- purpose: ensure recommendations are generated only in intended trading sessions/windows
- protects against: pre-market/post-market noise, wrong official window, and accidental scans outside schedule
- expected pass idea: market calendar, NY session resolver, scan window resolver, and scheduled gate agree
- expected fail idea: scan attempt is outside official windows or route/session diagnostics disagree
- evidence needed: market calendar status, resolved NY time, official scan window, scheduled gate window, and skip reason
- current readiness: known
- next audit step: compare diagnostics and scheduled route logic for each official window without changing gates

### 3. liquidity_gate

- purpose: avoid recommendations that may be hard to enter or exit cleanly
- protects against: thin tickers, poor fills, unreliable exits, and slippage-heavy plans
- expected pass idea: ticker has enough intraday volume/tradability for the intended day-trade plan
- expected fail idea: volume/tradability is too low or missing for the plan to be actionable
- evidence needed: intraday volume, relative volume if available, average volume/metadata, and ticker profile
- current readiness: needs audit
- next audit step: identify all current liquidity proxies and whether they affect visible ranking or only diagnostics

### 4. spread_or_volatility_gate

- purpose: reject setups where spread or volatility distorts risk/reward
- protects against: noisy entries, stop-outs from ordinary spread, and target distances that are unrealistic for the ticker
- expected pass idea: spread and volatility are reasonable relative to entry/stop/target distance
- expected fail idea: spread is too wide, volatility is chaotic, or risk geometry is not stable enough
- evidence needed: spread estimate, candle range, ATR/volatility proxy if available, and risk distance
- current readiness: needs audit
- next audit step: inventory current spread/volatility fields and define where missing data should be warning versus blocking

### 5. vwap_context_gate

- purpose: require useful VWAP/context alignment for intraday setups when that signal is available
- protects against: chasing moves far from useful context and taking setups with weak intraday structure
- expected pass idea: price action has coherent VWAP/context support for the side and setup type
- expected fail idea: setup conflicts with VWAP/context or the context signal is missing for a strategy that requires it
- evidence needed: VWAP value, price relationship to VWAP, setup side, context notes, and indicator timestamp
- current readiness: needs audit
- next audit step: locate VWAP/context calculations and decide which setup types require the gate

### 6. momentum_gate

- purpose: ensure the candidate has enough directional follow-through potential
- protects against: flat/no-follow-through ideas and weak continuation plans
- expected pass idea: price, trend, and recent candles support the intended side
- expected fail idea: momentum is flat, contradictory, already exhausted, or missing
- evidence needed: recent candle direction, momentum indicators if present, trend labels, and rejection diagnostics
- current readiness: needs audit
- next audit step: map momentum signals used in candidate generation and ranking without changing weights

### 7. volume_trend_gate

- purpose: confirm that participation supports the setup
- protects against: moves on fading volume, low-conviction breakouts, and weak reversals
- expected pass idea: current/recent volume trend supports the planned direction and setup type
- expected fail idea: volume is falling, missing, or inconsistent with the setup premise
- evidence needed: intraday volume trend, relative volume/volume ratio if available, and candle-level volume
- current readiness: needs audit
- next audit step: audit whether volume is a hard filter, score component, diagnostic note, or missing entirely

### 8. risk_reward_gate

- purpose: keep visible recommendations from offering poor reward for the risk
- protects against: targets too close, stops too wide, and plans with unattractive R
- expected pass idea: target distance and stop distance produce viable planned R for the setup/window
- expected fail idea: target is not far enough, stop is too far, or planned R is invalid/too weak
- evidence needed: entry, stop, target, planned R, target distance, stop distance, and rejection reason
- current readiness: partial
- next audit step: trace planned R calculation and compare it with outcome learning labels such as target_too_far

### 9. trade_geometry_gate

- purpose: reject invalid entry/stop/target plans before they become visible
- protects against: upside/downside geometry inversion, missing price fields, and impossible trade plans
- expected pass idea: ticker, side, entry, stop, target, and risk direction are coherent
- expected fail idea: missing side/entry/stop/target or invalid long/short geometry
- evidence needed: normalized side, entry range, stop, target, risk distance, target distance, and sanitizer output
- current readiness: known
- next audit step: compare live, research_only, Add Trade, and outcome-evaluation geometry handling

### 10. confidence_gate

- purpose: keep low-confidence ideas out of visible recommendations
- protects against: noisy cards, false precision, and uncalibrated visible signals
- expected pass idea: numeric confidence, label confidence, and setup score meet the visible policy for the window/tier
- expected fail idea: confidence is missing, below threshold, or contradicted by diagnostics
- evidence needed: numeric confidence, confidence label, score components, tier, rejection reason, and calibration bucket
- current readiness: partial
- next audit step: separate current score construction from future calibration evidence and outcome buckets

### 11. duplicate_candidate_gate

- purpose: avoid repeated recommendations for the same idea/window
- protects against: duplicated cards, duplicated snapshots, and double-counted outcomes
- expected pass idea: ticker/setup/snapshot identity is unique for the scan/window or intentionally retained once
- expected fail idea: duplicate ticker/snapshot/candidate rows are published or counted more than once
- evidence needed: ticker, recommendation id, snapshot fingerprint, batch fingerprint, scan run id, and dedupe diagnostics
- current readiness: partial
- next audit step: map dedupe keys across scanner output, persistence, readback, and outcome evaluation

### 12. recommendation_limit_gate

- purpose: keep the product selective and low-noise
- protects against: flooding the user, diluting attention, and making Ture feel like a screener instead of an assistant
- expected pass idea: each scan/window publishes only the intended number of high-quality recommendations
- expected fail idea: too many visible cards, no prioritization, or below-threshold samples leaking into visible UI
- evidence needed: selected/built/published counts, target count, visible card count, tier split, and research_only split
- current readiness: partial
- next audit step: audit visible selection limits and confirm research_only samples remain hidden

### 13. snapshot_persistence_gate

- purpose: ensure every visible recommendation can be learned from later
- protects against: recommendation cards without durable snapshot evidence
- expected pass idea: visible recommendation snapshots persist with enough metadata for outcome evaluation
- expected fail idea: missing snapshot, missing batch/run linkage, missing plan fields, or unreadable metadata
- evidence needed: recommendation id, snapshot fingerprint, batch fingerprint, scan run id, plan payload, and visibility metadata
- current readiness: partial
- next audit step: trace snapshot creation/readback for visible and research_only rows without changing persistence

### 14. learning_feedback_gate

- purpose: connect outcomes back into future calibration and quality review
- protects against: static recommendations that never improve and outcomes that remain disconnected from ranking
- expected pass idea: evaluated outcomes can inform read-only learning summaries and later approved calibration work
- expected fail idea: outcomes are missing, duplicate-blocked, unjoined from snapshots, or not visible in learning diagnostics
- evidence needed: outcome rows, horizons, best/worst R, target/stop hits, visibility split, setup labels, and confidence buckets
- current readiness: needs audit
- next audit step: map outcome evidence into Daily Learning Review, static replay, and future calibration without live ranking changes

## D. Gate Severity Model

- blocking: recommendation must not be shown
- warning: recommendation may be shown but should be marked/discounted
- diagnostic: background insight only

Blocking gates protect hard safety and product integrity. Warning gates should
reduce confidence or demand clearer explanation. Diagnostic gates should support
learning, review, and future calibration without changing live behavior yet.

## E. Product Interpretation

Quality gates should support fewer but better recommendations. The user should
need less user analysis because Ture has already rejected weak/noisy/stale/unsafe
ideas.

The result should be clearer cards, better trust, and a better learning feedback
loop. A gate should either make the visible recommendation more reliable or make
the reason for rejection easier to learn from later.

The result should include clearer cards, better trust, and a better learning feedback loop.

## F. Audit Findings Summary

| gate | severity | current readiness | likely product risk if weak | next audit action |
| --- | --- | --- | --- | --- |
| data_freshness_gate | blocking | partial | stale cards and misleading entries | Trace provider/reference freshness through visible publication. |
| market_session_gate | blocking | known | recommendations outside the intended window | Compare diagnostics/session resolver with scheduled gate behavior. |
| liquidity_gate | warning | needs audit | hard-to-trade ideas and poor fills | Inventory current liquidity fields and ticker-profile usage. |
| spread_or_volatility_gate | warning | needs audit | noisy stops and distorted R | Find spread/volatility proxies and current handling of missing data. |
| vwap_context_gate | diagnostic | needs audit | context-free entries and weaker explanations | Locate VWAP/context calculations and setup requirements. |
| momentum_gate | warning | needs audit | weak follow-through and flat recommendations | Map momentum inputs and whether they score or block. |
| volume_trend_gate | warning | needs audit | low-conviction moves | Map volume trend inputs and outcome-readback usefulness. |
| risk_reward_gate | blocking | partial | poor R plans and target/stop mismatch | Trace planned R and compare to target-too-far learning labels. |
| trade_geometry_gate | blocking | known | invalid entry/stop/target cards | Compare geometry handling across visible/research/evaluation paths. |
| confidence_gate | warning | partial | noisy visible recommendations and false confidence | Map score components to tiers and future calibration buckets. |
| duplicate_candidate_gate | blocking | partial | duplicate cards or double-counted outcomes | Audit dedupe keys across scan, snapshot, and outcome flows. |
| recommendation_limit_gate | blocking | partial | too many cards and user overload | Audit target counts and research_only visibility separation. |
| snapshot_persistence_gate | blocking | partial | no durable learning evidence | Trace snapshot payload completeness for visible and research rows. |
| learning_feedback_gate | diagnostic | needs audit | recommendations do not improve | Map outcome evidence to read-only learning summaries and future calibration. |

Current readiness values are known | partial | needs audit.

## G. What Not To Do Yet

- do not change gate thresholds
- do not mutate scanner/ranking
- do not add API routes
- do not connect static replay to live ranking
- do not persist synthetic outcomes
- do not deploy
- do not push main

## H. Recommended Next Actions

- Action 326: Setup Taxonomy and Confidence Calibration Map
- Action 327: Learning/Backfill Runtime Rollout Plan
- Action 328: Product UX Surface Map
- Action 329: Recommendation Engine Gate Test Plan
