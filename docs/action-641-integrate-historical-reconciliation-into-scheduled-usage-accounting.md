# Action 641: Integrate Historical Reconciliation Units Into Scheduled Usage Accounting

## Purpose

Action 639 reconciled the verified Action 609 historical usage gap: two claim-capacity units, one ordinary bounded-manual ledger unit, and one append-only reconciliation unit. The scheduled usage read model still read only the ordinary ledger and claims, so it incorrectly reported an accounting disagreement.

This action makes the read model include valid historical reconciliation units in total accounted usage. It does not create, alter, or reclassify ledger rows.

## Read Model

`readContinuousIntelligenceShadowCanaryUsageAccounting` now reads, for the requested UTC day:

- ordinary credit-ledger rows;
- canary claim rows; and
- `ci_hur_reconciliations` rows.

The pure usage contract exposes a separate `historical_manual_usage_reconciliation` scope. `bounded_manual_proof` remains ordinary-ledger-only and `scheduled_shadow_collector_canary` remains scheduled-ledger-only.

`total_ledger` is now total accounted usage:

```text
ordinary ledger units + valid historical reconciliation units
```

Claim capacity remains derived exclusively from claim rows.

## Strict Reconciliation Validation

A reconciliation row counts only when it has all of the following:

- `usage_units = 1`;
- `provider_request_count_for_reconciliation = 0`;
- contract version `continuous_intelligence_shadow_canary_historical_usage_reconciliation_v1`;
- operation `historical_manual_usage_ledger_reconciliation`;
- record type `historical_manual_usage_reconciliation`;
- reason `verified_post_provider_receipt_identity_collision`;
- queried `historical_utc_day`;
- a bounded, internally consistent reconciliation identity; and
- either a canonical manual claim identity or the exact Action 609 claim/execution/audit triple.

Malformed rows, a wrong UTC day, a wrong contract/operation/reason, provider work attributed to reconciliation, or duplicate reconciliation identity/claim/audit/authorization evidence make the entire accounting result unavailable. The scheduled budget then remains fail-closed.

## Action 609 Result

For the verified production-shaped Action 609 state, the read model now reports:

| Scope | Attempts | Credits |
| --- | ---: | ---: |
| Claim capacity | 2 | 2 |
| Ordinary bounded manual proof | 1 | 1 |
| Historical reconciliation | 1 | 1 |
| Total accounted usage | 2 | 2 |

The scheduled budget no longer returns `usage_disagreement`. Because the day already contains two accounted attempts, the normal scheduled policy correctly returns `scheduled_attempt_limit_reached` for a prospective additional scheduled attempt.

## Safety

This is a read-only accounting change. It introduces no provider call, claim, audit, ledger, usage mutation, scheduler action, environment change, or execution enablement. Canary-disabled, kill-switch-active, schedule-inactive, and scheduled-execution-disabled defaults are unchanged.

## Validation

- Focused Action 641 coverage covers exact Action 609 state, no reconciliation, malformed/duplicate/wrong-day rows, invalid contract metadata, reconciliation provider-count violations, ordinary-day compatibility, and scheduled-budget behavior.
- Relevant Actions 621, 626–632, and 637 tests are run with the Action 641 suite.
- No migration is required because `ci_hur_reconciliations` is already deployed by the historical reconciliation schema.

## Next Step

Ship this read-only accounting release through the established review and release process, then perform a fresh production scheduled dry-run verification. Do not activate scheduled execution as part of this action.
