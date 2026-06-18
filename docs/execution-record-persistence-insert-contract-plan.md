# Execution Record Persistence Insert Contract Plan

## 1. Purpose

Define the future insert contract for execution record persistence before any
runtime implementation exists. This plan describes the expected insert inputs,
outputs, server-only posture, validation gates, duplicate handling, audit
relationship, trade mutation separation, and implementation preconditions.

This action is documentation-only. It adds no runtime code, Supabase write,
Supabase client change, database migration application, route/API
implementation, execution record storage, audit append, trade mutation, broker
result creation, Avanza/browser behavior, or execution behavior.

## 2. Current persistence pipeline inventory

Candidate builder:

- `lib/execution-record-candidate-builder.ts` builds an
  `ExecutionRecordCandidate` only after the pure creation validator returns an
  eligible result.
- current builder output remains non-persistent by default and is not wired to
  any write path.
- the Action 422 dev fixture can produce an eligible preview candidate for UI
  coverage, but it is explicitly fixture-only and must remain blocked from
  real persistence.

Persistence contract types:

- `lib/execution-record-persistence-contract.ts` defines the future
  persistence input, result, duplicate metadata, persisted record reference,
  audit metadata, user/account context, broker confirmation metadata,
  association metadata, and safety checklist contracts.
- those types do not write, query, or mutate anything.

Persistence eligibility validator:

- `lib/execution-record-persistence-validator.ts` validates
  `ExecutionRecordPersistenceInput`.
- it can return `eligible`, `rejected`, `duplicate`, or `needs_review`.
- it is pure and deterministic, and it does not import Supabase, localStorage,
  route, UI, audit append, trade mutation, broker result creation, bridge,
  Avanza, or browser modules.

Migration draft:

- `supabase/migrations/20260614000000_create_execution_records.sql` drafts the
  future `public.execution_records` table.
- the draft contains idempotency/fingerprint uniqueness, nullable-aware broker
  reference uniqueness, query indexes, validation fields, JSONB metadata, and
  conservative RLS comments.
- the migration has not been applied.

Current gaps:

- no applied `execution_records` table exists.
- no generated Supabase types exist for this table.
- no Supabase execution-record write path exists.
- no duplicate lookup implementation exists.
- no audit append implementation is connected to execution-record persistence.
- no trade mutation path exists.

## 3. Future insert input

The future insert boundary should accept a validated persistence input rather
than raw UI, broker-preview, or candidate-builder values.

Expected input shape:

- validated `ExecutionRecordPersistenceInput`.
- validated `ExecutionRecordCandidate`.
- `candidateStatus` or equivalent proof that the creation result was eligible.
- stable `idempotencyKey`.
- stable `recordFingerprint`.
- stable `sourceFingerprint`.
- optional `brokerResultFingerprint` when confirmed broker evidence provides
  one.
- authenticated `userContext`, including user id and/or account context
  according to the final ownership model.
- broker confirmation metadata, including broker, order id, confirmation id
  when available, confirmation timestamp, and captured timestamp.
- association metadata, including source recommendation id, source position id,
  handoff session id, planning snapshot id, and association confidence.
- schema/version metadata, including contract versions and source environment.
- audit context, including request id, capture id, source event ids, actor
  type, and explicit no-trade-mutation intent.
- safety checklist proving the candidate is not preview-only, fixture-only,
  synthetic, mock, dev-only, automatic-mode unreviewed, or missing required
  broker confirmation evidence.

The insert input must not include commands to open, close, sell, exit, or
otherwise mutate trade state.

## 4. Future insert output

The insert output should report persistence outcome only.

Expected output shape:

- status: `inserted`, `duplicate`, `rejected`, `needs_review`, or `error`.
- persisted record reference when a row is inserted or an existing duplicate is
  intentionally returned.
- duplicate match metadata for idempotency key, record fingerprint, broker
  confirmation id, broker order id, broker result id, or source fingerprint
  matches.
- rejection reason codes from the persistence contract.
- warnings for non-blocking issues.
- audit metadata describing the persistence attempt, target schema/table,
  request id, source fingerprints, and no-trade-mutation confirmation.
- no trade mutation output.

The output must not imply that History, Statistics, active positions, or
recommendation state were updated. Those integrations need separate future
read-model or mutation boundaries.

## 5. Server-only posture

Insert should be server-side only:

- no direct browser/client insert into `public.execution_records`.
- no client-supplied trust for `user_id`, `account_id`, broker confirmation
  evidence, idempotency, or safe-to-write state.
- the server boundary should run the persistence validator before any insert
  attempt.
- the server should derive or verify user/account context from trusted auth
  context, not from unauthenticated client payloads.
- the server should map the validated input to an insert payload explicitly,
  rather than spreading arbitrary metadata into table columns.

Service role/client expectations:

- service-role writes may be acceptable only inside a narrow server route or
  trusted server action.
- a normal anon/browser client should not be granted direct insert/update
  access.
- if RLS is enabled later, policies must align with the final user/account
  ownership model.
- if RLS remains disabled for server-only writes, the route must be
  authenticated and audited before production use.

Validation should run before insert:

- creation validation and candidate building must happen before persistence
  validation.
- persistence validation must reject unsafe, preview-only, dev fixture,
  synthetic, mock, missing-user-context, missing-confirmation, and
  schema-unavailable inputs before database work.

## 6. Insert algorithm plan

Future algorithm:

1. Receive a contract-shaped insert request on a server-only boundary.
2. Authenticate the request and derive trusted user/account context.
3. Reconstruct or verify `ExecutionRecordPersistenceInput`.
4. Run `validateExecutionRecordPersistenceInput(...)`.
5. Reject hard failures without querying or inserting.
6. Return `needs_review` for ambiguous association, automatic-mode, audit
   policy, or conflicting safety metadata before insert.
7. Check duplicate/idempotency keys against `public.execution_records` when the
   table exists.
8. Map the validated input to a strict insert row for the draft table columns.
9. Insert the row.
10. Handle unique-conflict responses by performing a duplicate lookup and
    returning duplicate metadata when safe.
11. Return a persisted record reference or duplicate result.
12. Do not mutate trade state.
13. Do not append audit events in the first insert implementation unless a
    separate audit boundary has explicitly approved ordering and failure
    behavior.

The first implementation should support a dry-run or route-stub phase before
any real insert is enabled.

Action 438 follow-up:

- `docs/execution-record-insert-route-dry-run-stub-design.md` defines that
  dry-run phase as a future no-write route posture.
- The dry-run route should run request and persistence validation, simulate
  duplicate metadata only when explicitly requested, and return safety metadata
  proving no Supabase write, audit append, trade mutation, or broker/browser
  behavior occurred.
- The next recommended action is
  **Action 439 - Reassess Insert Route Dry-Run Stub Design** before any
  runtime route file is created.

Action 439 follow-up:

- `docs/execution-record-insert-route-dry-run-stub-design-reassessment.md`
  verified the dry-run phase remains write-free and mutation-free.
- It concluded a dry-run-only route implementation is safe next if it uses the
  existing route contract and pure persistence validator without Supabase
  imports, duplicate lookup, audit append, trade mutation, client helper, or
  broker/browser behavior.
- The next recommended action is
  **Action 440 - Implement Execution Record Insert Route Dry-Run Stub**.

Action 440 follow-up:

- `app/api/execution/records/insert/route.ts` now implements the dry-run-only
  route stub for this insert contract.
- The route uses `validateExecutionRecordPersistenceInput(...)` and returns
  typed route responses without Supabase reads/writes.
- Real insert remains unavailable; no migration application, duplicate DB
  lookup, audit append, trade mutation, or broker/browser behavior was added.
- The next recommended action is
  **Action 441 - Reassess Execution Record Insert Route Dry-Run Stub**.

Action 441 follow-up:

- `docs/execution-record-insert-route-dry-run-stub-reassessment.md`
  verified the dry-run route remains no-write, no-read, no-audit, and
  no-mutation.
- It confirmed the route uses the pure persistence validator and maps eligible
  results to dry-run only.
- The next recommended action is
  **Action 442 - Create Dry-Run Route Client Helper**.

Action 442 follow-up:

- `lib/execution-record-insert-dry-run-client.ts` now provides a typed helper
  for the dry-run route.
- The helper refuses non-dry-run requests and returns typed fallback responses
  for malformed route responses without throwing untyped errors.
- No UI wiring, production insert helper, Supabase behavior, audit append,
  trade mutation, broker result creation, or Avanza/browser behavior was
  added.
- The next recommended action is
  **Action 443 - Reassess Dry-Run Route Client Helper**.

Action 443 follow-up:

- `docs/execution-record-insert-dry-run-client-reassessment.md` verified the
  helper remains dry-run-only, typed, no-write, and unwired from UI.
- It confirmed fallback responses preserve safety metadata and that no
  production insert helper exists.
- The next recommended action is
  **Action 444 - Create Read-Only Dry-Run Route UI Preview Design**.

Action 444 follow-up:

- `docs/execution-record-insert-dry-run-ui-preview-design.md` defines the
  read-only UI preview for the dry-run insert route.
- It keeps UI wiring out of scope while documenting placement, inputs, output
  fields, safety copy, interaction model, tests, and non-goals.
- The next recommended action is
  **Action 445 - Implement Read-Only Dry-Run Route UI Preview**.

## 7. Duplicate/idempotency handling

Idempotency key conflict behavior:

- the same idempotency key should never create two rows.
- retrying the same safe input should return the existing persisted reference
  or a `duplicate` result.
- conflicting input for the same idempotency key should return
  `needs_review`, not overwrite.

Broker confirmation/order conflict behavior:

- a non-null broker confirmation id should uniquely identify a real non-dev,
  non-mock broker confirmation for the same broker.
- when confirmation id is unavailable, broker order id plus confirmed
  timestamp is only a fallback and remains sensitive to partial-fill semantics.
- broker order fallback conflicts should return `duplicate` only when the
  matched row is clearly the same execution; otherwise return `needs_review`.

Retry behavior:

- retry after network failure should first perform duplicate lookup using
  idempotency key and record fingerprint.
- retry after an ambiguous database response should return `needs_review`
  until the existing state is known.
- retrying a dev fixture, preview-only, synthetic, or mock candidate must
  remain rejected.

Statistics/history safety:

- persistence must not double count records in History or Statistics.
- History/Statistics should not consume persisted rows until a separate
  read-model plan defines how persisted execution records relate to current
  trade state.

## 8. Error handling and rollback

Validation failures:

- return `rejected` with explicit persistence rejection reasons.
- do not query or insert when hard safety gates fail.

Schema unavailable:

- return `rejected` or `error` according to the persistence contract.
- do not fallback to localStorage or another table.

Insert conflict:

- inspect conflict type if possible.
- return `duplicate` for known same-record conflicts.
- return `needs_review` for conflicting duplicate matches.
- never update an existing row silently.

Network/db error:

- return `error` with a non-sensitive error classification.
- do not mutate local app state as if persistence succeeded.
- do not append audit success events.

Partial write prevention:

- the initial insert boundary should do exactly one insert into
  `execution_records`.
- audit append and trade mutation should not be bundled, so rollback does not
  need to undo trade state.

Rollback:

- before any migration is applied, rollback is doc/process only.
- after migration application, rollback must be handled by a separate
  migration application checklist and should not drop production data without
  explicit approval.

## 9. Audit relationship

Audit events are important but should remain a separate future boundary.

Initial insert should not append audit:

- no audit event append in the first insert implementation.
- no local execution event log append.
- no execution audit table write.
- no route should claim audit persistence succeeded until that boundary exists.

Future audit events should be designed separately:

- insert attempt.
- insert rejected with rejection reasons.
- duplicate detected with duplicate metadata.
- insert success with persisted record id and record fingerprint.
- insert failure with error classification.
- needs-review decision with review reasons.

Future audit events should reference:

- persisted execution record id when available.
- record fingerprint.
- idempotency key.
- broker order id and confirmation id.
- source handoff session id.
- source recommendation id or position id.
- request id/capture id.

Audit failure policy:

- a later boundary must decide whether audit append is best-effort or
  blocking.
- the initial insert plan should avoid this ambiguity by not appending audit
  at all.

## 10. Trade mutation separation

Execution record persistence does not open or close trades.

Explicit separation:

- no active position creation.
- no close/sell/exit mutation.
- no recommendation status update.
- no History insertion.
- no Statistics recalculation trigger.
- no localStorage trade mutation.
- no Supabase position/trade update.

Trade state update must be a separate action and boundary:

- it should consume a persisted record reference only after persistence is
  proven safe.
- it should define its own idempotency and rollback behavior.
- it should define how trade state and execution records remain consistent.

History and Statistics integration must not assume inserted records immediately
mutate trade state. A later read-model boundary should decide how persisted
execution records are displayed and counted.

## 11. Preconditions before implementation

Before any real insert implementation:

- migration applied in local or staging only.
- generated DB types updated if the project uses them.
- RLS/ownership model confirmed.
- server-only route or server action pattern chosen.
- duplicate constraints verified against local/staging data.
- broker confirmation/order uniqueness reviewed for partial fills.
- persistence validator aligned with the applied schema.
- insert payload mapping reviewed field-by-field.
- no client direct insert posture confirmed.
- test strategy chosen for pure validation, route dry run, duplicate handling,
  conflict handling, and no trade mutation.
- rollback strategy documented.
- audit append boundary deferred or explicitly designed.
- trade mutation boundary deferred or explicitly designed.

Production remains blocked until the same preconditions are proven in staging
and ownership/RLS are reviewed.

## 12. Candidate future implementation sequence

Action 433: Reassess Execution Record Persistence Insert Contract Plan

- verify this plan against current contracts, validator, migration draft, and
  safety requirements.
- decide whether route design is safe next.

Action 434: Create Execution Record Insert Server Route Design

- documentation-only route shape, auth assumptions, dry-run behavior, and
  server-only posture.
- no route implementation.

Action 435: Create Execution Record Insert Client Contract Types

- type-only request/response contracts for a future client/server boundary if
  still needed.
- no fetch helper or write.

Action 436: Implement Insert Route Stub / Dry Run

- server-gated dry-run route that validates and returns planned insert payload
  metadata.
- no Supabase insert until migration is applied locally/staging and route
  gating is reviewed.

Later actions:

- apply migration locally/staging with explicit approval.
- generate/update DB types after apply.
- implement duplicate lookup behind server-only boundary.
- implement real insert only after dry-run and schema verification.
- design audit append ordering.
- design trade mutation boundary separately.

## 13. Recommended next action

**Action 433 - Reassess Execution Record Persistence Insert Contract Plan**

## Action 445 Follow-Up

Action 445 added the first read-only UI surface for the dry-run insert route.

Persistence boundary preserved:

- The UI does not persist execution records.
- No Supabase read/write, migration application, audit append, trade mutation,
  broker result creation, or Avanza/browser behavior was added.
- The visible dry-run response includes no-write/no-mutation metadata and a
  no-record-persisted message.
- The future real insert contract remains blocked by migration, RLS/user
  context, duplicate lookup, audit append, trade mutation, and confirmed broker
  result readiness.

Next recommended action:

**Action 446 - Reassess Read-Only Dry-Run Route UI Preview**

## Action 446 Follow-Up

Action 446 created
`docs/execution-record-insert-dry-run-ui-preview-reassessment.md`.

Persistence boundary status:

- The dry-run UI remains no-write/no-mutation and does not persist execution
  records.
- No Supabase read/write, localStorage write, audit append, trade mutation,
  execution record storage, migration application, broker result creation, or
  Avanza/browser behavior was added.
- Real insert remains blocked by migration application, DB/generated types,
  RLS/ownership, duplicate DB lookup, confirmed broker result path, audit
  append boundary, and trade mutation boundary.

Next recommended action:

**Action 447 - Create Supabase Migration Application Checklist**

## Action 447 Follow-Up

Action 447 created
`docs/supabase-execution-record-migration-application-checklist.md`.

Insert boundary status:

- the checklist defines migration application preconditions and sequencing
  without enabling real inserts.
- local/staging/production apply, generated type timing, RLS/security review,
  rollback, and no-write guardrails are documented.
- no Supabase writes, real insert route, audit append, trade mutation, broker
  result creation, or Avanza/browser behavior was added.

Next recommended action:

**Action 448 - Reassess BrokerExecutionResult Confirmation Path**

Rationale:

- the insert contract is still documentation-only and should be checked before
  route design creates a runtime surface.
- the migration remains unapplied, ownership/RLS remain unresolved, and
  partial-fill uniqueness is still an open question.
- a reassessment can confirm whether the route design should proceed or
  whether migration application/generation planning should happen first.

## 14. Risk assessment

False insert risk:

- high if preview-only, fixture, synthetic, mock, missing-confirmation, or
  unreviewed automatic-mode candidates are allowed through.

Duplicate record risk:

- high without both validator gates and database uniqueness.
- partial fills may make broker order fallback uniqueness unsafe without
  broker confirmation evidence.

RLS/user context risk:

- high until ownership semantics are finalized.
- user/account context must be server-derived or strongly verified.

Dev fixture persistence risk:

- high because the Action 422 fixture can intentionally produce an eligible
  preview candidate. The persistence validator and insert boundary must keep
  fixture candidates rejected.

Schema drift risk:

- medium/high while the migration is draft-only and generated DB types are not
  updated.

Audit mismatch risk:

- medium/high if insert success and audit append are implemented in separate
  systems without an ordering policy.

Trade mutation coupling risk:

- high if insert is bundled with open/close trade mutation.

Statistics double-counting risk:

- high if persisted execution records are immediately counted alongside
  existing History/trade state without a read-model boundary.

## 15. Verification

Verification for this documentation-only plan:

- `git diff --check`

No runtime code changes were made. No write path, route, Supabase client
change, migration application, audit append, trade mutation, broker result
creation, or Avanza/browser behavior was added.

## Action 433 Follow-Up

Action 433 created
`docs/execution-record-persistence-insert-contract-plan-reassessment.md`.

Result:

- Verified the insert contract plan remains server-only, write-free,
  mutation-free, and aligned with the persistence contracts, pure validator,
  schema plan, migration draft, and creation candidate builder.
- Confirmed the plan still adds no route/API implementation, Supabase client
  change, migration application, audit append, trade mutation, broker result
  creation, or Avanza/browser behavior.
- Identified remaining blockers before real insert: unapplied migration,
  missing generated DB types, unresolved RLS/user ownership, missing duplicate
  lookup, missing route design, missing audit boundary, missing trade mutation
  boundary, and missing trusted broker confirmation path.

Next recommended action:

**Action 434 - Create Execution Record Insert Server Route Design**

## Action 434 Follow-Up

Action 434 created
`docs/execution-record-insert-server-route-design.md`.

Result:

- Turned the insert contract plan's route-design recommendation into a
  documentation-only server route design.
- Proposed `POST /api/execution/records/insert` as the future route path,
  aligned with existing `app/api/execution/...` conventions.
- Kept all runtime behavior out of scope: no route, no Supabase client, no
  write/read behavior, no migration application, no audit append, no trade
  mutation, and no broker/Avanza/browser behavior.

Next recommended action:

**Action 435 - Reassess Execution Record Insert Server Route Design**

## Action 435 Follow-Up

Action 435 created
`docs/execution-record-insert-server-route-design-reassessment.md`.

Result:

- Reassessed the server route design produced from this insert plan.
- Confirmed the design still honors server-only posture, validation-first
  ordering, duplicate/idempotency protections, audit separation, trade
  mutation separation, and future-only insert behavior.
- Recommended route contract types before any route stub or write behavior.

Next recommended action:

**Action 436 - Create Execution Record Insert Route Contract Types**

## Action 436 Follow-Up

Action 436 created
`lib/execution-record-insert-route-contract.ts`.

Result:

- Added type-only route contracts that wrap the existing persistence input and
  persistence result concepts for the future insert route.
- Modeled dry-run metadata and explicit safety metadata so future stubs can
  state no write, no audit append, and no trade mutation.
- Added no implementation, route, client, Supabase behavior, audit append, or
  trade mutation.

Next recommended action:

**Action 437 - Reassess Execution Record Insert Route Contract Types**

## Action 437 Follow-Up

Action 437 created
`docs/execution-record-insert-route-contract-types-reassessment.md`.

Result:

- Verified route contracts preserve the insert plan's validation-first,
  idempotent, audit-separated, and trade-mutation-separated posture.
- Confirmed no route, client, Supabase read/write, migration application,
  audit append, or trade mutation was added.
- Recommended a dry-run stub design as the next documentation-only step.

Next recommended action:

**Action 438 - Create Execution Record Insert Route Dry-Run Stub Design**
