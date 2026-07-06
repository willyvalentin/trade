# Avanza Settlement Note Route Contract

The Avanza settlement note route contract models how Ture will later locate the correct Avanza transaction and avräkningsnota after a manually confirmed trade.

The contract supports BUY and SELL trade references. Matching requires explicit trade reference fields such as side, ticker, instrument name, quantity, trade date, settlement date, and currency. Any broker reference must remain masked or safe.

## Modeled Route

1. Open Min ekonomi.
2. Open Transaktioner.
3. Filter or locate the transaction.
4. Match the transaction by trade reference.
5. Open the transaction detail panel.
6. Locate Avräkningsnota.
7. Open Avräkningsnota later.
8. Stop before document/PDF read.

## Current Boundary

This is fixture/model-only. Planned route steps are not executable yet.

No real Avanza navigation is implemented. No document/PDF read is implemented. No OCR is implemented. No value extraction is implemented. No reconciliation write is implemented. No cookies/session handling is implemented. No BankID automation is implemented. No Trade UI wiring is implemented. No API route wiring is implemented. This is not production ready.

The route contract prepares future note retrieval/extraction, but it does not activate reconciliation or writes.

## Extraction Schema And Mapping Follow-Up

Settlement extraction schema and reconciliation mapping now exist. Exact
cost/FX reconciliation is modeled but not applied.

The extraction schema defines future avräkningsnota targets for exact courtage,
FX/växelkurs, settlement amount, trade date, settlement date, quantity, price,
and currency. The reconciliation mapping previews future execution, trade
result, statistics/PnL, and audit metadata targets.

This still does not activate document reading, OCR, value extraction,
reconciliation writes, Supabase writes, Trade UI wiring, or API route wiring.

## Settlement Reconciliation Dry-Run Follow-Up

Settlement reconciliation now has a dry-run validation layer. It validates this
route contract together with the action contract, extraction schema, and
reconciliation mapping preview. The dry-run is fixture/model-only, requires
manual review, and stops before any write.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor Follow-Up

Settlement reconciliation now has a mock execution layer after dry-run. It uses
the route contract as modeled input and simulates transaction matching,
Avräkningsnota availability, masked/synthetic courtage, masked/synthetic
FX/växelkurs, masked/synthetic settlement amount, reconciliation preview, and
manual review.

It still does not activate real navigation, document reading,
PDF/download/read, OCR, real value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring. Exact cost/FX reconciliation
remains modeled/mock-only.
