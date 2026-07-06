# Avanza Instrument To Order Dry-Run Executor

## Purpose

The Avanza instrument-to-order dry-run executor is a pure model/helper for the
Sharp Semi Auto Execution Agent. It simulates the full pre-submit handoff path
from a modeled instrument search chain to order ticket readiness, then stops
before any final human-only order action.

The chain now has a dry-run validation layer. This still does not activate execution. Final human confirmation remains mandatory.

## Implemented Artifacts

- `lib/avanza-instrument-to-order-dry-run-executor.ts` builds an explicit-input
  dry-run report.
- `lib/avanza-instrument-to-order-dry-run-executor-fixtures.ts` provides static
  fixture reports for disabled, waiting, blocked, failure, BUY, SELL, forbidden,
  error, and unknown states.
- `components/execution/AvanzaInstrumentToOrderDryRunExecutorHarness.tsx`
  renders the fixtures for inspection.
- `app/dev/avanza-visual-qa/page.tsx` renders the harness as a dev-only
  fixture/model-only section.

## Dry-Run Scope

The dry-run executor validates these modeled checkpoints:

- handoff chain availability
- instrument verification readiness
- order field plan readiness
- order action plan readiness
- BUY dry-run to final human action
- SELL dry-run to final human action
- stop before final KÖP
- stop before final SÄLJ

It reports planned step details, expected results, blocked reasons, warnings,
and safety flags. Planned steps are not executable yet.

## Safety Boundaries

The dry-run executor is fixture/model-only and explicit-input only.

- No real search execution.
- No real Avanza navigation.
- No real form fill.
- No click.
- No BUY/SELL entry click.
- No final KÖP/SÄLJ click.
- No order submission.
- No cookies/session.
- No credential handling.
- No BankID automation.
- No BankID bypass.
- No Supabase execution write.
- No Trade UI wiring.
- No API route wiring.

The safety flags keep `canExecuteChain`, `canSearchInstrument`,
`canNavigateToInstrument`, `canFillOrderFields`, `canReviewOrder`,
`canClickFinalBuy`, `canClickFinalSell`, and `canSubmitOrder` false. Controls
remain disabled and the gate remains locked.

## Route Visibility

The dev-only Avanza visual QA route renders the dry-run harness with static
fixtures only. The route remains unlinked from main navigation and does not read
Trade UI state.

## Non-Goals

This phase does not implement live Avanza browser control, search execution,
navigation, form fill, review clicking, final order clicking, confirmation
capture, order submission, session handling, or Supabase writes.

## Next Step

The next phase can either stop here with fixture/model-only dry-run visibility,
or plan a separately gated local-only dry-run invocation path. Any future phase
must keep execution, fill, final click, and order submission forbidden unless a
separate explicit approval gate is completed.

## Instrument To Order Mock Executor

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

It simulates the full pre-submit flow using simulated Avanza page state and
stops before final KÖP/SÄLJ. This still does not activate real Avanza execution.
Final human confirmation remains mandatory.

## Settlement Note / Order Information Follow-Up

Settlement note signals now exist as the post-trade reconciliation foundation.
Exact courtage, FX/exchange rate, settlement amount, and realized execution
cost are future extraction targets from Avanza avräkningsnota after manual
execution. The dry-run layer still does not activate post-trade navigation,
PDF/download/read, OCR, value extraction, trade reconciliation writes, Trade UI
wiring, API route wiring, cookie/session handling, BankID automation, or
Supabase writes.
