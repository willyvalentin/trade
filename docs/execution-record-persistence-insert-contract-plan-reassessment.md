# Execution Record Persistence Insert Contract Plan Reassessment

## 1. Purpose

Reassess the execution record persistence insert contract plan before any route
or write implementation. This document verifies that the plan remains
server-only, write-free, mutation-free, and aligned with the existing creation,
persistence, schema, and migration boundaries.

This action is documentation-only. It adds no runtime code, Supabase writes,
Supabase client changes, route/API implementation, migration application,
audit append, trade mutation, broker result creation, Avanza/browser behavior,
or execution behavior.

## 2. Current insert plan inventory

Input semantics:

- the plan expects a validated `ExecutionRecordPersistenceInput`.
- input includes a validated `ExecutionRecordCandidate`, idempotency key,
  record fingerprint, source fingerprint, broker confirmation metadata,
  user/account context, association metadata, schema/version metadata, audit
  context, and safety checklist.
- input explicitly excludes trade mutation commands.
- raw UI values, preview-only broker data, and candidate-builder output alone
  are not sufficient at the insert boundary.

Output semantics:

- output is planned as persistence-only: `inserted`, `duplicate`, `rejected`,
  `needs_review`, or `error`.
- output may include a persisted record reference or duplicate match metadata.
- output includes rejection reasons, warnings, and audit metadata.
- output intentionally has no trade mutation result and must not imply History,
  Statistics, active positions, or recommendation state changed.

Server-only posture:

- insert is planned as server-side only.
- no direct browser/client insert into `public.execution_records`.
- user/account context must be derived or verified by the server.
- a service-role client, if used, must stay behind a narrow authenticated
  server boundary.
- no permissive client insert/update posture is proposed.

Validation gates:

- creation validation and candidate building occur before persistence
  validation.
- `validateExecutionRecordPersistenceInput(...)` must run before insert.
- unsafe, preview-only, dev fixture, synthetic, mock, missing user context,
  missing broker confirmation, schema-unavailable, and ambiguous inputs are
  rejected or held for review before database work.

Duplicate/idempotency handling:

- idempotency key and record fingerprint are primary duplicate guards.
- broker confirmation id is the preferred broker-side uniqueness signal when
  available.
- broker order id plus confirmation timestamp remains a fallback that must be
  reviewed for partial-fill behavior.
- retrying the same input should return an existing reference or duplicate
  result, not insert another row.

Error handling:

- hard validation failures return `rejected` before database work.
- schema unavailable returns `rejected` or `error`; no localStorage fallback is
  allowed.
- conflicts return `duplicate` only when the match is known to represent the
  same execution.
- ambiguous conflicts return `needs_review`.
- network/db failures return non-sensitive `error` results and do not mutate
  app state.

Audit separation:

- initial insert does not append audit events.
- audit attempt/success/failure/duplicate events remain a separate future
  boundary.
- audit failure policy is explicitly deferred.

Trade mutation separation:

- insert does not open, close, sell, exit, or update trades.
- insert does not update recommendations, History, Statistics, localStorage
  trade state, or Supabase position/trade rows.
- any trade mutation must be a separate action with its own idempotency and
  rollback rules.

Preconditions:

- migration applied in local/staging only before real insert implementation.
- generated DB types updated if the project uses them.
- RLS/ownership confirmed.
- server-only route or server action pattern chosen.
- duplicate constraints verified.
- broker partial-fill uniqueness reviewed.
- persistence validator aligned with applied schema.
- insert payload mapping reviewed field-by-field.
- route test strategy and rollback strategy documented.
- audit append and trade mutation boundaries remain deferred or separately
  designed.

## 3. Boundary verification

No writes:

- Action 432 produced a plan only.
- no Supabase insert, update, upsert, select, or delete was added.
- no execution record storage was added.

No route/API implementation:

- no `app/api` route was created or modified.
- no server action was created.
- no dry-run route exists yet.

No client changes:

- no Supabase browser or server client was changed.
- no generated Supabase types were produced.
- no fetch helper or UI wiring was added.

No migration application:

- `supabase/migrations/20260614000000_create_execution_records.sql` remains a
  draft file.
- no Supabase command was run.
- no local, staging, or production database state changed.

No audit append:

- the plan references audit metadata and future audit events only.
- no lifecycle, agent-run, progress-event, local event log, or
  execution-record audit append was implemented.

No trade mutation:

- no position, recommendation, History, Statistics, close, sell, exit, or open
  trade behavior changed.

No broker/Avanza/browser behavior:

- no `BrokerExecutionResult` creation was added.
- no bridge, browser runner, Avanza page interaction, confirmation capture, or
  automatic-mode behavior was added.

## 4. Alignment with existing contracts

Persistence contract types:

- `lib/execution-record-persistence-contract.ts` already models the future
  boundary with `ExecutionRecordPersistenceInput`,
  `ExecutionRecordPersistenceResult`, duplicate match metadata, persisted
  references, audit metadata, user/account context, broker confirmation
  metadata, association metadata, and safety checklist.
- the insert plan aligns with those types, while using `inserted` as a
  planning label for what the current contract calls `persisted`.
- no type changes are needed before a route design document.

Persistence validator:

- `lib/execution-record-persistence-validator.ts` is pure and returns
  `eligible`, `rejected`, `duplicate`, or `needs_review`.
- the insert plan correctly places validation before any duplicate lookup or
  insert.
- validator gates for dev fixture, preview-only, mock, synthetic, missing
  idempotency, missing user/account context, missing broker confirmation,
  schema unavailable, RLS context, trade mutation separation, and audit policy
  are reflected in the plan.

Schema plan:

- `docs/supabase-execution-record-schema-plan.md` defines the future
  `public.execution_records` table and emphasizes server-only writes,
  user/account ownership, idempotency uniqueness, partial-fill risk, and
  metadata minimization.
- the insert plan aligns with those non-goals and preconditions.

Migration draft:

- `supabase/migrations/20260614000000_create_execution_records.sql` provides
  the draft table, constraints, and indexes targeted by the insert plan.
- the insert plan correctly treats the migration as unapplied and blocks real
  insert implementation until local/staging application and generated type
  strategy are resolved.

Creation candidate builder:

- `lib/execution-record-candidate-builder.ts` remains pure and does not write.
- the insert plan consumes validated candidates only after the persistence
  validator has confirmed that fixture, preview-only, and unsafe candidates are
  blocked.
- the Action 422 dev fixture remains explicitly unsafe for persistence even
  when it produces an eligible read-only preview candidate.

## 5. Remaining blockers before real insert

- migration not applied.
- generated DB types unavailable for `public.execution_records`.
- RLS/user/account ownership unresolved.
- no duplicate lookup implementation.
- no server route or server action design yet.
- no insert payload mapper.
- no conflict classification implementation.
- no audit append boundary or ordering policy.
- no trade mutation boundary.
- no production confirmed broker result path.
- no trusted broker confirmation capture path.
- no local/staging verification against real constraints.
- no rollback/application checklist for the migration.

## 6. Candidate next actions

A. Create Execution Record Insert Server Route Design

- best next step.
- can remain documentation-only.
- should define route shape, authentication, server-only posture, dry-run
  behavior, validation order, duplicate lookup expectations, insert payload
  mapping, error result semantics, and explicit no-write/no-mutation phases.

B. Create Migration Application Checklist

- important before applying the draft migration.
- slightly less immediate than route design because the insert boundary still
  needs a server surface design before deciding which migration apply checks
  are most relevant.

C. Create Supabase Generated Types Plan

- useful after migration application strategy is clearer.
- premature before a route design identifies which generated types are needed
  by runtime code versus tests.

D. Reassess BrokerExecutionResult Confirmation Path

- necessary before production persistence.
- higher risk because it approaches real broker evidence and confirmation
  capture trust rules.

## 7. Recommended next action

**Action 434 - Create Execution Record Insert Server Route Design**

Rationale:

- the insert plan is aligned and still write-free.
- route design can remain documentation-only while clarifying the future
  server-only API, auth assumptions, dry-run phase, validation order,
  duplicate lookup boundary, and no-trade-mutation guarantees.
- migration application, generated types, and broker confirmation capture
  should wait until the server route design confirms exactly what the runtime
  boundary would need.

## 8. Risk assessment

False insert risk:

- high if future route implementation accepts preview-only, fixture, mock,
  synthetic, missing-confirmation, or unreviewed automatic-mode candidates.

Route misuse risk:

- high if the route is exposed before authentication, dry-run gating, and
  server-only ownership are settled.

Direct client write risk:

- high if browser clients can insert directly into `execution_records`.

RLS/user context risk:

- high because the migration draft leaves `user_id` and `account_id` nullable
  until ownership is finalized.

Duplicate write risk:

- high until duplicate lookup and database conflict handling are implemented
  and tested against the actual applied constraints.

Audit mismatch risk:

- medium/high because insert and audit append are intentionally separate. A
  later audit boundary must define ordering and failure behavior.

Trade mutation coupling risk:

- high if insert implementation is bundled with opening, closing, selling, or
  updating trades.

Schema drift risk:

- medium/high while the schema is draft-only and generated DB types do not
  exist.

## 9. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No write path, route, Supabase client
change, migration application, audit append, trade mutation, broker result
creation, or Avanza/browser behavior was added.

## Action 434 Follow-Up

Action 434 created
`docs/execution-record-insert-server-route-design.md`.

Result:

- Defined the future `POST /api/execution/records/insert` route design without
  implementing it.
- Documented request/response contracts, server-only posture,
  auth/security expectations, validation sequence, duplicate/idempotency
  strategy, error handling, audit separation, trade mutation separation, and
  preconditions before implementation.
- Confirmed no route/API implementation, Supabase client change, write/read
  behavior, migration application, audit append, trade mutation, broker result
  creation, or Avanza/browser behavior was added.

Next recommended action:

**Action 435 - Reassess Execution Record Insert Server Route Design**

## Action 435 Follow-Up

Action 435 created
`docs/execution-record-insert-server-route-design-reassessment.md`.

Result:

- Verified the Action 434 route design stays within the Action 432/433 insert
  contract boundary.
- Confirmed the route design remains documentation-only and adds no runtime
  route, write path, Supabase client change, audit append, trade mutation, or
  migration application.
- Recommended type-only route contracts as the next safe step before any
  dry-run route.

Next recommended action:

**Action 436 - Create Execution Record Insert Route Contract Types**
