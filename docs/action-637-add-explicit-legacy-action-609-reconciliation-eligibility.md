# Action 637: Explicit Legacy Action 609 Reconciliation Eligibility

## Decision

Local implementation is ready for a separately reviewed production release and migration. This action made no production request, migration, deployment, or durable change.

## Background

The historical-usage reconciliation contract originally accepted only canonical manual claim identifiers. The verified Action 609 evidence is a completed bounded manual proof, but its pre-claim identity predates that canonical form. The existing contract correctly failed closed rather than reconciling it through a broad legacy exception.

## Explicit Target

The only legacy compatibility target is the immutable triple below:

| Field | Value |
| --- | --- |
| Claim | `canary_claim_canary_execution_20260723_8feacb91` |
| Execution | `canary_execution_20260723_8feacb91` |
| Source audit / receipt | `canary_receipt_AAPL_5min_2026-07-22T19-30-00.000Z_2026-07-22T20-00-00.000Z` |

It is not derived from ticker, interval, date range, client input, or credentials. It remains bound to completed provider-success evidence, exact source-audit linkage, legacy receipt-identity-collision evidence, and the exact `2 / 1 / 0 / 1` accounting state.

## Contract Changes

`lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract.ts` now:

- keeps the canonical manual claim-ID rule unchanged;
- classifies targets as canonical, the exact Action 609 legacy target, unsupported legacy, or malformed;
- allows the legacy target only when every claim, execution, and audit identifier matches exactly;
- returns `ineligible_unsupported_legacy_target` for every other `canary_claim_canary_execution_*` value;
- derives the existing deterministic reconciliation identity only for an approved canonical or exact legacy target; and
- validates authorization against the eligibility-produced exact target, audit, and reconciliation identity rather than a second divergent regex.

Action 604 (`canary_claim_canary_execution_20260722_d827c872`) remains blocked. A correct Action 609 claim with a wrong execution or audit identity also remains blocked. Canonical Action 617-shaped input still classifies as canonical but remains ineligible when its ordinary ledger representation is already present.

## SQL Follow-up Migration

`supabase/migrations/20260723003000_allow_explicit_legacy_action_609_historical_usage_reconciliation.sql` replaces `ci_hur_issue` and `ci_hur_reconcile` with one shared target policy:

- canonical manual claim regex; or
- the exact Action 609 claim, execution, and receipt triple.

Both RPCs re-check the full target policy from the durable claim row. The legacy target additionally requires `provider_success_with_candles`, a matching completed bounded-manual audit, a legacy ledger row with `durable_audit_persisted = false`, a different ledger/audit generation time, no target claim-scoped ledger, and the exact precondition state.

The RPCs retain service-role-only execution. Helper predicates are not callable by service role or public roles. The reconciliation RPC holds an advisory transaction lock and returns exactly one row on the idempotent branch.

## Local PostgreSQL 16 Acceptance

A disposable local PostgreSQL 16 container applied migrations `20260723002000` then `20260723003000` successfully. It verified:

- exact Action 609 issuance: `issued`;
- exact Action 609 reconciliation: `reconciliation_applied`, with ordinary `1`, reconciliation `1`, total `2`;
- two concurrent identical reconciliation calls: exactly one `reconciliation_applied` and one `reconciliation_already_applied` row;
- one reconciliation and one reconciliation audit after commit;
- an injected rollback leaves zero reconciliations and zero reconciliation audits;
- Action 604 and a random legacy claim fail issuance as malformed;
- wrong Action 609 execution fails the SQL target predicate;
- canonical Action 617-shaped input remains blocked by its existing ledger/accounting state;
- `anon` and `authenticated` lack RPC execution while `service_role` retains it.

The first local acceptance pass exposed a missing `return` after the idempotent `return query` branch. The migration and regression test were corrected before the final acceptance run.

## Validation

- Focused Actions 628–632 and 637 Playwright checks: 30 passed.
- `npx next typegen`, `npx tsc --noEmit`, and scoped ESLint: passed.
- Disposable PostgreSQL 16 migration acceptance, rollback, and two-session concurrency: passed.
- `npm run build` and `git diff --check`: passed.

## Scope and Next Step

No generic legacy allowlist, wildcard, production mutation, provider call, schedule action, ordinary-ledger update, or historical backfill is included. The existing production records remain untouched.

The next operation requires a separately reviewed, SHA-preserving release and application of `20260723003000`, followed by a fresh production preflight before any one-time authorization or reconciliation.
