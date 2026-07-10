# Action 323: Recommendation Engine Readiness Map

recommendation_engine_readiness_status: roadmap_ready

## A. Readiness Map Status

- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is recommendation-engine roadmap planning, not runtime change, deploy
readiness, or scanner/ranking mutation. It does not authorize production deploy,
main push, runtime route additions, proxy or middleware changes,
provider calls, Supabase access, replay execution, synthetic outcome
persistence, scanner changes, ranking changes, recommendation mutation,
Learning Acceleration changes, Add Trade changes, or broker/execution/risk
changes.

This is not deploy readiness.

## B. Recommendation Engine Role In Ture

The recommendation engine is the product core.

Ture must find, score, rank, and explain a limited number of day trade
recommendations. Ture should minimize user analysis by doing the heavy work in
the background and surfacing only clear, actionable recommendations.

Ture must explain a limited number of day trade recommendations.

Ture must serve recommendations per trading window, prefer quality over quantity,
and learn from every recommendation, including recommendations the user does not
take.

## C. Core Responsibilities

### 1. Market Scanning

- scan US market
- respect trading windows
- produce candidate universe
- handle data freshness and provider reliability

### 2. Candidate Filtering

- reject weak/stale/noisy candidates
- require enough confirmation
- avoid flooding the user

### 3. Setup Quality Assessment

- momentum
- VWAP/context
- volume trend
- price structure
- risk/reward
- liquidity
- spread/volatility sanity

### 4. Trade Geometry

- entry
- stop
- target
- planned R
- position sizing input
- invalid geometry rejection

### 5. Confidence Scoring

- numeric confidence
- label confidence
- confidence explanation
- calibration readiness

### 6. Ranking And Selection

- select limited recommendations per window
- target around 6-10 recommendations per day/window when system is mature
- prioritize strong setups
- separate strong/valid/experimental/rejected tiers

### 7. Recommendation Explanation

- simple card-level explanation
- deeper diagnostics behind modals/history/dev tools
- avoid noisy analysis UI

### 8. Snapshot And Learning Integration

- persist recommendation snapshots
- track shadow outcomes
- connect to replay/backfill
- feed confidence calibration later

## D. Current Known Strengths

- existing recommendation generation exists
- scan/window/tier systems exist
- risk controls exist
- recommendation snapshots/history/statistics foundations exist
- Actions 309-320 now support static replay/review foundation
- product roadmap focus restored by Actions 321-322

## E. Current Gaps / Unknowns

- current scanner/ranking quality needs review
- confidence calibration is not fully proven
- setup taxonomy may need sharpening
- recommendation quantity target needs validation
- stale/data-quality gates need audit
- learning feedback loop is not yet fully connected to ranking
- runtime replay path is blocked
- production route rollout is blocked until safe plan/staging exists

## F. Recommendation Engine Quality Gates

### data_freshness_gate

- purpose: prevent recommendations from stale or unreliable market data
- pass/fail idea: pass when source candles/quotes are current for the trading window
- current readiness: partial, needs audit

### market_session_gate

- purpose: ensure recommendations are generated only in intended trading windows
- pass/fail idea: pass when the current market session matches an allowed scan window
- current readiness: known, needs regression review after recovery

### liquidity_gate

- purpose: avoid setups that are difficult to enter or exit cleanly
- pass/fail idea: pass when volume and tradability meet minimum product standards
- current readiness: needs audit

### spread_or_volatility_gate

- purpose: avoid noisy setups where spread or volatility distorts risk/reward
- pass/fail idea: pass when spread and volatility are sane for day trading
- current readiness: needs audit

### risk_reward_gate

- purpose: ensure the plan has enough reward for the risk taken
- pass/fail idea: pass when planned R and target distance are viable
- current readiness: partial

### trade_geometry_gate

- purpose: reject invalid entry/stop/target plans
- pass/fail idea: pass when side, entry, stop, target, and R geometry are coherent
- current readiness: known, needs audit

### confidence_gate

- purpose: keep low-confidence ideas out of visible recommendations
- pass/fail idea: pass when numeric and label confidence meet the window/tier policy
- current readiness: partial, calibration not fully proven

### duplicate_candidate_gate

- purpose: avoid repeated recommendations or duplicate snapshots
- pass/fail idea: pass when ticker/setup/snapshot identity is unique for the window
- current readiness: partial

### recommendation_limit_gate

- purpose: keep the product low-noise and selective
- pass/fail idea: pass when each mature trading window stays near the 6-10 target
- current readiness: needs audit

### snapshot_persistence_gate

- purpose: ensure every recommendation can be learned from later
- pass/fail idea: pass when visible recommendations are saved as snapshots
- current readiness: partial

### learning_feedback_gate

- purpose: connect outcomes back into confidence calibration and future ranking
- pass/fail idea: pass when outcome evidence can influence later model decisions safely
- current readiness: needs audit; runtime replay path remains blocked

## G. Readiness Levels

- R0: undocumented / unknown
- R1: existing but unaudited
- R2: documented and test-covered
- R3: validated with historical outcomes
- R4: calibrated and trusted for product use
- R5: production-grade recommendation engine

The recommendation engine is not yet R5.

## H. Next Recommended Actions

- Action 324: Recommendation Engine Code Surface Inventory
- Action 325: Recommendation Quality Gates Audit
- Action 326: Setup Taxonomy and Confidence Calibration Map
- Action 327: Learning/Backfill Runtime Rollout Plan
- Action 328: Product UX Surface Map

## I. What Not To Do Yet

- do not mutate scanner/ranking from static replay yet
- do not add runtime replay routes
- do not persist synthetic outcomes
- do not deploy branch package
- do not push main
- do not prioritize execution agent over recommendation quality
