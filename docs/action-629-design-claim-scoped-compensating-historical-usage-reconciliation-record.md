# Action 629 - Design Claim-Scoped Compensating Historical Usage Reconciliation Record

## Status

`claim_scoped_historical_usage_reconciliation_schema_required`

## Background and scope

Action 628 established that Action 609 is a distinct, completed manual attempt with confirmed provider usage and a linked audit, but without a ledger row. The old market-contract receipt identity collided with Action 604's existing ledger identity. Action 617 is a later distinct attempt with an attempt-scoped receipt, linked audit, and linked ledger. The current production-shaped state remains claim capacity `2`, persisted ledger `1`, and fail-closed `usage_disagreement`.

This action designs and locally verifies only the future reconciliation contract. It performs no production request, provider call, claim/audit/ledger write, usage mutation, migration, deployment, configuration change, schedule activation, or data repair.

## Historical target and eligibility

The only eligible target is a canonical manual Action 609-shaped claim. Eligibility requires all of the following:

- canonical manual claim namespace and exact operator-authorized target claim;
- terminal `completed` state and confirmed provider usage;
- a durable audit whose claim linkage exactly matches the target;
- no normal claim-scoped ledger record and no prior reconciliation record;
- verified receipt-identity-collision ledger failure;
- no duplicate-attempt evidence and no scheduled, dry-run, synthetic, malformed, or unknown state;
- exact precondition `claim_capacity = 2`, `persisted_ledger = 1`, verified provider usage `= 2`, and delta `= 1`.

Unknown or malformed evidence fails closed. A missing ledger by itself is never eligible. Action 604 cannot be used as the target because it already has its normal ledger representation; Action 617 cannot be used because it already has both normal audit and ledger evidence.

## Identity and authorization

The reconciliation identity is:

`historical_manual_usage_reconciliation:<contract-version>:<canonical-claim-id>`

It contains the complete durable, non-secret claim ID and the reconciliation contract version. It is deterministic for one target claim, distinct across claims, and cannot collide with ordinary receipt IDs, which remain in their own namespace. It contains no raw authorization token, lease ID, provider payload, timestamp-only nonce, or market-contract-only fingerprint.

The future one-time authorization contract must bind:

- operation `historical_manual_usage_ledger_reconciliation`;
- exact target claim and source audit IDs;
- reconciliation identity and contract version;
- exact expected precondition `2 / 1 / 1`;
- sanitized operator identity, reason, deployment binding, issue/expiry timestamps, and durable-mutation acknowledgment;
- issued/consumed/revoked/expired state.

The same authorization cannot target another claim. A future atomic server-side transaction must reject stale preconditions, expired/reused authorization, mismatched audit linkage, existing reconciliation identity, and all non-eligible state before inserting anything.

## Future ledger and audit contracts

The compensating record is an append-only accounting event, not a provider execution:

- record type: `historical_manual_usage_reconciliation`;
- target historical claim, source audit, original execution identity, and reconciliation identity;
- usage units exactly `1`;
- provider `twelve_data`, but `provider_request_count_for_reconciliation: 0`;
- exact failure reason `verified_post_provider_receipt_identity_collision`;
- authorization, historical-event, repair-persistence, and deployment facts.

It must be accompanied by a separate reconciliation audit record containing the expected and observed before-state, resulting identity/delta, final decision, operator authorization, and deployment binding. It must not modify the original execution audit, historical claim, or Action 604 ledger row.

## Idempotency, concurrency, and required persistence

The same claim and reconciliation contract always derive the same identity. The future persistence operation requires:

1. a dedicated append-only reconciliation ledger/audit schema, or equivalent explicitly typed extension;
2. unique constraint on reconciliation identity and target claim;
3. unique reconciliation-audit identity;
4. service-role-only atomic RPC that validates authorization, live preconditions, eligibility, and inserts audit plus ledger in one transaction;
5. an idempotent exact retry response, while a new authorization for an already reconciled claim returns typed already-reconciled without a second usage unit.

The current credit-ledger contract only permits `bounded_manual_proof` and `scheduled_shadow_collector_canary`, and keys normal records by execution receipt. It cannot truthfully store this distinct record type without schema work. Action 630 must therefore add a dedicated schema/migration and atomic RPC locally before any production repair is considered.

## Readback and aggregation semantics

Before repair: claim capacity `2`, normal execution ledger `1`, reconciliation records `0`, internal cause `missing_ledger_after_verified_provider_usage`, and readiness blocked.

After one proven repair: claim capacity remains `2`; normal execution records remain unchanged; reconciliation records equal `1`; total accounted usage equals `2`; Action 609 has exactly one reconciliation representation; Action 617 retains exactly one normal execution representation. No provider call occurs during repair.

Usage accounting must expose normal execution ledger usage separately from historical reconciliation usage and their combined durable accounting total. Scheduled usage remains separate and unchanged. A historical repair is not a new current-day provider call and must never increment scheduled attempts, live provider budget use, or claim admission capacity.

## Security and failure handling

No automatic reconciliation is permitted from a count mismatch. No claim exclusion is permitted for Action 609 because provider usage is confirmed. An existing reconciliation identity, stale aggregate/audit state, malformed evidence, or any database uncertainty blocks the operation without writes. A reversal, if ever required, must be a separately authorized append-only corrective event; deletion or mutation of historical records is forbidden.

## Local implementation and validation

Created:

- `lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract.ts`
- `tests/e2e/action-629-claim-scoped-historical-usage-reconciliation-design.spec.ts`

The pure implementation provides eligibility evaluation, claim-scoped identity construction, strict authorization validation, compensating ledger/audit builders, and post-reconciliation invariant verification. Tests cover eligibility failures, identity separation, authorization binding/expiry, zero-provider compensating records, idempotency semantics, before/after readback, Action 628 root-cause retention, and scheduled isolation.

## Production and next action

Action 609 remains unreconciled. Claim capacity remains `2`; durable ledger remains `1`; `usage_disagreement` remains blocking. Scheduled execution/live-shadow and canary remain disabled, the kill switch remains active, and no schedule is active.

Recommended next action: **Action 630 - Add Atomic Historical Usage Reconciliation Persistence Schema**. It should add the dedicated append-only schema and service-role-only atomic RPC locally, with isolated database validation. It must not apply a production migration or repair historical production state without a later explicit authorization.

## Release assessment

This is a self-contained local design checkpoint. Commit after validation. Production deployment must wait for the separate schema/RPC implementation, scoped release review, and an explicit one-time production reconciliation authorization.
