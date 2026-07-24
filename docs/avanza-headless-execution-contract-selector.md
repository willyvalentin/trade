# Avanza Headless Execution Contract Selector

## Current Status

`lib/avanza-headless-execution-contract-selector.ts` defines a pure,
under-the-surface selector for future Sharp Semi Auto Execution Agent
consideration.

The selector is represented in dev QA through:

- `lib/avanza-headless-execution-contract-selector-fixtures.ts`;
- `components/execution/AvanzaHeadlessExecutionContractSelectorHarness.tsx`;
- the fixture/model-only section on `app/dev/avanza-visual-qa/page.tsx`.

## Purpose

The selector chooses the next agent-readable headless execution contract from
recommendation entry BUY contracts and live-position exit SELL contracts.

It is headless, UI-hidden, and does not change the visually simple Trade UI.
Future agent logic can consume the selected contract without adding visual
clutter to recommendation cards.

## Priority Rules

Selection is deterministic:

- exits outrank entries;
- stop-loss exits outrank target exits;
- target exits outrank entry BUY candidates;
- among entries, higher confidence wins when available;
- when confidence ties, better reward:risk wins;
- when confidence and reward:risk tie, newest candidate wins.

Invalid, incomplete, and unsafe contracts are marked blocked, incomplete, or
unsafe and are not selected.

## Safety Boundary

The selector does not start handoff, does not prepare orders, cannot call APIs,
cannot fetch or poll, cannot start browser automation, cannot access
credentials, cannot read cookies/session, cannot automate BankID, cannot submit
orders, cannot click final KÖP/SÄLJ, and cannot write Supabase.

Final confirmation remains human-only. The Execution Agent must never click
final KÖP/SÄLJ.

## Safety Flags

The selector keeps:

- `selectorOnly: true`;
- `headlessOnly: true`;
- `visibleInUi: false`;
- `canStartHandoff: false`;
- `canPrepareOrder: false`;
- `canRunSmokeTestFromUi: false`;
- `canCallApiRoute: false`;
- `canFetch: false`;
- `canPoll: false`;
- `canUseBrowserAutomation: false`;
- `canAccessCredentials: false`;
- `canReadCookies: false`;
- `canExportSession: false`;
- `canAutomateBankId: false`;
- `canSubmitOrder: false`;
- `canClickFinalBuy: false`;
- `canClickFinalSell: false`;
- `canWriteSupabase: false`;
- `canClaimProductionReady: false`;
- `userMustConfirm: true`;
- `finalHumanClickRequired: true`;
- `controlsEnabled: false`;
- `gateLocked: true`.

## Production Readiness

This selector is model/helper/docs/dev-QA only and is not production-ready. It
does not activate Trade UI behavior, mutate trades, call the disabled API
route, run smoke tests, or write Supabase execution records.

## Headless Agent Plan Builder

The selector now feeds `docs/avanza-headless-agent-plan-builder.md`. A selected
contract can be converted into an under-the-surface, agent-readable Avanza
preparation plan without visual UI or execution. The plan builder
models login planning, instrument search, identity verification, BUY/SELL route
planning, limit order field preparation, review stop, human-only final KOP/SALJ,
and later settlement reconciliation while still forbidding API calls, fetch,
polling, browser automation now, credential access, cookies/session handling,
BankID automation, order submission, final clicks, and Supabase writes.

## Headless Execution Session State Machine

`docs/avanza-headless-execution-session-state-machine.md` follows the plan
builder. The headless execution session state machine is lifecycle metadata
only: contract selector feeds plan builder, and plan builder now feeds session
lifecycle without visual UI or execution. The lifecycle is agent-readable and
UI-hidden, rejects invalid transitions, keeps agent final click forbidden,
blocks forbidden order/credential/session/Supabase events, and keeps final
KOP/SALJ human-only.

## Orchestration Pipeline Consumer

`docs/avanza-headless-execution-orchestration-pipeline.md` now uses the
selector output inside the under-surface end-to-end chain. The orchestration
pipeline is the headless execution orchestration pipeline. It connects contract
to selector to plan to session, and future agent session behavior is modeled
without visual UI or active broker behavior. The
selector remains UI-hidden and still cannot start handoff, prepare orders now,
call APIs, fetch, poll, access credentials, automate BankID, submit orders,
click final KOP/SALJ, write Supabase, or claim production readiness.

## Architecture Checkpoint

`docs/avanza-headless-execution-architecture-checkpoint.md` now checkpoints the
full under-surface agent brain loop: contract -> selector -> plan -> session ->
orchestration. Next work must pass through activation gates before any
local-dev execution bridge or real browser run is attempted. The checkpoint
does not open any gate.

## Local-Dev Bridge Contract

`docs/avanza-local-dev-bridge-contract.md` now models the locked bridge
contract after selector -> plan -> session -> orchestration. The selector can
contribute a selected contract summary to a future terminal-only smoke request
candidate, but the bridge gate remains closed and no smoke runner, browser
automation, API call, credential access, order submission, final KOP/SALJ click,
or Supabase write is activated.
It is the next locked review step before any actual bridge invocation.
