# Action 328: Product UX Surface Map

product_ux_surface_map_status: map_ready
branch: dev/safe-post-recovery-work
rollback deploy protected: 6a501645908e4100088b7396
clean base commit: 512a0c5

This is UX/product planning only, not UI implementation, runtime change, deploy readiness, scanner mutation, ranking mutation, or execution change.

This is not deploy readiness.

## Product UX Principle

Ture should feel like a quiet intelligent co-pilot. The surface should be simple, calm, and action-oriented, while the engine underneath remains deeply analytical.

The user should not need to analyze raw market noise. Recommendation cards should explain the trade without overwhelming the user. Deeper diagnostics belong behind secondary surfaces such as detail modals, History, Statistics, Learning / Replay Review, and dev tools.

Execution is secondary until recommendation quality and the learning loop are proven. The product should minimize user analysis while still explaining why a trade is relevant.

## Primary User Surfaces

### 1. Today / Active Window Dashboard

Purpose:

- show current trading window
- show limited recommendations
- show scan status quietly
- show market/session health
- avoid noisy tables

### 2. Recommendation Card

Purpose:

- present ticker, direction, entry, stop, target, confidence, risk/reward, setup, and simple reason
- make action obvious
- show only essential diagnostics by default

### 3. Recommendation Detail Modal

Purpose:

- explain setup evidence
- show quality gates
- show confidence components
- show risk/reward and invalidation logic
- keep advanced diagnostics off the main card

### 4. History

Purpose:

- show past recommendations and outcomes
- include recommendations not taken by user
- support learning transparency

### 5. Statistics

Purpose:

- show hit rate, expectancy, confidence calibration, setup performance, and plan-vs-actual later
- avoid premature overfitting claims

### 6. Learning / Replay Review

Purpose:

- surface replay/backfill results after safe runtime rollout
- show target/stop/no-entry/open-at-window-end outcomes
- keep behind review/dev/diagnostic surface initially

### 7. Risk / Trade Management Surface

Purpose:

- show risk per trade, position sizing, stop discipline, EOD safety, and live trade state
- keep user disciplined

### 8. Execution / Avanza Handoff Surface

Purpose:

- only after recommendation quality is proven
- semi-automatic order preparation
- final buy/sell confirmation always manual
- no autonomous trading behavior

## Recommendation Card Information Hierarchy

Primary:

- ticker
- direction
- entry
- stop
- target
- confidence
- setup label
- one-sentence reason
- CTA

Secondary:

- risk/reward
- quality gates
- VWAP/momentum/volume evidence
- market/session context
- freshness
- duplicate/limit status

Hidden/deep:

- raw candles
- provider diagnostics
- replay diagnostics
- calibration evidence
- dev-only no-effect flags
- route/runtime status

## Noise Reduction Rules

- no broad market data tables on primary surface
- no excessive indicators on cards
- no provider/internal diagnostics unless needed
- no replay/debug info in primary recommendation card
- no execution controls before recommendation quality is clear
- no autonomous execution copy
- no false certainty in confidence language

## Learning/Replay UX Placement

Static replay foundation should eventually inform History/Statistics and dev review first. Replay should not immediately alter live ranking.

Replay results should be framed as evaluation, not trading advice. Learning feedback should improve future confidence only after validation.

## UX Readiness States

- UX0: undocumented surface
- UX1: planned surface
- UX2: wireframe-ready
- UX3: implemented but unaudited
- UX4: validated against product principle
- UX5: production-grade low-noise experience

Current UX is not yet UX5.

## Next UX Actions

- Action 329: Recommendation Engine Gate Test Plan
- Action 330: Confidence Calibration Static Metric Spec
- Action 331: Recommendation Card Content Hierarchy Spec
- Action 332: History/Statistics Learning Surface Spec
- Action 333: Execution Agent Boundary Refresh

## What Not To Do Yet

- do not implement UI changes in this action
- do not add app/page routes
- do not surface replay reports in production UI yet
- do not add execution CTAs beyond current safe boundaries
- do not change scanner/ranking
- do not deploy
- do not push main

This UX surface map does not authorize production deploy, main push, runtime route, app/page route, UI implementation, proxy or middleware, scanner changes, ranking changes, provider calls, Supabase reads, Supabase writes, replay execution, synthetic outcome persistence, execution changes, recommendation mutation, or live trading behavior changes.
