# Avanza Headless Agent Plan Builder

## Current Status

The headless Avanza agent plan builder converts a selected headless execution contract into an agent-readable Avanza preparation plan. It is under-the-surface metadata only: the plan is UI-hidden, fixture/model-only in the dev QA route, and not connected to Trade UI execution.

The builder consumes the headless execution contract selector output and models what a future Sharp Semi Auto Execution Agent would prepare without doing it:

- confirm the selected contract is eligible
- verify profile readiness
- plan login if needed through username/password path only
- avoid BankID automation
- plan instrument search
- plan instrument identity verification
- plan BUY or SELL entry route
- plan limit order field preparation
- plan review verification
- stop before final confirmation
- require the user manual final KOP/SALJ click
- plan future result capture and settlement reconciliation

## Safety Boundary

The plan builder does not execute the plan. It does not start handoff, prepare orders now, call APIs, start browser automation now, access credentials, read cookies, export sessions, automate BankID, submit orders, click final KOP/SALJ, or write Supabase execution records.

Final broker confirmation is human-only. BankID remains manual-only and forbidden for automation or bypass. Settlement reconciliation is only planned for a later avrakningsnota flow.

## Fixture And Dev QA Visibility

Static fixtures cover recommendation BUY ready plans, live-position SELL ready plans, missing selected contract, selected contract blocked, incomplete contract, market order blocked, profile incomplete warnings, login unknown planning, private and company customer login paths, stop-before-final-confirmation, user final click required, BankID forbidden/manual-only, settlement reconciliation planned, no order submission, no Supabase write, and UI hidden under the surface.

The isolated dev QA route renders the harness as fixture/model-only. The route remains unlinked from main navigation and does not change the default Trade UI.

## Hard Safety Flags

The plan always remains:

- planOnly true
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

This is not production ready. It is a planning layer for future agent consumption only. Ture UI remains minimal and visually simple while execution behavior stays under the surface.
