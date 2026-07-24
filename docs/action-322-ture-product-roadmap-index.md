# Action 322: Ture Product Roadmap Index

roadmap_index_status: product_roadmap_index_ready

## A. Roadmap Index Status

- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is roadmap planning, not deploy readiness. It does not authorize
production deploy, main push, runtime route additions, proxy or middleware
changes, provider calls, Supabase access, replay execution, synthetic outcome
persistence, scanner changes, ranking changes, recommendation mutation,
Learning Acceleration changes, Add Trade changes, or broker/execution/risk
changes.

## B. Product North Star

Ture is a learning recommendation engine for US daytrading.

Ture is simple on the surface, hyperintelligent under the hood. It should scan
the market, analyze setups in the background, and produce a limited number of
high-quality, clear, actionable day trade recommendations per trading window.
The user should need to analyze as little as possible.

Ture should learn from every recommendation, not only executed trades.
Execution is secondary until recommendation quality and the learning loop are
proven. Long-term execution is semi-automatic Avanza handoff only, and the user
always confirms final KÖP/SÄLJ manually.

The user always confirms final KÖP/SÄLJ manually.

## C. Roadmap Tracks

### 1. Recommendation Engine

Purpose:

- find candidates
- score setup quality
- define entry/stop/target
- set confidence
- rank and filter to limited recommendations

Current status:

- existing recommendation generation exists
- scan/window/tier systems exist
- needs roadmap review after recovery

Next milestones:

- Recommendation Engine Readiness Map
- scan-window quality gates
- confidence calibration integration
- setup quality taxonomy
- limited recommendation target verification

Blocked:

- scanner/ranking mutation from replay until runtime rollout is safe

### 2. Learning / Backfill / Replay

Purpose:

- learn from recommendations
- replay historical outcomes
- evaluate target/stop-first
- calibrate confidence
- improve expectancy

Current status:

- Actions 309-320 created static replay-with-signal-package foundation
- runtime replay route is blocked
- Supabase synthetic outcome persistence is blocked

Next milestones:

- Learning/Backfill Runtime Rollout Plan
- staging or production-safe route rollout checklist
- read-only replay route reintroduction plan
- synthetic outcome persistence design

Blocked:

- app/api route
- Supabase write path
- provider refetch path
- scanner/ranking mutation

### 3. Product UX

Purpose:

- keep Ture simple and actionable
- show recommendation cards
- surface deeper diagnostics only when needed
- make History/Statistics useful

Current status:

- existing app UI exists
- recovery work has not touched UX

Next milestones:

- Recommendation Card Surface Map
- History/Statistics Replay Insights Map
- low-noise dashboard review
- dark finance UI refinement

Blocked:

- surfacing replay reports in UI until runtime path is safe

### 4. Risk / Discipline / Trade Management

Purpose:

- keep user safe and disciplined
- risk per trade
- position sizing
- EOD safety
- live monitoring
- plan-vs-actual

Current status:

- risk controls and live day trade cards exist
- not part of recent recovery work

Next milestones:

- Risk Discipline Readiness Map
- plan-vs-actual review improvements
- EOD safety review
- live position monitoring review

Blocked:

- none for static review; runtime/live changes need separate safety gates

### 5. Execution Agent

Purpose:

- semi-automatic Avanza handoff
- prepare KÖP/SÄLJ order flow
- user confirms final manual KÖP/SÄLJ
- no autonomous trading bot behavior

Current status:

- execution architecture exists conceptually/partially
- paused during recovery
- secondary until recommendation engine proves value

Next milestones:

- Execution Agent Boundary Refresh
- semi-auto-only Avanza handoff spec
- final-click human confirmation guarantee
- sell/exit handoff boundary review

Blocked:

- any autonomous final order submission
- any live broker mutation
- any execution work before recommendation/learning readiness is clarified

## D. Recommended Near-Term Order

1. Action 323: Recommendation Engine Readiness Map
2. Action 324: Learning/Backfill Runtime Rollout Plan
3. Action 325: Product UX Surface Map
4. Action 326: Execution Agent Boundary Refresh
5. Action 327: Risk / Discipline / Trade Management Readiness Map

Why:

- Recommendation quality is the product core.
- Learning/backfill supports recommendation quality.
- UX should surface recommendations simply.
- Execution should come after quality is proven.
- Risk discipline remains a foundation across all tracks.

## E. What Not To Do Yet

- do not add new app/api replay route
- do not change proxy/middleware
- do not deploy static branch package
- do not push main
- do not integrate replay into scanner/ranking
- do not persist synthetic outcomes
- do not work on autonomous execution
- do not let execution dominate the roadmap before recommendation quality is proven

## F. Roadmap Decision

The next product-focused action should be Action 323: Recommendation Engine
Readiness Map.
