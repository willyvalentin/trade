# Avanza Settlement Note / Order Information Signals

The Avanza settlement note / order information signal pack exists as the first post-trade reconciliation model layer for the Sharp Semi Auto Execution Agent.

It is based on sanitized user-provided settlement-flow material. The observed flow is: open Min ekonomi, open Transaktioner, locate the transaction row, open the detail side panel, access Avräkningsnota, and later read exact settlement details from the note.

## Why The Note Matters

After a user manually confirms KÖP/SÄLJ in Avanza, exact values can settle after execution. The avräkningsnota is the future source for exact courtage, exact FX/exchange rate, exact settlement amount, and exact realized execution cost.

## Modeled Flow

1. Min ekonomi
2. Transaktioner
3. Locate matching transaction
4. Open transaction detail panel
5. Identify Avräkningsnota
6. Open/read Avräkningsnota later
7. Extract courtage, FX/exchange rate, settlement amount, and related values later

## Current Boundary

This task only models signals in `lib/avanza-real-world-settlement-note-signals.ts`, fixtures in `lib/avanza-real-world-settlement-note-signals-fixtures.ts`, and the dev QA harness in `components/execution/AvanzaSettlementNoteSignalsHarness.tsx`.

No real Avanza navigation is implemented. No PDF/download/read is implemented. No OCR is implemented. No settlement value extraction is implemented. No Ture reconciliation write is implemented. No cookies/session handling is implemented. No BankID automation is implemented. No Trade UI wiring is implemented. No API route wiring is implemented. This is not production ready.

## Safety State

The signal pack is sanitized fixture/model-only data. It can be used for settlement planning and selector planning, but it cannot navigate to transactions, select a transaction, open a settlement note, read a settlement document, extract settlement values, write trade reconciliation, read cookies, export sessions, automate BankID, bypass BankID, or submit orders.

Final human confirmation remains mandatory for trading. Post-trade reconciliation write behavior remains a future separately planned phase.

## Route And Action Contract Follow-Up

Settlement route/action contracts now exist in
`lib/avanza-settlement-note-route-contract.ts` and
`lib/avanza-settlement-note-action-contract.ts`.

They prepare future note retrieval/extraction by modeling how Ture can later
route from a trade reference to the matching transaction and Avräkningsnota.
They do not activate real Avanza navigation, document/PDF read, OCR, value
extraction, reconciliation writes, Trade UI wiring, API route wiring,
cookie/session handling, BankID automation, or Supabase writes.
They do not activate reconciliation or writes.

## Extraction Schema And Reconciliation Mapping Follow-Up

Settlement extraction schema and reconciliation mapping now exist in
`lib/avanza-settlement-note-extraction-schema.ts` and
`lib/avanza-settlement-reconciliation-mapping.ts`.

Exact cost/FX reconciliation is modeled but not applied. The schema identifies
future avräkningsnota targets such as courtage, FX/växelkurs, settlement
amount, trade date, settlement date, quantity, price, and currency. The mapping
previews how those values could later flow into execution, trade result,
statistics/PnL, and audit metadata targets.

This still does not activate document reading, OCR, value extraction,
reconciliation writes, Supabase writes, Trade UI wiring, API route wiring,
cookie/session handling, or BankID automation.

## Settlement Reconciliation Dry-Run Follow-Up

Settlement reconciliation now has a dry-run validation layer. It simulates the
full post-trade reconciliation path from executed trade reference through
route/action/schema/mapping to manual review and stop-before-write.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor Follow-Up

Settlement reconciliation now has a mock execution layer after dry-run. It
simulates the full post-trade reconciliation path using simulated settlement
state only: transaction matching, Avräkningsnota availability,
masked/synthetic courtage, masked/synthetic FX/växelkurs, masked/synthetic
settlement amount, reconciliation preview, and manual review.

This still does not activate real navigation, document reading,
PDF/download/read, OCR, real value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring. Exact cost/FX reconciliation
remains modeled/mock-only.
