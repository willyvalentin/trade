# Avanza Settlement Reconciliation Mock Executor

## Current Status

The Avanza settlement reconciliation mock executor simulates the full
post-trade reconciliation path using simulated settlement state. It runs after
the dry-run validation layer and remains fixture/model only.

It simulates the full post-trade reconciliation path.
It includes transaction matching, Avräkningsnota, courtage mocked,
FX/växelkurs mocked, settlement amount mocked, reconciliation preview, and
manual review.

The mock executor supports BUY and SELL fixture paths. Both paths can reach a
manual review gate without enabling any real Avanza behavior.

## Simulated Path

The mock path models:

1. Min ekonomi visible
2. Transaktioner visible
3. transaction list visible
4. matching transaction visible
5. transaction detail panel visible
6. Avräkningsnota available
7. settlement note document visible as mock state only
8. courtage mocked
9. FX/växelkurs mocked
10. settlement amount mocked
11. reconciliation preview simulated
12. manual review required
13. stop before any reconciliation write

All settlement values are masked/synthetic only. No real values are read,
extracted, reconciled, or written.

## Implemented Surface

The pure helper lives in
`lib/avanza-settlement-reconciliation-mock-executor.ts`.

Static fixtures live in
`lib/avanza-settlement-reconciliation-mock-executor-fixtures.ts`.

The isolated harness lives in
`components/execution/AvanzaSettlementReconciliationMockExecutorHarness.tsx`.

The dev-only Avanza visual QA route renders the harness as fixture/model-only
visibility.

## Safety Boundary

The mock executor does not navigate Avanza, open real settlement notes, read
PDFs or documents, download files, use OCR, extract real values, apply
reconciliation, update trade results, update statistics, write audit metadata,
write Supabase records, read cookies, export sessions, automate BankID, bypass
BankID, or wire into Trade UI or API routes.
It does not read PDFs.

Safety flags remain locked:

- mock only
- simulated Avanza settlement state only
- values are masked/synthetic
- manual review required
- user must confirm
- controls disabled
- gate locked
- no real Avanza navigation
- no PDF/download/read
- no OCR
- no real value extraction
- no reconciliation write
- no Supabase write
- no cookies/session
- no BankID automation

## Not Production Ready

This layer is not production-ready. Exact cost/FX reconciliation remains
modeled/mock-only. The mock executor is a visibility and validation aid before
any separately approved real document intake or reconciliation-write phase.
## Sharp Semi Auto Execution Architecture Checkpoint

The settlement reconciliation mock executor is summarized in the Sharp Semi Auto Execution readiness map at `docs/avanza-execution-readiness-map.md`, with the full checkpoint in `docs/avanza-sharp-semi-auto-execution-architecture-checkpoint.md`.

Settlement reconciliation is model/dry-run/mock mature only and is not production ready. Exact PnL remains dependent on a future settlement local-dev signal/document binding plan before any real document reading, OCR, value extraction, reconciliation write, Supabase write, Trade UI execution wiring, or API route execution wiring.
