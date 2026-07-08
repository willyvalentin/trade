# Post-Trade Supabase Staging Read-Only RLS Catalog Verification Result

## Summary

Purpose: run approved read-only staging catalog introspection to verify live RLS, policy, and grant state for expected staging tables.

Result: read-only catalog verification completed with warnings. Runtime/API/UI write-path readiness remains blocked.

Decision: `post_trade_supabase_staging_read_only_rls_catalog_verification_ready_with_warnings_runtime_blocked`.

## Target

- Environment: `ture-staging`
- Project ref / safe identifier: `pdvzyuhykomwfqyyztru`

Local Supabase CLI target metadata was confirmed before the catalog query:

```json
{"ref":"pdvzyuhykomwfqyyztru","name":"ture-staging"}
```

Production was not selected for this action.

## Scope

Performed:

- read-only staging catalog metadata inspection
- table existence check for expected public tables
- RLS enabled-state check
- policy count/name check
- grant/privilege metadata check for `anon`, `authenticated`, and `service_role`

Not performed:

- application table row reads
- data insert/update/delete
- test row insertion
- migration apply
- migration repair
- migration marking
- API activation
- Trade UI execution
- runtime write-path activation

## Read-Only Command

Command shape:

```bash
supabase db query --linked --file tmp/action-427-staging-rls-catalog-readonly.sql --output json
```

The temporary SQL file selected only from:

- `pg_class`
- `pg_namespace`
- `pg_policies`
- `information_schema.role_table_grants`

It did not select from application tables and did not read application data rows.

## Expected Table Coverage

Baseline tables inspected:

- `public.positions`
- `public.position_updates`
- `public.recommendations`
- `public.user_settings`
- `public.scanner_cache`
- `public.scheduled_scan_runs`
- `public.market_calendar_cache`
- `public.market_regime_snapshots`

Execution and post-trade tables inspected:

- `public.execution_lifecycle_events`
- `public.execution_agent_runs`
- `public.execution_agent_progress_events`
- `public.execution_records`
- `public.execution_record_audit_events`
- `public.execution_confirmation_evidence`
- `public.execution_settlement_reviews`
- `public.execution_cost_breakdowns`
- `public.execution_deviation_reviews`
- `public.execution_learning_candidates`
- `public.execution_redacted_artifacts`

## Live Catalog Result

### Pass

All expected tables were present.

RLS enabled state matched source-controlled migration evidence:

- legacy baseline tables with source-evidenced RLS were RLS-enabled
- `scheduled_scan_runs` was not RLS-enabled, matching baseline draft evidence
- execution foundation tables without explicit RLS remained not RLS-enabled
- `execution_record_audit_events` was RLS-enabled
- post-trade persistence tables were RLS-enabled

Policy posture matched source-controlled migration evidence:

- legacy baseline tables with source-evidenced public policies had the expected policy counts and names
- `execution_record_audit_events` had RLS enabled and zero policies
- post-trade persistence tables had RLS enabled and zero policies, matching the future-gated policy design in `20260708000000_post_trade_persistence_schema_draft.sql`

### Warning

Live grant metadata showed broad table privileges for `anon`, `authenticated`, and `service_role` on all inspected tables, including post-trade persistence tables.

This does not by itself prove runtime access to post-trade tables because RLS is enabled and no policies exist on those post-trade tables. In PostgreSQL, RLS with no applicable policies is deny-by-default for affected roles.

However, broad grant metadata is still a warning for future write-path readiness because grant posture should be explicitly reviewed before any Supabase real write path, API activation, or Trade UI execution gate.

## Per-Group Decision

| Table group | Result | Notes |
| --- | --- | --- |
| Legacy baseline with policies | Pass with grant warning | Tables exist, RLS enabled, expected policies present. Broad grants are live and match the reviewed legacy posture. |
| `scheduled_scan_runs` | Warning | Table exists and matches no-RLS baseline evidence, but broad grants are live. |
| Execution foundation | Warning | Tables exist and match no-RLS/no-policy migration evidence, but broad grants are live. Runtime write paths remain blocked. |
| Execution audit | Pass with grant warning | RLS enabled and zero policies match migration evidence. Broad grants are live but blocked by RLS policy absence for client roles. |
| Post-trade persistence | Pass with grant warning | RLS enabled and zero policies match migration evidence. Broad grants are live and must be reviewed before any future write path. |

## Comparison Against Static Evidence

The live catalog evidence is consistent with:

- `supabase/migrations/20260519000000_create_legacy_baseline_schema_draft.sql`
- `supabase/migrations/20260615001000_enable_rls_execution_record_audit_events.sql`
- `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql`
- focused static Playwright coverage for baseline and post-trade migration drafts

The only new live-catalog warning is broad grant metadata across expected roles. This warning does not authorize runtime writes and must remain tracked.

## Remaining Gate Position

Write-path readiness remains blocked until a separate gate explicitly resolves or accepts the live grant warning.

Still separately blocked:

- Supabase real write paths
- API/runtime write activation
- Trade UI execution
- Avanza/browser automation
- production migration/apply
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for Action 427:

- no production connection
- no production state touch
- no production Supabase write
- no staging data write
- no application row reads
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

`post_trade_supabase_staging_read_only_rls_catalog_verification_ready_with_warnings_runtime_blocked`
