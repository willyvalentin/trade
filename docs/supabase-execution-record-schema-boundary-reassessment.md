# Supabase Execution Record Schema Boundary Reassessment

## Action 702 - Audit Append Writer Dry-Run Result Contract Reassessment

- Created docs/execution-record-audit-append-writer-dry-run-result-contract-reassessment.md as a documentation-only reassessment of lib/execution-record-audit-append-writer-dry-run-result-contract.ts.
- Verified the contract remains type-only/constants-only, contract-only, dry-run-contract-only, future-boundary-only, and disconnected from dry-run logic, writer logic, audit append execution, route calls, execution-record creation, persistence/write behavior, Supabase/localStorage writes, audit writes, downstream actions, broker/Avanza behavior, and automatic mode.
- Reconfirmed dry-run result success is not audit write approval, audit append execution, route call approval, record creation approval, persistence/write approval, Supabase/localStorage write approval, security proof, server-only proof, schema/table proof, generated-types proof, migration proof, RLS/security proof, downstream approval, or full workflow completion; all action authority flags remain false.
- Reconfirmed audit schema/table proof, generated audit table types, migration proof, RLS/security proof, server-only proof, service-role proof, route/auth boundary proof, writer implementation, dry-run implementation, production insert route, and production insert/write path remain absent/unproven blockers.
- Validation: git diff --check passed; find docs -type f -size 0 returned 0.
- Recommended next action: Action 703 - Create Audit Append Writer Dry-Run Validator Design.


## 1. Purpose

Reassess the Supabase execution record schema boundary before any persistence
implementation. This document inventories the current Supabase schema and
runtime assumptions, identifies the absence of an execution-record table,
proposes future schema requirements, and defines what remains out of scope.

This action is documentation-only. It adds no migration, Supabase write,
Supabase client change, execution record storage, audit append, trade mutation,
broker result creation, Avanza/browser behavior, or runtime behavior.

## 2. Current Supabase inventory

Known migrations:

- `supabase/migrations/20260520000000_add_execution_metadata_to_positions.sql`
  adds `public.positions.execution_metadata jsonb`.
- `supabase/migrations/20260528000000_create_recommendation_snapshots.sql`
  creates `public.recommendation_snapshots`.
- `supabase/migrations/20260528001000_create_recommendation_outcomes.sql`
  creates `public.recommendation_outcomes`.
- `supabase/migrations/20260528002000_create_recommendation_scan_runs.sql`
  creates `public.recommendation_scan_runs`.
- `supabase/migrations/20260528003000_create_recommendation_batches.sql`
  creates `public.recommendation_batches`.
- `supabase/migrations/20260605000000_add_recommendation_outcomes_snapshot_horizon_unique_index.sql`
  adds a unique recommendation outcome index.
- `supabase/migrations/20260610000000_execution_audit_foundation.sql`
  creates draft execution audit tables:
  `execution_lifecycle_events`, `execution_agent_runs`, and
  `execution_agent_progress_events`.

Known active table usage:

- `app/trade-app.tsx` reads/writes existing app tables such as
  `recommendations`, `user_settings`, `positions`, `position_updates`,
  `scheduled_scan_runs`, `recommendation_scan_runs`,
  `recommendation_batches`, `recommendation_snapshots`,
  `recommendation_outcomes`, and `market_regime_snapshots`.
- recommendation learning modules use Supabase tables for snapshots, scan
  runs, batches, and outcomes.
- `lib/intraday-indicator-cache.ts` uses `scanner_cache`.
- execution audit writer drafts target `execution_lifecycle_events`,
  `execution_agent_runs`, and `execution_agent_progress_events`.

Known clients/routes:

- `lib/supabase.ts` creates the browser/client Supabase client from public URL
  and anon key.
- `lib/supabase-server.ts` creates server-side service-role or read clients
  when environment variables are available.
- `app/api/execution/audit/server-db.ts` adapts the server Supabase client for
  the execution audit writer draft.
- execution audit API routes exist for lifecycle events, agent runs, and
  progress events, but previous actions kept them validation/flag gated and
  separate from execution-record persistence.

Execution-record-related references:

- `docs/execution-persistence-schema-proposal.md` previously proposed an
  `execution_records` table, but it is proposal-only.
- `docs/execution-persistence-schema-review.md` explicitly recommends delaying
  normalized execution records until broker evidence semantics, idempotency,
  RLS, and product-linking boundaries are clearer.
- the actual migration set does not create `execution_records`.
- no runtime code writes an execution-record table.
- current local/dev execution records remain local diagnostics, not Supabase
  production rows.

Current gaps/unknowns:

- no confirmed `execution_records` table exists in the migration set.
- no `broker_execution_results` table exists in the migration set.
- no durable `execution_intents` or `broker_handoffs` table exists.
- no production confirmed broker result path exists.
- no execution-record insert route exists.
- no user/account ownership model for execution records is finalized.
- RLS conventions are not finalized for execution audit tables; the audit
  foundation migration explicitly leaves RLS as a TODO.

## 3. Execution record schema requirements

A future execution record table should be designed as a normalized summary
derived from confirmed broker evidence and validated candidate data. A likely
table name is `public.execution_records`, but the final name should be
confirmed in the schema plan.

Proposed columns:

- `id uuid primary key default gen_random_uuid()`.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()`.
- `user_id uuid null` or account/user context once ownership is finalized.
- `account_id text null` if the app needs broker/account scoping separate from
  auth user id.
- `broker text not null`.
- `broker_order_id text null`.
- `broker_confirmation_id text null`.
- `broker_result_id uuid null` if a future `broker_execution_results` table
  exists.
- `ticker text not null`.
- `instrument_id text null`.
- `instrument_name text null`.
- `market text null`.
- `instrument_type text null`.
- `side text not null`.
- `execution_phase text not null`.
- `execution_mode text not null`.
- `quantity numeric not null`.
- `price numeric not null`.
- `currency text null`.
- `fees numeric null`.
- `gross_amount numeric null`.
- `net_amount numeric null`.
- `source_recommendation_id text null`.
- `source_position_id text null`.
- `handoff_session_id text null`.
- `planning_snapshot_id text null`.
- `confirmed_at timestamptz not null`.
- `captured_at timestamptz null`.
- `idempotency_key text not null`.
- `record_fingerprint text not null`.
- `source_fingerprint text not null`.
- `broker_result_fingerprint text null`.
- `source_environment text not null`.
- `is_mock boolean not null default false`.
- `is_dev boolean not null default false`.
- `validation_status text not null`.
- `validation_errors jsonb not null default '[]'::jsonb`.
- `validation_warnings jsonb not null default '[]'::jsonb`.
- `metadata jsonb not null default '{}'::jsonb`.
- `audit_metadata jsonb not null default '{}'::jsonb`.

Recommended check constraints:

- `side in ('buy', 'sell')`.
- `execution_phase in ('entry', 'exit')`, unless future partial fill/status
  modeling needs more values.
- `execution_mode in ('semi_automatic', 'automatic')`.
- `broker in ('avanza')` initially, or a broader broker enum only when needed.
- `source_environment in ('local_dev', 'staging', 'production')`.
- `quantity > 0`.
- `price > 0`.

Schema plan notes:

- `user_id` should stay nullable only if the table is local/staging-only or
  server-only with a documented ownership model. Production needs a clearer
  account/user scope.
- `metadata` must not store credentials, cookies, raw broker pages, or full
  browser session data.
- the table should summarize confirmed executions; broker evidence may need a
  separate `broker_execution_results` table first.

## 4. Idempotency/unique constraints

Proposed constraints:

- unique `idempotency_key`.
- unique `record_fingerprint`.
- unique `(broker, broker_confirmation_id)` where `broker_confirmation_id is
  not null` and `is_mock = false` and `is_dev = false`.
- unique `(broker, broker_order_id, confirmed_at)` where confirmation id is
  missing, if this does not break partial-fill semantics.
- optional unique `broker_result_id` where a separate broker evidence table is
  added.

Duplicate prevention strategy:

- validate candidate idempotency before insert.
- rely on database uniqueness at insert time.
- return duplicate/existing metadata on idempotency or fingerprint conflict.
- return `needs_review` on conflicting duplicate signals.
- never create another execution record for the same confirmed broker
  execution.

Retry behavior:

- exact retry should return existing/duplicate metadata.
- retry with changed association should require review.
- retry after unknown partial failure should query by idempotency key,
  fingerprint, broker confirmation id, and source fingerprint before insert.

Conflict behavior:

- duplicate by idempotency key is expected and safe to classify as duplicate.
- duplicate by broker confirmation id must block insert.
- duplicate by fingerprint must block insert.
- duplicate conflicts that point to different recommendations or positions
  should be `needs_review`, not silently accepted.

## 5. RLS/security assumptions

Current state:

- existing execution audit migration comments state that RLS is intentionally
  not enabled because project-wide auth/user ownership is not finalized.
- this same gap applies to future execution records.

Future assumptions:

- production writes should be server-only unless a later review proves direct
  client writes are safe.
- service-role writes should be limited to narrow API routes or trusted jobs.
- clients may read only records scoped to their user/account once ownership is
  finalized.
- production queries should filter out `is_mock = true`, `is_dev = true`, and
  non-production `source_environment` unless explicitly inspecting dev data.
- RLS policies should prevent one user/account from reading another account's
  execution history.
- no broker credentials, cookies, Avanza session data, or raw browser pages
  should be stored.

No direct client write should be added until:

- ownership is defined.
- RLS policy is written and tested.
- server-only idempotency/duplicate checks exist or direct writes are rejected.

## 6. Migration requirements

Future migration needed:

- yes. No execution-record table exists in the current migration set.

Migration requirements:

- create the table and indexes in a separate action.
- keep any migration separate from runtime write wiring.
- define rollback SQL before apply.
- verify table, column, index, constraint, and RLS state after apply.
- apply local/staging first.
- production apply should wait for RLS/user ownership and backup/snapshot
  confirmation.

Compatibility:

- existing local/dev `TureExecutionRecord` localStorage diagnostics should not
  be migrated automatically.
- dev fixture candidates should not be backfilled.
- existing `positions.execution_metadata` should remain separate until a trade
  mutation/read-model boundary is planned.

No migration is included in this action.

## 7. Relationship to trade mutations

Execution record persistence does not open, close, sell, exit, or update
trades.

Rules:

- no trade mutation in the execution-record insert action.
- no recommendation status mutation in the execution-record insert action.
- no History card creation in the execution-record insert action.
- no Statistics recalculation side effect in the execution-record insert
  action.
- trade open/close mutation requires a separate validator, idempotency design,
  rollback policy, and e2e coverage.

Statistics and History must not double-count:

- current app state may already represent positions and closed trades.
- future read models should decide whether to read from positions, execution
  records, or both.
- persisted execution records should not be counted as completed trades until
  a separate integration boundary says how.

## 8. Relationship to audit/event logs

Audit persistence is separate from execution-record persistence.

Current audit state:

- draft audit tables exist for lifecycle events, agent runs, and progress
  events.
- audit writer drafts and route stubs exist, but execution-record persistence
  does not use them.

Future relationship:

- a future execution-record insert should likely append audit events for
  attempt, success, duplicate, rejection, and failure.
- audit append ordering must be planned before implementation.
- audit failure behavior must be defined before writes are enabled.
- audit events should link to the source handoff, broker result/capture,
  idempotency key, and persisted execution record id when available.

No audit append is added by this action.

## 9. Candidate next actions

A. Create Supabase Execution Record Schema Plan

- Best next step.
- Can remain documentation-only while turning this boundary reassessment into a
  concrete table/constraint/RLS/migration plan.
- Should resolve whether broker evidence table design must come first.

B. Create Execution Record Persistence Contract Types

- Useful after schema shape is clearer.
- Higher risk if done before schema, because persistence types may drift from
  database constraints.

C. Create Execution Record Persistence Eligibility Validator

- Should wait until the schema and persistence contract types are drafted.

D. Create migration later after schema plan

- Must be a separate action after local/staging apply strategy and rollback SQL
  are reviewed.

E. Reassess BrokerExecutionResult Confirmation Path

- Needed before real persistence, but higher risk than schema planning because
  it moves closer to real broker evidence capture.

## 10. Recommended next action

**Action 426 - Create Supabase Execution Record Schema Plan**

## Action 426 Follow-Up

Action 426 created
`docs/supabase-execution-record-schema-plan.md`.

Planning outcome:

- Proposed `public.execution_records` as the future normalized execution record
  table.
- Defined planned columns, nullability, constraints, indexes, RLS/security
  posture, idempotency strategy, audit relationship, trade mutation separation,
  migration strategy, and open questions.
- Reconfirmed no execution-record table or write path exists today.
- Recommended type-only persistence contract work before any migration draft.
- Added no migration, Supabase write, Supabase client change, execution record
  storage, audit append, trade mutation, broker result creation,
  Avanza/browser behavior, or runtime behavior.

Next recommended action:

**Action 427 - Create Execution Record Persistence Contract Types**

## Action 427 Follow-Up

Action 427 created
`lib/execution-record-persistence-contract.ts`.

Result:

- Added persistence contract types aligned with the Action 424 boundary plan
  and Action 426 schema plan.
- Explicitly modeled rejection reason codes for missing idempotency, missing
  user/RLS context, missing broker confirmation, preview-only/dev-fixture/mock
  candidates, duplicates, ambiguous associations, schema gaps, unsupported
  brokers, and trade mutation separation.
- Modeled duplicate matches and persisted record references without adding
  writes or migrations.

Next recommended action:

**Action 428 - Create Execution Record Persistence Eligibility Validator**

## Action 429 Follow-Up

Action 429 created
`docs/execution-record-persistence-validator-reassessment.md`.

Result:

- Reassessed the pure persistence validator after Action 428.
- Confirmed schema unavailable remains a hard rejection and no table/write path
  exists yet.
- Confirmed duplicate metadata is modeled but no duplicate lookup exists.
- Recommended a SQL migration draft as the next safe schema step.

Next recommended action:

**Action 430 - Create Supabase Execution Record Migration Draft**

## Action 430 Follow-Up

Action 430 created
`supabase/migrations/20260614000000_create_execution_records.sql`.

Result:

- Added a draft migration for the future `public.execution_records` table.
- The draft follows existing timestamped migration naming and plain SQL style.
- The draft includes constraints, indexes, idempotency uniqueness, nullable-aware
  broker uniqueness, JSONB metadata, and conservative RLS comments.
- The migration was not applied.
- No Supabase client changes, writes, record storage, audit append, trade
  mutation, broker result creation, UI wiring, or Avanza/browser behavior were
  added.

Next recommended action:

**Action 431 - Reassess Supabase Execution Record Migration Draft**

## Action 431 Follow-Up

Action 431 created
`docs/supabase-execution-record-migration-draft-reassessment.md`.

Result:

- Reassessed the draft `public.execution_records` migration before any apply.
- Verified schema-only status and alignment with the schema plan.
- Confirmed no migration application, generated types, Supabase client change,
  write path, read path, audit append, trade mutation, broker result creation,
  or browser/Avanza behavior was added.

Next recommended action:

**Action 432 - Create Execution Record Persistence Insert Contract/Plan**

Rationale:

- no execution-record table exists today.
- schema and RLS decisions should precede persistence contract types.
- the plan can stay documentation-only and avoid migrations or writes.
- it can decide whether `broker_execution_results` must be designed before
  `execution_records`.

## 11. Risk assessment

Schema drift risk:

- high if persistence contract types or builders evolve before table
  constraints are planned.

Duplicate record risk:

- high until unique idempotency, fingerprint, and broker confirmation
  constraints are designed.

RLS/security risk:

- high because execution records are sensitive trade/account-adjacent data and
  current execution audit RLS remains unresolved.

Wrong user/account association risk:

- high until the app defines whether execution records are user-owned,
  account-owned, service-owned, or some combination.

Statistics double-counting risk:

- high if execution records are later read alongside current positions/history
  without a read-model boundary.

Audit mismatch risk:

- medium/high until audit append ordering and failure policy are planned.

Migration rollback risk:

- medium. A table-only migration is lower risk than write wiring, but
  constraints and indexes become compatibility commitments after apply.

## 12. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made.
