# Avanza Headless Execution Session State Machine

## Current Status

The headless execution session state machine models the lifecycle of a future
Sharp Semi Auto Execution Agent session after a headless Avanza agent plan has
been built. It is under-the-surface, agent-readable, UI-hidden, and
fixture/model-only in the isolated dev QA route.

Contract selector feeds plan builder, and plan builder now feeds session
lifecycle. The future agent session behavior is modeled without visual UI or
execution.

## Lifecycle Modeled

The state machine can model:

- session created
- selected contract validated
- plan ready
- login requirement known
- login ready
- instrument search planned
- instrument verified
- order fields planned
- order review ready
- waiting for manual final confirmation
- broker result capture pending
- settlement reconciliation pending
- completed, failed, cancelled, or blocked terminal states

It can observe a user final click later, but agent final click is forbidden.
Observation of the user action does not mean the agent clicked final KOP/SALJ.

## Safety Boundary

The state machine models lifecycle only. It does not execute anything, start
handoff, prepare orders now, call APIs, start browser automation now, access
credentials, read cookies, export sessions, automate BankID, submit orders,
click final KOP/SALJ, mutate trades, or write Supabase execution records.

Final confirmation is human-only. BankID remains manual-only and forbidden for
automation or bypass. Settlement reconciliation pending supports a later
avrakningsnota flow only.

## Forbidden Events

Events are blocked if event metadata implies:

- agent_clicked_final_buy
- agent_clicked_final_sell
- order_submitted_by_agent
- bankid_automated
- cookies_read
- session_exported
- credentials_logged
- supabase_execution_write

Invalid transitions are rejected with a reason and do not advance the session.

## Dev QA Visibility

Static fixtures cover recommendation BUY and live-position SELL sessions to
`waiting_for_manual_final_confirmation`, user final click observed,
`broker_result_capture_pending`, `settlement_reconciliation_pending`,
completed, failed, cancelled, blocked, invalid transition rejected, forbidden
agent final click, forbidden order submission by agent, forbidden BankID
automation, forbidden cookies/session handling, forbidden Supabase write, and
UI hidden under the surface.

The dev QA route renders this as fixture/model-only visibility. It remains
unlinked from main navigation and does not change default Trade UI behavior.

## Hard Safety Flags

The session state machine always remains:

- stateMachineOnly true
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

This is not production ready. Ture UI remains minimal and visually simple while
execution behavior stays under the surface.

## Orchestration Pipeline Consumer

`docs/avanza-headless-execution-orchestration-pipeline.md` now records the
under-surface chain orchestration after the session state machine. The
headless execution orchestration pipeline connects contract to selector to plan
to session, and future agent session behavior is modeled without visual UI or
active broker behavior.

The pipeline remains agent-readable and UI-hidden. It can initialize a
headless session to plan-ready, login-required, or login-ready lifecycle state,
but it still cannot execute, start handoff, prepare orders now, call APIs,
fetch, poll, start browser automation now, access credentials, read cookies or
export sessions, automate BankID, submit orders, click final KOP/SALJ, write
Supabase, or claim production readiness.

## Architecture Checkpoint

`docs/avanza-headless-execution-architecture-checkpoint.md` now checkpoints the
full under-surface agent brain loop: contract -> selector -> plan -> session ->
orchestration. Next work must pass through activation gates before any
local-dev execution bridge or real browser run is attempted. The checkpoint
does not open any gate. Trade UI execution, API route execution, browser
automation, credential access, Supabase writes, settlement writes, and
production readiness remain locked or blocked.

## Local-Dev Bridge Contract

`docs/avanza-local-dev-bridge-contract.md` now models the locked bridge
contract after orchestration. The session state machine can feed orchestration,
and orchestration can feed a future terminal-only smoke request candidate, but
the local-dev bridge gate remains closed. The contract does not invoke smoke
runners, browser automation, API calls, credential access, cookies/session,
BankID automation, order submission, final KOP/SALJ clicks, or Supabase writes.
It is the next locked review step before any actual bridge invocation.
