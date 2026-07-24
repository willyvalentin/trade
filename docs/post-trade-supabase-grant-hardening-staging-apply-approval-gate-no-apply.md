# Post-Trade Supabase Grant-Hardening Staging Apply Approval Gate, No Apply

## Summary

Purpose: define the approval gate for a future apply of the reviewed grant-hardening migration to isolated non-production staging.

Result: staging apply approval gate is ready. No migration was applied and no remote grants were changed.

Decision: `post_trade_supabase_grant_hardening_staging_apply_approval_gate_ready_no_apply`.

## Target

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Production remains blocked.

## Reviewed Migration

Migration draft:

```text
supabase/migrations/20260708001000_harden_post_trade_execution_grants_draft.sql
```

Static review checkpoint:

```text
docs/post-trade-supabase-grant-hardening-migration-draft-static-review-no-apply.md
```

Static test:

```text
tests/e2e/post-trade-supabase-grant-hardening-migration-draft-static.spec.ts
```

The draft is ordered after:

```text
20260708000000_post_trade_persistence_schema_draft.sql
```

## Future Approval Would Authorize

A future explicit approval would authorize only:

- applying `20260708001000_harden_post_trade_execution_grants_draft.sql`
- target: `ture-staging` / `pdvzyuhykomwfqyyztru`
- isolated non-production staging only
- remote grant hardening only
- revoking table privileges from `anon` and `authenticated` on intended tables
- preserving `service_role` capability for future gated server-side flows
- post-apply read-only catalog verification of grant/RLS/policy posture

Future approval would not authorize production apply.

## Future Approval Would Not Authorize

A future approval would not authorize:

- production connection
- production apply
- production Supabase write
- applying unrelated migrations
- applying baseline/schema migrations again
- applying any migration other than the grant-hardening migration
- staging data writes
- test row insertion
- data insert/update/delete
- migration repair
- migration marking
- `supabase db reset`
- API activation
- Trade UI execution
- runtime write-path activation
- Avanza/browser automation
- credential/session/BankID handling
- order behavior
- settlement retrieval
- real trade/broker data insertion
- live trade mutation
- live position mutation

## Pre-Apply Checks For Future Action

Before any future apply command:

- local Supabase target must be exactly `pdvzyuhykomwfqyyztru`
- target name should be confirmed as `ture-staging`
- production must not be selected
- migration history must be inspected
- only `20260708001000_harden_post_trade_execution_grants_draft.sql` should be pending, if applicable
- if unrelated migrations are pending, stop before apply
- command output must not print secrets
- no database URLs, passwords, service role keys, anon keys, access tokens, cookies, sessions, JWT secrets, or connection strings may be printed or stored
- runtime/API/UI write paths must still be inactive

## Future Apply Command Shape

Allowed future command shape only after explicit approval and clean pre-apply checks:

```bash
supabase db push --linked
```

This command is only acceptable if migration history proves the grant-hardening migration is the only pending remote migration.

If the CLI cannot target only the reviewed grant-hardening migration safely, stop and create a separate command strategy checkpoint.

## Post-Apply Verification Expectations

After a future approved apply:

- migration history should show the grant-hardening migration applied to staging
- grant posture should no longer show broad `anon` privileges on intended post-trade/execution tables
- grant posture should no longer show broad `authenticated` privileges on intended post-trade/execution tables
- `service_role` capability should remain
- RLS should remain enabled where already expected
- no permissive policies should be introduced
- no policies should be created, altered, or dropped by the grant-hardening migration
- no application rows should be read
- no test rows should be inserted
- no API/UI/runtime write path should be activated

Expected post-apply read-only catalog targets:

- `pg_class`
- `pg_namespace`
- `pg_policies`
- `information_schema.role_table_grants`

## Failure Handling

If a future staging apply fails:

- stop immediately
- do not run migration repair
- do not run `supabase db reset`
- do not mark migrations as applied
- do not attempt unsafe manual grant changes
- document the error without secrets
- keep production blocked
- keep runtime/API/UI write paths blocked
- create a separate rollback/cleanup plan if needed

## Paste-Ready Future Approval Wording

```text
I approve applying only supabase/migrations/20260708001000_harden_post_trade_execution_grants_draft.sql to isolated non-production staging ture-staging / pdvzyuhykomwfqyyztru.
This approval is limited to remote grant hardening only.
No production connection, unrelated migration apply, data write, test row insertion, migration repair, API activation, Trade UI execution, runtime write path, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, or live trade/position mutation is approved.
```

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

Confirmed for Action 431:

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

`post_trade_supabase_grant_hardening_staging_apply_approval_gate_ready_no_apply`
