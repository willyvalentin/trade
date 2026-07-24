# Action 331: Intelligence-First Roadmap Reprioritization

intelligence_first_roadmap_status: reprioritized
branch: dev/safe-post-recovery-work
rollback deploy protected: 6a501645908e4100088b7396
clean base commit: 512a0c5

This is roadmap reprioritization only, not runtime implementation, deploy readiness, UI implementation, scanner mutation, ranking mutation, or data collection implementation.

This is not deploy readiness.

## User Direction

- The user already has a Figma design for the UI.
- UX/UI work should be handled near the end.
- Current priority is the recommendation engine and intelligence layer.
- Ture should collect data every trading day.
- Ture should collect historical data.
- Ture should learn as much as possible from recommendations and outcomes.
- Ture should detect patterns and improve its ability to produce high-quality recommendations.
- Execution and UI polish are secondary until the intelligence layer is stronger.

## Updated Product Priority Order

### 1. Recommendation Engine Intelligence

- scan quality
- setup detection
- candidate filtering
- quality gates
- confidence scoring
- ranking readiness

### 2. Daily Data Collection

- collect market data every trading day
- store reliable intraday data
- preserve recommendation snapshots
- preserve scan context
- prepare for later learning

### 3. Historical Data Collection / Backfill

- collect enough historical candles
- support replay of past recommendations
- build outcome sample size
- validate setups and confidence

### 4. Learning / Replay / Outcome Analysis

- target/stop/no-entry/open-at-window-end outcomes
- R multiples
- setup performance
- confidence bucket performance
- pattern discovery

### 5. Confidence Calibration / Pattern Recognition

- identify which setups work
- identify which windows work
- identify which confidence labels are over/underconfident
- improve future recommendation quality

### 6. Product UX / UI

- use existing Figma design later
- surface intelligence simply after engine is strong
- keep product low-noise

### 7. Execution Agent

- semi-automatic Avanza handoff later
- final buy/sell confirmation always manual
- no autonomous trading

## What Changes From Action 328

Product UX Surface Map remains useful. But UX/UI is no longer the next active development priority.

Recommendation Card hierarchy and UI implementation should be postponed. The Figma design should remain the reference for later product surface work.

Current roadmap should focus on data/intelligence.

## New Recommended Next Actions

- Action 332: Daily Trading Data Collection Readiness Map
- Action 333: Historical Data Backfill Coverage Plan
- Action 334: Recommendation Snapshot Completeness Audit
- Action 335: Learning Outcome Dataset Design
- Action 336: Pattern Discovery and Confidence Calibration Roadmap
- Action 337: First Static Gate Helper Extraction Plan
- Action 338: Runtime Ping-Only Rollout Checklist

## Runtime Caution

Daily/historical data collection will eventually require runtime/provider/Supabase paths. These are still blocked until a safe rollout checklist exists.

The next actions should first map readiness and design data models/workflows without changing runtime.

- No new app/api routes yet.
- No provider calls yet.
- No Supabase writes yet.
- No deploy yet.

## What Not To Do Yet

- do not focus on UI implementation now
- do not implement recommendation card changes now
- do not work on execution agent now
- do not add runtime data collection routes yet
- do not add provider calls yet
- do not add Supabase write paths yet
- do not mutate scanner/ranking yet
- do not change confidence thresholds yet
- do not deploy
- do not push main

## Final Roadmap Decision

The next action should be Action 332: Daily Trading Data Collection Readiness Map.

This reprioritization does not authorize production deploy, main push, runtime route, app/page route, provider calls, Supabase reads, Supabase writes, UI implementation, execution changes, scanner changes, ranking changes, confidence threshold changes, replay execution, synthetic outcome persistence, recommendation mutation, or live ranking mutation.
