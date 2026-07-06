# Avanza Settlement Note Extraction Schema

## Current Status

The Avanza settlement note extraction schema defines the values Ture must later extract from an Avanza `Avräkningsnota`. It is fixture/model only.

No real settlement note navigation, PDF/download/read, OCR, value extraction, reconciliation write, Supabase write, Trade UI wiring, or API route wiring is implemented.

No real PDF/download/read is implemented. No reconciliation writes are implemented.

## Values To Extract

The schema targets the exact settlement-note values needed after a BUY/SELL order has finalized:

- trade date and settlement date
- side, instrument name, ticker, ISIN, market, and currency
- quantity and execution price
- gross amount
- exact courtage
- FX/växelkurs and FX fee when present
- settlement amount, total cost, and net amount
- account label only as masked/safe display metadata
- broker reference and settlement note reference

Exact courtage, FX/växelkurs, and settlement amount matter because the final Avanza values can differ from pre-submit estimates and affect cost basis, realized PnL, and audit metadata.

Those values are intended for a future reconciliation preview that can map
exact costs into execution metadata, trade result fields, statistics/PnL, and
audit metadata.

## Safety Boundary

Every extraction target has `extractedInThisTask: false`.

The schema keeps these capabilities false:

- `canReadSettlementDocument`
- `canDownloadPdf`
- `canUseOcr`
- `canExtractValues`
- `canWriteTradeReconciliation`
- `canWriteSupabase`
- `canReadCookies`
- `canExportSession`
- `canAutomateBankId`
- `canBypassBankId`
- `controlsEnabled`

Manual review and final human confirmation remain required, and the gate remains locked.

## Not Production Ready

This layer is not production-ready. It only describes extraction targets so a future approved phase can implement controlled settlement note reading and manual-reviewed reconciliation.

## Settlement Reconciliation Dry-Run Follow-Up

Settlement reconciliation now has a dry-run validation layer. It consumes this
schema as a modeled input only and verifies that courtage, FX/växelkurs,
settlement amount, trade/settlement dates, quantity, price, and currency can
flow toward the reconciliation mapping preview.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor Follow-Up

Settlement reconciliation now has a mock execution layer after dry-run. It uses
the extraction schema as modeled input and simulates masked/synthetic
settlement values for courtage, FX/växelkurs, settlement amount, trade date,
settlement date, quantity, execution price, and currency.

It still does not activate real navigation, document reading,
PDF/download/read, OCR, real value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring. Exact cost/FX reconciliation
remains modeled/mock-only.
