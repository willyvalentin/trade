# Post-Trade Supabase Grant-Hardening Staging Apply Execution Result

## Summary

Purpose: apply only the reviewed grant-hardening migration to isolated non-production staging and verify grant posture with read-only catalog inspection.

Result: staging grant-hardening apply succeeded. Runtime/API/UI write paths remain blocked.

Decision: `post_trade_supabase_grant_hardening_staging_apply_succeeded_runtime_blocked`.

## Target

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Local Supabase metadata confirmed before apply:

```json
{"ref":"pdvzyuhykomwfqyyztru","name":"ture-staging"}
```

Production was not selected.

## Approved Migration

Applied migration:

```text
supabase/migrations/20260708001000_harden_post_trade_execution_grants_draft.sql
```

The pre-apply migration history showed only this migration pending remotely.

## Apply Command And Result

Command:

```bash
supabase db push --linked
```

CLI result:

```text
Applying migration 20260708001000_harden_post_trade_execution_grants_draft.sql...
Finished supabase db push.
```

No secrets, database URLs, passwords, service role keys, anon keys, access tokens, cookies, sessions, JWT secrets, or connection strings were printed or stored.

## Post-Apply Migration History

Read-only command:

```bash
supabase migration list --linked
```

Result:

- all local migration versions matched remote staging versions
- `20260708001000` is now applied remotely

## Post-Apply Catalog Verification

Read-only command shape:

```bash
supabase db query --linked --file tmp/action-432-grant-hardening-catalog-readonly.sql --output json
```

The temporary SQL selected only from:

- `pg_class`
- `pg_namespace`
- `pg_policies`
- `information_schema.role_table_grants`

It did not select from application tables and did not read application data rows.

## Verified Tables

Post-trade persistence tables:

- `public.execution_confirmation_evidence`
- `public.execution_settlement_reviews`
- `public.execution_cost_breakdowns`
- `public.execution_deviation_reviews`
- `public.execution_learning_candidates`
- `public.execution_redacted_artifacts`

Execution persistence table:

- `public.execution_record_audit_events`

## Verification Result

Pass.

For every verified table:

- table exists
- RLS remains enabled
- `rls_force` remains false
- policy count remains `0`
- no permissive policies were introduced
- broad `anon` grants are no longer present
- broad `authenticated` grants are no longer present
- `service_role` capability remains

Observed grant metadata per table:

```text
service_role: DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
```

No `anon` or `authenticated` grant entries were present for the intended post-trade/execution persistence tables after apply.

## Runtime Position

Runtime/API/UI write paths remain blocked.

Still separately blocked:

- Supabase real write-path activation
- API/runtime write activation
- Trade UI execution
- Avanza/browser automation
- production migration/apply
- live trade mutation
- live position mutation

## Not Performed

Not run:

- production connection
- production apply
- production Supabase write
- unrelated migration apply
- staging application data write
- application row reads
- test row insertion
- migration repair
- migration marking
- `supabase db reset`
- API activation
- Trade UI execution
- runtime write-path activation
- browser automation
- Avanza login
- credential/session/BankID handling
- order action
- settlement retrieval
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for Action 432:

- no production connection
- no production state touch
- no production Supabase write
- no staging application data write
- no application row reads
- no test row insertion
- no migration repair
- no migration marking
- no DB reset
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

`post_trade_supabase_grant_hardening_staging_apply_succeeded_runtime_blocked`
