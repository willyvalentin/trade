# Post-Trade Supabase Production Schema-Only Baseline Dump Gate, No Data

## Summary

Purpose: define the approval gate for a possible future production schema-only baseline dump or inspection needed to reconstruct the missing legacy Supabase baseline for `ture-staging`.

Result: gate ready; no production connection, schema dump, migration apply, migration repair, DB schema/data command, Supabase write, staging apply, or data export occurred.

Decision: `post_trade_supabase_production_schema_only_baseline_dump_gate_ready_no_data`.

## Context

- Action 411 decision: `post_trade_supabase_baseline_schema_reconstruction_plan_requires_schema_only_dump_gate_no_apply`
- Local evidence identifies `public.positions` and adjacent legacy baseline tables.
- Local evidence does not safely prove authoritative DDL, constraints, indexes, defaults, RLS, policies, grants, or triggers.
- `ture-staging` initialization remains blocked pending an authoritative baseline.
- Staging target remains `ture-staging` / `pdvzyuhykomwfqyyztru`.
- Production remains blocked except for a possible future schema-only inspection or dump under explicit approval.

## Future Approval Would Authorize

A future approval would authorize only:

- production schema-only dump or schema-only inspection
- schema object metadata needed to reconstruct the legacy baseline
- no table data
- no rows
- no real trade data
- no broker data
- no user data
- no migration apply
- no migration repair
- no DB write
- no staging apply

The purpose would be to obtain authoritative baseline DDL evidence only.

## Future Approval Would Not Authorize

A future approval would not authorize:

- data dump
- row export
- Supabase write
- production mutation
- staging mutation
- migration apply
- migration repair
- runtime/API/UI activation
- Trade UI execution
- Avanza/browser automation
- credential/session/BankID handling beyond the minimum approved local operator authentication needed to run a schema-only command
- order behavior
- live trade mutation
- live position mutation

## Future-Only Command Categories

Allowed only after a separate explicit approval:

```text
schema-only inspection command against the approved production project
schema-only dump command against the approved production project
schema artifact redaction/review command that reads local dump output only
```

Forbidden even after this gate unless separately approved:

```bash
supabase db push
supabase migration up
supabase db reset
```

Also forbidden:

- data export commands
- row export commands
- migration repair commands
- any command that writes to production
- any command that writes to staging
- any command that applies migrations
- any command that activates runtime/API/UI write paths

No future command should be run from this checkpoint. This checkpoint is approval language only.

## Secret-Handling Rules

Any future schema-only baseline dump must follow these rules:

- do not print or store database URLs
- do not print or store passwords
- do not print or store service role keys
- do not print or store anon keys
- do not print or store access tokens
- do not print or store cookies
- do not print or store sessions
- do not print or store JWT secrets
- redact shell output before documenting results
- never commit secrets or secret-bearing command output
- generated schema artifacts must be reviewed for accidental sensitive content before being committed or referenced

## Output Handling Rules

Any future schema-only artifact must:

- exclude data
- exclude rows
- exclude real trade data
- exclude broker data
- exclude user data
- be treated as a local review artifact until redaction review is complete
- be referenced in docs only after redaction review
- never commit production data
- never include credentials, URLs, tokens, cookies, sessions, or service-role material

If a schema-only dump unexpectedly contains data or secrets, it must be treated as contaminated, excluded from commits, and replaced only after a separate cleanup decision.

## Follow-Up Path

After a future approved schema-only dump or inspection:

1. Review the schema-only output for secrets and accidental data.
2. Extract only baseline DDL required before `20260520000000_add_execution_metadata_to_positions.sql`.
3. Create a source-controlled baseline migration draft for staging/local review.
4. Run static validation on the baseline draft.
5. Seek a separate staging apply gate.
6. Apply to `ture-staging` only under a separate explicit approval.

No staging apply is authorized by this checkpoint.

## Paste-Ready Future Approval Wording

```text
I approve a production schema-only baseline dump/inspection for Ture.
This approval is schema-only and no-data.
It does not approve table data, row export, production mutation, staging mutation, migration apply, migration repair, runtime/API/UI activation, Avanza/browser automation, order behavior, live trade mutation, or live position mutation.
The output must be reviewed for secrets and accidental data before it is committed or referenced.
```

## Current Safety Confirmation

Confirmed for Action 412:

- no production connection
- no schema dump
- no data dump
- no row export
- no migration apply
- no migration repair
- no DB schema/data command
- no Supabase write
- no production state touch
- no staging state touch
- no secrets printed or stored
- no API activation
- no Trade UI execution
- no Avanza/browser automation
- no credential/session/BankID handling
- no order behavior
- no live trade mutation
- no live position mutation

## Final Decision

`post_trade_supabase_production_schema_only_baseline_dump_gate_ready_no_data`
