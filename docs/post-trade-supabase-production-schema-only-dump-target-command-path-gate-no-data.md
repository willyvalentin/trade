# Post-Trade Supabase Production Schema-Only Dump Target And Command Path Gate, No Data

## Summary

Purpose: define the no-data/no-connection gate needed to prove production target identity and a secret-safe schema-only command path before any future production schema-only baseline dump.

Result: target and command path gate ready; no production connection, schema dump, data dump, row export, migration apply, migration repair, DB schema/data command, Supabase write, staging apply, or state mutation occurred.

Decision: `post_trade_supabase_production_schema_only_dump_target_command_path_gate_ready_no_data`.

## Context

- Action 414 decision: `post_trade_supabase_production_schema_only_baseline_dump_blocked_or_failed_no_data`
- Block reason: production target and secret-safe schema-only command path were not explicitly proven for execution.
- Action 413 captured approval for a production schema-only baseline dump only.
- Approval remains no data, no rows, no real trade/broker/user data, no migration apply, no migration repair, no DB write, and no staging apply.
- Local evidence is insufficient to reconstruct authoritative baseline DDL.
- `ture-staging` initialization remains blocked pending schema-only baseline evidence.

## Required Non-Secret Production Target Identity

Before any future production schema-only dump, the user must provide:

- production environment name
- production Supabase project ref or equivalent safe non-secret identifier
- explicit statement that this target is production
- explicit statement that only schema-only/no-data inspection is approved
- explicit confirmation that no table data, row export, migration apply, migration repair, production write, or staging write is approved

Do not provide or store:

- database URLs
- passwords
- service role keys
- anon keys
- access tokens
- cookies
- sessions
- JWT secrets
- connection strings

## Future Command Path Requirements

A future command path must satisfy all of these constraints:

- exports schema only
- exports no table rows
- exports no real trade data
- exports no broker data
- exports no user data
- runs no migrations
- repairs no migrations
- marks no migrations as applied
- writes nothing to production
- writes nothing to staging
- activates no runtime/API/UI write path
- writes output to a local review-only artifact path
- avoids printing secret-bearing connection material to logs

Acceptable future command shape, after target declaration and separate execution approval:

```text
schema-only dump or schema-only inspection command against the declared production target
output redirected to a local review-only artifact path
redaction/sensitivity review command against the local artifact only
```

Forbidden command categories:

```bash
supabase db push
supabase migration up
supabase db reset
supabase migration repair
```

Also forbidden:

- data export commands
- row export commands
- commands that write to production
- commands that write to staging
- commands that apply migrations
- commands that activate app runtime write paths

## Output Handling Rules

Any future schema artifact must:

- be local/review-only initially
- exclude all data rows
- exclude production data
- exclude real trade/broker/user data
- be reviewed for secrets and accidental sensitive content before commit or reference
- be discarded or quarantined if it contains rows, secrets, or unexpected sensitive content

No production data may be committed.

## Paste-Ready Production Target Declaration Template

```text
Production environment name: <FILL_IN_PRODUCTION_ENVIRONMENT_NAME>
Production project ref / safe identifier: <FILL_IN_PRODUCTION_PROJECT_REF_OR_SAFE_IDENTIFIER>
Production statement: I confirm this target is production.
Scope statement: I approve schema-only/no-data inspection for baseline reconstruction only.
Exclusion statement: I do not approve table data export, row export, migration apply, migration repair, production write, staging write, runtime/API/UI activation, Avanza/browser automation, order behavior, live trade mutation, or live position mutation.
Secret statement: I will not paste database URLs, passwords, service role keys, anon keys, tokens, cookies, sessions, JWT secrets, or connection strings.
```

## Paste-Ready Future Execution Approval Wording

Use only after the production target declaration is complete and the command path is explicitly schema-only/no-data:

```text
I approve executing the production schema-only baseline dump/inspection for the declared production target only.
This approval is schema-only and no-data.
It does not authorize table data export, row export, migration apply, migration repair, production write, staging write, runtime/API/UI activation, Avanza/browser automation, order behavior, live trade mutation, or live position mutation.
The output must be written to a local review-only artifact path and reviewed for secrets and accidental data before commit or reference.
```

## Follow-Up Path

After a future complete target declaration:

1. Verify the declared target is production.
2. Verify the declared target is not `ture-staging` / `pdvzyuhykomwfqyyztru`.
3. Verify the future command is schema-only/no-data.
4. Seek separate execution approval with the exact command shape and output path.
5. Run only after the execution approval is explicit.

## Current Safety Confirmation

Confirmed for Action 415:

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

`post_trade_supabase_production_schema_only_dump_target_command_path_gate_ready_no_data`
