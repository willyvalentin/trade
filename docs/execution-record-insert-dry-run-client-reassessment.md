# Execution Record Insert Dry-Run Client Reassessment

## Action 702 - Audit Append Writer Dry-Run Result Contract Reassessment

- Created docs/execution-record-audit-append-writer-dry-run-result-contract-reassessment.md as a documentation-only reassessment of lib/execution-record-audit-append-writer-dry-run-result-contract.ts.
- Verified the contract remains type-only/constants-only, contract-only, dry-run-contract-only, future-boundary-only, and disconnected from dry-run logic, writer logic, audit append execution, route calls, execution-record creation, persistence/write behavior, Supabase/localStorage writes, audit writes, downstream actions, broker/Avanza behavior, and automatic mode.
- Reconfirmed dry-run result success is not audit write approval, audit append execution, route call approval, record creation approval, persistence/write approval, Supabase/localStorage write approval, security proof, server-only proof, schema/table proof, generated-types proof, migration proof, RLS/security proof, downstream approval, or full workflow completion; all action authority flags remain false.
- Reconfirmed audit schema/table proof, generated audit table types, migration proof, RLS/security proof, server-only proof, service-role proof, route/auth boundary proof, writer implementation, dry-run implementation, production insert route, and production insert/write path remain absent/unproven blockers.
- Validation: git diff --check passed; find docs -type f -size 0 returned 0.
- Recommended next action: Action 703 - Create Audit Append Writer Dry-Run Validator Design.


## 1. Purpose

Reassess the dry-run route client helper after implementation. This document
verifies that `requestExecutionRecordInsertDryRun(...)` remains dry-run-only,
typed, no-write/no-mutation, and disconnected from UI wiring and production
insert behavior.

This action is documentation-only. It adds no runtime code, refactor,
behavior change, UI wiring, production insert helper, Supabase read/write,
localStorage access, audit append, trade mutation, execution record storage,
broker result creation, Avanza/browser behavior, or automatic-mode behavior.

## 2. Current helper inventory

Exported API:

- `requestExecutionRecordInsertDryRun(request, options)`.
- `RequestExecutionRecordInsertDryRunOptions`.

Route target:

- default endpoint: `/api/execution/records/insert`.
- request method: `POST`.
- content type: `application/json`.

Request requirements:

- accepts an `ExecutionRecordInsertRouteRequest`.
- requires `request.mode === "dry_run"`.
- requires `request.dryRun === true`.
- refuses non-dry-run requests before calling `fetch`.
- exposes an optional `fetchFn` for tests and controlled callers.
- exposes optional endpoint and timeout overrides.

Response parsing behavior:

- parses route JSON defensively.
- requires the route contract version, path, method, timestamps, status, and
  safety metadata.
- returns a typed `ExecutionRecordInsertRouteResponse` when the route response
  matches the contract shape.

Error/fallback behavior:

- returns a typed rejected response for non-dry-run requests.
- returns a typed error response for invalid JSON route responses.
- returns a typed error response for invalid route response shapes.
- returns a typed error response for timeout or network failure.
- fallback responses include safety metadata and dry-run metadata.

Tests:

- successful helper call posts to the dry-run route and returns the typed
  route response.
- non-dry-run helper input is rejected before `fetch`.
- invalid JSON and invalid response shapes return typed error responses.

## 3. Boundary verification

Dry-run only:

- the helper checks `mode` and `dryRun` before network activity.
- it does not expose an insert helper.
- it does not transform an insert-mode request into a dry-run request.

Non-dry-run rejected before fetch:

- focused test coverage confirms `fetch` is not called when `mode: "insert"`
  and `dryRun: false` are supplied.
- the returned response uses `supabase_write_disabled`.

Typed no-write fallback:

- fallback responses are typed as `ExecutionRecordInsertRouteResponse`.
- fallback responses include `ExecutionRecordInsertRouteSafetyMetadata`.
- fallback dry-run metadata states:
  - `insertAttempted=false`.
  - `supabaseWriteAttempted=false`.
  - `auditAppendAttempted=false`.
  - `tradeMutationAttempted=false`.

No UI wiring:

- the helper is not imported into `app/trade-app.tsx`.
- it is not wired into the handoff modal or any user-facing preview.
- no button or action was added.

No production insert helper:

- no `requestExecutionRecordInsert(...)` or equivalent production insert
  helper exists.
- the helper name and behavior remain dry-run-specific.

No Supabase/localStorage/audit/trade/storage behavior:

- the helper imports no Supabase client.
- it imports no localStorage helper.
- it imports no audit append helper.
- it imports no trade mutation helper.
- it stores no execution records.

No broker/Avanza/browser behavior:

- the helper imports no broker result creation, bridge, browser, Avanza, or
  automatic-mode modules.
- it performs only an HTTP request to the dry-run route.

## 4. Test coverage

Successful helper call:

- covered by `client helper calls execution record insert dry-run route
  safely`.
- verifies endpoint, method, payload mode, typed dry-run response, no
  persisted record, and no-write/no-mutation metadata.

Non-dry-run refusal:

- covered by `client helper refuses non-dry-run execution record insert
  requests`.
- verifies `fetch` is not called, `status: "rejected"` is returned,
  `supabase_write_disabled` is included, and no-write metadata is preserved.

Defensive parse/error handling:

- covered by `client helper returns typed error for invalid dry-run route
  responses`.
- verifies invalid JSON and invalid response shape return typed error
  responses with safety metadata.

Default sandbox limitation:

- default `npm run test:e2e` was blocked by sandbox port binding on
  `0.0.0.0:3010` before app test logic.

Escalated e2e:

- escalated `npm run test:e2e` passed: 73 tests.

Other checks from Action 442:

- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed.
- `git diff --check` passed.

## 5. Remaining blockers before UI wiring

- UI preview/client state design is missing.
- the location for a dry-run action in the execution handoff modal is not
  chosen.
- user-facing copy for dry-run/no persistence/no mutation is not designed.
- no loading/error/disabled states are designed for the helper.
- no retry behavior is designed for network fallback responses.
- real persistence still does not exist.
- migration is still not applied.
- no generated DB types exist.
- no production broker confirmation path exists.
- audit append and trade mutation boundaries remain separate and unresolved.

## 6. Candidate next actions

A. Create Read-Only Dry-Run Route UI Preview Design

- safest next step.
- can define where and how to surface helper output before UI wiring.
- should specify copy, states, dev gating, and no-persist affordances.

B. Wire Dry-Run Client into Dev-Gated Preview UI

- useful after a UI design exists.
- higher risk because visible UI can be mistaken for persistence capability.

C. Create Supabase Migration Application Checklist

- important before real insert.
- less immediate because the dry-run route and helper remain independent of
  Supabase schema availability.

D. Reassess BrokerExecutionResult Confirmation Path

- necessary before production persistence.
- higher risk and should wait until dry-run UI boundaries are clear.

## 7. Recommended next action

**Action 444 - Create Read-Only Dry-Run Route UI Preview Design**

Rationale:

- the route and helper are now available, but UI wiring would introduce a new
  user-facing surface.
- a design pass should decide placement, labels, disabled states, and
  no-persistence copy before the helper is imported by UI components.
- migration, real persistence, broker confirmation, audit append, and trade
  mutation should remain blocked.

## 8. Risk assessment

Helper mistaken for production insert risk:

- medium/high. The route name contains `insert`, so helper naming and UI copy
  must keep dry-run prominent.

UI misuse risk:

- high. Wiring the helper without a design could create a button that users
  interpret as persistence.

No-write metadata loss risk:

- low/medium. Helper fallback responses currently preserve metadata, but UI
  consumers must not hide it.

Network fallback confusion:

- medium. Typed error responses can look like route responses; UI should label
  them as failed dry-run attempts, not persistence outcomes.

Dry-run route path drift:

- medium. The helper and route contract both target
  `/api/execution/records/insert`; future path changes need synchronized
  updates.

E2e coverage reliance:

- medium. Default sandbox e2e remains blocked by port permissions, so
  escalated runs are currently needed for full coverage.

## 9. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No UI wiring, production insert helper,
Supabase read/write, localStorage, audit append, trade mutation, execution
record storage, broker result creation, Avanza/browser behavior, or
automatic-mode behavior was added.

## Action 444 Follow-Up

Action 444 created
`docs/execution-record-insert-dry-run-ui-preview-design.md`.

Result:

- Designed a future read-only UI preview for the dry-run insert route before
  wiring the helper into UI.
- Recommended placement in the existing execution handoff modal late-phase
  preview area, as a separate dev-gated/collapsible section after the current
  execution-record creation preview.
- Defined inputs, output fields, safety labels, interaction model, non-goals,
  tests, risks, and next action.

Next recommended action:

**Action 445 - Implement Read-Only Dry-Run Route UI Preview**

## Action 445 Follow-Up

Action 445 wired the dry-run client helper into a dev-gated, read-only preview
inside the execution handoff modal.

Verified boundary:

- The UI calls `requestExecutionRecordInsertDryRun(...)` only from the manual
  `Run dry-run preview` action.
- No production insert helper was added.
- No Supabase read/write, localStorage, audit append, trade mutation, execution
  record storage, broker result creation, Avanza/browser behavior, or
  automatic-mode behavior was added.
- The preview displays no-write/no-mutation metadata and does not include a
  persist/save/create control.

Next recommended action:

**Action 446 - Reassess Read-Only Dry-Run Route UI Preview**

## Action 446 Follow-Up

Action 446 created
`docs/execution-record-insert-dry-run-ui-preview-reassessment.md`.

Client boundary status:

- The dry-run UI still calls only `requestExecutionRecordInsertDryRun(...)`.
- The helper remains dry-run-only and continues to reject non-dry-run payloads
  before fetch.
- The UI does not add production insert behavior, Supabase read/write,
  localStorage, audit append, trade mutation, execution record storage, broker
  result creation, or Avanza/browser behavior.

Next recommended action:

**Action 447 - Create Supabase Migration Application Checklist**
