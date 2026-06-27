# Dev Mock Broker Controls Coupling Inventory

## Purpose

Action 936 inventories the current dev/mock broker controls coupling before any
component extraction. This is documentation-only: no runtime code, JSX,
handlers, effects, state mutation, helper wiring, audit writer path, database
query, migration, type generation, or `.env.local` change was performed.

## Current Dev/Mock Controls Surface Map

### Settings Page Surface

- File/location: `app/settings/page.tsx`.
- Inline components:
  - `DevMockBrokerResultsPanel`
  - `DevMockBrokerResultRow`
- Current responsibilities:
  - Read and display local dev mock broker results.
  - Show total result count, latest timestamp, storage availability, parse
    errors, discarded malformed result count, and message state.
  - Render recent local mock results.
  - Provide `Refresh` and `Clear dev mock results` controls.
  - Render row-level mock result details, conversion preview, local capture
    test, and server capture route stub test.
- Surface category:
  - Dev-only/settings-only.
  - Local-only for refresh/clear/viewer behavior.
  - Interactive.
  - Viewer-adjacent to execution records and event log diagnostics.
  - Mutation-adjacent at row level because local capture appends local execution
    records and local execution audit events.

### Parent Render Location

`DevMockBrokerResultsPanel` is rendered in the execution dev tools section:

- `readResult={devMockBrokerResultStore}`
- `visibleResults={latestDevMockBrokerResults}`
- `latestTimestamp={latestDevMockBrokerResultTimestamp}`
- `executionRecords={executionRecordStore.records}`
- `message={devMockBrokerResultStoreMessage}`
- `onRefresh={refreshDevMockBrokerResults}`
- `onClear={clearLocalDevMockBrokerResults}`
- `onCaptureComplete={refreshAfterDevMockBrokerCapture}`

The surrounding dev tools section is controlled by existing execution dev tools
gating. This action does not change those gates.

## State And Callback Dependencies

### Parent State

- `devMockBrokerResultStore`
  - Type: `DevMockBrokerResultStoreReadResult`.
  - Initialized with `readDevMockBrokerResultsForSettings()`.
  - Contains `results`, `discardedCount`, `storageAvailable`, and `error`.
- `devMockBrokerResultStoreMessage`
  - Displays refresh/clear/capture completion messages.
- `latestDevMockBrokerResults`
  - Derived with `useMemo` from `devMockBrokerResultStore.results`.
  - Sorted by `createdAt` descending and limited to 50 rows.
- `latestDevMockBrokerResultTimestamp`
  - Derived from the newest visible dev mock result.
- `executionRecordStore.records`
  - Passed to rows for duplicate/capture checks.

### Parent Callbacks

- `refreshDevMockBrokerResults()`
  - Reads `readDevMockBrokerResultsForSettings()`.
  - Sets `devMockBrokerResultStore`.
  - Sets message: `Dev mock broker results refreshed.`
- `clearLocalDevMockBrokerResults()`
  - Confirms with `window.confirm`.
  - Calls `clearDevMockBrokerResults()`.
  - Re-reads `readDevMockBrokerResultsForSettings()`.
  - Sets success/failure message.
  - Clear text states this only removes the local mock diagnostics key and does
    not affect trades, broker state, History, or Statistics.
- `refreshAfterDevMockBrokerCapture()`
  - Refreshes execution event log, execution records, and dev mock broker
    results after a local capture action.
  - Maintains viewer adjacency between local capture, local records, and local
    audit event diagnostics.

### Row State And Callbacks

`DevMockBrokerResultRow` owns row-local UI state:

- `captureResult`
- `serverCaptureStubResult`
- `serverCaptureStubPending`

Row-local callbacks:

- `captureMockResultLocally()`
  - Confirms manual local diagnostic capture.
  - Converts a dev mock result to a broker execution result preview.
  - Builds a local capture intent.
  - Builds a local `TureExecutionRecord`.
  - Appends a local execution record.
  - Appends a local execution audit event.
  - Calls `onCaptureComplete()`.
  - Copy states no real broker execution, no Supabase write, no trade update,
    no History update, and no Statistics update.
- `testServerCaptureStub()`
  - Builds and validates a server capture request from mock data.
  - Posts to the server capture stub client.
  - Copy states route stub validation only and no Supabase write, execution
    record, trade update, History update, or Statistics update is created by
    the route stub test.

## Store/Helper Dependency Map

- `lib/dev-mock-broker-result-store.ts`
  - Exposes `readDevMockBrokerResultStoreResult()`.
  - Exposes `clearDevMockBrokerResults()`.
  - Uses `DEV_MOCK_BROKER_RESULT_STORAGE_KEY`.
  - Bounds stored results with `MAX_STORED_DEV_MOCK_BROKER_RESULTS`.
  - Delegates storage reads/writes/clear to
    `lib/execution-local-storage-helpers.ts`.
- `lib/execution-local-storage-helpers.ts`
  - Provides browser local storage access via `getBrowserExecutionLocalStorage`.
  - Provides dev mock broker result read/append/write/clear helper behavior.
- `lib/execution-record-store.ts`
  - Used by local capture to append local execution records.
  - Existing records are passed to rows for duplicate/capture checks.
- `lib/execution-event-log.ts`
  - Used by local capture to append a local audit event with
    `type: "dev_mock_broker_capture_stub"`.
- `lib/dev-mock-to-broker-execution-result.ts`
  - Converts dev mock broker results to broker execution result previews.
  - Builds duplicate keys and finds local execution records for capture checks.
- `lib/broker-execution-capture.ts`
  - Builds the local `TureExecutionRecord` candidate for diagnostic capture.
- `lib/execution-server-capture-contract.ts`
  - Builds and validates server capture stub requests.
- `lib/execution-server-capture-client.ts`
  - Posts the server capture stub request.

No settings persistence helper is directly part of dev mock broker result
storage, but the panel lives inside Settings and shares Settings page state,
effects, and dev tools gating.

## Handler/Effect Coupling

- Initial hydration effect in `app/settings/page.tsx` re-reads execution event
  log, execution records, Avanza agent runs, dev mock broker results, safe
  browser action diagnostics, bridge config, and smoke checklist state on a
  zero-delay timer.
- Refresh/clear handlers are parent-owned.
- Local capture and server capture stub handlers are row-owned today.
- Local capture writes local execution record and local audit event diagnostics,
  so it is mutation-adjacent even though it remains local-only.
- Server capture stub is network/route-adjacent and must remain clearly
  separated from any production audit writer path.
- Error/message handling is split:
  - parent message for refresh/clear and capture completion;
  - row-local result messages for local capture and server capture stub result.
- Stale callback risks:
  - row callbacks close over `result`, `executionRecords`, duplicate detection,
    and parent refresh callback;
  - extraction must preserve the same callback identity expectations or keep
    handler ownership parent/row-local with explicit props.
- Parent-owned state that should remain parent-owned in the first extraction:
  - `devMockBrokerResultStore`
  - `devMockBrokerResultStoreMessage`
  - `latestDevMockBrokerResults`
  - `latestDevMockBrokerResultTimestamp`
  - `executionRecordStore.records`
  - refresh/clear/capture-complete handlers

## Candidate Component Boundary

Recommended component:

- Name: `ExecutionDevMockBrokerResultsPanel`
- Proposed path:
  `components/execution/execution-dev-mock-broker-results-panel.tsx`

Suggested props:

- `readResult: DevMockBrokerResultStoreReadResult`
- `visibleResults: StoredDevMockBrokerExecutionResult[]`
- `latestTimestamp: string | null`
- `executionRecords: StoredExecutionRecord[]`
- `message: string`
- `onRefresh: () => void`
- `onClear: () => void`
- `onCaptureComplete: () => void`

Allowed imports for a first extraction:

- Formatting/presentation helpers already used by the inline panel.
- Client-safe local conversion/capture helpers only if row behavior moves with
  the component.
- Types for dev mock results and stored execution records.

Imports not allowed:

- `server-only`
- audit writer server modules
- service-role/env helpers
- Supabase clients
- audit writer route invocation
- market-loop/scanner modules
- broker/Avanza automation modules

Risk level:

- Medium.
- The panel shell is low risk, but row-level local capture and server capture
  stub actions are mutation-adjacent/route-adjacent and need baseline tests
  before extraction.

Extraction priority:

1. Add baseline tests.
2. Extract panel and row together only if tests lock local-only, route-stub,
   duplicate guard, and no-production-write boundaries.
3. Consider a later split if row-level capture/stub behavior needs a separate
   boundary.

## Safety Boundaries

- Dev/mock UI remains local/dev diagnostics only.
- No audit writer client invocation is approved.
- No service-role/env/Supabase use is approved for the dev/mock controls
  extraction seam.
- No broker/Avanza behavior is approved.
- No automatic order submission is approved.
- No market/scanner invocation is approved.
- No trade/stats/PnL mutation is approved.
- No server-only imports are approved in the extracted UI component.
- Route/fetch behavior must not be introduced by extraction. Existing server
  capture stub behavior is row-owned today and must remain explicit, tested, and
  separate from audit writer routing.
- Local capture may append local diagnostics only; it is not production
  persistence and is not broker confirmation.

## Suggested Extraction Sequence

1. Action 937 - Add Dev Mock Broker Controls Baseline Tests.
2. Action 938 - Extract Dev Mock Broker Results Panel Component.
3. Action 939 - Create Dev Mock Broker Controls Extraction Summary.

## First Recommended Seam

First seam after baseline tests:

- Extract `DevMockBrokerResultsPanel` as a presentational/client-safe component
  with parent-owned refresh, clear, and capture-complete callbacks.

Rationale:

- The surface is dev/local-only.
- The dev mock broker result store is already helper-backed.
- This seam is lower risk than full live-position panel extraction.
- The parent can retain refresh, clear, store state, and execution-record
  adjacency.
- Baseline tests can lock the row-level local capture and server capture stub
  safety copy before any JSX moves.

## Risks

- Local dev result clear/remove regression.
- Store helper boundary regression.
- Local-only/server-audit confusion.
- Accidental audit writer/client boundary leak.
- Broker/Avanza implication from copy or control names.
- Automatic order submission implication.
- Style/layout drift in the settings dev tools surface.
- Stale callback behavior around row-local capture/stub handlers.
- Duplicate guard behavior drift when `executionRecords` are passed through a
  new component boundary.
- Route-stub behavior being mistaken for production persistence.

## Result Status

`dev_mock_broker_controls_coupling_inventory_created`

## Action 937 Baseline Test Update

Action 937 added `tests/e2e/dev-mock-broker-controls-baseline.spec.ts` and
`docs/dev-mock-broker-controls-baseline-tests.md`.

The baseline locks the current inline `DevMockBrokerResultsPanel` and
`DevMockBrokerResultRow` source shape, parent-owned refresh/clear/capture
callbacks, dev mock broker result store helper behavior, local-only/server-stub
copy, local-only/server-audit distinction, and safety boundaries before any JSX
is moved.

Status: `dev_mock_broker_controls_baseline_tests_added`.

## Action 938 Extraction Update

Action 938 extracted `DevMockBrokerResultsPanel` and
`DevMockBrokerResultRow` into
`components/execution/execution-dev-mock-broker-results-panel.tsx`.

The Settings page remains the owner of dev mock broker result store state,
visible result selection, latest timestamp, messages, refresh/clear callbacks,
and capture-complete refresh callback. The row-local manual local diagnostic
capture and server capture stub handlers moved with the row UI and were not
broadened.

Status: `dev_mock_broker_results_panel_extracted`.

## Recommended Next Action

Action 939 - Create Dev Mock Broker Controls Extraction Summary.
## Action 938 — Dev Mock Broker Results Panel Extraction

Status: `dev_mock_broker_results_panel_extracted`

- Extracted the Settings dev mock broker results panel and result row UI into
  `components/execution/execution-dev-mock-broker-results-panel.tsx`.
- Kept `app/settings/page.tsx` as the owner of dev mock broker result store
  state, visible result selection, latest timestamp, messages, refresh/clear
  callbacks, and capture-complete refresh callback.
- Preserved existing panel labels, row fields, local-only diagnostics copy,
  server capture route stub copy, and broker-result preview copy.
- Did not add audit writer route invocation, service-role code, Supabase table
  access, broker/Avanza behavior, automatic mode, migrations, type generation,
  generated type edits, or `.env.local` changes.
- Added extraction proof in
  `docs/dev-mock-broker-results-panel-extraction.md`.
- Recommended next action: Action 939 — Create Dev Mock Broker Controls
  Extraction Summary.
## Action 939 — Dev Mock Broker Controls Extraction Summary

Status: `dev_mock_broker_controls_extraction_summary_created`

- Created `docs/dev-mock-broker-controls-extraction-summary.md` as a
  documentation-only summary of Actions 936-938.
- Summarized the dev/mock broker controls coupling inventory, baseline tests,
  extracted panel/row component map, parent ownership, test coverage, safety
  boundaries, remaining gaps, and next refactor direction.
- Confirmed no runtime code, JSX, handlers, effects, state mutation, helper
  wiring, audit writer runtime path, rollout flags, broker/Avanza behavior,
  automatic mode behavior, migrations, type generation, generated types,
  live proof/query/insert, service-role adapter call, or `.env.local` changes
  were performed for Action 939.
- Recommended next action: Action 940 — Create Execution State/Effects
  Coupling Inventory.

