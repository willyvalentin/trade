# Avanza Local-Dev Bridge Contract

Status: `avanza_local_dev_bridge_contract_added`

## Current Status

The local-dev bridge contract is now modeled but locked as an under-surface layer
between the headless orchestration report and any future local smoke-runner
request candidate.

The modeled chain is:

1. headless orchestration report
2. selected contract summary
3. plan/session summary
4. local-dev smoke runner request candidate
5. activation gates
6. blocked until explicit manual activation

This contract is agent-readable and UI-hidden. It does not open the local-dev
bridge gate; the bridge gate remains closed.

## Purpose

The contract describes how a future local-dev bridge would translate a ready
headless orchestration report into a safe, terminal-only smoke-runner request
candidate. It is model/helper/docs/dev-QA only.

It can summarize a recommendation BUY orchestration, a live-position SELL
orchestration, login smoke candidate, order-chain smoke candidate, combined
login-then-order candidate, or review-only candidate. The candidate remains
blocked until explicit future gates are opened.

## Activation Gates

The local-dev bridge gate is not open. The contract models these gates:

- local-dev only gate
- explicit operator approval gate
- env opt-in gate
- manual terminal confirmation gate
- separate real-run flag gate
- browser automation gate
- credential provider gate
- cookie/session forbidden gate
- BankID forbidden gate
- order submit forbidden gate
- final KOP/SALJ human-only gate
- Supabase write locked gate

Env opt-in, manual terminal confirmation, and a separate real-run flag are
required later before any future local-dev run can even be considered.

## Safety Boundary

The bridge contract does not invoke smoke runners, does not import terminal
scripts, does not start browser automation, cannot call APIs, cannot fetch or
poll, cannot access credentials, cannot read cookies or export sessions, cannot
automate or bypass BankID, cannot submit orders, cannot click final KOP/SALJ,
and does not write Supabase.

The path is terminal-only for a future phase. It is not wired to Trade UI, not
linked from main navigation, and not production-ready.

## UI Boundary

The Ture UI remains intentionally minimal and visually simple. The dev-only
visual QA route can render static fixture/model-only contract states, but the
default Trade UI remains unchanged. No visible Trade UI execution elements,
active handoff, prepare action, buy/sell CTA, browser automation, API route
call, fetch/polling, credential access, order submission, final KOP/SALJ click,
or Supabase write is added.

## Next Step

The next possible step is still review-only planning for a local-dev bridge.
Any actual bridge invocation, smoke-runner invocation, terminal script run,
browser automation, credential access, or real Avanza interaction requires a
separate explicit activation task and must keep final confirmation human-only.

## Activation Checklist

`docs/avanza-local-dev-bridge-activation-checklist.md` now models the local-dev
bridge activation checklist for disabled bridge runner design. The checklist is
required before disabled runner design, but disabled runner design approval is
not runtime approval and runtime remains locked. The local-dev bridge gate
remains locked, smoke runner invocation remains blocked, model-only dry-run is
not yet approved, and real-run remains forbidden.

## Disabled Runner Skeleton

`docs/avanza-disabled-local-dev-bridge-runner.md` now adds a report-only
disabled bridge runner skeleton after the bridge contract and activation
checklist. It can consume this bridge contract as model input, but it cannot
open the bridge gate, invoke smoke runners, import terminal scripts, start
browser automation, call APIs, fetch or poll, access credentials, handle
cookies/session, automate BankID, submit orders, click final KOP/SALJ, or write
Supabase.

## Model-Only Dry Runner

`docs/avanza-model-only-local-dev-bridge-dry-runner.md` now models the bridge
contract flowing into a model-only dry-run layer through the disabled runner
skeleton. The dry-run can describe a simulated smoke request summary, but it
stops at the invocation boundary and does not open the bridge gate, invoke
smoke runners, run terminal scripts, start browser automation, access
credentials, submit orders, click final KOP/SALJ, or write Supabase.

## Bridge Readiness Checkpoint

`docs/avanza-local-dev-bridge-readiness-checkpoint.md` now adds an invocation
boundary checkpoint for the local-dev bridge stack. The checkpoint records that
the bridge stack has a checkpoint at invocation boundary, future work must
explicitly decide the next allowed design step, and runtime remains locked.
Runtime invocation, real Avanza runs, Trade UI active handoff, API route
activation, final KOP/SALJ agent clicks, and production readiness remain
blocked.

## Manual Invocation Approval Runbook

`docs/avanza-manual-local-dev-invocation-approval-runbook.md` now gates any
future invocation adapter design. The runbook records manual evidence for
design-only work and keeps runtime locked.

## Disabled Invocation Adapter Contract

`docs/avanza-disabled-local-dev-invocation-adapter-contract.md` now defines the
future adapter shape only. The bridge contract may feed safe summary metadata
into that design model, while sensitive payload is forbidden and runtime remains
locked.
