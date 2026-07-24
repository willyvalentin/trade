# Avanza Settlement Reconciliation Dry-Run Executor

## Current Status

The Avanza settlement reconciliation dry-run executor validates the modeled
post-trade settlement reconciliation path for the Sharp Semi Auto Execution
Agent. It is fixture/model only and dry-run only.

The simulated path is:

1. executed trade reference
2. settlement note route contract
3. settlement note action contract
4. extraction target schema
5. reconciliation mapping preview
6. manual review required
7. stop before any reconciliation write

## What It Validates

The dry-run checks that the route contract, action contract, extraction schema,
and reconciliation mapping preview are coherent enough to describe a future
settlement reconciliation path.

Dry-run validates settlement route/action/schema/mapping coherence.
It simulates the full post-trade reconciliation path.

It supports BUY and SELL fixture paths. It also makes the expected extraction
targets visible:

- courtage
- FX/växelkurs
- settlement amount/likvidbelopp
- quantity
- execution price
- trade date
- settlement date
- currency

The expected reconciliation targets remain modeled only:

- execution record metadata
- trade result fields
- statistics/PnL fields
- audit metadata

## Safety Boundary

The dry-run executor does not navigate Avanza, open settlement notes, read PDFs
or documents, use OCR, extract values, apply reconciliation, update Ture trades,
or write Supabase records.

It does not navigate Avanza.
It does not read PDF/documents.
It does not use OCR.
It does not extract values.
It does not write reconciliation.
It does not write Supabase records.

All active capabilities remain disabled:

- no real Avanza navigation
- no PDF/download/read
- no OCR
- no value extraction
- no reconciliation write
- no Supabase write
- no cookies/session handling
- no BankID automation or bypass
- no Trade UI wiring
- no API route wiring

Manual review is always required, the user must confirm before any future
apply step, controls remain disabled, and the gate remains locked.

## Not Production Ready

This layer is not production-ready. It is a dry-run validation layer only. Exact
cost/FX reconciliation remains modeled only, and no document
reading/extraction/writes are active.

## Settlement Reconciliation Mock Executor Follow-Up

Settlement reconciliation now has a mock execution layer after dry-run in
`lib/avanza-settlement-reconciliation-mock-executor.ts`.

The mock layer simulates the full post-trade reconciliation path with simulated
settlement state: Min ekonomi, Transaktioner, transaction matching,
Avräkningsnota availability, masked/synthetic courtage, masked/synthetic
FX/växelkurs, masked/synthetic settlement amount, reconciliation preview, and
manual review.

It still does not activate real Avanza navigation, document reading,
PDF/download/read, OCR, real value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring. Exact cost/FX reconciliation
remains modeled/mock-only.
