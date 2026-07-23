# Action 628 - Define and Validate Historical Manual Usage Reconciliation Policy

## Status

`historical_manual_ledger_persistence_failure_verified_repair_policy_required`

## Scope

This is a local, read-only evidence and policy action. It does not query or mutate production, invoke a provider, change accounting, repair history, alter scheduled readiness, change configuration, or deploy. The existing `usage_disagreement` remains fail-closed.

## Historical disagreement

The current production-shaped UTC-day readback is `claim_capacity: 2` and `total_ledger: 1`. These are two distinct manual admitted attempts, not scheduled rows, test fixtures, rejected admissions, or a retry of one authorization/lease pair.

| Record | Claim | Terminal state | Provider reached | Audit | Ledger | Expected usage effect |
| --- | --- | --- | --- | --- | --- | --- |
| Action 604 predecessor | distinct historical manual claim | completed | confirmed | absent due to then-known audit mapping failure | persisted | one durable manual ledger credit on its own historical day |
| Action 609 | distinct manual claim | completed | confirmed | persisted and linked | missing unexpectedly | one actual manual provider-use unit without a matching ledger entry |
| Action 617 | distinct attempt-scoped manual claim | completed | confirmed | persisted and linked | persisted and linked | one current-day manual provider-use and ledger unit |

Action 609 reused the pre-Action-611 receipt identity for the same AAPL/5min/30-minute range as Action 604. Its ledger insert met the existing Action 604 ledger unique keys and correctly refused to overwrite a non-equivalent row. Action 611 changed future manual receipt identity to be claim-scoped; it did not backfill Action 609. This is a verified post-provider ledger persistence failure, not a pre-ledger execution or an audit failure.

## Lifecycle reconstruction

| Stage | Action 609 | Action 617 |
| --- | --- | --- |
| Authorization and lease | confirmed | confirmed |
| Atomic consumption and claim admission | confirmed | confirmed |
| Provider attempt | confirmed, one request | confirmed, one request |
| Terminal claim | confirmed, completed | confirmed, completed |
| Durable audit | confirmed and linked | confirmed and linked |
| Durable ledger | missing unexpectedly after identity collision | confirmed and linked |
| Usage readback | claim capacity only | claim capacity and manual ledger |

No raw credentials, credential hashes, provider payloads, or sensitive production identifiers are represented in this evidence.

## Semantics and source hierarchy

`claim_capacity` counts every durable admitted claim for the queried UTC day, regardless of terminal provider result. It is admission accounting and a conservative upper bound, not authoritative actual billing or proof that every row reached the provider.

The credit ledger is authoritative persisted accounting: a row records an immutable, receipt-linked usage event. A ledger row is not the sole source of truth for whether a provider request happened, because a verified persistence failure can leave it absent.

The authoritative hierarchy is:

1. Actual provider usage: a sanitized terminal receipt/audit showing one provider attempt and completed provider result.
2. Admitted capacity: the durable claim, used as a conservative upper bound when provider usage cannot be safely excluded.
3. Persisted accounting: an immutable ledger record, used for durable accounting and usage reporting.
4. Readiness: the conservative maximum and an exact reconciliation policy; any unexplained disagreement remains blocked.

For Action 609, provider usage is confirmed, admitted capacity is one unit, and persisted accounting is missing. For Action 617, all three sources agree. The combined `2 / 1` result is therefore a real integrity disagreement and cannot be cleared by lowering claim capacity or treating the existing Action 604 ledger row as Action 609's ledger.

## Reconciliation alternatives

| Option | Assessment |
| --- | --- |
| A. Permanent disagreement | Safe but leaves scheduled rollout blocked indefinitely. |
| B. Legacy classification | Incorrect: Action 609 occurred under a ledger-required contract and failed persistence. |
| C. Append-only compensating ledger | Recommended future repair, subject to separate design and production approval. |
| D. Operator acknowledgment | Could be useful as an audit adjunct, but cannot replace immutable accounting. |
| E. Data repair/migration | Too broad for this known single missing record; no migration is justified yet. |
| F. Claim exclusion | Prohibited by evidence: Action 609 reached the provider and completed. |

## Chosen policy

The typed pure evaluator classifies the evidence as `missing_ledger_after_verified_provider_usage` and keeps readiness `blocked`. The public scheduled budget result may remain `usage_disagreement`, but the internal cause is now preserved rather than flattened.

The recommended future correction is an **append-only compensating reconciliation ledger record** for the verified Action 609 claim. It must be a separately authorized Action 629. Its identity must be derived from the immutable admitted claim identity plus a versioned reconciliation policy identifier, never from a raw token, a lease ID, a timestamp alone, or the old execution receipt identity. It must be idempotent, carry an explicit reason/source, leave Actions 604 and 617 unchanged, and never be used to mask unknown provider usage. A reversal must also be append-only and separately authorized.

No durable mutation, operator acknowledgment, migration, or repair is authorized by Action 628. Until a later policy record/ledger entry is designed, tested, explicitly approved, and verified, readiness remains blocked and scheduled usage is not allowed to proceed.

## Code and tests

Created:

- `lib/continuous-intelligence-shadow-canary-historical-manual-usage-reconciliation.ts`
- `tests/e2e/action-628-historical-manual-usage-reconciliation-policy.spec.ts`

The pure evaluator distinguishes balanced, verified legacy, verified non-usage, duplicate, missing post-provider ledger, unknown, audit disagreement, unavailable, and malformed historical state. It has no database, provider, route, writer, or runtime-accounting import.

Focused tests cover balanced state, verified pre-ledger history, post-provider ledger failure, pre-provider non-usage, unknown evidence, duplicate attempts, distinct attempts, manual/scheduled isolation, malformed data, and the production-shaped `2 / 1` fixture.

## Production state and next action

Action 628 performed zero production requests, provider calls, claims, audit writes, ledger writes, usage changes, environment changes, schedule changes, or deployments. Scheduled execution/live-shadow and canary remain disabled; the kill switch remains active.

Recommended next action: **Action 629 - Design Idempotent Historical Usage Reconciliation Record**. It should remain local and define the exact append-only record contract, idempotency key, operator approval boundary, and verification plan before any production mutation.

## Release assessment

The policy/evidence changes form a coherent local checkpoint with Actions 626-628. Commit the local diagnostic and policy work after validation. Production deployment must wait for the separate, explicitly approved reconciliation design and for deployment-identity configuration remediation.
