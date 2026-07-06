# Avanza order ticket field contract

## Current status

The Avanza BUY/SELL order ticket field contract maps an explicit Ture execution
package into a safe field plan for future Avanza order ticket preparation.

This is the first order-side model after login readiness. It remains
fixture/model-only and is not wired into Trade UI or API routes.

This layer pairs with the order flow signals, which model sanitized
user-provided BUY-flow material and SELL labels for order-side planning.

## Supported order type

Only limit orders are supported.

Market orders are blocked by the contract and must not be prepared by the
agent.

## Modeled fields

- side
- ticker
- instrument name
- quantity
- order type
- limit price
- time in force
- account type
- customer type
- review required
- final human confirmation

Every field has `filledByAgentInThisTask` set to `false`.

## Safety guarantees

- Fixture/model only.
- Explicit input only.
- Limit orders only.
- BUY preparation modeled.
- SELL preparation modeled.
- No real form fill.
- No click.
- No final KÖP/SÄLJ click.
- No order submission.
- No cookies/session.
- No BankID automation.
- No BankID bypass.
- No Trade UI wiring.
- No API route wiring.
- Final human confirmation required.
- Controls disabled.
- Gate locked.
- Not production-ready.

## Relationship to semi-auto

Ture may prepare fields in a future reviewed phase, but the agent must never
submit orders and must never click final KÖP/SÄLJ in semi-auto.

This phase does not activate order behavior. No order submission exists yet.

## Order ticket action contract

The Avanza order ticket action contract now exists in
`lib/avanza-order-ticket-action-contract.ts`.

It is the bridge between order field mapping and future order-fill execution.
It converts the field plan into fixture/model-only BUY/SELL preparation
actions, supports limit orders only, and stops before final KÖP/SÄLJ.

It does not activate order behavior. No real form fill, click behavior, order
submission, Trade UI wiring, or API route wiring is added. Final human
confirmation remains mandatory.

## Instrument Search Before Field Mapping

Instrument discovery/search now exists as a model before order ticket preparation.

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

This does not activate order behavior. No real search execution, Avanza
navigation, click behavior, BUY/SELL entry click, order submission, Trade UI
wiring, or API route wiring is added. Final human confirmation remains
mandatory.

## Instrument To Order Handoff Chain

The pre-submit order chain is now modeled end-to-end in `lib/avanza-instrument-to-order-handoff-chain.ts`.

It links verified instrument handoff state to the order ticket field plan before the order ticket action contract. This still does not activate execution. Final human confirmation remains mandatory.

## Instrument To Order Dry-Run Executor

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

The dry-run layer verifies that order ticket field readiness is modeled before
the final human-only stop. This still does not activate execution. Final human
confirmation remains mandatory.

## Instrument To Order Mock Executor

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

The mock layer simulates order ticket field preparation but performs no real
form fill. This still does not activate real Avanza execution. Final human
confirmation remains mandatory.
