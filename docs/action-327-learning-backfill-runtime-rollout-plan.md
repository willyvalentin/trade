# Action 327: Learning/Backfill Runtime Rollout Plan

learning_backfill_runtime_rollout_status: rollout_plan_ready
branch: dev/safe-post-recovery-work
rollback deploy protected: 6a501645908e4100088b7396
clean base commit: 512a0c5

This is runtime rollout planning only, not runtime implementation, deploy readiness, replay execution, provider call, Supabase write, or scanner/ranking mutation.

This is not deploy readiness.

## Purpose

Ture is a quiet, learning recommendation engine for US daytrading. Learning/backfill is required for Ture to learn from every recommendation, not only executed trades. The learning loop should help Ture evaluate recommendation quality, target/stop-first outcomes, no-entry outcomes, R multiples, confidence calibration, setup performance, and future ranking quality.

Runtime replay was paused because Action 307/308 exposed a production runtime boundary failure. Production is currently protected by rollback deploy 6a501645908e4100088b7396, and the static replay foundation remains local/static-only.

Static replay foundation exists, but runtime rollout must be staged and gated. The goal is to prevent another production break while preserving the path toward better learning, backfill, replay, calibration, and review.

## Rollout Prerequisites

1. production remains healthy on rollback deploy
2. local/static replay foundation passes
3. staging or production-safe route rollout checklist exists
4. approval flags remain false by default
5. no provider calls without explicit approval
6. no Supabase writes without explicit approval
7. no scanner/ranking mutation until learning results are validated
8. rollback target is confirmed before any production deploy
9. known bad artifacts/markers remain absent
10. deployment route table is inspected before testing

## Rollout Phases

### Phase 0: Static/local only

Current state. No runtime routes. No provider calls. No Supabase reads/writes. No replay execution. No deploy.

### Phase 1: Runtime ping-only route

Smallest possible route. No auth dependency if possible. No Supabase/provider imports. No replay imports. Route marker only. Rollback-ready. Purpose: verify Next runtime route health.

### Phase 2: Runtime diagnostic read-only route

No provider calls. No Supabase writes. May inspect static config only. Returns no-effect flags. Verifies auth boundary if needed.

### Phase 3: Supabase read-only replay input route

Reads already-persisted candles/recommendation snapshot. No provider calls. No writes. No synthetic persistence. No scanner/ranking mutation.

### Phase 4: Replay execution dry-run route

Executes in-memory replay only. No writes. No provider calls. Returns result and no-effect flags. Approval flag required.

### Phase 5: Synthetic outcome write audit route

Writes only after explicit approval. Tiny scope. Single candidate/day. Readback verification required. No scanner/ranking mutation.

### Phase 6: Learning review integration

Surfaces replay results in History/Statistics/dev review. No ranking mutation yet.

### Phase 7: Controlled calibration/ranking research

Offline only first. No live ranking mutation. Requires separate readiness gate.

## Approval Flags

Planned approval flags and default values:

- TURE_RUNTIME_PING_ROLLOUT_APPROVED=false
- TURE_REPLAY_READ_ONLY_ROUTE_APPROVED=false
- TURE_REPLAY_DRY_RUN_ROUTE_APPROVED=false
- TURE_SYNTHETIC_OUTCOME_WRITE_APPROVED=false
- TURE_LEARNING_REVIEW_INTEGRATION_APPROVED=false
- TURE_CONFIDENCE_CALIBRATION_RESEARCH_APPROVED=false
- TURE_SCANNER_RANKING_MUTATION_APPROVED=false

## Route Safety Rules

- no proxy.ts changes
- no middleware changes
- no Netlify config changes
- no broad route publication experiments
- no 307K-style diagnostic proxy marker
- route must be isolated
- route must return no-effect flags
- route must not import provider/Supabase unless phase allows it
- route must have explicit tests
- route must have rollback instructions

## Production Deploy Safety Checklist

- confirm production pings healthy before deploy
- confirm rollback deploy id 6a501645908e4100088b7396 or newer known-good target
- inspect Netlify route table before testing
- test only ping routes first
- rollback immediately on HTTP 400 empty body
- never test write/execution route first
- never publish branch deploy if non-production runtime is still untrusted

## Blocked Until Later

- any new runtime route implementation
- any Supabase write
- any provider refetch path
- any synthetic outcome persistence
- any scanner/ranking mutation
- any confidence threshold mutation
- any deploy from dev branch without explicit deploy readiness checklist

This plan does not authorize production deploy, main push, runtime route, proxy or middleware, scanner changes, ranking changes, confidence threshold changes, provider calls, Supabase reads, Supabase writes, replay execution, synthetic outcome persistence, or recommendation mutation.

## Recommended Next Actions

- Action 328: Product UX Surface Map
- Action 329: Recommendation Engine Gate Test Plan
- Action 330: Confidence Calibration Static Metric Spec
- Action 331: Runtime Ping-Only Rollout Checklist
- Action 332: Staging Site Setup Plan
