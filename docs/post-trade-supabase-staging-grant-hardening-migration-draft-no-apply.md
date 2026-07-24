# Post-Trade Supabase Staging Grant-Hardening Migration Draft, No Apply

## Summary

Purpose: create a source-controlled no-apply migration draft that hardens broad staging grants for post-trade and execution persistence tables.

Result: grant-hardening migration draft is ready for static review. It was not applied.

Decision: `post_trade_supabase_staging_grant_hardening_migration_draft_ready_no_apply`.

## Target Context

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Production remains blocked.

## Input Warning

Action 427 read-only catalog verification found:

- expected baseline tables exist
- expected execution and post-trade tables exist
- RLS and policy posture match migration/static evidence
- live grant metadata is broad for `anon`, `authenticated`, and `service_role`
- broad grant metadata includes post-trade persistence tables

Action 428 recommended a no-apply grant-hardening migration draft as the safest next step.

## Draft Migration

New migration draft:

```text
supabase/migrations/20260708001000_harden_post_trade_execution_grants_draft.sql
```

Ordering:

- after `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql`

Scope:

- grant hardening only
- no apply
- no data writes
- no RLS weakening
- no permissive policies
- no runtime/API/Trade UI write path

## Tables Targeted

Post-trade persistence tables:

- `public.execution_confirmation_evidence`
- `public.execution_settlement_reviews`
- `public.execution_cost_breakdowns`
- `public.execution_deviation_reviews`
- `public.execution_learning_candidates`
- `public.execution_redacted_artifacts`

Execution persistence table:

- `public.execution_record_audit_events`

These are the intended persistence tables where broad client grant posture should be narrowed before any write-path readiness gate.

## Least-Privilege Posture

The draft:

- revokes all table privileges from `anon`
- revokes all table privileges from `authenticated`
- preserves `service_role` table capability for future gated server-side flows only
- does not add policies
- does not alter policies
- does not disable RLS
- does not touch unrelated baseline/legacy tables

Current effective safety remains:

- post-trade RLS is enabled
- post-trade policies remain zero/future-gated
- runtime/API/UI write paths remain inactive

## Tables Not Touched

The draft does not touch:

- legacy baseline tables
- recommendation snapshot/outcome/scan/batch tables
- execution foundation run/progress tables
- scheduled scan attempts
- symbol metadata

## Static Coverage

New static test:

```text
tests/e2e/post-trade-supabase-grant-hardening-migration-draft-static.spec.ts
```

The test verifies:

- migration exists after the post-trade persistence schema migration
- intended tables have `revoke all privileges` from `anon` and `authenticated`
- intended tables preserve `service_role` grants
- unrelated tables are excluded
- no permissive policies are added
- RLS is not disabled
- no data rows, `INSERT INTO`, `COPY` row data, runtime writes, schema recreation, or obvious secrets are present

## Not Performed

Not run:

- `supabase db push`
- `supabase migration up`
- `supabase db reset`
- migration repair
- migration marking
- grant changes in the remote database
- staging data write
- test row insertion
- production connection
- API activation
- Trade UI execution
- runtime write-path activation

## Safety Confirmation

Confirmed for Action 429:

- no production connection
- no production state touch
- no production Supabase write
- no staging data write
- no remote grant changes
- no test row insertion
- no migration apply
- no migration repair
- no migration marking
- no DB write
- no Supabase write
- no API activation
- no Trade UI execution
- no runtime write-path activation
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no settlement retrieval
- no real trade/broker data insertion
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_staging_grant_hardening_migration_draft_ready_no_apply`
