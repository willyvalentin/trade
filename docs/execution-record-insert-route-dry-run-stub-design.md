# Execution Record Insert Route Dry-Run Stub Design

## Action 702 - Audit Append Writer Dry-Run Result Contract Reassessment

- Created docs/execution-record-audit-append-writer-dry-run-result-contract-reassessment.md as a documentation-only reassessment of lib/execution-record-audit-append-writer-dry-run-result-contract.ts.
- Verified the contract remains type-only/constants-only, contract-only, dry-run-contract-only, future-boundary-only, and disconnected from dry-run logic, writer logic, audit append execution, route calls, execution-record creation, persistence/write behavior, Supabase/localStorage writes, audit writes, downstream actions, broker/Avanza behavior, and automatic mode.
- Reconfirmed dry-run result success is not audit write approval, audit append execution, route call approval, record creation approval, persistence/write approval, Supabase/localStorage write approval, security proof, server-only proof, schema/table proof, generated-types proof, migration proof, RLS/security proof, downstream approval, or full workflow completion; all action authority flags remain false.
- Reconfirmed audit schema/table proof, generated audit table types, migration proof, RLS/security proof, server-only proof, service-role proof, route/auth boundary proof, writer implementation, dry-run implementation, production insert route, and production insert/write path remain absent/unproven blockers.
- Validation: git diff --check passed; find docs -type f -size 0 returned 0.
- Recommended next action: Action 703 - Create Audit Append Writer Dry-Run Validator Design.


## 1. Purpose

Design the first future dry-run stub for the execution record insert route
before any route file, client helper, Supabase write, migration application,
audit append, trade mutation, broker result creation, or Avanza/browser
behavior exists.

This action is documentation-only. It defines the safest shape for a future
`POST /api/execution/records/insert` dry-run implementation that can exercise
contracts and validators without storing records or changing app state.

## 2. Scope

In scope for the future dry-run stub design:

- accept the existing execution record insert route contract shape.
- require `mode: "dry_run"` and/or `dryRun: true`.
- run request-shape checks before persistence validation.
- run `validateExecutionRecordPersistenceInput(...)`.
- return typed dry-run, rejected, duplicate, needs-review, or error metadata.
- report planned insert mapping and planned duplicate lookup without doing
  either against Supabase.
- expose explicit safety metadata proving no write or mutation occurred.

Out of scope for this design:

- route/API implementation.
- client fetch helper.
- Supabase reads, writes, upserts, or duplicate queries.
- database migration application.
- generated database types.
- audit/event append.
- trade, position, recommendation, History, or Statistics mutation.
- broker result creation.
- bridge, browser, Avanza, or automatic-mode behavior.

## 3. Proposed route behavior

Future route path:

- `POST /api/execution/records/insert`

Dry-run posture:

- the first runtime route, if implemented later, should only accept dry-run
  requests.
- `mode: "insert"` should be rejected or reported as disabled until migration
  application, duplicate lookup, insert mapping, auth/user-context, and write
  gating are separately approved.
- the route should never infer write permission from the presence of an
  eligible persistence input.
- every dry-run response should include `dryRunMetadata` with:
  - `insertAttempted=false`.
  - `supabaseWriteAttempted=false`.
  - `auditAppendAttempted=false`.
  - `tradeMutationAttempted=false`.
  - planned route path and method.
  - planned table name `execution_records`.
  - planned duplicate lookup and insert mapping flags.

Allowed dry-run outcomes:

- `dry_run` when the request is structurally valid and persistence validation
  would allow a future insert path to proceed to duplicate lookup/mapping.
- `rejected` when request or persistence validation fails.
- `duplicate` only for explicitly simulated duplicate inputs.
- `needs_review` when the validator reports ambiguity or conflicting safety
  metadata.
- `error` only for malformed route-level conditions that cannot be represented
  as validation failure.

The dry-run stub should not return `inserted`. That status belongs to a future
real-write path after schema, migration, duplicate lookup, RLS/ownership, and
write controls are complete.

## 4. Validation sequence

Future dry-run sequence:

1. Accept only `POST`.
2. Parse JSON.
3. Reject malformed JSON with a route-level validation error.
4. Confirm the route contract version, path, method, and mode shape.
5. Require dry-run mode for the stub.
6. Authenticate or require the same dev/sandbox-gated context used by adjacent
   execution preview tooling.
7. Derive or simulate server context without trusting client user/account
   context as authority.
8. Validate request-level required fields:
   - persistence input.
   - candidate.
   - idempotency key.
   - record fingerprint.
   - broker confirmation metadata.
   - association metadata.
   - user context.
   - safety checklist.
9. Run `validateExecutionRecordPersistenceInput(...)`.
10. Map persistence validator results into route contract results.
11. If eligible, return `dry_run` with planned duplicate lookup and insert
    mapping metadata.
12. If duplicate simulation data is present, return `duplicate` with simulated
    duplicate metadata and no persisted row claim.
13. Always return safety metadata confirming no Supabase, audit, trade, broker,
    browser, or Avanza side effects.

The dry-run route should be conservative: ambiguous inputs should become
`needs_review` or `rejected`, not successful dry-run eligibility.

## 5. Duplicate simulation

The dry-run stub should not query Supabase for duplicates.

Safe duplicate simulation sources:

- explicit duplicate matches already carried by
  `ExecutionRecordPersistenceInput`, if present.
- a future test-only request metadata flag that is accepted only in dry-run
  mode and clearly labeled as simulation.

Duplicate simulation requirements:

- simulated duplicates must be labeled as simulated.
- the response must not claim an actual persisted record exists.
- `supabaseWriteAttempted` and any future `supabaseReadAttempted` equivalent
  must remain false.
- conflict-style simulations should return `needs_review` when the simulated
  match does not clearly represent the same execution record.
- duplicate simulation must not influence production duplicate logic later.

Recommended dry-run duplicate response posture:

- use `status: "duplicate"` only for explicit simulation inputs.
- include `ExecutionRecordInsertRouteDuplicatePayload`.
- leave `persistedRecord` unset unless a future type adds an explicit
  simulated persisted reference field.
- include a warning that no real duplicate lookup was performed.

## 6. Safety metadata

Every dry-run response should include or preserve safety metadata showing:

- `serverOnly=true`.
- `directClientSupabaseWriteAllowed=false`.
- `noTradeMutation=true`.
- `noAuditAppendInInitialRoute=true`.
- `noBrokerResultCreation=true`.
- `noAvanzaAutomation=true`.
- `migrationMustBeAppliedBeforeRealInsert=true`.

Every dry-run response should also communicate:

- no Supabase insert occurred.
- no Supabase duplicate lookup occurred.
- no localStorage write occurred.
- no audit/event append occurred.
- no trade, position, recommendation, History, or Statistics mutation occurred.
- no broker result was created or confirmed.
- no bridge/browser/Avanza action occurred.

The safety metadata must be present even when validation fails so test output
and diagnostics cannot confuse rejection with a hidden write attempt.

## 7. UI/client posture

No client helper should be created as part of this design.

Future UI/client usage, if implemented later, should remain:

- dev/sandbox-gated.
- visibly labeled as dry-run.
- explicitly labeled as no persistence and no mutation.
- disconnected from production broker confirmation and automatic-mode flows.
- unable to show a persist/insert button.
- unable to enable `mode: "insert"` from the browser.

The browser should not receive service-role credentials or direct Supabase
write capability. Any future client trigger should call only the dry-run route,
and the route should still enforce server-side dry-run behavior.

## 8. Test strategy

Future dry-run route tests should cover:

- structurally valid eligible input returns `status: "dry_run"`.
- unsafe candidate or missing idempotency returns `rejected`.
- dev fixture candidate remains rejected for real insert semantics unless the
  request is explicitly accepted only as dry-run diagnostics.
- preview-only candidate remains rejected.
- duplicate simulation returns duplicate metadata without DB access.
- `mode: "insert"` is rejected while real writes are disabled.
- response metadata always reports no Supabase write, no audit append, and no
  trade mutation.
- no persist button or production UI path appears.

Verification for future runtime implementation should include:

- `./node_modules/.bin/tsc --noEmit`.
- `npm run lint`.
- `git diff --check`.
- focused e2e coverage for dry-run/no-write UI and route behavior.
- full `npm run test:e2e` when the sandbox/browser environment permits it.

## 9. Non-goals

- no runtime route/API implementation.
- no client helper.
- no Supabase read/write/upsert/delete.
- no migration application.
- no generated Supabase types.
- no audit append.
- no trade mutation.
- no execution record storage.
- no broker result creation.
- no production broker confirmation capture.
- no bridge/browser/Avanza behavior.
- no automatic-mode behavior.
- no conversion of dry-run eligibility into persistence eligibility.

## 10. Candidate next actions

A. Reassess Insert Route Dry-Run Stub Design

- safest next step.
- keeps the project in documentation mode before creating a route surface.
- can verify whether the dry-run plan is specific enough and still write-free.

B. Implement Execution Record Insert Route Dry-Run Stub

- useful after reassessment.
- higher risk because it creates an actual route/API surface.
- must remain dry-run-only and write-free.

C. Create Supabase Migration Application Checklist

- important before any real insert.
- still independent of dry-run route implementation.

D. Reassess BrokerExecutionResult Confirmation Path

- necessary before production persistence.
- higher risk because it approaches trusted broker evidence.

E. Create final insert route only much later

- blocked until migration application, generated types, auth/RLS, duplicate
  lookup, real broker confirmation, audit boundary, and trade mutation
  separation are resolved.

## 11. Recommended next action

**Action 439 - Reassess Insert Route Dry-Run Stub Design**

## Action 445 Follow-Up

Action 445 added a read-only UI preview for the dry-run route after the route
stub and client helper were implemented.

Design boundary still holds:

- The UI calls only the dry-run client helper and requires the existing
  dry-run request contract.
- The preview is dev-gated in the execution handoff modal late-phase preview
  area.
- It displays route status, validation/rejection details, duplicate simulation
  metadata, idempotency/fingerprint values, and explicit no-write/no-mutation
  safety metadata.
- It does not add Supabase reads/writes, localStorage, audit append, trade
  mutation, execution record storage, broker result creation, Avanza/browser
  behavior, or automatic-mode behavior.
- It does not add a persist/save/create button.

Next recommended action:

**Action 446 - Reassess Read-Only Dry-Run Route UI Preview**

Rationale:

- this design creates a concrete route behavior plan but still changes no
  runtime code.
- a reassessment should confirm the dry-run route is specific enough before an
  API file exists.
- implementing even a write-free route adds a callable surface and should wait
  until the design is checked against the route contract, persistence
  validator, schema plan, and execution UI boundaries.

## 12. Risk assessment

Dry-run mistaken for write risk:

- high. The route name includes `insert`, so dry-run metadata and UI copy must
  be unmistakable.

Route accidentally writing risk:

- high. The stub must not import Supabase client code or perform duplicate
  lookup while it is still a dry-run route.

Dev/prod gating risk:

- medium/high. A dry-run route is safer than a write route, but it can still be
  misunderstood if exposed in production UI without clear labels.

Duplicate simulation confusion risk:

- medium. Simulated duplicate metadata must never be interpreted as a real
  persisted record reference.

Contract drift risk:

- medium. The design must stay aligned with
  `lib/execution-record-insert-route-contract.ts` and the persistence
  validator.

Future production path confusion risk:

- high. `mode: "insert"` must remain disabled until all persistence
  preconditions are complete.

E2e coverage reliance:

- medium. Future runtime work should include focused no-write tests because
  the absence of side effects is the main safety guarantee.

## 13. Verification

Verification for this documentation-only design:

- `git diff --check`

No runtime code changes were made. No route/API implementation, client helper,
Supabase read/write, migration application, audit append, trade mutation,
broker result creation, or Avanza/browser behavior was added.

## Action 439 Follow-Up

Action 439 created
`docs/execution-record-insert-route-dry-run-stub-design-reassessment.md`.

Result:

- Verified this dry-run stub design remains no-write, no-Supabase-read,
  no-mutation, and no-audit.
- Confirmed duplicate handling is simulation-only and must not query Supabase
  or claim real persisted rows.
- Concluded a narrow dry-run route implementation is safe next if it rejects
  insert mode, imports no Supabase client, adds no client helper, and preserves
  explicit safety metadata.

Next recommended action:

**Action 440 - Implement Execution Record Insert Route Dry-Run Stub**

## Action 440 Follow-Up

Action 440 created
`app/api/execution/records/insert/route.ts`.

Result:

- Implemented this design as a dry-run-only route stub.
- The route rejects non-dry-run requests and malformed request shapes with
  no-write safety metadata.
- The route uses only the pure persistence validator and contract types.
- Duplicate handling remains simulation-only from supplied duplicate metadata.
- The route returns dry-run, rejected, duplicate, or needs-review metadata
  without creating persisted records.

Safety result:

- No Supabase read/write, localStorage access, audit append, trade mutation,
  broker result creation, bridge automation, Avanza/browser behavior, or
  automatic-mode behavior was added.

Next recommended action:

**Action 441 - Reassess Execution Record Insert Route Dry-Run Stub**

## Action 441 Follow-Up

Action 441 created
`docs/execution-record-insert-route-dry-run-stub-reassessment.md`.

Result:

- Reassessed the implemented route against this design.
- Verified eligible input maps to `status: "dry_run"` and never
  `status: "inserted"`.
- Verified every route path remains no-write/no-mutation/no-audit.
- Recommended a dry-run route client helper before UI wiring.

Next recommended action:

**Action 442 - Create Dry-Run Route Client Helper**

## Action 442 Follow-Up

Action 442 created
`lib/execution-record-insert-dry-run-client.ts`.

Result:

- Added a helper for calling the dry-run route described by this design.
- The helper only supports dry-run requests and refuses insert-mode requests
  before network activity.
- No UI wiring, production insert behavior, Supabase read/write, audit append,
  trade mutation, broker result creation, or Avanza/browser behavior was
  added.

Next recommended action:

**Action 443 - Reassess Dry-Run Route Client Helper**

## Action 443 Follow-Up

Action 443 created
`docs/execution-record-insert-dry-run-client-reassessment.md`.

Result:

- Verified the dry-run client helper still follows this design's dry-run-only
  route posture.
- Confirmed no UI, persistence, audit, trade, broker, Avanza, or browser
  behavior was added.
- Recommended designing the read-only UI preview before wiring the helper.

Next recommended action:

**Action 444 - Create Read-Only Dry-Run Route UI Preview Design**

## Action 444 Follow-Up

Action 444 created
`docs/execution-record-insert-dry-run-ui-preview-design.md`.

Result:

- Added the UI design layer for the dry-run route without wiring it.
- Recommended a manual `Run dry-run preview` interaction.
- Explicitly forbade persist/save/create/insert wording in the future UI.

Next recommended action:

**Action 445 - Implement Read-Only Dry-Run Route UI Preview**
