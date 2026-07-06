# Avanza real-world order flow signals

## Current status

The Avanza real-world order flow signal pack models sanitized BUY/SELL order
flow signals for the Sharp Semi Auto Execution Agent.

The BUY flow is based on sanitized user-provided buy-flow material. SELL is
modeled from the same structure with sell/red labels.

This layer pairs with the order ticket field contract, which maps explicit
package input to safe limit-order field plans.

## Modeled steps

- instrument/order panel
- order review
- order success confirmation
- order failed confirmation
- order list
- order detail panel
- unknown

## Safe visible concepts

The signal pack may include safe Swedish order-flow concepts such as `Köp`,
`Sälj`, `Konto`, `Antal`, `Pris`, `Ordertyp`, `Limit`, `Summa`, `Belopp`,
`Kostnad`, order review, success confirmation, failed confirmation, order list,
and order detail.

## Safety guarantees

- Fixture/model only.
- Sanitized user-provided visual material only.
- No credentials.
- No password values.
- No personnummer.
- No account numbers.
- No cookies/session.
- No BankID QR.
- No order IDs.
- No real form fill.
- No click.
- No final KÖP/SÄLJ click.
- No order submission.
- No Trade UI wiring.
- No API route wiring.
- Final human confirmation required.
- Not production-ready.

## Relationship to semi-auto

Ture may prepare BUY/SELL orders in Avanza in a future reviewed phase, but the
agent must never click final KÖP/SÄLJ in semi-auto. This signal pack only
supports order-flow and selector-planning analysis.

This phase does not activate order behavior.

## Instrument Search Before Order Ticket

Instrument discovery/search now exists as a model before order ticket preparation.

The new model layers are:

- `lib/avanza-real-world-instrument-search-signals.ts`
- `lib/avanza-instrument-search-route-contract.ts`
- `lib/avanza-instrument-search-action-contract.ts`

The execution package flow is now: recommendation/position -> search instrument -> verify instrument -> locate KÖP/SÄLJ -> order ticket field/action contract -> review -> stop before final KÖP/SÄLJ.

This does not activate order behavior. No real search execution, Avanza
navigation, click behavior, BUY/SELL entry click, order submission, Trade UI
wiring, or API route wiring is added. Final human confirmation remains
mandatory.

## Order ticket action contract

The Avanza order ticket action contract now exists in
`lib/avanza-order-ticket-action-contract.ts`.

The order flow signals remain a sanitized signal layer. The order ticket field
contract maps safe fields, and the order ticket action contract models the
future BUY/SELL limit-order preparation sequence.

It is the bridge between order field mapping and future order-fill execution.

It does not activate order behavior. No real form fill, click behavior, order
submission, Trade UI wiring, or API route wiring is added. Final human
confirmation remains mandatory.
