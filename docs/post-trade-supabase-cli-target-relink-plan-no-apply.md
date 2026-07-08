# Post-Trade Supabase CLI Target Relink Plan, No Apply

## Summary

Purpose: define a safe no-apply plan to correct and re-prove the local Supabase CLI target before any future non-production migration apply retry.

Result: relink plan ready; no relink, migration apply, DB connection, schema change, or data write occurred in this action.

Decision: `post_trade_supabase_cli_target_relink_plan_ready_no_apply`.

## Context

- Action 403 decision: `post_trade_supabase_non_production_migration_apply_retry_blocked_or_failed_runtime_blocked`
- Approved isolated non-production environment: `ture-staging`
- Approved project ref / safe identifier: `pdvzyuhykomwfqyyztru`
- Current local Supabase link metadata: `ekdyopdrrkphlrsilyoo`
- Production remains blocked.
- Migration draft remains unapplied: `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql`

## Mismatch To Resolve

| Item | Value | Status |
| --- | --- | --- |
| Approved target project ref | `pdvzyuhykomwfqyyztru` | Required before apply |
| Current local link metadata | `ekdyopdrrkphlrsilyoo` | Mismatch |
| Apply eligibility | Blocked | The CLI target must be corrected and re-proven first |

The mismatch must be resolved before any migration apply retry. Applying while the local CLI target points to `ekdyopdrrkphlrsilyoo` would violate the approved scope for `ture-staging` / `pdvzyuhykomwfqyyztru`.

## Currently Allowed Inspection Commands

These commands are safe for inspection only. They must not print secrets.

```bash
cat supabase/.temp/project-ref
node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('supabase/.temp/linked-project.json','utf8'));console.log(data.ref)"
rg -n "pdvzyuhykomwfqyyztru|ekdyopdrrkphlrsilyoo|ture-staging" supabase/.temp docs
```

Optional CLI help/version inspection is allowed only if it does not perform DB/apply/reset/write actions:

```bash
supabase --version
supabase link --help
```

If the CLI attempts to print or request secrets, stop and do not paste secret values into docs.

## Future-Only Relink Command Plan

The following commands are future-only and require a separate explicit action/approval before running. They are intended to update local CLI target metadata only; they must not apply migrations, reset a database, or write application data.

1. Confirm current local target mismatch:

```bash
cat supabase/.temp/project-ref
```

2. Relink the local Supabase project to the approved isolated non-production target:

```bash
supabase link --project-ref pdvzyuhykomwfqyyztru
```

3. Re-check local target metadata after relink:

```bash
cat supabase/.temp/project-ref
node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('supabase/.temp/linked-project.json','utf8'));console.log(data.ref)"
```

4. Stop after relink verification. Do not apply the migration in the relink action.

## Verification Requirements After Future Relink

The future relink action must verify:

- local metadata shows `pdvzyuhykomwfqyyztru`
- local metadata no longer shows `ekdyopdrrkphlrsilyoo` as the active link
- production is not selected
- no migration apply has run
- no DB write occurred
- no schema change occurred
- no real data write path was activated
- runtime/API/UI execution remains blocked

If any check fails, migration apply remains blocked.

## Forbidden Commands / Actions

Forbidden in this action and in any relink-only action:

```bash
supabase db push
supabase migration up
supabase db reset
```

Also forbidden:

- any migration apply
- any Supabase database write
- printing or storing database URLs
- printing or storing service role keys, anon keys, access tokens, passwords, cookies, or session values
- API activation
- Trade UI execution
- browser automation
- Avanza login
- credential/session/BankID handling
- order action
- live trade mutation
- live position mutation

## Safety Confirmation

Confirmed for this action:

- no relink command was run
- no migration apply
- no DB connection for schema change
- no Supabase write
- no secrets printed or stored
- no API activation
- no Trade UI execution
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_cli_target_relink_plan_ready_no_apply`
