# Action 332: Intelligence Data Collection Readiness Map

## Readiness Map Status

- intelligence_data_collection_readiness_status: map_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is intelligence data collection planning only, not runtime implementation, provider integration, news integration, Supabase persistence, scanner mutation, ranking mutation, deploy readiness, or main-push authorization.

## Purpose

Ture needs broad intelligence data to make better recommendations. Candles and indicators are necessary but not sufficient.

The engine should learn why a stock moved, whether the move was supported by broader context, and whether similar setups worked historically. The goal is better pattern recognition, confidence calibration, and recommendation quality.

Ture should become a quiet, learning recommendation engine for US daytrading that understands price action in context rather than treating each chart as an isolated object.

## Core Data Domains

### 1. Intraday Price/Volume Data

- OHLCV candles
- VWAP
- volume trend
- momentum
- volatility
- spread/liquidity if available
- premarket/regular session context

### 2. Recommendation Snapshot Data

- ticker
- timestamp
- trading window
- setup family
- entry
- stop
- target
- confidence
- quality gates
- reason text
- candidate tier
- scan context

### 3. Outcome Data

- entry touched
- target hit
- stop hit
- no-entry
- open-at-window-end
- max favorable excursion
- max adverse excursion
- gross R multiple
- time-to-entry
- time-to-exit
- outcome window

### 4. Sector / Industry Context

- sector
- industry
- peer group
- sector ETF if available
- industry strength/weakness
- sector-relative movement
- peer-relative movement

### 5. Market Regime Context

- SPY/QQQ/IWM direction
- market breadth
- volatility regime
- risk-on/risk-off context
- trend day vs chop day
- opening drive / midday drift / power hour context
- market session state

### 6. Relative Strength Context

- stock vs SPY
- stock vs QQQ
- stock vs sector ETF
- stock vs peer group
- intraday relative strength
- multi-day relative strength

### 7. Company News / Catalyst Context

- earnings
- guidance
- analyst upgrades/downgrades
- FDA/regulatory/company events where relevant
- mergers/acquisitions
- product announcements
- legal/regulatory headlines
- unusual news volume
- catalyst timestamp
- catalyst freshness

### 8. Calendar / Event Context

- earnings date
- ex-dividend if relevant
- macro event days
- FOMC/CPI/jobs days
- options expiration
- major sector events

### 9. Historical Setup Behavior

- setup family performance
- confidence bucket performance
- sector-specific setup behavior
- market-regime-specific setup behavior
- time-window-specific setup behavior
- catalyst-backed vs non-catalyst performance

### 10. Data Quality / Provenance

- provider
- fetch timestamp
- freshness
- missing fields
- confidence in source
- raw response retention policy
- read/write audit status

## Daily Collection Goals

Ture should eventually collect the following every trading day:

- intraday candles for candidate universe
- scan run metadata
- recommendations and rejected candidates
- recommendation snapshots
- market regime snapshot
- sector/industry context snapshot
- relative strength snapshot
- news/catalyst snapshot
- shadow outcomes for all recommendations
- end-of-day outcome summary

## Historical Backfill Goals

Ture should eventually backfill:

- historical candles
- historical market regime context
- historical sector/industry movement
- historical relative strength
- historical news/catalysts where available
- historical recommendation replay outcomes
- historical setup/calibration datasets

## Intelligence Features This Enables

- better setup filtering
- avoiding weak setups in bad regimes
- identifying sector-supported movers
- identifying news-backed vs purely technical moves
- separating real momentum from noisy spikes
- confidence calibration by setup/sector/regime/window
- better pattern discovery
- better recommendation ranking later
- fewer but better recommendations

## Collection Readiness Levels

- D0: not defined
- D1: data domain defined
- D2: static schema/plan exists
- D3: local/offline fixture coverage exists
- D4: read-only runtime collection tested
- D5: production collection with audit/readback
- D6: learning integration validated
- D7: trusted intelligence signal in recommendation engine

Current intelligence collection is not yet D7. This map only defines the domains and readiness path.

## Blocked Implementation Work

- no new runtime routes yet
- no provider calls yet
- no news API calls yet
- no Supabase writes yet
- no scanner/ranking mutation yet
- no confidence threshold changes yet
- no deploy
- no main push

This map does not authorize deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase reads, Supabase writes, scanner mutations, ranking mutations, confidence threshold changes, recommendation mutations, replay execution, synthetic outcome persistence, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 333: Historical Data Backfill Coverage Plan
- Action 334: Recommendation Snapshot Completeness Audit
- Action 335: Learning Outcome Dataset Design
- Action 336: Pattern Discovery and Confidence Calibration Roadmap
- Action 337: Intelligence Data Schema Draft
- Action 338: Runtime Ping-Only Rollout Checklist
