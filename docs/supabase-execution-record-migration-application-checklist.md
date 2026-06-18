# Supabase Execution Record Migration Application Checklist

## 1. Purpose

Define the safe process before applying the future
`public.execution_records` migration.

This checklist is documentation-only. It does not apply the migration, generate
types, add Supabase client behavior, enable writes, append audit events, mutate
trades, create broker results, or touch Avanza/browser behavior.

## 2. Current migration status

Migration file path:

- `supabase/migrations/20260614000000_create_execution_records.sql`

Current status:

- migration draft exists.
- migration has not been applied locally, in staging, or in production as part
  of this action.
- no `execution_records` write path exists.
- no real insert route exists.
- no generated Supabase types were updated.
- the existing insert route remains dry-run-only.
- the dry-run route, client helper, and UI preview remain no-write/no-mutation.

## 3. Preconditions before local application

Before applying the migration locally:

- Review the migration SQL against
  `docs/supabase-execution-record-schema-plan.md`.
- Review the Action 431 migration draft reassessment for known gaps.
- Confirm the `user_id` and `account_id` ownership model is either finalized
  or explicitly accepted as nullable/draft for local-only application.
- Review the RLS/security posture. The draft currently does not enable RLS and
  includes comments warning against permissive client write policies.
- Decide whether local testing will remain server-only/no-client-write.
- Review nullable uniqueness behavior:
  - `idempotency_key` unique.
  - `record_fingerprint` unique.
  - nullable-aware broker confirmation uniqueness for real non-dev/non-mock
    rows.
  - broker order plus `confirmed_at` fallback uniqueness when confirmation id
    is absent.
- Document rollback SQL or a rollback plan before applying.
- Confirm a local Supabase environment is available and disposable enough for
  schema iteration.
- Confirm the generated types workflow is known before generating any types.
- Confirm no production insert route is enabled.
- Confirm the dry-run-only route remains no-write.
- Confirm no trade mutation, audit append, broker result creation, or
  automatic-mode behavior will be added with migration application.

## 4. Local application checklist

Apply locally first:

- Apply the migration only to a local Supabase database.
- Do not apply to staging or production during the local verification step.
- Do not add app write behavior while applying the schema.

Verify table existence:

- Confirm `public.execution_records` exists.
- Confirm the primary key and timestamp columns exist.
- Confirm ownership/account columns exist and remain nullable if the model is
  still unresolved.

Verify constraints and indexes:

- Confirm side, execution phase, execution mode, broker, source environment,
  validation status, quantity, price, fee, gross amount, net amount, and
  `captured_at` constraints exist.
- Confirm `idempotency_key` uniqueness exists.
- Confirm `record_fingerprint` uniqueness exists.
- Confirm nullable-aware broker confirmation uniqueness exists.
- Confirm broker order plus confirmed time fallback uniqueness exists.
- Confirm user/account, ticker, broker reference, source recommendation,
  source position, confirmed time, created time, and environment indexes exist.

Verify RLS/security status:

- Confirm whether RLS is disabled as drafted or explicitly enabled by a later
  reviewed change.
- Confirm no broad public insert/update/select policies exist.
- Confirm any local policies are documented and not copied to staging/prod
  without review.

Verify rollback plan:

- Confirm rollback SQL or manual rollback steps are documented.
- Confirm rollback is acceptable before any records exist.
- If records are inserted in local experiments later, document whether rollback
  can drop data or must preserve/export it first.

Generated types:

- Generate or update local DB types only after successful local apply if the
  project uses generated Supabase types for this table.
- Keep generated type updates in a separate action if possible.
- Do not use generated types to add runtime writes in the same action.

Tests after local application:

- Run schema-focused checks if a project convention exists.
- Run `./node_modules/.bin/tsc --noEmit`.
- Run `npm run lint`.
- Run relevant dry-run route/helper/UI tests.
- Run full e2e when the environment allows it.

## 5. Staging application checklist

Apply to staging only after local verification:

- Confirm local application and rollback were verified.
- Confirm migration SQL matches the reviewed draft or document all changes.
- Confirm staging backup/snapshot posture.
- Confirm the RLS/user/account ownership decision for staging.
- Confirm no direct client write path exists.
- Confirm no production insert route is enabled.
- Confirm the dry-run insert route remains dry-run-only.
- Confirm monitoring/logging for route errors and Supabase errors.
- Confirm rollback path and owner.

After staging apply:

- Verify `public.execution_records` exists.
- Verify constraints and indexes.
- Verify RLS status and policies.
- Verify no client writes are possible unless explicitly approved in a later
  action.
- Run staging smoke checks.
- Run app smoke checks proving existing dry-run behavior remains unchanged.
- Monitor application errors and database logs.

## 6. Production application checklist

Production application requires explicit manual approval.

Before production apply:

- Confirm local and staging application succeeded.
- Confirm backup/snapshot exists and restore path is known.
- Confirm rollback SQL or manual rollback steps are ready.
- Obtain RLS/security signoff.
- Confirm user/account ownership model is approved.
- Confirm nullable uniqueness behavior is approved.
- Confirm no real insert route is enabled unless separately approved.
- Confirm no trade mutation, audit append, broker result creation, or automatic
  mode behavior is bundled with the migration.
- Choose a safe application window.
- Confirm monitoring/alerting coverage.

After production apply:

- Verify `public.execution_records` exists.
- Verify constraints and indexes.
- Verify RLS/security posture.
- Verify the app still uses dry-run-only route behavior.
- Verify no Supabase execution-record writes are occurring unexpectedly.
- Monitor API, app, and database errors.
- Record the migration application timestamp and operator.

## 7. Generated types checklist

When to generate:

- only after a target database has successfully applied the migration.
- preferably after local apply first.
- staging/prod generated type timing should follow the project convention.

Where generated types live:

- confirm the project convention before creating or updating generated files.
- if there is no established generated Supabase types file for this table,
  create a separate generated-types plan before adding one.

What code can use them:

- type-only imports are acceptable in a later action if they do not add writes.
- route/client/runtime write behavior should not be added solely because types
  exist.
- generated types should not imply that production persistence is enabled.

Guardrails:

- no runtime write behavior from generated types alone.
- generated type updates should be separate from migration application when
  possible.
- generated type updates should be separate from real insert route
  implementation.

## 8. RLS/security review checklist

Questions to answer before non-local apply:

- Who can read execution records?
- Who can insert execution records?
- Should inserts require service role/server-only access?
- Should direct client inserts be completely disallowed?
- How is `user_id` derived and validated?
- How is `account_id` derived and validated?
- Can a user read another account's execution records?
- Are audit/admin reads separate from user reads?
- What is the policy for dev/mock rows?

Security guardrails:

- no broad public writes.
- no permissive anonymous insert/update/delete policies.
- no direct client insert unless explicitly approved later.
- do not store broker credentials, cookies, raw broker pages, full browser
  session data, or 2FA material in metadata.
- keep production writes server-only until RLS/user/account ownership is
  finalized.

## 9. Rollback checklist

Before applying:

- document rollback SQL or manual rollback steps.
- document whether rollback can drop the table.
- document whether rollback must preserve records if any exist.
- identify the rollback owner.
- identify verification steps after rollback.

If table has no records:

- rollback can likely drop indexes and table in reverse order, subject to
  project migration policy.
- verify dependent generated types or code are not committed as active runtime
  dependencies.

If table has records:

- dropping the table means data loss.
- export or snapshot records before destructive rollback.
- communicate data-loss implications before executing rollback.
- verify downstream reads/writes are disabled before rollback.

After rollback:

- verify table absence or restored prior schema.
- verify app still runs.
- verify dry-run route remains no-write.
- monitor errors.

## 10. No-write guardrails

Migration application does not enable persistence by itself.

Explicit guardrails:

- applying the migration must not enable a real insert route.
- no Supabase execution-record writes should be added with the migration.
- no Supabase execution-record reads should be added with the migration unless
  separately reviewed.

## Action 549 Follow-Up - Migration/Application Status Reassessed

Action 549 created
`docs/supabase-execution-records-migration-application-reassessment.md`.

Checklist impact:

- Confirmed this checklist remains the right source for future local/staging/
  production application guardrails.
- Confirmed the migration draft exists, but target database application status
  is not proven by repository inspection.
- Confirmed generated Supabase execution-record table types are absent/unknown.
- Confirmed the existing insert route remains dry-run-only and no production
  write path is enabled.
- Confirmed Action 549 did not apply migrations, modify schema, generate
  types, write Supabase/localStorage, append audit, update stats/PnL,
  rollback/correct, mutate trades, wire UI, or touch Avanza/browser/broker
  behavior.

Next recommended action:

**Action 550 - Create Supabase Execution Records Migration Application Plan**

## Action 550 Follow-Up - Migration Application Plan Created

Action 550 created
`docs/supabase-execution-records-migration-application-plan.md`.

Checklist impact:

- Added a structured future application plan above this checklist.
- Reconfirmed local/staging/production application must remain manual and
  guarded.
- Reconfirmed migration application must not bundle production writes,
  execution-record creation, audit append, stats/PnL update, rollback,
  correction, trade mutation, Avanza/browser behavior, or broker/order
  behavior.
- Reconfirmed generated types should be planned before runtime use.

Next recommended action:

**Action 551 - Create Supabase Execution Records Generated Types Plan**

## Action 551 Follow-Up - Generated Types Plan Created

Action 551 created
`docs/supabase-execution-records-generated-types-plan.md`.

Checklist impact:

- Added a generated-types planning step after future migration application.
- Reconfirmed generated types should not be produced from an unverified project.
- Reconfirmed generated types should not enable production writes by
  themselves.

Next recommended action:

**Action 552 - Create Execution Record Candidate Builder Integration Design**
- dry-run route remains dry-run.
- dry-run client helper remains dry-run-only.
- dry-run UI remains read-only.
- no trade mutation.
- no audit append.
- no broker result creation.
- no Avanza/browser behavior.
- no automatic-mode behavior.

## 11. Candidate next actions

A. Reassess BrokerExecutionResult Confirmation Path

- highest strategic value before real persistence can be trusted.
- confirms whether production broker evidence can become reliable input for
  execution records.
- higher runtime/behavioral risk than generated-types planning, so it should be
  documentation/reassessment first.

B. Create Generated Types Plan

- useful after migration application planning.
- should remain documentation-only until a local/staging apply target is chosen.
- lower risk, but less useful until the migration application process is
  agreed.

C. Reassess Migration Application Checklist

- useful if the checklist needs review before local application.
- lower payoff if no new environment information is available.

D. Implement local-only migration application later if environment is ready

- should wait for explicit approval and local Supabase readiness.
- must remain separated from runtime writes.

## 12. Recommended next action

**Action 448 - Reassess BrokerExecutionResult Confirmation Path**

## Action 448 Follow-Up

Action 448 created
`docs/broker-execution-result-confirmation-path-reassessment.md`.

Result:

- Inventoried current broker result sources, including confirmation capture
  stubs, BrokerExecutionResult eligibility, BrokerExecutionResult previews,
  dev fixtures, dry-run route results, local diagnostics, and missing real
  broker-originating data.
- Classified current sources as preview-only, dev-only, synthetic fixture,
  dry-run-only, or unsafe for persistence/trade mutation.
- Confirmed no current source is production-safe for execution-record
  persistence or trade mutation.
- Identified production confirmation requirements before persistence or trade
  mutation can be considered.

Next recommended action:

**Action 449 - Create BrokerExecutionResult Confirmation Requirements Spec**

Rationale:

- the migration application checklist now blocks schema application from being
  mixed with runtime writes.
- the largest remaining trust gap before real insert is confirmed broker
  evidence, not UI or dry-run plumbing.
- reassessing the broker confirmation path keeps the next action
  documentation-only and avoids premature Supabase writes, audit append, or
  trade mutation.

## 13. Verification

Verification for this documentation-only checklist:

- `git diff --check`

No runtime code changes were made. The migration was not applied. No generated
types, Supabase client changes, route/API changes, writes, audit append, trade
mutation, broker result creation, Avanza/browser behavior, or automatic-mode
behavior was added.
