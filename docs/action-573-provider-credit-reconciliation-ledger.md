# Action 573: Provider Credit Reconciliation Ledger

## Purpose

The first bounded proof made one provider request with an estimated cost of one
credit, but Twelve Data did not report its actual charged cost. The ledger keeps
planner allocation, estimate, provider report, and independently verified usage
as different facts. An absent provider report stays `null`; it is never promoted
to a verified one-credit charge.

## Reconciliation

`not_chargeable` applies when no provider request began and records zero charge.
`estimated_only` means a request began, no actual usage was supplied, and both
reconciled and charged credits remain unknown. `provider_reported` and
`verified_from_provider_usage_snapshot` require an explicit accepted value.
Conflicting estimate/report/evidence is `conflict_requires_review`; timeout and
failed attempts without usage evidence are `reconciliation_unavailable`.

The current contract fixes the Action 565 policy facts at total `377`, hard
reserve `57`, and normal planned maximum `320`. Current bounded proof entries
always charge `0` reserve credits and preserve the execution-ready reserve.

## Storage and Safety

The migration creates `continuous_intelligence_credit_ledger`, an RLS-enabled
table holding only sanitized identifiers, bounded credit facts, reconciliation
state, planner provenance, and no-effect booleans. It excludes candles/OHLCV,
raw provider payloads, authorization values, secrets, URLs, stack traces, logs,
and arbitrary errors.

`TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED` is independent of the
Action 568 execution and Action 572 audit flags. It is disabled unless exactly
`true` or `1`. An enabled entry is written once only after receipt creation and
the optional audit attempt. A ledger failure neither retries the provider/audit
nor changes the proof result.

## Readback and Reconciliation

Authenticated GET readback is available at
`/api/automation/continuous-intelligence/credit-ledger`; it returns one exact
source receipt, one exact ledger entry, or the latest entry. Authenticated POST
reconciliation is available at `/credit-ledger/reconcile` and accepts only a
fixed provider-usage-snapshot evidence shape. Stronger verified evidence may
replace an estimated-only state; weaker or conflicting evidence never overwrites
the existing row.

No provider polling, cache mutation, scheduling, execution, broker action, or
client route invocation is introduced. Rollback disables the ledger flag.
Recommended Action 574 is separately authorized migration application and a
read-only production ledger verification before any evidence reconciliation.
