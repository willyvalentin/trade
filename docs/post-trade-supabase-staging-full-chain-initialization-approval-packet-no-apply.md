# Post-Trade Supabase Staging Full-Chain Initialization Approval Packet, No Apply

## Summary

Purpose: provide the final user approval packet for a future full-chain initialization of `ture-staging` from the local Supabase migration chain.

Result: approval packet ready; no migration apply, schema/data command, Supabase write, or production action occurred.

Decision: `post_trade_supabase_staging_full_chain_initialization_approval_packet_ready_no_apply`.

## Current Context

- Action 407 decision: `post_trade_supabase_staging_migration_history_alignment_plan_ready_no_apply`
- Target environment: `ture-staging`
- Target project ref / safe identifier: `pdvzyuhykomwfqyyztru`
- Local Supabase CLI target is aligned to `pdvzyuhykomwfqyyztru`.
- `supabase migration list --linked` showed all local migrations pending remotely.
- Applying only `20260708000000_post_trade_persistence_schema_draft.sql` remains blocked.
- Production remains blocked.

## What Future Approval Would Authorize

A future approval using this packet would authorize only:

- applying the full local Supabase migration chain to `ture-staging`
- isolated staging/non-production initialization only
- target project ref `pdvzyuhykomwfqyyztru` only
- migration/schema initialization only
- post-initialization schema and RLS verification
- documentation of command/result without printing secrets

Full local migration chain in scope:

```text
20260520000000_add_execution_metadata_to_positions.sql
20260528000000_create_recommendation_snapshots.sql
20260528001000_create_recommendation_outcomes.sql
20260528002000_create_recommendation_scan_runs.sql
20260528003000_create_recommendation_batches.sql
20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql
20260610000000_execution_audit_foundation.sql
20260614000000_create_execution_records.sql
20260615000000_create_execution_record_audit_events.sql
20260615001000_enable_rls_execution_record_audit_events.sql
20260625000000_create_scheduled_scan_attempts.sql
20260702000000_create_symbol_metadata.sql
20260708000000_post_trade_persistence_schema_draft.sql
```

## What Future Approval Would Not Authorize

Approval would not authorize:

- production apply
- applying to any project other than `pdvzyuhykomwfqyyztru`
- runtime/API/UI write-path activation
- Trade UI execution
- real trade data insertion
- real broker data insertion
- Supabase application write helpers
- Avanza/browser automation
- Avanza login
- credential/cookie/session/BankID handling
- settlement-note retrieval
- order submission
- final KOP/SALJ click
- live trade mutation
- live position mutation
- migration history repair outside the full-chain initialization command

## Required Preconditions Before Future Apply

All must be true before any future full-chain initialization command:

- `ture-staging` is confirmed empty/disposable, or the user explicitly approves it to be overwritten/initialized.
- Local Supabase CLI metadata still points to `pdvzyuhykomwfqyyztru`.
- Production is not selected.
- Production project ref/name is not targeted.
- Backup/rollback/cleanup expectations are understood.
- Full-chain migration scope is explicitly approved, not only `20260708000000`.
- Runtime/API/UI execution remains blocked.
- Supabase real application write paths remain blocked.
- No secrets are printed or stored.

If `ture-staging` is not empty/disposable and overwrite/initialization is not explicitly approved, the future apply must remain blocked.

## Backup / Rollback / Cleanup Expectations

Before future apply:

- record the target project ref as `pdvzyuhykomwfqyyztru`
- confirm staging data classification: empty, disposable, or explicitly approved for initialization
- confirm no production data is present
- confirm cleanup path for failed non-production initialization
- confirm whether failed initialization should be rolled forward by a reviewed fix or abandoned by recreating staging

If future full-chain initialization fails:

- stop immediately
- do not run unsafe repair commands
- document the exact error without secrets
- keep production blocked
- keep runtime/API/UI execution blocked
- choose a separate cleanup/repair/recreate plan before retrying

## Future-Only Apply Command Expectations

Future-only commands, not run in this action:

```bash
cat supabase/.temp/project-ref
supabase migration list --linked
supabase db push --linked
```

Expected future command behavior:

- `cat supabase/.temp/project-ref` must show `pdvzyuhykomwfqyyztru`.
- `supabase migration list --linked` must be captured before apply.
- `supabase db push --linked` may be used only after explicit full-chain staging initialization approval.
- `supabase db reset` remains forbidden unless a separate explicit destructive staging reset gate is approved.

## Post-Initialization Verification Expectations

Future-only verification after a successful approved full-chain initialization:

- migration history aligned for all 13 local migrations
- expected base recommendation schema exists
- expected execution/audit schema exists
- scheduled scan metadata schema exists
- symbol metadata schema exists
- post-trade persistence schema exists
- RLS is enabled where migration files require it
- post-trade RLS future-gated expectations are verified where possible
- no seed data or real trade/broker data was inserted
- no runtime/API/UI write path was activated
- production remains untouched

## Paste-Ready Future User Approval Wording

Use this exact wording only in a future task if all preconditions are true:

```text
I approve full-chain Supabase migration initialization for the isolated non-production staging target only.

Target environment: ture-staging
Target project ref: pdvzyuhykomwfqyyztru

I confirm this target is non-production and production is not selected.
I confirm ture-staging is empty/disposable or explicitly approved for initialization.
I approve applying the full local migration chain, not only 20260708000000.
I understand backup/rollback/cleanup expectations.

Do not activate API routes, Trade UI execution, runtime write paths, Avanza/browser automation, credential/session/BankID handling, order behavior, live trade mutation, or live position mutation.
```

## Forbidden In This Action

Forbidden and not run:

```bash
supabase db push
supabase migration up
supabase db reset
```

Also forbidden and not done:

- any migration apply
- any DB schema/data command
- any Supabase data write
- production DB connection
- printing or storing secrets
- API activation
- Trade UI execution
- browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order action
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for this action:

- no migration apply
- no DB schema/data command
- no Supabase write
- no production state touch
- no secrets printed or stored
- no API activation
- no Trade UI execution
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_staging_full_chain_initialization_approval_packet_ready_no_apply`
