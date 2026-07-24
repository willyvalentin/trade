# Avanza Settlement Reconciliation Mapping

## Current Status

The Avanza settlement reconciliation mapping defines how future extracted `Avräkningsnota` values would map into Ture reconciliation targets. It is fixture/model only and produces a reconciliation preview only.

No real PDF/download/read, OCR, value extraction, reconciliation write, Supabase write, Trade UI wiring, or API route wiring is implemented.

No reconciliation writes are implemented.

## Mapping Purpose

The mapping connects future exact settlement-note values to these Ture target areas:

- execution record metadata for trade identity and execution timing
- trade result fields for exact executed price, gross amount, courtage, and settlement amount
- statistics/PnL fields for FX, cost basis, total cost, net amount, and future realized PnL adjustment
- audit metadata for note reference and reconciliation status

Exact courtage, FX/växelkurs, and settlement amount are modeled because they are finalized after the order and must later reconcile estimates against Avanza's official settlement note.

## Safety Boundary

Every reconciliation field has `mappedInThisTask: false` and `writesInThisTask: false`.

The mapping keeps these capabilities false:

- `canApplyReconciliation`
- `canWriteExecutionRecord`
- `canWriteTradeResult`
- `canWriteStatistics`
- `canWriteAuditMetadata`
- `canWriteSupabase`
- `canReadSettlementDocument`
- `canUseOcr`
- `controlsEnabled`

Manual review and user confirmation remain required, and the gate remains locked.

## Not Production Ready

This layer is not production-ready. It previews future reconciliation targets only and does not activate document reading, extraction, or writes.

## Settlement Reconciliation Dry-Run Follow-Up

Settlement reconciliation now has a dry-run validation layer. It consumes this
mapping preview as a modeled input only, simulates the manual review gate, and
stops before reconciliation writes.

Exact cost/FX reconciliation remains modeled only. No document reading,
PDF/download/read, OCR, value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring is active.

## Settlement Reconciliation Mock Executor Follow-Up

Settlement reconciliation now has a mock execution layer after dry-run. It uses
the reconciliation mapping as modeled input and simulates a reconciliation
preview after masked/synthetic settlement values are present. The path still
stops at manual review and before any write.

It still does not activate real navigation, document reading,
PDF/download/read, OCR, real value extraction, reconciliation writes, Supabase
writes, Trade UI wiring, or API route wiring. Exact cost/FX reconciliation
remains modeled/mock-only.
