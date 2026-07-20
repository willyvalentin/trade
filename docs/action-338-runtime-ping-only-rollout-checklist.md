# Action 338: Runtime Ping-Only Rollout Checklist

## Checklist Status

- runtime_ping_only_rollout_checklist_status: checklist_ready
- branch: dev/safe-post-recovery-work
- rollback deploy protected: 6a501645908e4100088b7396
- clean base commit: 512a0c5

This is runtime ping-only rollout planning only, not route implementation, runtime implementation, deploy readiness, provider integration, Supabase persistence, scanner mutation, ranking mutation, or main-push authorization.

## Purpose

Future runtime work must restart with the smallest possible ping-only route. The route must prove Next runtime health before any replay, provider, Supabase, scanner, ranking, or write logic is reintroduced.

This checklist exists to prevent another Action 307/308-style production break where runtime/API boundary failures caused HTTP 400 empty body responses. No runtime route is added by this action.

## Preconditions Before Any Future Ping Route

- production pings healthy on rollback deploy or newer known-good deploy
- rollback target confirmed
- working tree clean
- current branch verified
- no forbidden 307K/runtime artifacts
- no proxy.ts changes
- no middleware changes
- no Netlify config changes
- all approvals false
- no provider/Supabase/replay imports planned
- route table inspection plan exists
- immediate rollback plan exists
- production test commands prepared

## Ping-Only Route Requirements For Future Implementation

Future route constraints:

- isolated route
- GET only
- returns static JSON only
- no auth dependency for first proof if possible
- no provider imports
- no Supabase imports
- no replay imports
- no scanner/ranking imports
- no env reads unless strictly needed
- no writes
- no dynamic Date.now timestamp
- stable route_build_marker
- no-effect flags all false

## Forbidden Route Behavior

- no POST
- no provider calls
- no Supabase reads/writes
- no replay execution
- no synthetic outcome persistence
- no scanner/ranking mutation
- no proxy marker
- no broad diagnostics
- no route-publication experiments
- no Netlify config changes
- no middleware changes

## Required Verification Before Deploy

- Action 309 guard passes
- relevant branch/package verifier passes
- git diff shows only planned route/doc/test files
- no proxy/middleware/netlify changes
- build passes
- lint passes
- typegen passes
- Playwright route spec passes locally
- production currently healthy before deploy
- rollback deploy ID recorded

## Production Test Sequence For Future Ping Route

1. confirm old known-good pings still return HTTP 200 JSON
2. deploy only after explicit deploy readiness approval
3. inspect Netlify route table
4. test new ping route first
5. test old known-good pings second
6. if any HTTP 400 empty body appears, rollback immediately
7. never test write/replay/provider routes first

## Rollback Plan

- rollback to deployId 6a501645908e4100088b7396 or newer known-good deploy
- verify old pings after rollback
- do not attempt fixes directly in production
- do not retry with proxy/middleware changes
- document failed deploy and stop

## Approval Flags For Future Ping Route

Defaults remain false:

- TURE_RUNTIME_PING_ROLLOUT_APPROVED=false
- TURE_RUNTIME_ROUTE_DEPLOY_APPROVED=false
- TURE_PROVIDER_CALLS_APPROVED=false
- TURE_SUPABASE_READ_APPROVED=false
- TURE_SUPABASE_WRITE_APPROVED=false
- TURE_REPLAY_EXECUTION_APPROVED=false
- TURE_SCANNER_RANKING_MUTATION_APPROVED=false

## Current Blocked Work

- no runtime ping route yet
- no deploy yet
- no main push yet
- no provider calls yet
- no Supabase access yet
- no replay execution yet
- no scanner/ranking mutation yet

This checklist does not authorize route implementation, deploys, main pushes, runtime route changes, provider calls, news API calls, Supabase reads, Supabase writes, replay execution, synthetic outcome persistence, pattern persistence, context persistence, dataset persistence, snapshot persistence changes, candle persistence, raw response persistence, fetch-run persistence, recommendation mutation, scanner mutations, ranking mutations, confidence threshold changes, proxy changes, middleware changes, Netlify config changes, visible recommendation changes, outcome persistence changes, Learning Acceleration changes, Add Trade changes, broker changes, execution changes, or risk changes.

## Recommended Next Actions

- Action 339: Historical Backfill Cost and Provider Capacity Plan
- Action 340: Snapshot Field Inventory Against Existing Schema
- Action 341: Learning Dataset Static Fixture Spec
- Action 342: Intelligence Context Static Fixture Spec
- Action 343: Pattern Insight Static Type Spec
- Action 344: Runtime Ping-Only Route Implementation Plan
