# Action 618: Controlled Scheduled Shadow Rollout Plan

## Decision

`controlled_scheduled_shadow_rollout_plan_ready`

This is a local architecture, policy, and validation action only. Production
remains unchanged: the canary is disabled, the kill switch is active, and no
schedule is declared or active.

## Proven Baseline

Action 617 proved the shared manual execution core: bounded authorization and
lease validation, atomic claim admission, one `AAPL` / `5min` / completed
30-minute provider call, terminal finalization, and linked
`bounded_manual_proof` audit and ledger persistence. Planner authorization,
calendar/range derivation, provider timeout/no-retry, claim RPCs, audit/ledger
stores, and separated usage accounting are therefore production-proven for one
manual attempt.

The Netlify scheduled wrapper, platform delivery, schedule-state admission, and
scheduled occurrence lifecycle have not run in production.

## Current Scheduled Path

| Component | Current behavior | Status |
| --- | --- | --- |
| Netlify entry point | `netlify/functions/scheduled-shadow-collector-canary.ts` forwards an empty authenticated POST. It contains no cron. | Foundation only |
| Canonical route | `POST /api/automation/continuous-intelligence/shadow-collector/canary` accepts only the empty canonical body and rejects manual-shaped input. | Unproven |
| Authentication | Wrapper sends `x-automation-secret`; route requires exact `AUTOMATION_SECRET`. | Source-covered |
| Flags | Provider entry requires canary enabled and kill switch released; missing/malformed values block. | Source-covered |
| Calendar/range | Verified current calendar, completed 30-minute regular-session range, fixed `AAPL` / `5min`. | Manual-proven |
| Planner/provider | Normal-capacity authorization, one provider call/credit, five-second timeout, zero retries, zero reserve use. | Manual-proven core |
| Claims | Atomic UTC-day claim, `claimed -> attempted`, and exact-identity finalization. | Manual-proven core |
| Audit/ledger | Scheduled receipt kind is `scheduled_shadow_collector_canary`; route persists audit then ledger. | Store-covered; scheduled persistence unproven |
| Usage | Scheduled ledger cap is separate from manual and claim-capacity usage. | Readback-proven |

Current source order is: authenticated request, preflight, atomic claim,
non-provider runtime recheck, atomic begin-attempt, at most one provider request,
atomic finalization, audit write, then ledger write.

## Scheduled Identity Policy

The current scheduled lifecycle identity derives from UTC day plus the canonical
request fingerprint. A retry of the same completed range is idempotent and a
different completed range is distinct. It does not bind the deployed revision
and has no explicit server-issued scheduled-occurrence identity.

Action 619 must define a server-derived occurrence key from the deployed commit,
UTC market day, completed range, canonical request fingerprint, and a schedule
contract version. The resulting rules are:

- The same occurrence on retry gets identical claim, execution, receipt, and
  ledger identities, with no second provider call.
- Different completed ranges get distinct claim and execution identities.
- A changed deployed commit cannot silently reuse an old occurrence identity.
- Overlaps have one `attempt_started` winner; other callers receive a typed
  in-progress or terminal result and never enter the provider.
- Receipt, audit, and ledger IDs derive from the admitted claim, never a raw
  secret, token, client nonce, current timestamp, or provider payload.
- Manual authorization identities remain separate and unchanged.

The current scheduled receipt identity is request-scoped. Action 619 must make
scheduled receipt and ledger identities claim-scoped, as bounded-manual entries
already are.

## Rollout Stages

### Stage 0: Disabled Baseline

- Canary disabled, kill switch active, and no platform schedule declaration.
- Scheduled usage is `0 / 0`; manual and claim-capacity usage remain separately
  observable.
- Only read-only readiness, preflight, audit, ledger, claim, and usage checks
  are allowed.

### Stage 1: Authenticated Schedule Reachability

- Add one explicit deployment-visible schedule configuration and matching
  sanitized runtime signal.
- The schedule reaches a dedicated dry-reachability mode only.
- It proves scheduler authentication, deployment identity, occurrence
  construction, diagnostics, and routing.
- It stops before claim admission, provider entry, audit/ledger writes, and any
  usage mutation. A successful Stage 1 invocation is not a canary run.

### Stage 2: One Scheduled Bounded Shadow Run

- A separately approved single market-window occurrence only.
- One fixed AAPL / 5min / 30-minute completed range, one claim, one provider
  request, one estimated credit, five-second timeout, and zero retries.
- Require terminal claim, linked scheduled audit, linked scheduled ledger, and
  before/after usage proof before the stage can pass.
- Use an explicit post-run schedule disable or an equally strong one-occurrence
  platform control. Any persistence discrepancy halts rollout.

### Stage 3: Narrow Scheduled Observation

- One approved market window and the fixed one-ticker universe only.
- Retain hard daily caps. Add a per-window cap of one admitted claim and a
  maximum concurrent active claim count of one.
- No publication, recommendations, ranking, scanning, trade, broker, or
  user-facing effects. Kill-switch rollback is immediate and operator-owned.

### Stage 4: Limited Recurring Shadow Operation

- Explicit cadence and bounded market windows only after reviewed Stage 3
  evidence.
- Keep the one-ticker universe until separately approved otherwise.
- Retain daily, per-window, concurrent-claim, provider-call, audit/ledger, and
  readback gates. No autonomous expansion or automatic retry.

No stage is authorized by this document.

## Activation Matrix

| Gate | Stage 1 dry reachability | Stages 2-4 provider entry |
| --- | --- | --- |
| Scheduler authentication | Required | Required |
| Deployment commit and schedule contract identity | Required | Required |
| Canary enabled / kill switch inactive | Dedicated dry-mode rule only | Required |
| Explicit schedule-active signal | Required | Required |
| Verified/current calendar and completed range | Required | Required |
| Correct market window | Required | Required |
| Provider configured and recognized budget state | Required | Required |
| Action 565 normal-capacity authorization | Required | Required |
| Audit and ledger enabled and schema-ready | Required | Required |
| Scheduled historical usage readable | Required | Required |
| No conflicting active claim | Required | Required |
| No unresolved prior persistence failure | Required | Required |

Stage 1 needs a dedicated `schedule_dry_reachability_only` mode. The existing
provider route has no explicit schedule-active input, so it cannot currently
prove an invocation came from the approved scheduler. This blocks Stage 1 and
every provider-entry stage.

## Budget Policy

The existing policy remains authoritative:

- Total capacity: `377` credits.
- Hard reserve: `57` credits.
- Normal planned maximum: `320` credits.
- Scheduled canary: at most `2` admitted claims and `2` estimated credits per
  UTC day under the current atomic daily-claim policy.
- Per occurrence/window: one claim, one provider call, one estimated credit,
  and one active claim maximum.
- Concurrent scheduled claim count: one for the same occurrence. Action 619
  must add a global active-scheduled-claim check before Stage 2+ provider entry.
- Scheduled work consumes normal planned capacity only, never the hard or
  execution-ready reserve.
- Manual proof usage stays separately accounted and does not alter the
  scheduled-ledger cap. Claim capacity is the conservative combined admission
  view.
- Unavailable usage, claim/ledger disagreement, unknown status, or a
  reconciliation conflict blocks provider entry and requires operator review.

## Failure Containment

| Failure point | Required terminal state | Retry / rollout action |
| --- | --- | --- |
| Before admission | No claim, provider, audit, or ledger write; typed blocker | Correct configuration; no automatic retry |
| Atomic admission unavailable/conflict | No provider entry | Stop scheduled mode and review infrastructure |
| Post-claim runtime gate | Finalize failed with `provider_attempted=false` | Capacity retained; no retry |
| Begin-attempt duplicate | No provider call; typed in-progress/terminal result | Same occurrence stays idempotent |
| Provider rejection/timeout/invalid response | Finalize failed with sanitized evidence | Capacity retained; review before next window |
| Finalization unproven | Treat state as unproven; do not fabricate receipt | Stop schedule; investigate database state |
| Audit failure | Claim remains accurate; disable/kill before another provider entry | No automatic retry or backfill |
| Ledger failure | Usage is untrusted for further scheduling | Stop schedule; no automatic retry or backfill |
| Usage unavailable/disagrees | Block before provider | Restore verified readback through an approved action |

Any Stage 2+ persistence failure is an operational stop condition. It never
erases a claim or reuses consumed capacity.

## Monitoring Evidence Per Occurrence

Capture only sanitized evidence:

- deployment commit and schedule-contract version;
- scheduled occurrence key and admitted claim ID;
- canonical request range and request-fingerprint category;
- preflight and runtime gate categories;
- provider outcome, request count, and estimated credit;
- terminal claim status and finalization proof;
- audit/ledger persistence status and linked attempt identity;
- scheduled and claim-capacity usage before and after;
- canary, kill-switch, and schedule-state signals; and
- blocker/failure category and resulting schedule-stop state.

Never capture tokens, headers, service keys, provider URLs, raw payloads,
candles, or stack traces.

## Gap Analysis and Smallest Action 619 Delta

| Item | Classification | Required delta |
| --- | --- | --- |
| Shared execution, calendar, planner, claim, finalization, audit, ledger | Already ready | Reuse without a parallel implementation |
| Scheduled wrapper authentication | Needs production verification | Stage 1 dry reachability only |
| Explicit schedule-active admission | Needs application code and deployment configuration | Server-controlled schedule contract/occurrence; reject direct calls lacking it |
| Deployment-bound occurrence identity | Needs application code; likely no migration | Include commit and schedule contract in scheduled lifecycle/receipt derivation |
| Claim-scoped scheduled receipt/ledger identity | Needs application code and tests | Derive scheduled receipt identity from admitted claim |
| Global active scheduled-claim gate | Needs application code and perhaps narrow read-only query/RPC | Fail closed on any nonterminal scheduled claim |
| Persistence-stop behavior | Needs application code and tests | Surface unresolved persistence to preflight/readiness and halt scheduling |
| Platform schedule | Needs deployment configuration after Stage 1 code | One frequency, matching runtime signal, no duplicate mechanism |
| Migration | Not currently justified | Reassess only if an occurrence or active-claim query cannot use existing durable contracts |

## Recommended Action 619

**Action 619 - Scheduled Canary Reachability and Occurrence Admission Hardening**

Implement only Stage 1 and its prerequisites:

1. A server-controlled scheduler occurrence envelope with deployment and
   schedule-contract identity.
2. A schedule-only dry-reachability route/path that authenticates and emits
   diagnostics but cannot claim, call a provider, or write audit/ledger rows.
3. An explicit schedule-state admission gate for the execution route.
4. Deployment-bound, occurrence- and claim-scoped scheduled identity.
5. A fail-closed unresolved-persistence signal and one-active-scheduled-claim
   guard for a future Stage 2.
6. No provider execution and no schedule activation in Action 619 itself.

Only after Action 619 is deployed and verified should a separately authorized
Stage 1 schedule reachability observation be considered.
