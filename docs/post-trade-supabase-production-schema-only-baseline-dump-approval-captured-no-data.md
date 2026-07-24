# Post-Trade Supabase Production Schema-Only Baseline Dump Approval Captured, No Data

## Summary

Purpose: capture explicit user approval for a future production schema-only baseline dump or inspection for baseline reconstruction only.

Result: approval captured; no production connection, schema dump, data dump, row export, migration apply, migration repair, DB schema/data command, Supabase write, staging apply, or state mutation occurred.

Decision: `post_trade_supabase_production_schema_only_baseline_dump_approval_captured_no_data`.

## Context

- Action 412 decision: `post_trade_supabase_production_schema_only_baseline_dump_gate_ready_no_data`
- Local evidence is insufficient to reconstruct authoritative baseline DDL.
- `ture-staging` initialization remains blocked pending a schema-only baseline.
- Production may only be touched under a narrow schema-only, no-data, no-write gate.

## Captured User Approval

The user explicitly approves a future production schema-only baseline dump for baseline reconstruction purposes only.

This approval is captured as permission to proceed in a future action only after execution preconditions are satisfied. It does not run the dump in this action.

## Approval Authorizes Only

The captured approval authorizes only:

- production schema-only dump or inspection
- no table data
- no rows
- no real trade data
- no broker data
- no user data
- no migration apply
- no migration repair
- no DB write
- no staging apply

The allowed purpose is authoritative baseline DDL reconstruction for a future reviewed staging/local baseline migration draft.

## Approval Does Not Authorize

The captured approval does not authorize:

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
- credential/session/BankID handling beyond the minimum local operator context needed for a separately executed schema-only command
- order behavior
- live trade mutation
- live position mutation

## Secret-Handling Rules

Any future schema-only dump or inspection must follow these rules:

- do not print or store database URLs
- do not print or store passwords
- do not print or store service role keys
- do not print or store anon keys
- do not print or store tokens
- do not print or store cookies
- do not print or store sessions
- do not print or store JWT secrets
- redact command output before documenting results
- generated schema artifacts must be reviewed for accidental sensitive content before being committed or referenced

## Output Handling Rules

Any future schema-only artifact must:

- exclude data
- exclude rows
- exclude real trade data
- exclude broker data
- exclude user data
- remain local/review-only until redaction review is complete
- not be committed until reviewed for secrets and accidental data
- never include production data
- never include credentials, URLs, tokens, cookies, sessions, or service-role material

If any output unexpectedly contains data or secrets, it must be treated as contaminated and excluded from commits.

## Future Execution Preconditions

Before any future schema-only dump or inspection:

- production target must be explicitly identified as production
- command must be schema-only
- command must not export rows
- command must not apply migrations
- command must not repair migration history
- command must not write to production
- command must not write to staging
- output location must be local/review-only
- output must be reviewed for secrets and sensitive content before commit or reference

## Current Safety Confirmation

Confirmed for Action 413:

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

`post_trade_supabase_production_schema_only_baseline_dump_approval_captured_no_data`
