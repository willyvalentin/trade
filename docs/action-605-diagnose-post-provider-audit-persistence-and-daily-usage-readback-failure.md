# Action 605 - Diagnose Post-Provider Audit Persistence and Daily Usage Readback Failure

## Scope

This was a read-only diagnosis of the single Action 604 production attempt. No
authorization, lease, execution, provider, claim, audit, ledger, flag, or
schedule operation was performed.

## Production Evidence

Sanitized production readback confirms:

- one consumed authorization and one consumed lease, with no active pair;
- one `completed` claim, with `provider_attempted: true` and no dangling
  `claimed` or `attempted` state;
- zero audit rows;
- one `bounded_manual_proof` ledger row with one provider request, one
  estimated credit, one proof credit, exact `377 / 57 / 320` policy values,
  `provider_success_with_candles`, and `durable_audit_persisted: false`;
- canary disabled, kill switch active, and schedule inactive.

## Audit Root Cause

Classification: `payload contract conflict`, detected by application-side
validation before any PostgREST insert.

The canonical manual-execution route creates a receipt with:

```text
entry_kind: bounded_manual_proof
daily_claim_id: <admitted claim>
daily_claim_status: completed
```

The audit mapper rejects this exact combination in
`mapBoundedShadowCollectorProofAuditReceipt()`:

```text
bounded_manual_proof requires daily_claim_id and daily_claim_status to be null
```

The corresponding database constraint,
`bounded_shadow_collector_proof_audits_claim_kind_check`, enforces the same
rule. Therefore the precise persistence result is sanitized
`validation_failed`; no audit insert, PostgREST database status, RPC response,
or ACL failure was reached. The route then persists the ledger with
`durable_audit_persisted: false` and returns HTTP `502`.

The conflict is semantic: the Action 583/585 atomic manual path legitimately
admits a daily claim, while the older audit contract models
`bounded_manual_proof` as detached from claims. Relabeling it as a scheduled
canary would be false provenance, so it is not a valid remediation.

## Daily Usage Root Cause

Classification: `source-filter mismatch`.

`readContinuousIntelligenceCanaryDailyUsage()` reads the credit ledger, not the
claim table, using the UTC `[start, end)` generated-at window. Its database
adapter explicitly filters:

```text
entry_kind = scheduled_shadow_collector_canary
```

It then counts those filtered rows and sums only their
`provider_estimated_credits`. The Action 604 row is correctly labeled
`bounded_manual_proof`, so it is excluded and the preflight readback returns
`0 / 0`.

The result is not a timezone, cache, schema-reload, failed insert, or provider
credit aggregation issue. It is an intentional scheduled-only query being
reused by the manual-canary preflight/context. The claim table independently
shows one estimated credit and continues to enforce the daily claim cap, but
the displayed/preflight usage does not reconcile that manual admitted attempt.

## Required Follow-Up

The next remediation must make audit claim linkage truthful for an atomic
manual execution without changing the entry kind, and must use a clearly named
authoritative usage source for manual attempts. It should preserve strict
source provenance, daily limits, one-request bounds, and the no-effect
boundaries. It must not replay Action 604 or create another provider request.

## Decision

`post_provider_audit_and_usage_root_causes_identified`
