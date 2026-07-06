# Avanza instrument search route contract

## Current status

The Avanza instrument search route contract converts an explicit instrument
search package plus sanitized search signals into a future instrument-search
route.

This remains fixture/model-only and is not wired into Trade UI or API routes.

## Modeled route

The route models opening `Sök`, filling the ticker or instrument name, waiting
for results, selecting the matching instrument, verifying the instrument page,
checking `Om depåbeviset`, `Marknadsplats`, `Kortnamn`, and `ISIN`, locating
KÖP/SÄLJ entry buttons, and stopping before the BUY/SELL entry click.

KÖP/SÄLJ buttons are entry points to the order ticket. They are not clicked in
this phase.

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

It links the instrument search route contract to the action contract, verified instrument handoff state, and order ticket preparation. This still does not activate execution. Final human confirmation remains mandatory.

## Instrument To Order Dry-Run Executor

The chain now has a dry-run validation layer in
`lib/avanza-instrument-to-order-dry-run-executor.ts`.

The route contract remains a model input to dry-run validation only. This still
does not activate execution. Final human confirmation remains mandatory.

## Instrument To Order Mock Executor

The chain now has a mock execution layer after dry-run in
`lib/avanza-instrument-to-order-mock-executor.ts`.

The route contract can be inspected through simulated page-state flow only.
This still does not activate real Avanza execution. Final human confirmation
remains mandatory.
