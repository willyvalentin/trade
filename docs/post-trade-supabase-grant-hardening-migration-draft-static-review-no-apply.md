# Post-Trade Supabase Grant-Hardening Migration Draft Static Review, No Apply

## Summary

Purpose: statically review the source-controlled grant-hardening migration draft before any staging apply gate.

Result: static review passed. The draft is ready for a future staging apply approval gate. It was not applied.

Decision: `post_trade_supabase_grant_hardening_migration_draft_static_review_ready_for_staging_apply_gate_no_apply`.

## Reviewed Files

- Migration draft: `supabase/migrations/20260708001000_harden_post_trade_execution_grants_draft.sql`
- Static test: `tests/e2e/post-trade-supabase-grant-hardening-migration-draft-static.spec.ts`

## Migration Ordering Review

Pass.

The migration draft is ordered after:

- `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql`

It is not ordered before the baseline or core schema migrations. Current local order places it after the post-trade persistence schema draft and after all earlier baseline/core migrations.

## Target Scope Review

Pass.

The draft targets only:

- `public.execution_confirmation_evidence`
- `public.execution_settlement_reviews`
- `public.execution_cost_breakdowns`
- `public.execution_deviation_reviews`
- `public.execution_learning_candidates`
- `public.execution_redacted_artifacts`
- `public.execution_record_audit_events`

Including `public.execution_record_audit_events` is intentional because Action 427 found broad grant metadata on execution persistence surfaces and this table already has RLS enabled with zero policies.

Excluded:

- legacy baseline tables
- recommendation snapshot/outcome/scan/batch tables
- execution foundation run/progress tables
- `public.execution_records`
- scheduled scan attempts
- symbol metadata

## Privilege Posture Review

Pass.

The draft:

- revokes all table privileges from `anon` on intended tables
- revokes all table privileges from `authenticated` on intended tables
- preserves `service_role` table capability for future gated server-side flows
- does not grant table privileges to `anon`
- does not grant table privileges to `authenticated`

This is a least-privilege improvement over the live broad-grant warning from Action 427.

## RLS And Policy Review

Pass.

The draft:

- does not disable RLS
- does not weaken RLS
- does not create policies
- does not alter policies
- does not drop policies
- does not add `using (true)`
- does not add `with check (true)`
- does not add row policies that would allow client access

RLS and policy design remain separately gated.

## Data And Secret Review

Pass.

The draft contains no:

- data rows
- `INSERT INTO`
- `COPY` table data
- application row reads
- schema recreation
- runtime writes
- connection strings
- obvious secrets
- credential/session/BankID/cookie material

## Static Test Coverage

Existing static coverage is sufficient. No test changes were needed in this review.

The static test verifies:

- migration exists after the post-trade persistence schema migration
- migration is read as text only
- imports stay isolated from runtime and restricted modules
- intended tables have `revoke all privileges` from `anon` and `authenticated`
- intended tables preserve `service_role` grants
- unrelated tables are excluded
- RLS is not weakened
- permissive policies are not added
- no data rows, schema recreation, runtime writes, or obvious secrets are present

## Not Performed

Not run:

- `supabase db push`
- `supabase migration up`
- `supabase db reset`
- migration repair
- migration marking
- remote grant changes
- staging schema/data commands
- staging data writes
- test row insertion
- production connection
- API activation
- Trade UI execution
- runtime write-path activation

## Safety Confirmation

Confirmed for Action 430:

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

`post_trade_supabase_grant_hardening_migration_draft_static_review_ready_for_staging_apply_gate_no_apply`
