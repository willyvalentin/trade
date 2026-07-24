# Action 587 - First Authorized Production Shadow Canary Execution

## Checkpoint A Decision

`checkpoint_a_passed_ready_to_issue_one_authorization_and_lease`

Action 587 performed Checkpoint A only. No authorization or lease was issued, no canonical execution request was submitted, and no provider, claim, audit, credit-ledger, flag, schedule, deployment, or repository mutation occurred.

## Deployment and Contract

- Current `origin/main` contains Action 585 commit `e8801d3` as an ancestor.
- The deployed production schema exposes the Action 580 authorization table, Action 583 claim table, and Action 585 manual execution lease table; all were available for service-role read-only count checks.
- The reviewed applied migrations are `20260722001000`, `20260722002000`, and `20260722003000`.
- Canonical manual-authorization, canonical manual-execution, legacy gate, and scheduled-canary routes each returned `405` to a safe `HEAD` request. No route handler was invoked.

## Exact Baseline

| Fact | Observed value |
| --- | --- |
| Activation readiness | `ready_for_one_manual_canary_attempt` |
| Readiness blockers | none |
| Preflight blockers | `canary_disabled`, `canary_kill_switch_active` only |
| Manual authorizations | `0` |
| Manual execution leases | `0` |
| Daily claims | `0` |
| Durable audit rows | `0` |
| Credit-ledger rows | `0` |
| Daily usage | `0` runs / `0` estimated credits |
| Canary default | disabled |
| Kill switch | active |
| Schedule signals | repository, deployment, remote, duplicate, and future frequency all absent |

## Gate Verification

- Calendar contract: `us_equity_market_calendar_v1`; verified, current, covered, regular-session-aware, and able to derive the selected completed window.
- Canonical request: `AAPL`, `5min`, `2026-07-22T16:00:00.000Z` through `2026-07-22T16:30:00.000Z`.
- Provider: configured with accepted status `within_budget`.
- Planner: `normal_broad_universe_refresh`, normal broad REST layer, with one executable credit from normal capacity.
- Policy: `377` total credits, `57` hard reserve, `320` normal planned maximum; hard reserve preserved and execution-ready reserve use `0`.
- Duplicate/concurrency baseline: no authorization, lease, claim, audit, or ledger record exists, and no schedule mechanism is active.

The paired lease path is recognized as the bounded server-controlled override for only `canary_disabled` and `canary_kill_switch_active`. It does not override calendar, provider, planner, policy, budget, audit, ledger, duplicate, daily-cap, or schedule gates.

## Security and Scope

- No production secret was printed, persisted, or added to this document.
- No raw credential probe was executed.
- `deno.lock` remains untracked and untouched.
- The only permitted next operation, after a fresh operator confirmation, is one issuance through the canonical manual-authorization route followed immediately by one canonical manual-execution submission with its matching in-memory authorization token and lease ID.

## Abort Rule

Abort before issuance if any baseline count changes, any additional preflight blocker appears, readiness differs, the calendar/provider/planner/policy gate changes, either global default changes, a schedule signal appears, or either canonical route is unavailable. Do not compensate with a second authorization or a direct RPC call.

## Checkpoint B Containment (2026-07-22)

`checkpoint_b_failed_abort_before_execution`

The canonical manual-authorization route was invoked exactly once after the Checkpoint A baseline passed. Its result did not prove a successfully issued authorization-and-lease pair, so the in-memory credential variables were cleared immediately. The canonical manual-execution route was not invoked.

Immediate service-role read-only containment readback found manual authorizations `0`, manual execution leases `0`, daily claims `0`, audit rows `0`, and credit-ledger rows `0`. No latest authorization or lease record exists to expire. No provider call, claim, audit write, ledger write, flag change, schedule action, deployment, or retry occurred.

This authorized attempt is closed. A later attempt requires a new explicit operator authorization and a separate diagnosis of why canonical issuance was not proven; it must not reuse this authorization.
