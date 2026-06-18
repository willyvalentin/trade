# Execution Record Insert Server Route Design

## 1. Purpose

Define the future server route for execution record insertion before any
implementation. This design captures the proposed route shape, auth/security
posture, request and response contracts, validation sequence,
idempotency/duplicate behavior, audit relationship, trade mutation separation,
and implementation preconditions.

This action is documentation-only. It adds no runtime code, route/API
implementation, Supabase write, Supabase client change, migration application,
audit append, trade mutation, broker result creation, Avanza/browser behavior,
or execution behavior.

## 2. Route scope

Proposed route path:

- `POST /api/execution/records/insert`

Rationale:

- existing execution API routes live under `app/api/execution/...`.
- `records/insert` keeps the route execution-domain scoped while avoiding
  collision with the existing dev-only `POST /api/execution/capture` route.
- the route name should remain explicit that it is an insert boundary, not a
  trade mutation boundary.

Server-only behavior:

- route implementation should run only on the server.
- the route should validate the request and derive trusted context before any
  database work.
- no direct browser/client Supabase insert should exist.
- no route should be implemented until the migration, generated type strategy,
  RLS/ownership assumptions, and dry-run strategy are settled.

Initial implementation posture:

- the first implementation should be a dry-run/stub route only.
- real insert should remain disabled until local/staging migration application
  and duplicate constraint verification are complete.

## 3. Request contract

Future request body should be based on `ExecutionRecordPersistenceInput`, not
raw UI state.

Expected fields:

- contract/version field for the route request.
- `requestedAt` timestamp.
- validated `ExecutionRecordPersistenceInput`.
- validated `ExecutionRecordCandidate`.
- `idempotencyKey`.
- `recordFingerprint`.
- `sourceFingerprint`.
- broker confirmation metadata:
  - broker.
  - broker order id.
  - broker confirmation id when available.
  - broker result id when available.
  - broker result/source fingerprint.
  - confirmed timestamp.
  - captured timestamp.
- association metadata:
  - source recommendation id.
  - source position id.
  - handoff session id.
  - planning snapshot id.
  - association confidence.
- audit context:
  - request id.
  - capture id.
  - source event ids.
  - actor type.
  - source environment.
  - explicit no-trade-mutation flag.
- safety checklist proving the input is not preview-only, dev fixture,
  synthetic, mock, missing broker confirmation, missing idempotency, missing
  user/account context, or unreviewed automatic mode.
- optional `dryRun` flag for route-stub and local/staging verification.

User/account context source:

- client-provided user/account context must not be trusted as authority.
- the server should derive or verify user/account context from authenticated
  server context.
- client-provided context can be compared for consistency, but it should not
  grant access or ownership.

Request non-goals:

- no trade mutation command.
- no audit append command.
- no raw broker page, cookie, credential, session, screenshot, or 2FA data.
- no client-selected Supabase table or write target.

## 4. Response contract

Future response should return a typed persistence result only.

Expected status values:

- `inserted`: row inserted successfully.
- `duplicate`: existing row matched the same idempotency/fingerprint/broker
  reference.
- `rejected`: validation or safety gates blocked the request.
- `needs_review`: ambiguous association, conflicting duplicate, partial-fill
  uncertainty, or unreviewed policy state requires manual review.
- `error`: unexpected server/database failure.

Expected response fields:

- contract/version field.
- evaluated/received timestamp.
- status.
- persisted record reference when inserted.
- duplicate metadata when duplicate.
- rejection reasons.
- warnings.
- idempotency key.
- record fingerprint.
- audit metadata describing the route attempt and no-trade-mutation state.
- non-sensitive error classification for failures.

Response non-goals:

- no trade mutation result.
- no History or Statistics mutation result.
- no recommendation or position update result.
- no broker execution result creation.
- no audit append success claim until a separate audit boundary exists.

## 5. Auth/security posture

Authenticated user requirements:

- the route should require an authenticated app/server context.
- anonymous or unauthenticated calls should return an auth rejection before
  validation or database work.
- production should require a reviewed user/account ownership model.

Server-side user/account derivation:

- user id and account id should be derived or verified server-side.
- client payloads may include expected context for consistency checks only.
- mismatched context should return `rejected` or `needs_review`.

Service role usage expectations:

- service-role writes, if used, must remain inside a narrow server route.
- no service-role key should ever be exposed to the browser.
- service-role use should be paired with explicit route auth, ownership
  derivation, and audit metadata.

RLS expectations:

- if RLS is enabled later, policies must align with the final user/account
  ownership model.
- if RLS is not enabled for server-only writes, the route must enforce
  ownership and remain closed to direct client writes.
- the migration draft's nullable `user_id` and `account_id` fields must be
  resolved before production writes.

Request spoofing protections:

- do not trust client-provided `safeToWrite`, `safeToPersist`, user id,
  account id, broker confirmation claims, or source environment without
  server validation.
- reject dev fixtures, preview-only data, synthetic data, mock data, and
  untrusted broker-result-shaped payloads.
- require stable idempotency and source fingerprints.
- avoid storing raw sensitive broker/browser material.

## 6. Validation sequence

Future route sequence:

1. Accept only `POST`.
2. Parse JSON body.
3. Reject malformed JSON.
4. Authenticate the request.
5. Derive trusted user/account context.
6. Check route environment and write flags if a future gated implementation
   uses them.
7. Validate request contract shape.
8. Reconstruct or verify `ExecutionRecordPersistenceInput`.
9. Run `validateExecutionRecordPersistenceInput(...)`.
10. Reject dev fixture, preview-only, unsafe, synthetic, mock, missing context,
    missing confirmation, schema unavailable, and trade-mutation-coupled
    inputs.
11. Verify migration/schema availability if real insert is enabled.
12. Check duplicate/idempotency matches.
13. Map validated input to the strict `execution_records` insert row.
14. Insert the row only on an explicitly enabled real-write path.
15. Handle database conflicts and classify duplicate vs needs-review.
16. Return a typed result.
17. Do not mutate trades.

Dry-run behavior:

- dry-run should execute parsing, auth, contract validation, persistence
  validation, and planned insert mapping.
- dry-run should not insert records.
- dry-run should clearly report no write occurred.

## 7. Idempotency/duplicate strategy

Idempotency key uniqueness:

- `idempotency_key` is unique in the migration draft.
- retrying the same safe request should return the existing record or a
  duplicate result.
- a changed request for the same idempotency key should return `needs_review`.

Broker confirmation/order conflict handling:

- `(broker, broker_confirmation_id)` is the preferred real broker duplicate
  guard when confirmation id exists.
- `(broker, broker_order_id, confirmed_at)` is a fallback only when
  confirmation id is missing.
- the fallback must remain under review because partial fills may create more
  than one legitimate event for the same order.

Conflict response semantics:

- known same-record conflict: return `duplicate` with existing record
  reference.
- conflicting duplicate metadata: return `needs_review`.
- unknown conflict type: return `error` or `needs_review`, not silent success.

Retry behavior:

- retry after network failure should first look up by idempotency key and
  record fingerprint.
- retry after ambiguous insert response should avoid blind reinsert.

No double-counting:

- route response must not cause History or Statistics to count the record.
- read-model integration must be a separate future boundary.

## 8. Error handling

Validation errors:

- malformed JSON: return invalid/rejected route response.
- contract shape errors: return `rejected`.
- persistence validator failures: return `rejected` with explicit reasons.

Auth errors:

- unauthenticated or unauthorized calls should return an auth rejection.
- user/account mismatch should return `rejected` or `needs_review`.

Schema unavailable:

- return `rejected` or `error`.
- do not fallback to localStorage or another table.
- do not attempt insert when migration availability is unverified.

Duplicate conflicts:

- return `duplicate` for known same-execution matches.
- return `needs_review` for conflicting duplicate matches.

Supabase insert failures:

- return `error` with non-sensitive classification.
- do not leak SQL, credentials, connection strings, or sensitive payloads.
- do not mutate app state as if insert succeeded.

Unexpected server errors:

- return a safe `error` result.
- include request/idempotency metadata when safe.
- keep broker, user, and account sensitive data minimized.

Rollback:

- no partial trade mutation rollback is needed because the route must not
  mutate trades.
- audit append is not part of the initial route, so no audit rollback is
  needed in the first implementation.

## 9. Audit relationship

Initial route implementation:

- no audit append.
- no local execution event log append.
- no execution audit table write.
- no response should claim audit event persistence.

Future audit boundary:

- may emit insert attempt, rejected, duplicate, success, failure, and
  needs-review events.
- should reference persisted execution record id when available.
- should reference record fingerprint, idempotency key, broker order id,
  broker confirmation id, handoff session id, and request id/capture id.
- must define whether audit append is blocking or best-effort before real
  route writes depend on it.

## 10. Trade mutation separation

The route only inserts an execution record.

It does not:

- open positions.
- close positions.
- sell or exit live trades.
- update recommendation status.
- update live trade state.
- update History.
- update Statistics.
- mutate localStorage trade state.
- mutate Supabase position/trade rows.

Trade mutation route/boundary:

- must be a separate future design.
- should consume persisted execution record references only after persistence
  is proven safe.
- needs independent idempotency, rollback, audit, and History/Statistics
  integration rules.

## 11. Preconditions before implementation

Before any route implementation:

- migration applied in local/staging or route explicitly limited to dry-run
  stub behavior.
- generated DB types available or an explicit temporary DB typing plan.
- RLS/security assumptions resolved for the target environment.
- server authentication pattern chosen.
- server-side user/account derivation designed.
- duplicate lookup strategy finalized.
- insert row mapping reviewed against the migration draft.
- partial-fill broker order uniqueness reviewed.
- tests prepared for parsing, auth failure, validation rejection, dry-run
  success, duplicate, conflict, and no trade mutation.
- rollback/apply plan documented for migration usage.

Before real insert:

- local/staging migration applied and verified.
- generated types updated if used by runtime code.
- route write flag/server gating designed.
- duplicate constraints verified against the target database.
- production remains blocked until RLS/ownership, backup, rollback, and audit
  posture are reviewed.

## 12. Candidate implementation sequence

Action 435: Reassess Execution Record Insert Server Route Design

- verify this design remains documentation-only and safe.
- decide whether route contract types are safe next.

Action 436: Create Execution Record Insert Route Contract Types

- type-only request/response contracts for the future route.
- no route implementation and no Supabase write.

Action 437: Implement Insert Route Dry-Run Stub

- dev/server-gated route stub that validates and returns planned insert
  metadata.
- no Supabase insert.
- no audit append.
- no trade mutation.

Later:

- migration application checklist.
- local/staging migration application with explicit approval.
- generated DB types update.
- duplicate lookup implementation.
- real insert implementation behind server-only flags.

## 13. Recommended next action

**Action 435 - Reassess Execution Record Insert Server Route Design**

## Action 445 Follow-Up

Action 445 added a read-only dry-run route preview to the dev-gated execution
handoff modal path.

Server-route posture remains unchanged:

- The UI invokes only the dry-run client helper.
- No real insert route behavior, Supabase client/write/read, migration
  application, audit append, trade mutation, broker result creation, or
  Avanza/browser behavior was added.
- The preview labels the response as dry-run only and displays no-write,
  no-audit, no-trade-mutation, and no-record-persisted metadata.

Next recommended action:

**Action 446 - Reassess Read-Only Dry-Run Route UI Preview**

## Action 446 Follow-Up

Action 446 created
`docs/execution-record-insert-dry-run-ui-preview-reassessment.md`.

Server-route posture remains unchanged:

- The implemented preview is dev-gated/read-only and calls only the dry-run
  client helper.
- No route/API real-write behavior, Supabase client usage, migration
  application, audit append, trade mutation, broker result creation, or
  Avanza/browser behavior was added.
- The next safe step is to document migration application readiness before any
  real insert work.

Next recommended action:

**Action 447 - Create Supabase Migration Application Checklist**

Rationale:

- the route design is still documentation-only and should be checked before
  route contract types imply a concrete API surface.
- migration application, generated types, duplicate lookup, and real insert
  remain blocked.
- a reassessment can confirm whether type-only route contracts are safe next
  or whether migration application planning should come first.

## 14. Risk assessment

Route misuse risk:

- high if a future route is enabled before dry-run gating, auth, ownership, and
  write flags are settled.

Spoofed request risk:

- high if client-provided broker confirmation, user context, safe-to-write, or
  source environment claims are trusted.

Direct client write risk:

- high if browser clients can insert directly into `execution_records` or use
  Supabase credentials to bypass server validation.

RLS/user context risk:

- high until the nullable `user_id`/`account_id` draft schema is paired with a
  final ownership model.

Duplicate write risk:

- high until duplicate lookup and database conflict classification are
  implemented and tested.

Audit mismatch risk:

- medium/high because initial route design intentionally separates audit
  append from insert.

Trade mutation coupling risk:

- high if route implementation tries to update positions, recommendations,
  History, or Statistics.

Schema drift risk:

- medium/high while the migration is draft-only and generated DB types do not
  exist.

## 15. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No route/API implementation, write path,
Supabase client change, migration application, audit append, trade mutation,
broker result creation, or Avanza/browser behavior was added.

## Action 435 Follow-Up

Action 435 created
`docs/execution-record-insert-server-route-design-reassessment.md`.

Result:

- Verified the server route design remains future-only, server-only,
  write-free, and route-free.
- Confirmed it aligns with the persistence contract types, pure persistence
  validator, insert contract plan, schema plan, migration draft, and creation
  candidate builder.
- Identified remaining blockers before route implementation: unapplied
  migration, missing generated DB types, unresolved RLS/user ownership, missing
  duplicate lookup, unresolved auth/user-context strategy, missing route
  contract types, no trusted production broker result path, and no audit/trade
  mutation boundaries.

Next recommended action:

**Action 436 - Create Execution Record Insert Route Contract Types**

## Action 436 Follow-Up

Action 436 created
`lib/execution-record-insert-route-contract.ts`.

Result:

- Added route-specific TypeScript contracts for the future
  `POST /api/execution/records/insert` boundary.
- Kept the route design unimplemented and future-only.
- Confirmed no runtime route, client, Supabase write/read, migration
  application, audit append, trade mutation, broker result creation, or
  Avanza/browser behavior was added.

Next recommended action:

**Action 437 - Reassess Execution Record Insert Route Contract Types**

## Action 437 Follow-Up

Action 437 created
`docs/execution-record-insert-route-contract-types-reassessment.md`.

Result:

- Confirmed the route contract types align with this server route design.
- Confirmed route-specific dry-run, duplicate, validation, auth/error, and
  safety metadata are modeled without implementing the route.
- Recommended a documentation-only dry-run stub design before any runtime
  route file exists.

Next recommended action:

**Action 438 - Create Execution Record Insert Route Dry-Run Stub Design**

## Action 438 Follow-Up

Action 438 created
`docs/execution-record-insert-route-dry-run-stub-design.md`.

Result:

- Expanded this route design with a dry-run stub plan before any route file
  exists.
- Recommended the same route path,
  `POST /api/execution/records/insert`, with dry-run-only behavior and
  `mode: "insert"` blocked until persistence preconditions are complete.
- Kept duplicate lookup simulated, insert mapping planned-only, and safety
  metadata explicit: no Supabase write, no audit append, no trade mutation,
  no broker result creation, and no Avanza/browser behavior.

Next recommended action:

**Action 439 - Reassess Insert Route Dry-Run Stub Design**

## Action 439 Follow-Up

Action 439 created
`docs/execution-record-insert-route-dry-run-stub-design-reassessment.md`.

Result:

- Confirmed the first route implementation can safely be dry-run-only on the
  existing `POST /api/execution/records/insert` path.
- Kept `mode: "insert"` disabled until migration, generated types, duplicate
  lookup, auth/RLS, audit boundary, and trade mutation separation are ready.
- Reaffirmed no Supabase reads/writes, audit append, trade mutation, broker
  result creation, or Avanza/browser behavior should be added in the dry-run
  stub.

Next recommended action:

**Action 440 - Implement Execution Record Insert Route Dry-Run Stub**

## Action 440 Follow-Up

Action 440 created the first route file for this design:
`app/api/execution/records/insert/route.ts`.

Result:

- Implemented only the dry-run route posture, not the real insert posture.
- The route requires dry-run mode and rejects `mode: "insert"`.
- The route runs pure validation and reports planned duplicate lookup/insert
  mapping without doing either against Supabase.
- No server/client write path, migration application, audit append, trade
  mutation, broker result creation, or Avanza/browser behavior was added.

Next recommended action:

**Action 441 - Reassess Execution Record Insert Route Dry-Run Stub**

## Action 441 Follow-Up

Action 441 created
`docs/execution-record-insert-route-dry-run-stub-reassessment.md`.

Result:

- Verified the implemented route follows the first-step dry-run posture from
  this server route design.
- Confirmed the route still does not implement the real insert posture.
- Confirmed real insert remains blocked on migration, generated types,
  duplicate DB lookup, RLS/user ownership, audit boundary, trade mutation
  boundary, and trusted broker confirmation.

Next recommended action:

**Action 442 - Create Dry-Run Route Client Helper**

## Action 442 Follow-Up

Action 442 created
`lib/execution-record-insert-dry-run-client.ts`.

Result:

- Added a typed helper for the dry-run route only.
- Kept server route behavior unchanged and dry-run-only.
- Added no UI wiring, no production insert caller, no Supabase read/write,
  no migration application, no audit append, no trade mutation, and no
  broker/Avanza/browser behavior.

Next recommended action:

**Action 443 - Reassess Dry-Run Route Client Helper**

## Action 443 Follow-Up

Action 443 created
`docs/execution-record-insert-dry-run-client-reassessment.md`.

Result:

- Verified the helper targets only the dry-run route posture of this server
  route design.
- Confirmed no UI wiring or production insert caller was added.
- Recommended a UI preview design before any user-facing integration.

Next recommended action:

**Action 444 - Create Read-Only Dry-Run Route UI Preview Design**

## Action 444 Follow-Up

Action 444 created
`docs/execution-record-insert-dry-run-ui-preview-design.md`.

Result:

- Designed future UI use of the dry-run route while preserving this server
  route design's no-write posture.
- Confirmed future UI should call only the dry-run helper and must not expose
  insert mode.
- Kept real insert, migration, audit append, trade mutation, broker result
  creation, and Avanza/browser behavior out of scope.

Next recommended action:

**Action 445 - Implement Read-Only Dry-Run Route UI Preview**
