# Post-Trade Supabase Staging Read-Only RLS Catalog Verification Approval Gate

## Summary

Purpose: define the approval gate for a future read-only staging catalog introspection to verify live RLS, policy, and grant state.

Result: approval gate ready. No catalog introspection was run.

Decision: `post_trade_supabase_staging_read_only_rls_catalog_verification_approval_gate_ready_no_write`.

## Target

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Production remains blocked.

## Context

Already verified:

- staging full-chain initialization succeeded
- staging migration history is aligned
- generated staging types confirm expected baseline and post-trade tables exist
- static migration evidence describes intended RLS, policy, and grant posture

Remaining warning:

- live staging RLS/policy/grant catalog state has not been directly verified because the Docker-based schema dump path hung and produced only a zero-byte ignored artifact

Write-path readiness remains blocked until this warning is closed or explicitly accepted as a known limitation under a separate gate.

## Future Approval Would Authorize

A future approval would authorize only read-only staging catalog introspection for `ture-staging` / `pdvzyuhykomwfqyyztru`.

Allowed future scope:

- inspect RLS enabled state
- inspect policy names and commands
- inspect safe policy expressions where available
- inspect grants/privileges where possible
- inspect system catalog metadata only
- use generated types as supporting evidence

No table row reads are authorized beyond system catalog metadata.

## Future Approval Would Not Authorize

A future approval would not authorize:

- staging data writes
- test row insertion
- data updates
- data deletes
- data imports
- application write-path activation
- API activation
- Trade UI execution
- runtime write path activation
- migration apply
- migration repair
- migration marking
- production connection
- production state touch
- production Supabase write
- Avanza/browser automation
- credential/session/BankID handling
- order behavior
- settlement retrieval
- real trade/broker data insertion
- live trade mutation
- live position mutation

## Allowed Future Read-Only Inspection Targets

Future introspection may inspect read-only metadata from:

- `pg_tables`
- `pg_class`
- `pg_namespace`
- `pg_policy`
- `pg_policies`
- `information_schema.role_table_grants`
- `information_schema.table_privileges`
- Supabase-generated types as supporting table-presence evidence

Future introspection must not use:

- `insert`
- `update`
- `delete`
- `copy`
- `alter`
- `create`
- `drop`
- `grant`
- `revoke`
- migration commands
- repair commands
- reset commands

## Expected Inspection Scope

Baseline tables:

- `public.positions`
- `public.position_updates`
- `public.recommendations`
- `public.user_settings`
- `public.scanner_cache`
- `public.scheduled_scan_runs`
- `public.market_calendar_cache`
- `public.market_regime_snapshots`

Post-trade tables:

- `public.execution_confirmation_evidence`
- `public.execution_settlement_reviews`
- `public.execution_cost_breakdowns`
- `public.execution_deviation_reviews`
- `public.execution_learning_candidates`
- `public.execution_redacted_artifacts`

## Pass Criteria

Pass if read-only catalog introspection confirms:

- expected tables are present
- expected RLS enabled state matches source-controlled migration evidence
- expected policy posture matches source-controlled migration evidence
- expected grant/privilege posture matches source-controlled migration evidence where grants are expected
- no unexpected broad runtime write posture appears for post-trade persistence tables
- no data rows are read, inserted, updated, deleted, copied, or exported

## Warning Criteria

Warning if:

- catalog access is insufficient to inspect all policy/grant details
- generated types and migration-history evidence remain consistent
- no conflicting live catalog evidence is found
- write-path readiness remains blocked or explicitly accepts the warning under a separate gate

## Fail Criteria

Fail if:

- live staging RLS state conflicts with source-controlled migration evidence
- live staging policy posture conflicts with source-controlled migration evidence
- unexpected broad write policies or grants appear on post-trade persistence tables
- catalog introspection would require reading application data rows
- catalog introspection would require any write, migration, repair, reset, or runtime activation
- production would need to be touched
- secrets or connection strings would need to be printed or stored

## Paste-Ready Future Approval Wording

```text
I approve read-only staging catalog introspection for ture-staging / pdvzyuhykomwfqyyztru only.
This approval is limited to system catalog metadata for RLS, policies, and grants.
No table data rows, test row insertion, data write, migration apply, migration repair, API activation, Trade UI execution, production connection, Avanza/browser automation, credential/session/BankID handling, order behavior, settlement retrieval, or live trade/position mutation is approved.
```

## Current Safety Confirmation

Confirmed for Action 426:

- no production connection
- no production state touch
- no production Supabase write
- no staging data write
- no test row insertion
- no migration apply
- no migration repair
- no migration marking
- no DB write
- no Supabase write
- no API activation
- no Trade UI execution
- no runtime write path activation
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no settlement retrieval
- no real trade/broker data insertion
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_staging_read_only_rls_catalog_verification_approval_gate_ready_no_write`
