# Avanza order ticket action contract

## Current status

The Avanza order ticket action contract converts an
`AvanzaOrderTicketFieldPlan` into future order-preparation actions for the
Sharp Semi Auto Execution Agent.

This is the order-side bridge between safe field mapping and a future
order-fill executor. It remains fixture/model-only and is not wired into Trade
UI or API routes.

It is the bridge between order field mapping and future order-fill execution.

## Modeled action plan

BUY and SELL limit orders are modeled.

The contract can describe future preparation steps such as selecting the
BUY/SELL side, selecting a safe account label, filling ticker, confirming the
instrument, filling quantity, selecting limit order mode, filling limit price,
selecting day validity, and reviewing prepared fields.

Only limit orders are supported. Market order plans are blocked.

## Final human boundary

The final KÖP/SÄLJ step is human-only.

The action contract must stop before final KÖP/SÄLJ. It must not model a final
agent click as executable, and it must not submit orders.

## Safety guarantees

- Fixture/model only.
- Contract only.
- Explicit input only.
- BUY action plan modeled.
- SELL action plan modeled.
- Limit orders only.
- Planned actions are not executable yet.
- No real Avanza form fill.
- No click behavior.
- No final KÖP/SÄLJ click.
- No order submission.
- No cookies/session handling.
- No BankID automation.
- No BankID bypass.
- No Trade UI wiring.
- No API route wiring.
- Final human confirmation required.
- Controls disabled.
- Gate locked.
- Not production-ready.

## Relationship to existing layers

The real-world order flow signals identify sanitized Avanza order-flow cues.
The order ticket field contract maps explicit package input into safe field
plans. The order ticket action contract converts those field plans into a
future preparation sequence.

This phase does not activate order behavior. Final human confirmation remains
mandatory.

## Instrument Search Before Action Planning

Instrument discovery/search now exists as a model before order ticket preparation.

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

This does not activate order behavior. No real search execution, Avanza
navigation, click behavior, BUY/SELL entry click, order submission, Trade UI
wiring, or API route wiring is added. Final human confirmation remains
mandatory.

## Instrument To Order Handoff Chain

The pre-submit order chain is now modeled end-to-end in `lib/avanza-instrument-to-order-handoff-chain.ts`.

It links execution package -> instrument search -> verification -> order ticket field plan -> order ticket action contract -> stop before final KÖP/SÄLJ. This still does not activate execution. Final human confirmation remains mandatory.

## Instrument To Order Dry-Run Executor

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

The dry-run layer verifies that order ticket action readiness is modeled before
the final human-only stop. This still does not activate execution. Final human
confirmation remains mandatory.

## Instrument To Order Mock Executor

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

The mock layer simulates review-ready state and stops before final KÖP/SÄLJ.
This still does not activate real Avanza execution. Final human confirmation
remains mandatory.
