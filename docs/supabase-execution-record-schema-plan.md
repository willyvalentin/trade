# Supabase Execution Record Schema Plan

## 1. Purpose

Define the future Supabase schema for execution records before any migration or
write implementation. This plan turns the Action 425 boundary reassessment into
a concrete proposed table, column, constraint, index, RLS/security, migration,
and non-goal design.

This action is documentation-only. It adds no migration, Supabase write,
Supabase client change, execution record storage, audit append, trade mutation,
broker result creation, Avanza/browser behavior, or runtime behavior.

## Action 447 Follow-Up

Action 447 created
`docs/supabase-execution-record-migration-application-checklist.md`.

The checklist translates this schema plan and the draft migration into a safe
application process:

- local application first.
- staging verification before production.
- explicit production approval, backup, rollback, and RLS/security signoff.
- generated types only after successful target application and preferably in a
  separate action.
- no real insert route, Supabase writes, audit append, trade mutation, broker
  result creation, Avanza/browser behavior, or automatic-mode behavior bundled
  with migration application.

Next recommended action:

**Action 448 - Reassess BrokerExecutionResult Confirmation Path**

## 2. Current Supabase state

Current state:

- no `public.execution_records` table exists in the actual migration set.
- no Supabase execution-record write path exists.
- no production confirmed broker result path exists.
- no trade mutation path is connected to execution-record creation.
- current `ExecutionRecordCandidate` builder output remains
  `safeToPersist=false`.

Relevant existing migrations/tables:

- `public.positions` has an `execution_metadata jsonb` column from
  `20260520000000_add_execution_metadata_to_positions.sql`.
- recommendation-learning migrations create `recommendation_snapshots`,
  `recommendation_outcomes`, `recommendation_scan_runs`, and
  `recommendation_batches`.
- `20260610000000_execution_audit_foundation.sql` drafts
  `execution_lifecycle_events`, `execution_agent_runs`, and
  `execution_agent_progress_events`.
- prior execution persistence docs proposed `execution_records`, but no
  migration creates it.

Current gaps/unknowns:

- no `broker_execution_results` table exists.
- no durable `execution_intents` or `broker_handoffs` table exists.
- user/account ownership and RLS conventions are not finalized.
- broker confirmation id availability is not proven for production data.
- partial fill representation is still unresolved.
- History/Statistics read-model integration is not designed.

## 3. Proposed table

Proposed table name:

- `public.execution_records`

Purpose:

- store normalized execution record summaries derived from confirmed broker
  evidence and validated candidate data.
- provide durable, idempotent execution evidence for later History/Statistics
  read models.
- remain separate from broker confirmation capture, audit append, and trade
  mutation.

The table should not be the first source of truth for broker evidence if a
future `broker_execution_results` table is introduced. In that case,
`execution_records` should summarize or reference the confirmed broker evidence
row.

## 4. Proposed columns

Core identity:

- `id uuid primary key default gen_random_uuid()`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.
- `user_id uuid null`.
- `account_id text null`.

Broker/source identifiers:

- `broker text not null`.
- `broker_order_id text null`.
- `broker_confirmation_id text null`.
- `broker_result_id uuid null`.
- `handoff_session_id text null`.
- `planning_snapshot_id text null`.
- `source_recommendation_id text null`.
- `source_position_id text null`.

Instrument:

- `ticker text not null`.
- `instrument_id text null`.
- `instrument_name text null`.
- `market text null`.
- `instrument_type text null`.
- `currency text null`.

Execution fields:

- `side text not null`.
- `execution_phase text not null`.
- `execution_mode text not null`.
- `quantity numeric not null`.
- `price numeric not null`.
- `fees numeric null`.
- `gross_amount numeric null`.
- `net_amount numeric null`.
- `confirmed_at timestamptz not null`.
- `captured_at timestamptz null`.

Idempotency and fingerprints:

- `idempotency_key text not null`.
- `record_fingerprint text not null`.
- `source_fingerprint text not null`.
- `broker_result_fingerprint text null`.

Safety and environment:

- `source_environment text not null`.
- `is_mock boolean not null default false`.
- `is_dev boolean not null default false`.
- `validation_status text not null`.
- `validation_errors jsonb not null default '[]'::jsonb`.
- `validation_warnings jsonb not null default '[]'::jsonb`.

Flexible metadata:

- `metadata jsonb not null default '{}'::jsonb`.
- `audit_metadata jsonb not null default '{}'::jsonb`.

Column notes:

- `user_id` remains nullable only until ownership is finalized. Production RLS
  should not rely on nullable ownership without a reviewed service-only write
  model.
- `account_id` may be needed if broker/account scoping differs from app auth
  user ownership.
- source id fields should remain `text` initially because current app ids and
  recommendation/position references are not uniformly proven UUIDs.
- `metadata` and `audit_metadata` must be minimized. Do not store credentials,
  cookies, raw broker pages, full browser session data, or 2FA material.

## 5. Required constraints

Primary key:

- `id uuid primary key default gen_random_uuid()`.

Required not-null fields:

- `broker`.
- `ticker`.
- `side`.
- `execution_phase`.
- `execution_mode`.
- `quantity`.
- `price`.
- `confirmed_at`.
- `idempotency_key`.
- `record_fingerprint`.
- `source_fingerprint`.
- `source_environment`.
- `validation_status`.

Sanity checks:

- `quantity > 0`.
- `price > 0`.
- `fees is null or fees >= 0`.
- `gross_amount is null or gross_amount >= 0`.
- `net_amount is null or net_amount >= 0`.
- `captured_at is null or captured_at >= confirmed_at - interval '1 day'`.

Enum/check constraints:

- `side in ('buy', 'sell')`.
- `execution_phase in ('entry', 'exit')`.
- `execution_mode in ('semi_automatic', 'automatic')`.
- `broker in ('avanza')` for the first migration.
- `source_environment in ('local_dev', 'staging', 'production')`.
- `validation_status in ('eligible', 'persisted', 'duplicate', 'needs_review',
  'rejected')` or a tighter persistence-specific set after contract types are
  drafted.

Idempotency/uniqueness:

- unique `idempotency_key`.
- unique `record_fingerprint`.
- partial unique `(broker, broker_confirmation_id)` where
  `broker_confirmation_id is not null and is_mock = false and is_dev = false`.
- partial unique `(broker, broker_order_id, confirmed_at)` where
  `broker_order_id is not null and broker_confirmation_id is null and
  is_mock = false and is_dev = false`, only if partial-fill semantics allow it.
- unique `broker_result_id` where `broker_result_id is not null`, if the future
  schema includes a broker evidence table.

Timestamp checks:

- `confirmed_at <= now() + interval '5 minutes'` could guard future-dated rows,
  but may be too strict for clock skew. Prefer validator-level enforcement
  unless the migration plan confirms clock expectations.

## 6. Indexes

Recommended indexes:

- `execution_records_user_created_at_idx` on `(user_id, created_at desc)`.
- `execution_records_account_created_at_idx` on `(account_id, created_at desc)`
  if `account_id` is adopted.
- `execution_records_ticker_confirmed_at_idx` on `(ticker, confirmed_at desc)`.
- `execution_records_broker_order_id_idx` on `(broker, broker_order_id)` where
  `broker_order_id is not null`.
- `execution_records_broker_confirmation_id_idx` on
  `(broker, broker_confirmation_id)` where `broker_confirmation_id is not null`.
- `execution_records_idempotency_key_idx` unique on `(idempotency_key)`.
- `execution_records_record_fingerprint_idx` unique on
  `(record_fingerprint)`.
- `execution_records_source_recommendation_idx` on
  `(source_recommendation_id)` where `source_recommendation_id is not null`.
- `execution_records_source_position_idx` on `(source_position_id)` where
  `source_position_id is not null`.
- `execution_records_confirmed_at_idx` on `(confirmed_at desc)`.
- `execution_records_created_at_idx` on `(created_at desc)`.
- `execution_records_environment_idx` on
  `(source_environment, is_mock, is_dev)`.

Index notes:

- partial unique broker indexes should exclude dev/mock rows unless the table
  is later split into real and dev tables.
- do not add a broad unique `(broker, broker_order_id)` until partial fill and
  order-event semantics are decided.

## 7. RLS/security posture

Write posture:

- production writes should be server-only.
- service-role insertion may be acceptable only through a narrow API route or
  trusted job.
- direct client inserts should remain disallowed until a later RLS review
  proves they are safe.

Read posture:

- authenticated users should read only their own records or their authorized
  account scope.
- if `account_id` is adopted, policies need a membership/account ownership
  source before production.
- service-role reads may support server diagnostics, but should not bypass
  product access rules in client responses.

Ownership enforcement:

- future writes must set `user_id` or account context server-side.
- clients should not be trusted to supply ownership fields for production
  writes.
- nullable `user_id` is acceptable only for early local/staging schema testing
  or server-only designs with no client read exposure.

Client exposure restrictions:

- no direct client write policy in the first migration plan.
- no policy that allows dev fixture, preview-only, mock, or synthetic rows to be
  read as production execution history.
- no raw broker payload, credentials, cookies, session data, or browser page
  content in client-readable metadata.

## 8. Idempotency strategy

Primary idempotency:

- `idempotency_key` is required and unique.
- it should be derived from confirmed broker evidence plus source handoff or
  capture fingerprints.

Secondary duplicate keys:

- `record_fingerprint`.
- `(broker, broker_confirmation_id)` when available.
- `(broker, broker_order_id, confirmed_at)` only as a fallback.
- `broker_result_id` if a broker evidence table exists.
- `source_fingerprint` for review and diagnostics, but not necessarily unique
  by itself.

Retry-safe insert expectations:

- exact replay of the same confirmed broker evidence should return duplicate or
  existing metadata, not insert another row.
- insert conflict on idempotency key should not mutate trades or append success
  audit as if a new insert happened.
- conflict on broker confirmation with a different idempotency key should be
  `needs_review`.
- conflict on record fingerprint with different source association should be
  `needs_review`.

History/Statistics:

- persisted execution records must not be double-counted with current
  positions/history state.
- History and Statistics should consume execution records only after a separate
  read-model plan decides how records relate to existing app state.

## 9. Audit/event relationship

Execution record insert should later emit audit events under a separate
boundary.

Future audit links:

- execution record id.
- record fingerprint.
- idempotency key.
- broker order id.
- broker confirmation id.
- source handoff/session id.
- source recommendation id.
- source position id.
- persistence status and rejection/duplicate/error metadata.

Audit event types to plan later:

- persistence attempt.
- persistence success.
- persistence rejected.
- duplicate detected.
- persistence failed.
- needs review.

Non-goals in this plan:

- no audit append implementation.
- no execution audit route wiring.
- no assumption that audit insert and execution record insert are in the same
  transaction until a later plan decides that policy.

## 10. Trade mutation separation

Execution record insert must not open, close, sell, exit, or update trades in
the same action.

Separation rules:

- no mutation of `positions`.
- no mutation of `recommendations`.
- no creation of History/closed-trade rows.
- no Statistics recalculation side effect.
- no trade mutation result in the execution-record insert response.

Future trade state updates:

- should consume persisted records only under a separate plan.
- need their own idempotency and rollback policy.
- need protections against double-counting existing live/closed trade state.

## 11. Migration plan, not migration

No migration is generated in this action.

Future migration filename pattern:

- follow the existing timestamped convention, for example
  `supabase/migrations/YYYYMMDDHHMMSS_create_execution_records.sql`.

Rollout steps:

- write migration draft in a separate action.
- review SQL line by line.
- include rollback SQL in the same planning action or companion doc.
- apply locally or to staging first only after explicit target confirmation.
- verify table, columns, constraints, indexes, RLS state, and initial row
  count.
- keep write routes disabled after migration apply.
- production apply requires backup/snapshot confirmation and RLS/user ownership
  decisions.

Rollback considerations:

- dropping the table is safe only before production writes.
- after writes exist, rollback needs archival/export or compatibility
  migration.
- constraint rollback should not permit duplicates silently in production.

Manual review required before applying:

- target Supabase project.
- auth/user ownership model.
- RLS policy.
- service-role write route.
- idempotency/duplicate constraints.
- partial fill behavior.
- metadata minimization.
- local/staging verification SQL.

## 12. Open questions

- What is the exact user/account ownership model for execution records?
- Will execution records be scoped by Supabase `auth.uid()`, a broker account
  id, a single-user service model, or another account table?
- Is `broker_confirmation_id` consistently available from Avanza confirmation
  capture?
- If broker confirmation id is absent, is `(broker, broker_order_id,
  confirmed_at)` safe enough for uniqueness?
- Are gross/net amounts reliable from the broker source, or should they be
  optional computed metadata?
- Should currency be required once broker confirmation capture is real?
- Should `source_recommendation_id` and `source_position_id` remain text or
  become foreign keys later?
- Should `broker_execution_results` be designed and migrated before
  `execution_records`?
- Should metadata remain two JSONB blobs or be split into source, validation,
  and audit metadata columns?
- How should partial fills, cancellations, rejected orders, and status changes
  relate to normalized records?

## 13. Candidate next actions

A. Create Execution Record Persistence Contract Types

- Best next step.
- The schema plan now gives persistence contracts a stable target shape.
- Contract types can remain type-only and avoid migrations/writes.

B. Create Supabase Execution Record Migration Draft

- Useful soon, but higher risk than contract types because it creates SQL that
  may become sticky.
- Should wait until persistence input/output contracts are aligned with this
  schema plan.

C. Reassess BrokerExecutionResult Confirmation Path

- Necessary before real persistence, but higher risk because it approaches real
  broker evidence capture.

D. Create Execution Record Persistence Eligibility Validator

- Should follow persistence contract types.
- Must stay pure and reject preview/dev fixture/synthetic/mock candidates.

## 14. Recommended next action

**Action 427 - Create Execution Record Persistence Contract Types**

## Action 427 Follow-Up

Action 427 created
`lib/execution-record-persistence-contract.ts`.

Contract outcome:

- Added type-only persistence contracts for future execution-record writes.
- Modeled persistence input, result statuses, rejection reasons, warnings,
  safety checklist, broker confirmation metadata, association metadata,
  duplicate match metadata, persisted record references, and audit metadata.
- Kept the module pure TypeScript constants/types only.
- Added no persistence logic, Supabase client code, migration, audit append,
  trade mutation, execution record storage, broker result creation,
  Avanza/browser behavior, or runtime wiring.

Next recommended action:

**Action 428 - Create Execution Record Persistence Eligibility Validator**

## Action 428 Follow-Up

Action 428 created
`lib/execution-record-persistence-validator.ts`.

Validator outcome:

- Added a pure deterministic validator for
  `ExecutionRecordPersistenceInput`.
- The validator returns typed `ExecutionRecordPersistenceResult` values and
  can classify eligible, rejected, duplicate, and needs-review inputs.
- Hard safety gates produce explicit rejection reasons for unsafe candidates,
  missing idempotency, missing broker confirmation, preview/dev fixture/mock
  sources, schema/RLS gaps, unsupported broker, invalid quantity/price, and
  trade mutation coupling.
- Duplicate metadata can return `duplicate` without writes.
- Added focused e2e/unit-style coverage in
  `tests/e2e/execution-sandbox.spec.ts`.
- Added no Supabase client code, migration, write behavior, audit append,
  trade mutation, execution record storage, broker result creation,
  Avanza/browser behavior, UI wiring, or runtime persistence behavior.

Next recommended action:

**Action 429 - Reassess Execution Record Persistence Validator**

## Action 429 Follow-Up

Action 429 created
`docs/execution-record-persistence-validator-reassessment.md`.

Result:

- Confirmed the persistence validator matches the current schema plan safety
  assumptions.
- Confirmed the next schema-oriented step can be a migration draft, not an
  applied migration or write path.
- Documented that exact table/constraint names should now be drafted before
  insert contract work.
- Confirmed no migration, Supabase client, write behavior, audit append, trade
  mutation, record storage, UI wiring, broker result creation, or
  Avanza/browser behavior was added.

Next recommended action:

**Action 430 - Create Supabase Execution Record Migration Draft**

## Action 430 Follow-Up

Action 430 created
`supabase/migrations/20260614000000_create_execution_records.sql`.

Migration draft outcome:

- Added a draft `public.execution_records` table based on this schema plan.
- Included core identity, broker/source identifiers, instrument fields,
  execution fields, idempotency/fingerprint fields, environment flags,
  validation JSONB, metadata JSONB, and audit metadata JSONB.
- Added primary key, not-null fields, check constraints, unique idempotency and
  fingerprint indexes, nullable-aware broker confirmation/order uniqueness,
  and read/query indexes for user/account, ticker, broker references, source
  recommendation/position, confirmed time, created time, and environment flags.
- Added comments documenting that the draft is schema-only and does not
  implement app writes, trade mutations, audit appends, broker result creation,
  or Avanza automation.
- Left RLS disabled with comments, matching the current execution audit
  migration posture until ownership/RLS are reviewed.
- Did not apply the migration and did not add runtime read/write behavior.

Next recommended action:

**Action 431 - Reassess Supabase Execution Record Migration Draft**

## Action 431 Follow-Up

Action 431 created
`docs/supabase-execution-record-migration-draft-reassessment.md`.

Reassessment outcome:

- Verified the Action 430 migration is schema-only and has not been applied.
- Compared the draft against this schema plan and confirmed alignment for
  table name, columns, constraints, indexes, idempotency uniqueness,
  nullable-aware broker uniqueness, JSONB metadata, timestamps, ownership
  fields, and conservative RLS comments.
- Documented open questions around user/account ownership, RLS policy,
  nullable uniqueness, partial fills, rollback, generated types, and
  application process.
- Added no runtime code, Supabase client changes, writes, reads, audit append,
  trade mutation, broker result creation, UI wiring, or Avanza/browser
  behavior.

Next recommended action:

**Action 432 - Create Execution Record Persistence Insert Contract/Plan**

Rationale:

- contract types can encode the planned schema and safety gates without adding
  writes or migrations.
- they can define persistence input/output, status, rejection reason, duplicate
  metadata, and audit metadata before any Supabase implementation.
- a migration draft should wait until the persistence contract and schema plan
  agree.

## 15. Risk assessment

Schema drift risk:

- medium/high. The plan reduces drift, but persistence contract types and
  future migrations still need to stay aligned.

Duplicate record risk:

- high without unique idempotency, fingerprint, and broker confirmation
  constraints.

RLS/security risk:

- high until user/account ownership and server-only write rules are finalized.

Wrong user/account association risk:

- high if clients can supply ownership fields or if service writes lack
  account context.

Metadata over/under-capture risk:

- medium/high. Too much metadata can expose sensitive broker/browser data; too
  little can break auditability.

Statistics double-counting risk:

- high until History/Statistics read models know how to treat persisted
  records versus current position/history state.

Trade mutation coupling risk:

- high if future persistence is bundled with open/close position mutation.

Migration rollback risk:

- medium before writes, high after writes. Rollback planning must precede any
  apply action.

## 16. Verification

Verification for this documentation-only schema plan:

- `git diff --check`

No runtime code changes were made.

## Action 432 Follow-Up

Action 432 created
`docs/execution-record-persistence-insert-contract-plan.md`.

Planning outcome:

- Added the insert contract/plan that sits between the schema draft and any
  future server route or Supabase write implementation.
- Defined how validated candidates, persistence validator output, idempotency,
  broker confirmation metadata, user/account context, association metadata,
  audit context, and the safety checklist should feed a future insert.
- Reconfirmed that the current schema remains draft-only and unapplied.
- Added no runtime code, Supabase client changes, writes, reads, migration
  application, audit append, trade mutation, broker result creation, UI wiring,
  or Avanza/browser behavior.

Next recommended action:

**Action 433 - Reassess Execution Record Persistence Insert Contract Plan**

## Action 433 Follow-Up

Action 433 created
`docs/execution-record-persistence-insert-contract-plan-reassessment.md`.

Reassessment outcome:

- Confirmed the insert plan aligns with the schema plan's table shape,
  server-only write posture, idempotency constraints, duplicate prevention,
  metadata minimization, and trade mutation separation.
- Confirmed RLS/user ownership, generated types, migration application, and
  broker partial-fill uniqueness remain unresolved before real insert.
- Recommended a server route design document next, not a route
  implementation.

Next recommended action:

**Action 434 - Create Execution Record Insert Server Route Design**

## Action 434 Follow-Up

Action 434 created
`docs/execution-record-insert-server-route-design.md`.

Design outcome:

- Defined the future server route that would eventually target the draft
  `public.execution_records` table.
- Kept the route design blocked on migration application, generated DB types,
  RLS/user ownership, duplicate lookup, and partial-fill uniqueness review.
- Added no migration application, Supabase client change, write/read behavior,
  audit append, trade mutation, broker result creation, or Avanza/browser
  behavior.

Next recommended action:

**Action 435 - Reassess Execution Record Insert Server Route Design**

## Action 435 Follow-Up

Action 435 created
`docs/execution-record-insert-server-route-design-reassessment.md`.

Reassessment outcome:

- Confirmed the route design targets `public.execution_records` but remains
  future-only and write-free.
- Reconfirmed migration application, generated DB types, RLS/user ownership,
  duplicate lookup, partial-fill semantics, and trusted broker confirmation
  capture remain blockers before real insert.
- Recommended route contract types as a type-only next step.

Next recommended action:

**Action 436 - Create Execution Record Insert Route Contract Types**

## Action 438 Follow-Up

Action 438 created
`docs/execution-record-insert-route-dry-run-stub-design.md`.

Result:

- Confirmed the future dry-run route does not require applying the
  `execution_records` migration.
- Kept duplicate lookup and insert mapping planned-only until schema
  application, generated types, and RLS/user ownership are resolved.
- Reaffirmed that real insert remains blocked; the dry-run design adds no
  Supabase read/write, migration application, audit append, trade mutation, or
  broker/browser behavior.

Next recommended action:

**Action 439 - Reassess Insert Route Dry-Run Stub Design**
