# Post-Trade Supabase Non-Production Apply Gate Preflight, No Apply

## Summary

Purpose: create the final preflight checkpoint before any future Supabase non-production migration apply is considered.

Scope: preflight-only, review-only, no-apply. This checkpoint does not apply the migration, connect to a database, write Supabase data, activate API routes, open runtime gates, run Trade UI execution, start browser automation, log in to Avanza, handle credentials/cookies/sessions/BankID, submit orders, click final KOP/SALJ, mutate live trades, mutate live positions, or claim production readiness.

Expected decision: `post_trade_supabase_non_production_apply_preflight_ready`.

This decision means the migration package is ready for a separately approved, isolated, non-production apply task. It does not approve or perform the apply in this task.

## Current Inputs

| Input | Status | Notes |
| --- | --- | --- |
| Migration draft | Present | `supabase/migrations/20260708000000_post_trade_persistence_schema_draft.sql` |
| Task 393 approval decision | Present | `post_trade_supabase_non_production_apply_approval_ready_with_warnings` |
| Non-production apply plan | Present | `docs/post-trade-supabase-non-production-apply-plan-no-apply.md` |
| Non-production approval checklist | Present | `docs/post-trade-supabase-non-production-apply-approval-checklist-no-apply.md` |
| Migration apply-readiness checklist | Present | `docs/post-trade-supabase-migration-apply-readiness-checklist-no-apply.md` |
| Static migration tests | Present | `tests/e2e/post-trade-supabase-migration-draft-static.spec.ts` |
| Production readiness | Blocked | No production apply or production DB access is approved |

## Gate State

The apply gate remains closed.

- Future non-production apply is blocked until explicit user approval in a separate task.
- Production apply is blocked.
- Database connection is blocked.
- Supabase writes are blocked.
- API route activation is blocked.
- Trade UI execution is blocked.
- Avanza/browser automation is blocked.
- Credential/session/BankID handling is blocked.
- Order actions are blocked.
- Live trade mutation is blocked.
- Live position mutation is blocked.

## Preflight Checklist

| Check | Required result | Current preflight status |
| --- | --- | --- |
| Migration draft exists | File exists at approved path | Pass |
| Migration remains draft-only | No apply performed | Pass |
| Explicit future approval required | Apply cannot happen in this task | Pass |
| Target environment named | Future task must name isolated non-production target | Pending future approval |
| Production target blocked | Production apply forbidden | Pass |
| Backup/checkpoint plan exists | Future task must confirm before apply | Pass with future verification |
| SQL/RLS validation plan exists | Future task must validate in non-production only | Pass with future verification |
| No-write verification plan exists | Future task must inspect row counts and no seed data | Pass with future verification |
| Rollback plan exists | Future task must confirm rollback/restore path | Pass with future verification |
| Post-apply inspection plan exists | Future task must inspect schema/RLS/no rows | Pass with future verification |
| `.env.local` unchanged | Diff check must pass | Pass when validation passes |
| `app/trade-app.tsx` unchanged | Diff check must pass | Pass when validation passes |

## Allowed Commands For This Preflight Task

Allowed safe commands:

- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-supabase-migration-draft-static.spec.ts --reporter=line`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-schema-allowlist-alignment.spec.ts --reporter=line`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/post-trade-persistence-payload-allowlist.spec.ts --reporter=line`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-settlement-mock-fixtures.spec.ts --reporter=line`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-headless-to-mock-boundary-mapping.spec.ts --reporter=line`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-mock-boundary-contract-fixtures.spec.ts --reporter=line`
- `PLAYWRIGHT_SKIP_WEB_SERVER=true npx playwright test tests/e2e/execution-script-import-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-boundary.spec.ts tests/e2e/execution-record-audit-writer-route-auth-hardening.spec.ts --reporter=line`
- `./node_modules/.bin/tsc --noEmit`
- `npm run lint`
- `git diff --check`
- `git diff -- .env.local --exit-code`
- `git diff -- app/trade-app.tsx --exit-code`
- `find docs -type f -size 0`

These commands are static/model/test validation only. They do not apply migrations, connect to Supabase, write data, run browser automation, log in to Avanza, or execute orders.

## Forbidden Commands And Actions

Forbidden commands:

- `supabase db push`
- `supabase migration up`
- `supabase db reset`

Forbidden actions:

- any DB connection
- any Supabase write
- any API route activation
- any Trade UI execution
- any browser automation
- any Avanza login
- any credential, cookie, session, or BankID handling
- any order action
- any final KOP/SALJ by the agent
- any live trade mutation
- any live position mutation
- any production apply
- any production readiness claim

## Pass / Fail Decision Language

Pass:

`post_trade_supabase_non_production_apply_preflight_ready`

Use this only if all safe validations pass, `.env.local` and `app/trade-app.tsx` remain unchanged, no forbidden commands/actions occur, and the apply remains explicitly future-gated.

Pass with warnings:

`post_trade_supabase_non_production_apply_preflight_ready_with_warnings`

Use this if safe validations pass but warnings remain, such as target selection, backup execution, SQL syntax validation, and RLS runtime behavior still being future-only.

Fail:

`post_trade_supabase_non_production_apply_preflight_blocked`

Use this if any validation fails, any forbidden command/action occurs, `.env.local` or `app/trade-app.tsx` changes unexpectedly, production apply is requested, target isolation is unclear, credentials are exposed, or any runtime/write/execution gate opens.

## Future Apply Boundary

A future apply task must be explicit and separate. It must name the isolated non-production target and confirm:

- no production data
- no real broker/customer/account data
- no raw artifacts
- backup/checkpoint exists
- rollback/restore path exists
- migration apply is non-production only
- post-apply inspection is schema/RLS/no-row-count verification only
- API routes remain inactive
- Trade UI execution remains inactive
- runtime write paths remain blocked
- production readiness remains blocked

## What This Preflight Proves

- The migration draft still exists at the expected path.
- The apply is still blocked in the current task.
- Production apply remains blocked.
- The static validation set can be used before any future apply.
- The safety boundary is explicit enough for a future approval decision.

## What This Preflight Does Not Prove

- SQL syntax success against a live database.
- Migration apply success.
- RLS runtime behavior.
- Runtime write-path security.
- Production safety.
- Real Avanza safety.
- Real settlement extraction safety.
- Live trading safety.

## Final Decision

`post_trade_supabase_non_production_apply_preflight_ready`
