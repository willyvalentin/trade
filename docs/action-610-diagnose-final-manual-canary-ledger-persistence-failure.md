# Action 610 - Diagnose Final Manual Canary Ledger Persistence Failure

## Decision

`final_manual_canary_ledger_root_cause_identified`

## Exact Root Cause

Action 609 reached the ledger store after its audit had persisted. The ledger
entry did not fail audit, policy, provider, claim, permission, or table
readiness validation. It collided with the existing Action 604 ledger identity.

The canonical canary receipt identifier is derived only from the bounded
request fingerprint. Both attempts used the same completed AAPL `5min`
30-minute request range, so the Action 609 receipt reused the Action 604
receipt identity. The ledger derives both unique keys from that identity:

- `source_receipt_id` is the receipt identifier; and
- `ledger_entry_id` is `credit_ledger_<receipt identifier>`.

Read-only production comparison proved both unique keys and the request
fingerprint collide with the legacy ledger row. The new audit is terminally
`completed`; the legacy ledger row has a different `generated_at` and records
`durable_audit_persisted: false`.

## Persistence Path

The manual route builds and persists a sanitized `bounded_manual_proof` audit,
then passes the same receipt to `persistContinuousIntelligenceCreditLedger`.
The ledger builder produces the fixed `377 / 57 / 320` policy, one estimated
credit, one normal-capacity proof credit, zero reserve use, and the audit
persistence fact.

The new Action 609 audit confirms all of the ledger builder's planner inputs
are valid:

- requested credits: `1`;
- allocated credits: `1`;
- executable credits: `1`;
- provider request count: `1`;
- estimated credits: `1`;
- hard reserve preserved: `true`; and
- execution-ready reserve consumed: `false`.

The database insert therefore reaches a duplicate-key branch. The ledger store
handles PostgreSQL `23505` by reading the existing row and requiring bytewise
entry equality. That comparison is intentionally false here because the old
row has a different generated timestamp and `durable_audit_persisted: false`,
whereas Action 609's receipt has a newly persisted audit. The store returns the
safe `validation_failed` persistence result rather than overwriting the old
ledger row. The execution route exposes only `persisted: false`, so no raw
PostgREST error or specific unique-constraint name was retained.

## Eliminated Causes

- **ACL or table availability:** the prior ledger row is readable and the
  same service-role path persisted the new audit row.
- **Entry kind or policy:** both rows are `bounded_manual_proof` and the new
  audit proves the exact `377 / 57 / 320` policy.
- **Claim or audit linkage:** the new audit has the exact terminal Action 609
  claim linkage and one provider request.
- **Provider, timestamp, or credit values:** the Action 609 receipt and audit
  passed their strict mapper contracts before ledger insertion.

## Production Containment

Read-only production state after Action 609 remains contained:

- Action 609 authorization and lease: consumed once, with no active pair;
- Action 609 claim: one terminal `completed` claim with one provider attempt;
- Action 609 audit: one persisted linked `bounded_manual_proof` row;
- Action 609 ledger: zero matching new row;
- legacy Action 604 ledger: one distinct historical row only;
- nonterminal claims: `0`;
- canary: disabled;
- kill switch: active; and
- schedules: inactive.

No new credential, provider call, claim, audit, ledger write, flag, schedule,
or production mutation was performed for this diagnosis.

## Follow-Up Boundary

Any correction must give each admitted attempt a unique ledger/audit linkage
identity while preserving durable idempotency for retries of that *same*
attempt. It must not backfill or mutate either historical attempt without a
separately approved action.
