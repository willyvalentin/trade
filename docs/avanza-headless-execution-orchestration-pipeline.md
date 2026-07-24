# Avanza Headless Execution Orchestration Pipeline

## Current Status

The Avanza headless execution orchestration pipeline is now modeled as an
under-the-surface, agent-readable layer for the Sharp Semi Auto Execution Agent.
It connects contract to selector to plan to session without execution.

The pipeline consumes recommendation and live-position inputs, builds or
normalizes headless contracts through the selector path, selects the next
eligible headless contract, builds a headless Avanza agent plan, and initializes
the headless execution session lifecycle. Future agent session behavior is
modeled without visual UI or active broker behavior.

## Modeled Chain

The chain is:

1. recommendation/live-position input
2. headless contracts
3. selector
4. selected contract
5. headless agent plan
6. headless execution session lifecycle initialization

The orchestration report is agent-readable and UI-hidden. It can show
recommendation BUY orchestration, live-position SELL orchestration, exit
priority, stop-loss priority, target priority, blocked candidates, plan blocked,
session blocked, login unknown next step, login ready next step, and settlement
expectation carry-through.

## Execution Boundary

The pipeline does not execute anything. It does not start handoff, does not
prepare orders now, cannot call APIs, cannot start browser automation now,
cannot access credentials, cannot read cookies or export sessions, cannot submit
orders, cannot click final KOP/SALJ, and does not write Supabase.

Final confirmation is human-only. User manual final KOP/SALJ remains required,
and agent final click is forbidden.

## BankID Boundary

BankID remains manual-only and forbidden for automation or bypass. If BankID or
MFA is required in a future real local-dev flow, the agent must stop for manual
user action.

## UI Boundary

The Ture UI remains minimal and visually simple. The pipeline is not rendered in
Trade UI, does not add visible Trade UI elements, does not add active handoff,
does not add prepare action, does not add buy/sell CTA, and does not change
default Trade UI behavior. Dev QA route visibility is fixture/model-only.

## Safety Flags

Hard safety flags remain locked:

- orchestrationOnly true
- headlessOnly true
- visibleInUi false
- canStartHandoff false
- canPrepareOrderNow false
- canRunSmokeTestFromUi false
- canCallApiRoute false
- canFetch false
- canPoll false
- canUseBrowserAutomationNow false
- canAccessCredentials false
- canReadCookies false
- canExportSession false
- canAutomateBankId false
- canSubmitOrder false
- canClickFinalBuy false
- canClickFinalSell false
- canWriteSupabase false
- canClaimProductionReady false
- userMustConfirm true
- finalHumanClickRequired true
- controlsEnabled false
- gateLocked true

## Not Production Ready

This is not production ready. It is a model/helper/docs/dev-QA layer only. The
order handoff/action/local-dev/smoke stack exists separately but is not invoked
here. The settlement stack remains model/mock-only.

## Architecture Checkpoint

`docs/avanza-headless-execution-architecture-checkpoint.md` now checkpoints the
full under-surface agent brain loop: contract -> selector -> plan -> session ->
orchestration. Next work must pass through activation gates before any
local-dev execution bridge or real browser run is attempted.

The checkpoint does not execute anything and does not open any gate. Trade UI
execution, API route execution, browser automation, credential access,
Supabase writes, settlement writes, and production readiness remain locked or
blocked. Cookies/session export, BankID automation, order submission, and final
KOP/SALJ click by agent remain forbidden.

## Local-Dev Bridge Contract

`docs/avanza-local-dev-bridge-contract.md` now defines the modeled but locked contract that
could later translate a ready orchestration report into a terminal-only smoke
request candidate. It is the next modeled step before any actual bridge
invocation. It does not invoke smoke runners, import terminal scripts, run
browser automation, call APIs, access credentials, handle cookies/session,
automate BankID, submit orders, click final KOP/SALJ, or write Supabase.

## Local-Dev Bridge Activation Checklist

`docs/avanza-local-dev-bridge-activation-checklist.md` now adds the manual
approval checklist after the bridge contract. Next work may design a disabled
bridge runner design only if the checklist approves design; runtime remains
locked and real-run remains forbidden.

## Disabled Local-Dev Bridge Runner

`docs/avanza-disabled-local-dev-bridge-runner.md` now models the disabled
local-dev bridge runner skeleton after the bridge contract and activation
checklist. It is a report-only layer: bridge contract plus activation checklist
can produce a disabled runner report, but the bridge gate remains locked, smoke
runner invocation and terminal script invocation remain blocked, browser
automation and credentials remain locked, cookies/session remain forbidden,
BankID remains manual-only, order submission remains forbidden, final KOP/SALJ
remains human-only, Supabase writes remain locked, and the layer is not
production-ready.
