# Avanza Settlement Note Action Contract

The Avanza settlement note action contract models the future action plan for reaching an avräkningsnota from a ready settlement-note route contract.

It supports BUY and SELL references through the route contract. Matching transaction actions remain model/read-only. Avräkningsnota location is modeled, but the note is not read in this task.

## Modeled Actions

1. Click Min ekonomi later.
2. Click Transaktioner later.
3. Filter transactions later.
4. Locate matching transaction.
5. Open transaction detail panel later.
6. Locate Avräkningsnota.
7. Open Avräkningsnota later.
8. Stop before document read.

## Current Boundary

This is fixture/model-only and contract-only. Planned actions are not executable yet.

No real Avanza navigation is implemented. No document/PDF read is implemented. No OCR is implemented. No value extraction is implemented. No reconciliation write is implemented. No cookies/session handling is implemented. No BankID automation is implemented. No Trade UI wiring is implemented. No API route wiring is implemented. This is not production ready.

The action contract prepares future note retrieval/extraction, but it does not activate reconciliation or writes.

## Extraction Schema And Mapping Follow-Up

Settlement extraction schema and reconciliation mapping now exist. Exact
cost/FX reconciliation is modeled but not applied.

The schema models courtage, FX/växelkurs, settlement amount, trade date,
settlement date, quantity, price, and currency as future avräkningsnota
extraction targets. The mapping previews future execution, trade result,
statistics/PnL, and audit metadata targets.

This still does not activate document reading, OCR, value extraction,
reconciliation writes, Supabase writes, Trade UI wiring, or API route wiring.

## Settlement Reconciliation Dry-Run Follow-Up

Settlement reconciliation now has a dry-run validation layer. It validates this
action contract together with the route contract, extraction schema, and
reconciliation mapping preview. The dry-run is fixture/model-only, requires
manual review, and stops before any write.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor Follow-Up

Settlement reconciliation now has a mock execution layer after dry-run. It uses
the action contract as modeled input and simulates the post-trade path through
matching transaction, transaction detail, Avräkningsnota availability,
masked/synthetic settlement values, reconciliation preview, and manual review.

It still does not activate real navigation, document reading,
PDF/download/read, OCR, real value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring. Exact cost/FX reconciliation
remains modeled/mock-only.
