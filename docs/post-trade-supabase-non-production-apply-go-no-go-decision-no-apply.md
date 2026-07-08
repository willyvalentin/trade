# Post-Trade Supabase Non-Production Apply Go/No-Go Decision, No Apply

## Summary

Purpose: record the final Go/No-Go checkpoint before any future Supabase non-production migration apply.

Scope: decision-checkpoint-only, no-apply, no database connection, no Supabase write. This task does not apply the migration, connect to any database, run Supabase apply/push/reset commands, write Supabase data, activate API routes, open runtime gates, run Trade UI execution, start browser automation, log in to Avanza, handle credentials/cookies/sessions/BankID, submit orders, click final KOP/SALJ, mutate live trades, mutate live positions, or claim production readiness.

Decision: `post_trade_supabase_non_production_apply_go_no_go_decision_ready_for_user_approval_only`.

## Readiness Chain

| Step | Artifact | Decision / status | Meaning |
| --- | --- | --- | --- |
| Migration draft | `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` | Draft exists / 0% applied | Schema candidate exists, but no DB apply has occurred |
| Migration static tests | `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts` | Passing static/model coverage | Draft is text-reviewed for table order, no writes, RLS posture, constraints, indexes, and metadata-only artifacts |
| Apply-readiness checklist | `docs/post-trade-supabase-migration-apply-readiness-checklist-no-apply.md` | Ready with warnings | Apply can be considered only as a future non-production task |
| Non-production apply plan | `docs/post-trade-supabase-non-production-apply-plan-no-apply.md` | Complete with warnings | Future apply path is planned but not authorized |
| Non-production approval checklist | `docs/post-trade-supabase-non-production-apply-approval-checklist-no-apply.md` | `post_trade_supabase_non_production_apply_approval_ready_with_warnings` | Future approval direction exists, with warnings |
| Gate preflight | `docs/post-trade-supabase-non-production-apply-gate-preflight-no-apply.md` | `post_trade_supabase_non_production_apply_preflight_ready` | Apply gate is ready for a user decision only |
| Dry-run command plan | `docs/post-trade-supabase-non-production-apply-dry-run-command-plan-no-apply.md` | `post_trade_supabase_non_production_apply_dry_run_command_plan_ready` | Future command sequence is documented, but not run |
| Final user approval packet | `docs/post-trade-supabase-non-production-apply-final-user-approval-packet-no-apply.md` | `post_trade_supabase_non_production_apply_final_user_approval_packet_ready` | User approval wording exists, but approval is not granted |

## Go / No-Go Decision

Go:

- The project is ready for the user to make a future explicit apply decision.
- The decision may only be for an isolated non-production migration apply.
- The migration draft, static validation baseline, preflight, dry-run command plan, and final approval packet are all present.
- The approval wording can be used in a future task after filling in the isolated non-production target.

No-Go:

- Actual apply remains blocked until explicit user approval is given in a future task.
- Production apply remains blocked.
- Runtime/API/UI write paths remain blocked.
- Trade UI execution remains blocked.
- Avanza/browser automation remains blocked.
- Supabase writes remain blocked in this task.

Overall state: ready for user approval decision only, not ready for automatic apply.

## Approval Wording Reference

The exact approval wording template lives in:

`docs/post-trade-supabase-non-production-apply-final-user-approval-packet-no-apply.md`

Reference template:

```text
I explicitly approve a Supabase non-production migration apply for the post-trade persistence migration only.

Approved target:
- Environment: <isolated non-production environment name>
- Project reference: <non-production-project-ref>

Approved scope:
- Apply supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql to the named non-production target only.
- Run the static/model validation checks before apply.
- Run exactly one approved apply command path from docs/post-trade-supabase-non-production-apply-dry-run-command-plan-no-apply.md.
- Perform post-apply schema/RLS/row-count verification.
- Document the result.

Not approved:
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

Stop if target identity, credentials, backup, rollback path, or production isolation is unclear.
```

This wording is not granted by this checkpoint. It is only a future approval template.

## What Is Not Authorized

This checkpoint does not authorize:

- marking the migration as applied
- production apply
- production DB connection
- any DB connection
- Supabase writes
- runtime/API/UI write-path activation
- Trade UI execution
- browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order behavior
- final KOP/SALJ by the agent
- live trade mutation
- live position mutation
- production readiness

## Current Safety Confirmations

- Migration remains draft-only.
- Migration has not been applied.
- No database connection occurred.
- No Supabase write occurred.
- No API route activation occurred.
- No Trade UI execution occurred.
- No Avanza/browser automation occurred.
- No credential/session/BankID handling occurred.
- No order behavior occurred.
- No live trade mutation occurred.
- No live position mutation occurred.

## Future Apply Preconditions

Before any future apply, the user must explicitly provide:

- isolated non-production environment name
- non-production project reference
- approval wording that limits scope to the migration draft only
- confirmation that production is not selected
- confirmation that backup/checkpoint exists
- confirmation that rollback/restore path exists
- confirmation that runtime/API/UI write paths remain closed
- confirmation that no real broker/customer/account data is present

If any item is missing or unclear, the future task is No-Go.

## Final Decision

`post_trade_supabase_non_production_apply_go_no_go_decision_ready_for_user_approval_only`
