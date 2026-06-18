# Supabase Execution Record Migration Draft Reassessment

## 1. Purpose

Reassess the execution record migration draft before any application. This
document verifies that the draft remains schema-only, has not been applied, and
aligns with the Action 426 schema plan. It also identifies gaps and open
questions before any future migration application or persistence code.

This action is documentation-only. It adds no runtime code, Supabase client
changes, reads, writes, audit append, trade mutation, broker result creation,
Avanza/browser behavior, or migration application.

## 2. Draft migration inventory

File path:

- `supabase/migrations/20260614000000_create_execution_records.sql`

Table name:

- `public.execution_records`

Major columns:

- identity/timestamps: `id`, `created_at`, `updated_at`.
- ownership/account context: `user_id`, `account_id`.
- broker/source references: `broker`, `broker_order_id`,
  `broker_confirmation_id`, `broker_result_id`, `handoff_session_id`,
  `planning_snapshot_id`, `source_recommendation_id`, `source_position_id`.
- instrument fields: `ticker`, `instrument_id`, `instrument_name`, `market`,
  `instrument_type`, `currency`.
- execution fields: `side`, `execution_phase`, `execution_mode`, `quantity`,
  `price`, `fees`, `gross_amount`, `net_amount`, `confirmed_at`,
  `captured_at`.
- idempotency/fingerprints: `idempotency_key`, `record_fingerprint`,
  `source_fingerprint`, `broker_result_fingerprint`.
- environment/safety fields: `source_environment`, `is_mock`, `is_dev`,
  `validation_status`, `validation_errors`, `validation_warnings`.
- metadata fields: `metadata`, `audit_metadata`.

Constraints:

- primary key on `id`.
- checks for `side`, `execution_phase`, `execution_mode`, `broker`,
  `source_environment`, and `validation_status`.
- positive quantity and price checks.
- non-negative optional fee/gross/net amount checks.
- `captured_at` sanity check relative to `confirmed_at`.

Indexes:

- unique indexes for `idempotency_key` and `record_fingerprint`.
- nullable-aware unique broker confirmation index for non-dev/non-mock rows.
- nullable-aware broker order plus confirmation timestamp fallback uniqueness
  for non-dev/non-mock rows when confirmation id is missing.
- unique `broker_result_id` where present.
- query indexes for user/account, ticker plus confirmed time, broker order,
  broker confirmation, source recommendation, source position, confirmed time,
  created time, and environment/dev/mock flags.

Comments:

- table comment states this is a draft normalized execution record table and
  does not implement app writes, trade mutations, audit appends, broker result
  creation, or Avanza automation.
- column comments document nullable ownership, optional account scope, optional
  future broker result reference, minimized metadata, and audit linkage.

RLS/security posture:

- RLS is intentionally not enabled in this draft.
- SQL comments state that auth/user/account ownership is not finalized and
  production writes should remain server-only until RLS policies, ownership,
  idempotency lookup, and duplicate handling are reviewed.
- no permissive client insert/update policy is created.

## 3. Alignment with schema plan

Planned columns vs migration columns:

- aligns with the Action 426 plan for identity, ownership/account, broker,
  source association, instrument, execution, idempotency, environment,
  validation, metadata, and audit metadata fields.
- `broker_result_id` is included as nullable, matching the plan's future
  broker evidence reference without creating a `broker_execution_results`
  table.
- `source_recommendation_id` and `source_position_id` remain text, matching
  the plan's caution that app ids are not uniformly proven UUIDs.

Idempotency constraints:

- migration includes unique `idempotency_key`.
- migration includes unique `record_fingerprint`.
- these match the schema and persistence boundary plans.

Broker confirmation/order uniqueness:

- migration includes partial unique `(broker, broker_confirmation_id)` for real
  non-dev/non-mock rows when confirmation id exists.
- migration includes partial unique `(broker, broker_order_id, confirmed_at)`
  fallback when confirmation id is missing.
- this is nullable-aware and excludes dev/mock rows.
- the broker order fallback remains a review point because partial-fill
  semantics are not finalized.

Indexes:

- planned user/account, ticker, broker reference, source recommendation,
  source position, confirmed time, created time, and environment indexes are
  present.

Metadata columns:

- `metadata jsonb not null default '{}'::jsonb` exists.
- `audit_metadata jsonb not null default '{}'::jsonb` exists.
- validation JSONB arrays exist for errors and warnings.

Created/updated timestamps:

- `created_at timestamptz not null default now()` and
  `updated_at timestamptz not null default now()` match project convention.
- no updated-at trigger is included, which matches current simple migration
  style but remains an open consistency question.

User/account ownership:

- `user_id` and `account_id` are nullable as planned.
- comments document that ownership is unresolved.

RLS/security posture:

- matches the existing execution audit migration posture: no RLS policies yet,
  explicit comments warning against permissive client writes.
- this is conservative for a draft, but must be resolved before production
  application or client exposure.

## 4. Boundary verification

Migration not applied:

- no Supabase command was run.
- no local, staging, or production database state was changed.
- no generated Supabase types were produced.

No runtime code:

- no app runtime files were modified by Action 431.
- no route handlers were added or changed.
- no persistence helper was wired.

No Supabase client changes:

- no browser or server Supabase client code was changed.
- no insert/select/update/delete behavior was added.

No writes/reads:

- no execution-record read path exists.
- no execution-record write path exists.
- no storage function or route uses this table.

No audit append:

- the draft includes `audit_metadata` only.
- it does not append lifecycle, agent, or progress events.

No trade mutation:

- no `positions`, `recommendations`, History, Statistics, open, close, sell, or
  exit mutation is added.

No execution/browser behavior:

- no broker result creation is added.
- no bridge, browser, Avanza, order page, or confirmation capture behavior is
  added.

## 5. Risks and open questions

User/account ownership finalization:

- `user_id` and `account_id` are nullable. Production needs a final ownership
  model before apply or write exposure.

RLS policy details:

- no RLS is enabled in the draft. This is conservative, but production apply
  needs explicit RLS or a reviewed server-only/no-client-read posture.

Nullable uniqueness behavior:

- broker confirmation uniqueness is safe for non-null confirmation ids.
- broker order fallback uniqueness may be too strict or too loose depending on
  partial fills and repeated order status captures.

Schema drift:

- persistence contract types and validator assumptions now need to stay aligned
  with this draft.

Migration rollback:

- rollback is simple only before writes exist. A future apply checklist should
  include rollback SQL and target-specific verification steps.

Generated types timing:

- Supabase generated types were not updated. A future generated-types plan
  should happen only after the migration target and apply path are clear.

Staging/prod application process:

- local/staging apply should happen before production.
- production remains blocked until RLS/ownership, backup/snapshot, rollback,
  and target project are confirmed.

## 6. Candidate next actions

A. Create Execution Record Persistence Insert Contract/Plan

- Best next step.
- The schema draft exists, but no write behavior should be implemented yet.
- A contract/plan can define route shape, insert payload, duplicate lookup,
  error handling, and no-trade-mutation guarantees without wiring Supabase.

B. Create Supabase Migration Application Checklist

- Useful before applying the migration.
- Lower immediate payoff because persistence insert contract questions still
  need shape before deciding apply readiness.

C. Create Supabase Execution Record Generated Types Plan

- Useful after migration apply strategy is clearer.
- Premature before the draft is reassessed further and target apply path is
  known.

D. Reassess BrokerExecutionResult Confirmation Path

- Necessary before production persistence, but higher risk because it touches
  real broker confirmation evidence.

## 7. Recommended next action

**Action 432 - Create Execution Record Persistence Insert Contract/Plan**

## Action 447 Follow-Up

Action 447 created
`docs/supabase-execution-record-migration-application-checklist.md`.

Migration draft status remains unchanged:

- `supabase/migrations/20260614000000_create_execution_records.sql` is still a
  draft.
- The migration was not applied.
- No generated types were updated.
- No Supabase read/write, real insert route, audit append, trade mutation,
  broker result creation, or Avanza/browser behavior was added.

The new checklist defines local/staging/production sequencing, generated type
timing, RLS/security review, rollback requirements, and no-write guardrails
before any future application.

Next recommended action:

**Action 448 - Reassess BrokerExecutionResult Confirmation Path**

Rationale:

- migration draft, persistence contract types, and pure validator now exist.
- before applying or writing anything, the insert boundary should be planned:
  input shape, insert payload mapping, duplicate lookup, conflict behavior,
  audit ordering, error handling, and explicit no-trade-mutation policy.
- this can remain documentation-only and avoid Supabase writes.

## 8. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. The migration was not applied.

## Action 432 Follow-Up

Action 432 created
`docs/execution-record-persistence-insert-contract-plan.md`.

Result:

- Defined the future execution-record insert boundary before any runtime
  implementation.
- Documented future input/output semantics, server-only posture, validation
  gates, duplicate/idempotency behavior, error handling, audit relationship,
  trade mutation separation, and implementation preconditions.
- Confirmed the migration remains unapplied and no write path, route,
  Supabase client change, audit append, trade mutation, broker result creation,
  or Avanza/browser behavior was added.

Next recommended action:

**Action 433 - Reassess Execution Record Persistence Insert Contract Plan**

## Action 433 Follow-Up

Action 433 created
`docs/execution-record-persistence-insert-contract-plan-reassessment.md`.

Result:

- Reassessed the insert plan against the schema draft and confirmed the
  migration remains unapplied and out of scope for this phase.
- Confirmed future insert design still depends on local/staging migration
  application, generated type strategy, ownership/RLS decisions, duplicate
  lookup, and conflict handling.
- Added no runtime code, Supabase client changes, migration application,
  writes, reads, audit append, trade mutation, broker result creation, or
  Avanza/browser behavior.

Next recommended action:

**Action 434 - Create Execution Record Insert Server Route Design**

## Action 434 Follow-Up

Action 434 created
`docs/execution-record-insert-server-route-design.md`.

Result:

- Designed the future insert route while keeping the Action 430 migration draft
  unapplied.
- Confirmed real insert remains blocked until local/staging application,
  generated type strategy, ownership/RLS, duplicate lookup, conflict handling,
  and route dry-run strategy are settled.
- Added no route/API implementation, migration application, Supabase write,
  Supabase client change, audit append, trade mutation, broker result
  creation, or Avanza/browser behavior.

Next recommended action:

**Action 435 - Reassess Execution Record Insert Server Route Design**

## Action 435 Follow-Up

Action 435 created
`docs/execution-record-insert-server-route-design-reassessment.md`.

Result:

- Verified the future route design does not apply or depend on an applied
  migration yet.
- Confirmed the migration draft remains schema-only and real route insert is
  blocked until local/staging apply, generated type strategy, ownership/RLS,
  duplicate lookup, and partial-fill review are resolved.
- Recommended type-only route contracts before route implementation.

Next recommended action:

**Action 436 - Create Execution Record Insert Route Contract Types**
