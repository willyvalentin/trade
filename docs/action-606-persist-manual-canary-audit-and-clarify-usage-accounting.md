# Action 606 - Persist Manual Canary Audit and Clarify Usage Accounting

## Decision

`manual_canary_audit_and_usage_accounting_ready`

## Root Causes Addressed

Action 604 completed one bounded manual provider request and terminally finalized its claim. The receipt was rejected before audit insertion because the mapper and audit-table claim constraint only allowed claim linkage for `scheduled_shadow_collector_canary`. The same receipt was a legitimate `bounded_manual_proof` with a completed claim.

The existing scheduled daily usage value remained `0 / 0` because it intentionally reads only `scheduled_shadow_collector_canary` ledger entries. The Action 604 ledger entry was correctly `bounded_manual_proof`; this was a diagnostic scope distinction, not a capacity-accounting failure.

## Audit Contract

Bounded manual proof receipts may continue to omit claim metadata for generic, non-canary bounded proofs. A claim-linked manual receipt is accepted only when all of these facts are present and valid:

- terminal claim status: `completed` or `failed`
- deterministic `daily_claim_execution_id`
- `daily_claim_id` exactly derived from that execution identity
- execution identity deterministically derived from the receipt request fingerprint and UTC day
- constrained audit policy fields fixed at `377 / 57 / 320`

The manual execution route supplies this identity from its immutable atomic-admission binding. The audit mapper rejects partial, non-terminal, malformed, or mismatched linkage. Raw authorization tokens, lease credentials, hashes, provider payloads, URLs, and candle data remain excluded.

## Usage Accounting

The established scheduled-cap metric is unchanged and remains scoped to `scheduled_shadow_collector_canary` entries only. Read-only `usage_accounting` now reports four explicit UTC-day scopes:

- scheduled shadow collector attempts and estimated credits
- bounded manual proof attempts and estimated credits
- total ledger attempts and estimated credits
- claim-level capacity attempts and estimated credits

This keeps scheduled `0 / 0` from being mistaken for proof that no manual capacity was consumed. The usage reader makes no provider calls and performs no durable writes.

## Validation and Boundaries

The Action 604-equivalent fixture proves a terminal manual receipt persists with its exact claim linkage and shares a request fingerprint with its ledger record. Non-terminal or mismatched linkage fails closed. Scheduled and manual ledger entries are counted separately and never double-counted.

No production migration was applied, no Action 604 audit row was backfilled, and no authorization, lease, claim, provider call, flag, schedule, audit, or ledger mutation was performed for this Action.
