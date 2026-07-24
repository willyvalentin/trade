# Post-Trade Supabase Non-Production Target Identification Gate, No Apply

## Summary

Purpose: resolve the Action 399 blocker by defining the exact target identity requirements before any future Supabase non-production migration apply may proceed.

Scope: target-identification gate only. This task does not apply the migration, connect to any database, run Supabase apply/push/reset commands, write Supabase data, print secrets, activate API routes, open runtime gates, run Trade UI execution, start browser automation, log in to Avanza, handle credentials/cookies/sessions/BankID, submit orders, click final KOP/SALJ, mutate live trades, mutate live positions, or claim production readiness.

Decision: `post_trade_supabase_non_production_target_identification_gate_ready`.

## Background

Action 399 stopped safely before any Supabase command.

Action 399 decision:

`post_trade_supabase_non_production_migration_apply_blocked_or_failed_runtime_blocked`

Block reason:

- no explicit isolated non-production Supabase environment name was provided
- no explicit non-production project reference was provided
- production exclusion could not be proven against a concrete target

The previous isolated non-production apply approval remains insufficient until target identity is explicit.

## Required Target Information Before Apply

Before any future apply can proceed, the user must provide all of the following non-secret identifiers:

| Required item | Requirement | Secret? | Status now |
| --- | --- | --- | --- |
| Isolated non-production environment name | Human-readable environment name, for example staging/sandbox/dev | No | Missing |
| Supabase project ref or equivalent identifier | Non-secret project ref or other safe identifier | No | Missing |
| Explicit non-production statement | User must state the target is not production | No | Missing |
| Production exclusion statement | User must state production project ref/name is different or not selected | No | Missing |
| Backup/checkpoint acknowledgement | User must confirm backup/checkpoint path exists or is intentionally not required for disposable target | No | Missing |
| Rollback/cleanup acknowledgement | User must confirm rollback/cleanup expectation for failed apply | No | Missing |

All missing items must be supplied in a future task before any DB command.

## Secret Handling Rules

Do not print or request printed values for:

- database URLs
- service role keys
- anon keys
- access tokens
- passwords
- connection strings
- JWTs
- session/cookie values
- BankID or credential material

Safe identifiers may be provided:

- environment label
- Supabase project ref
- project display name if non-secret
- confirmation that the project is isolated non-production
- confirmation that production is not selected

## Safe Repo-Local Observation

Safe local observation from the current environment:

- `.env.local` contains generic Supabase key names only.
- The key names do not prove that the configured target is isolated non-production.
- No secret values are required or printed by this checkpoint.

Therefore, the apply remains blocked until the user provides explicit target identity.

## Paste-Ready Target Declaration Template

For a future retry, the user should paste a declaration like this:

```text
I explicitly identify the Supabase target for the post-trade persistence migration apply.

Target identity:
- Environment name: <isolated non-production environment name>
- Supabase project ref / non-secret identifier: <non-production-project-ref>

Production exclusion:
- This target is not production.
- The production Supabase project ref/name is different or not selected.
- I confirm this target contains no production data and no real broker/customer/account data.

Scope:
- Apply only supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql.
- Apply only to the named isolated non-production target.
- Run static/model validation before apply.
- Perform schema/RLS/row-count verification after apply.

Still not approved:
- No production apply.
- No production DB connection.
- No runtime/API/UI execution activation.
- No Trade UI execution.
- No real broker/Avanza behavior.
- No browser automation.
- No credential/cookie/session/BankID handling.
- No order behavior.
- No final KOP/SALJ by the agent.
- No live trade mutation.
- No live position mutation.
- No production readiness claim.

Rollback/checkpoint:
- Backup/checkpoint status: <available / disposable target explicitly accepted>
- Rollback/cleanup expectation: <documented expectation>
```

This declaration is a prerequisite for future apply. It does not cause apply by itself unless the future task also explicitly asks Codex to proceed with the non-production apply.

## Current Gate State

- Non-production target identification gate: ready.
- Target identity: not yet provided.
- Previous apply approval: insufficient without explicit target identity.
- Non-production apply: still blocked.
- Production apply: blocked.
- Database connection: blocked.
- Supabase write: blocked.
- Runtime/API/UI execution: blocked.
- Avanza/browser automation: blocked.
- Credential/session/BankID handling: blocked.
- Order behavior: blocked.
- Live trade mutation: blocked.
- Live position mutation: blocked.

## Future Retry Requirements

A future retry may proceed only if:

1. The user provides the target declaration with non-secret target identifiers.
2. The target is explicitly isolated non-production.
3. Production is explicitly not selected.
4. Static/model validations pass.
5. `.env.local` and `app/trade-app.tsx` remain unchanged unless separately approved.
6. No runtime/API/UI execution path is opened.
7. No real broker/Avanza behavior is introduced.

If any item is missing or unclear, the apply remains blocked.

## Final Decision

`post_trade_supabase_non_production_target_identification_gate_ready`
