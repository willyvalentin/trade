# Post-Trade Supabase Non-Production Apply Final User Approval Packet, No Apply

## Summary

Purpose: provide the final user approval packet for a future Supabase non-production migration apply.

Scope: approval-packet-only, no-apply, no database connection, no Supabase write. This task does not apply the migration, connect to any database, run Supabase apply/push/reset commands, write Supabase data, activate API routes, open runtime gates, run Trade UI execution, start browser automation, log in to Avanza, handle credentials/cookies/sessions/BankID, submit orders, click final KOP/SALJ, mutate live trades, mutate live positions, or claim production readiness.

Decision: `post_trade_supabase_non_production_apply_final_user_approval_packet_ready`.

This packet prepares the wording and checklist for a future explicit user approval. It does not grant approval in this task.

## Current Inputs

| Input | Status | Notes |
| --- | --- | --- |
| Action 396 decision | Ready | `post_trade_supabase_non_production_apply_dry_run_command_plan_ready` |
| Migration draft | Present | `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` |
| Apply preflight | Present | `docs/post-trade-supabase-non-production-apply-gate-preflight-no-apply.md` |
| Dry-run command plan | Present | `docs/post-trade-supabase-non-production-apply-dry-run-command-plan-no-apply.md` |
| Non-production apply | Blocked | Requires explicit future approval |
| Production apply | Blocked | Not allowed |

## What A Future User Approval Would Approve

A future approval would authorize only:

- applying the drafted post-trade persistence migration to an explicitly named isolated non-production Supabase target
- using one selected future apply command path from the dry-run command plan
- schema-only non-production migration apply
- post-apply schema/RLS/row-count inspection in that isolated non-production target
- documenting the result
- rollback/cleanup only if separately approved or already included in the future task approval wording

The future approval must remain limited to non-production migration apply only.

## What The User Is Not Approving

The user is not approving:

- production apply
- production DB connection
- runtime/API/UI execution activation
- Trade UI execution
- API write-path activation
- Supabase writes outside the schema migration itself
- real broker data handling
- real Avanza behavior
- browser automation
- Avanza login
- credential/cookie/session/BankID handling
- order behavior
- final KOP/SALJ by the agent
- live trade mutation
- live position mutation
- real settlement note retrieval
- production readiness

## Pre-Approval Checklist

All items must be true before any future apply:

- isolated non-production target is explicitly named
- production target is not selected
- project reference is confirmed non-production
- target contains no production data
- target contains no real broker/customer/account data
- target contains no raw artifacts
- backup/checkpoint exists
- rollback/restore path exists
- migration draft path is unchanged
- static migration tests pass
- schema allowlist tests pass
- payload allowlist tests pass
- `.env.local` is unchanged unless separately approved
- no service role key is printed
- no credentials are logged
- no runtime/API/UI write path is activated
- no Trade UI execution is enabled
- no real data write path is introduced
- no Avanza/browser automation is started
- production readiness remains blocked

Any failed or uncertain item blocks future apply.

## Apply-Time Checklist, Future-Only

During a future explicitly approved apply, the operator must verify:

- the command is run against the named non-production target only
- the command path matches the approved plan
- no production project reference appears
- no secrets are printed
- no runtime/API/UI flags are changed
- no app code is edited to enable writes
- no Trade UI execution path is touched
- no Avanza/browser automation starts
- migration output is captured without secrets
- any failure stops the process immediately

This checklist is future-only and is not executed in this task.

## Future-Only Post-Apply Verification Expectations

After a future approved non-production apply, verification should confirm:

- expected post-trade tables exist
- expected indexes exist
- expected constraints exist
- RLS is enabled on every post-trade table
- no permissive public policies exist
- no broad grants exist
- row counts are zero
- no seed data exists
- no raw artifact columns exist
- optional artifact table remains metadata-only
- no API write path is activated
- no Trade UI execution path is activated
- runtime persistence remains blocked
- production readiness remains blocked

These checks are future-only and are not executed in this task.

## Rollback / Cleanup Expectations For Failed Non-Production Apply

If a future non-production apply fails:

- stop immediately
- capture a redacted error summary
- do not retry until the failure is understood
- confirm production was not touched
- confirm no real data was written
- confirm no runtime/API/UI gate was opened
- document partial schema state if any
- restore from backup/checkpoint if required
- require explicit approval before destructive cleanup unless cleanup was included in the future approval wording

Expected cleanup dependency order for drafted post-trade tables:

1. `public.execution_redacted_artifacts`
2. `public.execution_learning_candidates`
3. `public.execution_deviation_reviews`
4. `public.execution_cost_breakdowns`
5. `public.execution_settlement_reviews`
6. `public.execution_confirmation_evidence`

Rollback and cleanup remain future-only.

## Explicit Future Approval Wording Template

To approve a future non-production apply task, the user should paste wording like this in a new task:

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

This exact wording is only a template. The future user must still fill in the non-production target details and explicitly approve that task.

## Forbidden In This Task

Forbidden commands:

```bash
supabase db push
supabase migration up
supabase db reset
```

Forbidden actions:

- any DB connection
- any Supabase write
- any API route activation
- any Trade UI execution
- any browser automation
- any Avanza login
- any credential/cookie/session/BankID handling
- any order action
- any final KOP/SALJ by the agent
- any live trade mutation
- any live position mutation
- any production apply
- any production readiness claim

## Pass / Fail Decision Language

Pass:

`post_trade_supabase_non_production_apply_final_user_approval_packet_ready`

Use this if the approval packet is complete, safe validations pass, `.env.local` and `app/trade-app.tsx` remain unchanged, and no forbidden command/action occurs.

Pass with warnings:

`post_trade_supabase_non_production_apply_final_user_approval_packet_ready_with_warnings`

Use this if the packet is complete and validations pass, but future target selection, backup execution, SQL syntax validation, RLS runtime behavior, rollback execution, or post-apply inspection remain future-only warnings.

Fail:

`post_trade_supabase_non_production_apply_final_user_approval_packet_blocked`

Use this if any forbidden command/action occurs, any safe validation fails, production is selected, target isolation is unclear, credentials are exposed, or runtime/write/execution gates open.

## Final Decision

`post_trade_supabase_non_production_apply_final_user_approval_packet_ready`
