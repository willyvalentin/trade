# Avanza instrument search action contract

## Current status

The Avanza instrument search action contract converts a ready instrument search
route into future search/navigation actions.

This remains fixture/model-only and is not wired into Trade UI or API routes.

## Modeled actions

The action contract can model future actions for clicking `Sök`, filling the
search input, waiting for search results, selecting `Nokia ADR` or another
matching instrument, verifying instrument identity and details, locating the
KÖP or SÄLJ button, and stopping before the entry click.

The agent may prepare a route in a future reviewed phase, but this phase does
not execute search, navigation, form fill, or clicks.

## Final human boundary

KÖP/SÄLJ entry buttons lead toward order ticket preparation, but they are not
clicked in this phase.

Final KÖP/SÄLJ remains human-only. The agent must never submit orders.

## Safety guarantees

- Fixture/model only.
- Contract only.
- BUY instrument route modeled.
- SELL instrument route modeled.
- Instrument verification modeled.
- Planned actions are not executable yet.
- No real search execution.
- No real Avanza navigation.
- No click.
- No BUY/SELL entry click.
- No order submission.
- No cookies/session.
- No BankID automation.
- No Trade UI wiring.
- No API route wiring.
- Final human confirmation required.
- Not production-ready.

## Relationship to order preparation

Instrument discovery/search now exists as a model before order ticket preparation.

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

This phase does not activate order behavior.

## Instrument To Order Handoff Chain

The pre-submit order chain is now modeled end-to-end in `lib/avanza-instrument-to-order-handoff-chain.ts`.

It links the instrument search action contract to verified instrument handoff state, order ticket field planning, and order ticket action planning. This still does not activate execution. Final human confirmation remains mandatory.

## Instrument To Order Dry-Run Executor

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

The action contract remains a model input to dry-run validation only. This still
does not activate execution. Final human confirmation remains mandatory.

## Instrument To Order Mock Executor

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

The action contract can be inspected through simulated page-state flow only.
This still does not activate real Avanza execution. Final human confirmation
remains mandatory.
