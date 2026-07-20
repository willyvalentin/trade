# Action 324: Recommendation Engine Code Surface Inventory

recommendation_engine_inventory_status: code_surface_inventory_ready

## A. Inventory Status

- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is code surface inventory only, not runtime change, deploy readiness,
scanner mutation, or ranking mutation. It does not authorize production deploy,
main push, runtime route additions, proxy or middleware changes, provider calls,
Supabase access, replay execution, synthetic outcome persistence, scanner
changes, ranking changes, recommendation mutation, Learning Acceleration
changes, Add Trade changes, or broker/execution/risk changes.

It does not authorize scanner changes or ranking changes.

## B. Purpose

The goal is to locate existing recommendation-engine surfaces before changing them.
This supports the Action 323 readiness map by turning the product-level readiness
questions into a static code inventory.

Ture must avoid changing scanner/ranking blindly after the recovery incident.
Before recommendation quality gates, confidence calibration, or learning
feedback are changed, the relevant code surfaces need to be identified and
audited.

## C. Inventory Categories

### 1. Market Data / Provider Intake

- Twelve Data usage
- candle fetching
- data freshness
- provider fallback or mock paths

Likely surfaces:

- `lib/market-data.ts`
- `lib/twelve-data-historical-fetch-contract.ts`
- `lib/twelve-data-historical-response-parser.ts`
- `lib/intraday-indicator-cache.ts`
- `lib/intraday-indicators.ts`
- `lib/provider-budget-guard.ts`
- `lib/provider-plan-profile.ts`
- `lib/reference-refresh-diagnostics.ts`
- `lib/plan-price-freshness.ts`

### 2. Scan Orchestration

- scan windows
- scheduled scans
- generate more
- pre-market/watchlist if present

Likely surfaces:

- `lib/day-trade-scan-orchestration.ts`
- `lib/intraday-scan-window.ts`
- `lib/market-session.ts`
- `lib/market-calendar.ts`
- `lib/recommendation-serving-cadence.ts`
- `lib/scheduled-scan-attempts.ts`
- `lib/official-scan-window-completion.ts`
- `lib/active-scan-trace.ts`
- `lib/recommendation-scan-run.ts`
- `lib/recommendation-scan-run-history.ts`
- `app/api/automation/run-scan/route.ts`
- `app/api/recommendations/generate/route.ts`

### 3. Candidate Generation

- ticker universe
- setup detection
- candidate construction
- rejected/experimental/valid/strong tiers

Likely surfaces:

- `lib/recommendation-generator.ts`
- `lib/real-scanner-candidate-generation.ts`
- `lib/scanner.ts`
- `lib/scanner-universe.ts`
- `lib/ticker-universe-readiness.ts`
- `lib/dynamic-movers-discovery.ts`
- `lib/dynamic-movers-shadow-fixture.ts`
- `lib/setup-types.ts`
- `lib/recommendation-decision-stack.ts`
- `lib/recommendation-build-diagnostics.ts`
- `lib/batch-candidate-audit.ts`

### 4. Candidate Validation / Quality Gates

- stale data
- VWAP
- momentum
- volume trend
- liquidity
- risk/reward
- invalid geometry

Likely surfaces:

- `lib/recommendation-freshness.ts`
- `lib/trade-plan-quality.ts`
- `lib/trade-eligibility.ts`
- `lib/trade-planning-snapshot.ts`
- `lib/recommendation-entry-type.ts`
- `lib/recommendation-intake-quality.ts`
- `lib/recommendation-sample-quality.ts`
- `lib/openai-recommendation-reality-guard.ts`
- `lib/scanner-output-qa.ts`
- `app/api/recommendations/validate-add-trade/route.ts`

### 5. Trade Geometry

- entry
- stop
- target
- risk multiple
- position sizing inputs

Likely surfaces:

- `lib/trade-plan-quality.ts`
- `lib/trade-planning-snapshot.ts`
- `lib/recommendation-plan-reference.ts`
- `lib/position-sizing.ts`
- `lib/recommendation-inline-metadata.ts`
- `lib/plan-price-freshness.ts`
- `app/api/recommendations/validate-add-trade/route.ts`

### 6. Confidence / Scoring

- numeric confidence
- labels
- setup score
- calibration readiness

Likely surfaces:

- `lib/confidence-calibration.ts`
- `lib/confidence-calibration-readiness.ts`
- `lib/calibration-guardrails.ts`
- `lib/recommendation-calibration.ts`
- `lib/scanner-candidate-ranking.ts`
- `lib/recommendation-tier-performance.ts`
- `lib/trade-quality-score-decomposition.ts` if present in a later branch, otherwise needs audit

### 7. Ranking / Selection

- sorting
- filtering
- recommendation limits
- window target

Likely surfaces:

- `lib/scanner-candidate-ranking.ts`
- `lib/day-trade-window-recommendation-target.ts`
- `lib/daily-recommendation-trade-targets.ts`
- `lib/recommendation-serving-cadence.ts`
- `lib/recommendation-generator.ts`
- `lib/recommendation-output-enrichment.ts`
- `lib/recommendation-empty-state.ts`

### 8. Recommendation Persistence / Snapshots

- recommendation rows
- snapshots
- history
- statistics

Likely surfaces:

- `lib/recommendation-snapshot.ts`
- `lib/recommendation-batch-memory.ts`
- `lib/recommendation-history.ts`
- `lib/recent-recommendation-readback.ts`
- `lib/recommendation-performance-statistics.ts`
- `lib/recommendation-batch-performance.ts`
- `lib/statistics-dashboard.ts`
- `lib/history-dashboard.ts`
- `supabase/migrations/20260528000000_create_recommendation_snapshots.sql`
- `supabase/migrations/20260528003000_create_recommendation_batches.sql`
- `supabase/migrations/20260528002000_create_recommendation_scan_runs.sql`

### 9. Learning / Outcome Integration

- shadow outcomes
- replay/backfill
- confidence calibration
- static replay foundation from Actions 309-320

Likely surfaces:

- `lib/recommendation-outcome-tracker.ts`
- `lib/recommendation-outcome-evaluation-runner.ts`
- `lib/recommendation-outcome-coverage.ts`
- `lib/recommendation-outcome-snapshot-canonicalization.ts`
- `lib/recommendation-outcome-learning-insights.ts`
- `lib/recommendation-learning-insights.ts`
- `lib/recommendation-batch-learning-insights.ts`
- `lib/daily-learning-review.ts`
- `lib/learning-acceleration-mode.ts`
- `lib/historical-learning-backfill-readiness.ts`
- `lib/replay-with-signal-package-static-preview.ts`
- `supabase/migrations/20260528001000_create_recommendation_outcomes.sql`

### 10. UI Surfaces That Display Recommendations

- recommendation cards
- dashboard
- modals/diagnostics
- History/Statistics

Likely surfaces:

- `app/trade-app.tsx`
- `lib/market-diagnostics-console.ts`
- `lib/recommendation-engine-control-center.ts`
- `lib/recommendation-empty-state.ts`
- `lib/recommendation-history.ts`
- `lib/history-dashboard.ts`
- `lib/statistics-dashboard.ts`
- `lib/trade-outcome-explainer.ts`
- `lib/monday-live-trial-review.ts`

## D. Known No-Touch Surfaces

- app/api route additions are blocked
- proxy.ts is blocked
- middleware is blocked
- netlify.toml is blocked
- Supabase write changes are blocked
- provider calls are blocked
- scanner/ranking mutation is blocked in this action
- execution/broker paths are out of scope

## E. Inventory Output

| category | likely files/modules | current confidence | risk level | next audit action |
| --- | --- | --- | --- | --- |
| Market data / provider intake | `lib/market-data.ts`, `lib/intraday-indicators.ts`, `lib/provider-budget-guard.ts`, `lib/reference-refresh-diagnostics.ts`, Twelve Data historical contract/parser helpers | likely | high | Trace current live provider calls and freshness semantics without calling providers. |
| Scan orchestration | `lib/day-trade-scan-orchestration.ts`, `lib/intraday-scan-window.ts`, `lib/recommendation-serving-cadence.ts`, `lib/scheduled-scan-attempts.ts`, `app/api/automation/run-scan/route.ts` | known | high | Static audit of scan-window gate, schedule gate, and successful official batch path. |
| Candidate generation | `lib/recommendation-generator.ts`, `lib/real-scanner-candidate-generation.ts`, `lib/scanner.ts`, `lib/scanner-universe.ts`, `lib/setup-types.ts` | likely | high | Map candidate shape, source universe, and setup/tier creation points. |
| Candidate validation / quality gates | `lib/recommendation-freshness.ts`, `lib/trade-plan-quality.ts`, `lib/trade-eligibility.ts`, `lib/recommendation-intake-quality.ts`, `lib/scanner-output-qa.ts` | likely | high | Compare existing checks to Action 323 quality gates and identify missing gates. |
| Trade geometry | `lib/trade-plan-quality.ts`, `lib/trade-planning-snapshot.ts`, `lib/recommendation-plan-reference.ts`, `lib/position-sizing.ts`, validate-add-trade route | likely | medium | Inventory entry/stop/target/R calculations and live-vs-research differences. |
| Confidence / scoring | `lib/confidence-calibration.ts`, `lib/confidence-calibration-readiness.ts`, `lib/calibration-guardrails.ts`, `lib/recommendation-calibration.ts`, `lib/scanner-candidate-ranking.ts` | likely | high | Separate current scoring from future calibration evidence; do not change weights yet. |
| Ranking / selection | `lib/scanner-candidate-ranking.ts`, `lib/day-trade-window-recommendation-target.ts`, `lib/daily-recommendation-trade-targets.ts`, `lib/recommendation-serving-cadence.ts` | likely | high | Audit sorting, thresholds, recommendation limits, and per-window target behavior. |
| Recommendation persistence / snapshots | `lib/recommendation-snapshot.ts`, `lib/recommendation-batch-memory.ts`, readback/history/statistics helpers, recommendation Supabase migrations | likely | medium | Inventory write/read boundaries and snapshot identity without changing persistence. |
| Learning / outcome integration | recommendation outcome helpers, daily learning review, Learning Acceleration, static replay helpers, outcomes migration | likely | high | Map how visible/research outcomes become learning evidence and where runtime replay remains blocked. |
| UI recommendation surfaces | `app/trade-app.tsx`, `lib/market-diagnostics-console.ts`, history/statistics/diagnostics helpers | likely | medium | Map visible card, diagnostics, history, and Statistics surfaces without UI changes. |

Current confidence values are known | likely | unknown.

Unknown surfaces should stay marked as unknown/needs audit rather than guessed.
This inventory is a starting point for the next audit pass, not proof that every
surface above is complete or safe to change.

## F. Recommended Next Actions

- Action 325: Recommendation Quality Gates Audit
- Action 326: Setup Taxonomy and Confidence Calibration Map
- Action 327: Learning/Backfill Runtime Rollout Plan
- Action 328: Product UX Surface Map

## G. What Not To Do Yet

- do not modify scanner/ranking
- do not add API routes
- do not persist synthetic outcomes
- do not connect static replay output to ranking
- do not deploy
- do not push main
- do not resume execution-agent work before recommendation-engine audit is clearer
