# Avanza instrument to order handoff chain

## Current status

The Avanza instrument search to order ticket handoff chain links the instrument
search contracts and order ticket preparation contracts for the Sharp Semi Auto
Execution Agent.

The handoff chain links instrument search and order ticket preparation.

This is fixture/model only. It is rendered only in the isolated dev QA route and
is not wired into Trade UI or any API route.

## Full model path

The pre-submit order chain is now modeled end-to-end:

recommendation/live position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> build order ticket field plan -> build order ticket action contract -> stop before final KÖP/SÄLJ.

The chain represents:

- Ture execution package
- instrument search package
- instrument search route contract
- instrument search action contract
- verified instrument handoff state
- order ticket field plan
- order ticket action contract
- stop before final KÖP/SÄLJ

## BUY and SELL

BUY and SELL are both modeled. BUY chains stop before final KÖP. SELL chains stop
before final SÄLJ.

The final KÖP/SÄLJ action remains human-only.

## Instrument verification

Instrument verification uses safe fields such as ticker, instrument name,
marketplace, instrument type, and ISIN when available.

The verified instrument handoff state is model-only and can report whether:

- instrument identity matched
- marketplace matched
- short name matched
- ISIN matched or was unavailable
- BUY button was located
- SELL button was located

## Safety guarantees

- Fixture/model only.
- Full pre-submit chain modeled.
- Execution package to instrument search modeled.
- Instrument verification modeled.
- Verified instrument to order ticket modeled.
- BUY handoff chain modeled.
- SELL handoff chain modeled.
- Planned steps are not executable yet.
- No real search execution.
- No real Avanza navigation.
- No navigation/click yet.
- No real form fill.
- No click.
- No BUY/SELL entry click.
- No final KÖP/SÄLJ click.
- No order submission.
- No cookies/session.
- No BankID automation.
- No Trade UI wiring.
- No API route wiring.
- Final human confirmation required.
- Not production-ready.

## Relationship to existing contracts

The chain consumes explicit model outputs only. It does not create selectors,
open Avanza, fill forms, call browser actions, call local APIs, or write
execution records.

The pre-submit order chain is now modeled end-to-end. This still does not activate execution. Final human confirmation remains mandatory.

## Instrument To Order Dry-Run Executor

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

It checks the modeled chain, instrument verification, and order ticket
readiness through fixture/model-only reports. It can show BUY and SELL dry-run
paths up to final human action, but it still does not activate execution. Final
human confirmation remains mandatory.

## Instrument To Order Mock Executor

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

The mock layer simulates search, instrument verification, order ticket
preparation, and review-ready state using simulated page state. This still does
not activate real Avanza execution. Final human confirmation remains mandatory.
