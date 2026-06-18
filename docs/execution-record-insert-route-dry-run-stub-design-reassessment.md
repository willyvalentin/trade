# Execution Record Insert Route Dry-Run Stub Design Reassessment

## 1. Purpose

Reassess the execution record insert route dry-run stub design before any
runtime implementation. This document verifies that the proposed dry-run stub
remains no-write, no-mutation, no-audit, and disconnected from Supabase,
broker automation, and production execution flows.

This action is documentation-only. It adds no runtime code, route/API
implementation, client helper, Supabase read/write, migration application,
audit append, trade mutation, broker result creation, Avanza/browser behavior,
or execution behavior.

## 2. Current dry-run design inventory

Proposed route path and method:

- `POST /api/execution/records/insert`.
- the first implementation should accept only dry-run requests.
- `mode: "insert"` remains disabled until separate persistence
  preconditions are complete.

Request/response use:

- request shape should follow
  `ExecutionRecordInsertRouteRequest`.
- response shape should follow
  `ExecutionRecordInsertRouteResponse`.
- successful validation in the stub should return `status: "dry_run"`, not
  `status: "inserted"`.
- rejection, duplicate simulation, needs-review, and error responses should
  remain typed route responses.

Validation sequence:

- parse JSON.
- validate route contract version, method, path, mode, and required fields.
- require dry-run mode.
- use dev/sandbox gating or authenticated server context.
- run `validateExecutionRecordPersistenceInput(...)`.
- map pure validator results into route response metadata.
- always include safety metadata.

Duplicate simulation:

- no Supabase duplicate lookup is proposed.
- duplicate behavior is allowed only from explicit simulation inputs or
  already supplied duplicate-match data.
- simulated duplicate metadata must not claim that a real persisted row
  exists.

Safety metadata:

- `insertAttempted=false`.
- `supabaseWriteAttempted=false`.
- `auditAppendAttempted=false`.
- `tradeMutationAttempted=false`.
- `directClientSupabaseWriteAllowed=false`.
- `noTradeMutation=true`.
- `noAuditAppendInInitialRoute=true`.
- `noBrokerResultCreation=true`.
- `noAvanzaAutomation=true`.
- `migrationMustBeAppliedBeforeRealInsert=true`.

UI/client posture:

- no client helper is part of the design.
- any future UI use must stay dev/sandbox-gated.
- UI copy should say dry-run/no persistence/no mutation.
- the browser must not enable `mode: "insert"`.
- no persist/insert button should be introduced.

Non-goals:

- no route/API implementation in the design action.
- no Supabase read/write/upsert/delete.
- no migration application or generated DB types.
- no audit append.
- no trade, position, recommendation, History, or Statistics mutation.
- no broker result creation.
- no bridge/browser/Avanza behavior.

Test strategy:

- eligible input returns `dry_run`.
- unsafe or missing fields return `rejected`.
- preview-only input remains blocked.
- `mode: "insert"` is rejected while writes are disabled.
- duplicate simulation returns duplicate metadata without DB access.
- metadata proves no write, no audit append, and no trade mutation.

## 3. Boundary verification

No writes:

- the design explicitly forbids insert, upsert, update, delete, record
  storage, localStorage writes, and trade-state writes.
- an eligible persistence validator result only permits a dry-run response.

No Supabase reads:

- duplicate lookup is simulation-only.
- the dry-run stub should not import Supabase client code.
- migration application and generated types remain unnecessary for dry-run.

No route implementation yet:

- no `app/api/execution/records/insert/route.ts` exists from this action.
- no server action, route handler, or runtime API surface was added.

No client helper:

- no fetch wrapper or UI caller was added.
- client posture remains future-only and dev/sandbox-gated.

No migration application:

- the draft migration remains unapplied.
- dry-run can proceed without the table because it does not query or write it.

No audit append:

- audit metadata is response/context metadata only.
- no audit/event store or append path is proposed.

No trade mutation:

- the design excludes trade, position, recommendation, History, Statistics,
  close, sell, exit, and open-trade updates.

No broker/Avanza/browser behavior:

- no broker result creation is proposed.
- no bridge, browser automation, Avanza capture, or automatic-mode behavior is
  proposed.

## 4. Alignment with contracts/plans

Insert route contract types:

- `ExecutionRecordInsertRoutePath` already models
  `/api/execution/records/insert`.
- `ExecutionRecordInsertRouteMode` already models `dry_run` and `insert`.
- `ExecutionRecordInsertRouteDryRunMetadata` explicitly models no insert, no
  Supabase write, no audit append, and no trade mutation.
- response types support dry-run, rejected, duplicate, needs-review, and error
  outcomes.

Persistence validator:

- `validateExecutionRecordPersistenceInput(...)` is pure and deterministic.
- the dry-run design uses validator output but does not persist it.
- duplicate matches already supplied to the validator can be reused as
  simulated duplicate output without a DB lookup.
- `safeToWrite=true` from the validator must be interpreted as future
  eligibility only; the dry-run route still must not write.

Server route design:

- the dry-run design follows the planned route path and validation-first
  ordering.
- it narrows the first implementation to dry-run-only behavior.
- it preserves server-only posture and rejects direct client write semantics.

Insert contract plan:

- the dry-run design exercises the insert contract without storing rows.
- it preserves audit separation and trade mutation separation.
- it does not claim History, Statistics, recommendation, or position updates.

Schema/migration plan:

- the dry-run design references the planned `execution_records` table only as
  planned metadata.
- it does not require migration application, generated types, RLS policy
  finalization, or duplicate index verification.

## 5. Implementation readiness

Is a dry-run route implementation safe now?

- yes, with a narrow scope.
- the implementation must be route-stub-only, dry-run-only, and write-free.
- it should not import Supabase, localStorage, audit stores, trade mutation
  modules, browser/bridge modules, or broker automation modules.
- it should not create a client helper or UI wiring in the same action.

What route path should be used?

- `POST /api/execution/records/insert`.
- avoid creating a separate dry-run path unless the route contract is updated
  first.

What dev/sandbox gating should be required?

- require dry-run mode at the route level.
- use the existing app/server authentication posture if available.
- if an explicit dev/sandbox gate is needed, it should be server-side and must
  not enable writes.
- production calls may still return dry-run responses, but they must never
  perform Supabase reads/writes or expose insert mode.

What request inputs should be allowed?

- only the route contract-shaped body.
- only `mode: "dry_run"` or `dryRun: true`.
- persistence input must be validated with the pure validator.
- `mode: "insert"` must return a disabled/rejected response.
- arbitrary raw UI, broker page, credential, cookie, screenshot, or trade
  mutation payloads should be rejected.

How should duplicate simulation work?

- accept only existing duplicate match data already inside the persistence
  input or an explicit dry-run-only metadata marker.
- never query Supabase.
- never claim a real row exists.
- return `duplicate` or `needs_review` based on simulated conflict metadata.

What tests are required?

- route rejects non-dry-run insert mode.
- valid dry-run input returns `status: "dry_run"`.
- invalid persistence input returns `rejected`.
- duplicate simulation returns `duplicate` without DB access.
- metadata proves no Supabase write, no audit append, no trade mutation, and
  no broker/browser behavior.
- no client helper or UI persist button appears.

## 6. Candidate next actions

A. Implement Execution Record Insert Route Dry-Run Stub

- highest payoff and now safe if narrowly scoped.
- should add only a dry-run route handler and focused tests.
- must not import Supabase or perform reads/writes.

B. Create Dry-Run Route Client Contract/Helper Design

- useful after the route stub exists.
- lower priority because adding a client helper before the route could blur
  the no-write boundary.

C. Create Supabase Migration Application Checklist

- important before real insert.
- not required for the dry-run route because the route will not query or write
  the table.

D. Reassess BrokerExecutionResult Confirmation Path

- necessary before production persistence.
- higher risk and should wait until the dry-run route proves the contract
  surface without writes.

## 7. Recommended next action

**Action 440 - Implement Execution Record Insert Route Dry-Run Stub**

Rationale:

- the dry-run design is specific enough to implement a narrow no-write route.
- existing route contract types and pure persistence validator provide the
  required shape and validation behavior.
- implementation should remain limited to the route stub and focused tests:
  no client helper, no Supabase import, no migration, no audit append, no trade
  mutation, no broker result creation, and no Avanza/browser behavior.

## 8. Risk assessment

Dry-run mistaken for write risk:

- high. The route name contains `insert`; responses and tests must clearly say
  dry-run/no persistence/no mutation.

Route accidentally writing risk:

- high. The implementation must not import Supabase client code or any
  persistence store.

Dev gating risk:

- medium/high. Dry-run is safe only if insert mode stays rejected and browser
  callers cannot enable writes.

Duplicate simulation confusion:

- medium. Simulated duplicate metadata must not be displayed or stored as a
  real persisted record.

Future production path confusion:

- high. `mode: "insert"` must remain disabled until migration, generated
  types, auth/RLS, duplicate lookup, audit boundary, and trade mutation
  separation are complete.

E2e coverage reliance:

- medium. Focused route tests are needed because the critical behavior is the
  absence of side effects.

## 9. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No route/API implementation, client helper,
Supabase read/write, migration application, audit append, trade mutation,
broker result creation, or Avanza/browser behavior was added.

## Action 440 Follow-Up

Action 440 created
`app/api/execution/records/insert/route.ts`.

Result:

- Implemented the first execution record insert route as a dry-run-only stub.
- The route accepts only the future route contract shape and requires
  `mode: "dry_run"` plus `dryRun: true`.
- The route runs the pure
  `validateExecutionRecordPersistenceInput(...)` validator and maps outcomes
  to typed route responses.
- Eligible inputs return `status: "dry_run"`, never `status: "inserted"`.
- Duplicate responses are simulation-only from supplied duplicate metadata and
  do not query Supabase.
- Every response path includes safety metadata and dry-run metadata proving no
  Supabase write, audit append, or trade mutation was attempted.
- Focused e2e coverage was added for malformed JSON, missing dry-run mode,
  eligible dry-run, duplicate simulation, and unsafe candidate rejection.

Safety result:

- No Supabase client was imported.
- No Supabase read/write was added.
- No localStorage access was added.
- No audit append was added.
- No trade mutation was added.
- No broker result creation, bridge automation, Avanza/browser behavior, or
  automatic-mode behavior was added.
- Migration was not applied.

Verification:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- Default `npm run test:e2e` was blocked by sandbox port binding on
  `0.0.0.0:3010` before app test logic.
- Escalated `npm run test:e2e` passed: 70 tests.
- `git diff --check` passed.

Next recommended action:

**Action 441 - Reassess Execution Record Insert Route Dry-Run Stub**

## Action 441 Follow-Up

Action 441 created
`docs/execution-record-insert-route-dry-run-stub-reassessment.md`.

Result:

- Verified the implemented route remains dry-run-only and rejects non-dry-run
  mode.
- Confirmed malformed input is safely rejected with no-write metadata.
- Confirmed the route imports no Supabase client, localStorage helper,
  audit append helper, trade mutation helper, broker/bridge/browser module, or
  Avanza behavior.
- Confirmed duplicate responses remain simulation-only from supplied
  duplicate metadata.

Next recommended action:

**Action 442 - Create Dry-Run Route Client Helper**

## Action 443 Follow-Up

Action 443 created
`docs/execution-record-insert-dry-run-client-reassessment.md`.

Result:

- Reassessed the helper created after the dry-run route stub.
- Confirmed the helper preserves the same no-write/no-mutation boundary as
  the route design.
- Recommended a read-only UI preview design before importing the helper into
  UI components.

Next recommended action:

**Action 444 - Create Read-Only Dry-Run Route UI Preview Design**
