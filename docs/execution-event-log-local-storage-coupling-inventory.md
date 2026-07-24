# Execution Event Log/Local Storage Coupling Inventory

## Action 923 Update - Settings Persistence Refactor Summary

- Created `docs/execution-settings-persistence-refactor-summary.md`.
- The summary confirms execution settings persistence is helper-backed while
  event log, execution records, and dev mock broker result helper wiring remain
  unchanged.
- Status: `execution_settings_persistence_refactor_summary_created`.
- Recommended next action: Action 924 - Create Execution UI Component
  Extraction Inventory.

## Action 922 Update - Settings Helper Wiring

- Execution settings persistence now uses the dedicated client-safe helper for
  the `ture_execution_mode` read/write seam.
- Event log, execution records store, and dev mock broker result store helper
  wiring remain unchanged.
- No audit writer, service-role, Supabase, broker/Avanza, market-loop/scanner,
  or database behavior was added.
- Status: `execution_settings_persistence_helpers_wired`.
- Recommended next action: Action 923 - Create Execution Settings Persistence
  Refactor Summary.

## Action 921 Update - Execution Settings Helpers Implemented

- Added client-safe execution settings persistence helpers without changing the
  event-log/localStorage helper seam.
- `ture_execution_mode` remains a separate settings preference key and is not
  added to the event log store.
- Status: `execution_settings_persistence_helpers_implemented_client_safe`.
- Recommended next action: Action 922 - Wire Execution Settings Helpers Into
  Read/Write Paths.

## Action 920 Update - Execution Settings Baseline Tests

- Added `tests/e2e/execution-settings-persistence-baseline.spec.ts` to cover
  execution settings persistence as a separate seam from event-log/localStorage
  helper wiring.
- Confirmed no event-log localStorage behavior or helper wiring was changed.
- Status: `execution_settings_persistence_baseline_tests_added`.
- Recommended next action: Action 921 - Implement Client-Safe Execution
  Settings Persistence Helpers.

## Action 919 Update

Action 919 created
`docs/execution-settings-persistence-coupling-inventory.md` to inventory the
execution settings seam that Action 918 left as the next safe local persistence
refactor target.

The inventory confirms `ture_execution_mode` remains distinct from the
dedicated execution event log, local execution records, dev mock broker result
store, and server-side audit writer path. It also identifies adjacent
paper-session protocol and risk-control stores as execution settings coupling
that should be baselined before helper extraction.

No event log helper wiring, local execution record wiring, dev mock broker
result wiring, storage key, settings default, runtime behavior, audit writer
path, broker/Avanza behavior, automatic mode behavior, migration, type
generation, generated type, or `.env.local` change was performed.

Result status:
`execution_settings_persistence_coupling_inventory_created`

Recommended next action:
Action 920 - Add Execution Settings Persistence Baseline Tests.

Action: 912
Date: 2026-06-27
Status: `execution_event_log_local_storage_coupling_inventory_created`

## Purpose

This inventory records the execution event log, local execution record, dev/mock
broker result, and adjacent localStorage coupling found before any extraction.
It is documentation-only. No runtime code, tests, migrations, generated types,
Supabase access, service-role code, broker behavior, Avanza behavior, automatic
mode behavior, or trade/stat/PnL mutation was changed.

The local browser event log is separate from the server-side audit writer path
and from `public.execution_record_audit_events`.

## Primary Local Storage Keys

| Key | Owner | Shape | Read paths | Write/clear paths | Bound | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `ture_execution_event_log_v1` | `lib/execution-event-log.ts` | `ExecutionAuditEvent[]` | `readExecutionAuditEvents`, `readExecutionEventLog`, lookup helpers by intent/position/recommendation; `app/settings/page.tsx` reads for settings display | `appendExecutionAuditEvent`, `appendExecutionAuditEvents`, `clearExecutionAuditEvents`; modal and localhost bridge append events | 1000 events | Browser-local execution audit/event evidence only. Clear writes `[]`. |
| `ture_execution_records_v1` | `lib/execution-record-store.ts` | `StoredExecutionRecord[]` / `TureExecutionRecord[]` | `readExecutionRecords`, `readExecutionRecordStoreResult`, lookup helpers; `app/settings/page.tsx` reads for settings display | `appendExecutionRecord`, `appendExecutionRecords`, `clearExecutionRecords`; dev broker capture appends records | 1000 records | Browser-local execution record store only. Clear writes `[]`. |
| `ture_dev_mock_broker_results_v1` | `lib/dev-mock-broker-result-store.ts` | `StoredDevMockBrokerExecutionResult[]` | `readDevMockBrokerResults`, `readDevMockBrokerResultStoreResult`, lookup helpers; settings reads display state | `appendDevMockBrokerResult(s)`, `clearDevMockBrokerResults` | 500 results | Dev/mock broker diagnostics only. Clear removes the key. |
| `trade-management-events` | `lib/persistence/local-storage-keys.ts`, `lib/execution-timeline.ts`, inline app loggers | Heterogeneous local event objects | `readTradeManagementEvents` and settings/trade views | Many inline `log*Event` helpers in `app/trade-app.tsx` and settings | 200 events per inline writer | Broader trade-management local timeline. Not the dedicated execution audit log. |
| `ture_execution_mode` | `lib/execution.ts`, settings/trade app | execution mode string | `readExecutionModePreferenceForTradeApp`, settings preference reader | settings preference writer and app focus/storage refresh | N/A | User setting only. Automatic mode still gated by feature flag. |
| `trade-paper-session-protocol-v1` | `lib/paper-session-protocol.ts`, `app/trade-app.tsx` | paper-session protocol state | app startup reader | app effect writes current protocol state | N/A | User/session checklist state, not audit evidence. |
| `trade-mock-broker-latest-fill` | `lib/persistence/local-storage-keys.ts`, dev diagnostics helpers, trade app | latest mock fill text/payload | helper read and app copy status paths | helper clear/write paths outside this action | N/A | Mock broker fill import UX state. |
| `trade-dismissed-warnings` | `lib/persistence/local-storage-keys.ts`, dev diagnostics helpers | string ids | dismissed warning helper | dismissed warning helper | N/A | UI preference state. |
| demo keys | `lib/persistence/local-storage-keys.ts`, `app/trade-app.tsx` | demo recommendations/positions/last action | demo list readers | demo list writers and reset | 25 list entries | Demo-only local app state. |

Adjacent storage discovered but not primary to this seam includes broker cost
settings, risk controls, Avanza verification notes, Avanza bridge config,
Avanza agent run store, safe browser action diagnostics, recommendation scan
local fallback stores, and live-market/dev-preview preferences.

## Event Log Producers

Dedicated execution audit events are produced by:

- `app/trade-app.tsx` execution handoff modal progress stubs via
  `createExecutionAuditEvent(...)` and `appendExecutionAuditEvents(...)`.
- `app/trade-app.tsx` preparation stub path, including
  `stub_prepare_clicked` and lifecycle-derived events from
  `buildExecutionAuditEventFromLifecycleEvent(...)`.
- `app/trade-app.tsx` dev broker capture path, including
  `broker_result_captured`, lifecycle capture, and terminal lifecycle events.
- `hooks/execution/useLocalhostBridgeControlsState.ts`, which writes
  `localhost_bridge_run_stub`, `localhost_mock_agent_run_stub`, and
  `localhost_bridge_cancel_stub` events.

The event log module owns normalization, malformed JSON fallback, storage
availability reporting, and bounded writes. Producers treat writes as local
diagnostics and do not let local event logging block UI flows.

## Execution Record Store Producers

`app/trade-app.tsx` appends one local execution record after the dev broker
capture stub builds a `TureExecutionRecord` with
`buildTureExecutionRecord(...)`. The stored record is local-only evidence for
the settings/debug surface. It does not update trades, History, Statistics,
PnL, Supabase, or broker state.

## Settings/UI Consumers

`app/settings/page.tsx` is the main reader/clear surface for this inventory:

- reads and refreshes `readExecutionEventLog()`;
- clears local audit events with `clearExecutionAuditEvents()`;
- reads and refreshes `readExecutionRecordStoreResult()`;
- clears local execution records with `clearExecutionRecords()`;
- reads and refreshes `readDevMockBrokerResultStoreResult()`;
- clears dev mock broker results with `clearDevMockBrokerResults()`;
- reads/writes execution mode preference;
- reads broader diagnostics stores such as Avanza agent runs, bridge config,
  safe browser action diagnostics, and sandbox checklist state.

`lib/execution-timeline.ts` reads `trade-management-events` and derives a
display timeline from local events, execution metadata, and position metadata.

## Modal And Helper Coupling

`lib/execution-modal-state-helpers.ts` remains client-safe and state-shaping
only. It does not own localStorage or event-log writes.

The coupling remains in `app/trade-app.tsx` around the modal handlers:

- modal open/close helpers shape modal state;
- preparation and capture handlers still perform local audit event appends;
- capture handler still writes local execution records;
- localhost bridge hook still writes dev-only local audit events;
- localStorage writes are interleaved with UI messages and state updates.

This is the main extraction seam: isolate event construction and storage
effects from modal state shaping while preserving existing no-broker/no-real
order behavior.

## Risk Inventory

- There are multiple local evidence stores with similar language:
  dedicated execution audit events, broader trade-management events, local
  execution records, and dev mock broker results.
- Clear semantics differ: execution audit events and records write `[]`; dev
  mock broker results removes the key.
- Bounds differ: dedicated execution event log and records keep 1000 entries,
  dev mock broker results keep 500, and trade-management event writers keep
  200.
- Malformed JSON handling differs between dedicated modules and inline app
  helpers.
- Inline `trade-management-events` writers duplicate parse/prepend/slice/write
  logic many times in `app/trade-app.tsx`.
- Event construction is mixed with modal UI state updates, which makes
  behavior-preserving extraction harder.
- The local browser event log can be confused with the server-side audit table
  unless docs/tests keep the distinction explicit.
- Future extraction must avoid importing server-only audit writer modules into
  UI/browser code.

## Proposed Extraction Seams

1. Add baseline tests for local event log, record store, dev mock broker result
   store, and trade-management event read/write behavior.
2. Extract a client-safe local execution event logging adapter that wraps
   `createExecutionAuditEvent(...)`, lifecycle-derived event construction, and
   append calls without importing server-only modules.
3. Extract a small modal-side effect helper for preparation/capture event
   batches after baseline coverage proves exact existing outputs.
4. Extract a trade-management local timeline writer helper to remove repeated
   inline parse/prepend/slice/write logic.
5. Normalize clear/error reporting only after tests freeze current behavior and
   a separate action approves behavior changes, if any.

## Safety Boundaries

- This inventory is not an implementation approval.
- This inventory is not generated types proof.
- This inventory is not audit writer, route, or production write-path approval.
- Local browser event logs remain separate from server-side audit persistence.
- No UI/browser/client invocation of the server audit writer is authorized.
- No market/scanner/automation invocation is authorized.
- No broker/Avanza behavior or automatic mode behavior is authorized.

## Result

Result status:
`execution_event_log_local_storage_coupling_inventory_created`

Recommended next action:
Action 913 - Add Execution Event Log/Local Storage Baseline Tests.

## Action 913 Update

Action 913 created:

- `tests/e2e/execution-event-log-local-storage-baseline.spec.ts`
- `docs/execution-event-log-local-storage-baseline-tests.md`

The baseline tests lock the current importable behavior for the dedicated local
execution event log, local execution record store, dev mock broker result store,
trade-management event reader, execution mode default, mock broker latest fill
reader, and static settings/modal coupling.

No helper extraction, runtime behavior change, storage key rename, handler/effect
change, modal helper wiring change, audit writer runtime path change, Supabase
query, service-role adapter call, live proof/insert, migration, type generation,
generated type edit, `.env.local` change, broker/Avanza behavior, automatic
mode behavior, or trade/stats/PnL mutation was performed.

Result status:
`execution_event_log_local_storage_baseline_tests_added`

Recommended next action:
Action 914 - Implement Client-Safe Execution Local Storage Helpers.

## Action 914 Update

Action 914 created a client-safe helper layer for the dedicated local execution
storage seam:

- `lib/execution-local-storage-helpers.ts`
- `tests/e2e/execution-local-storage-helpers.spec.ts`
- `docs/execution-local-storage-helpers-implementation.md`

The helper layer preserves the inventoried key names and clear semantics:
execution event log and execution records write `[]`; dev mock broker results
remove the key. The helpers remain dependency-injected and are not wired into
`app/trade-app.tsx`, settings, modal handlers, or any audit writer path.

Result status:
`execution_local_storage_helpers_implemented_client_safe`

Recommended next action:
Action 915 - Wire Event Log Helpers Into Read/Append Paths.

## Action 915 Update

Action 915 resolved the first implementation seam from this inventory by wiring
only the dedicated execution event log read/append/clear paths to
`lib/execution-local-storage-helpers.ts`.

The execution records store, dev mock broker result store,
`trade-management-events` inline writers, settings behavior, modal handlers,
and audit writer runtime persistence path remain unchanged.

Result status:
`execution_event_log_helpers_read_append_wired`

Recommended next action:
Action 916 - Wire Execution Records Store Helpers Into Read/Write/Clear Paths.
# Action 916 Update

The execution records store localStorage seam has now been wired through
`lib/execution-local-storage-helpers.ts` for read, append/write, and clear
paths only. Event log helper wiring remains unchanged from Action 915. Dev mock
broker result storage remains the next unwired seam.

# Action 917 Update

The dev mock broker result store localStorage seam has now been wired through
`lib/execution-local-storage-helpers.ts` for read, append/write, and
remove-clear paths. The dedicated local execution storage helper seam is now
complete.

# Action 918 Update

Action 918 closed the dedicated local persistence refactor summary and
identified execution settings persistence as the next inventory seam.

## Task 341 Terminology Checkpoint Update

Task 341 created `docs/local-diagnostic-execution-records-checkpoint.md` to
make the local-only status of these stores explicit. The existing storage keys
and type names remain unchanged:

- `ture_execution_event_log_v1`
- `ture_execution_records_v1`
- `ture_dev_mock_broker_results_v1`
- `trade-management-events`

These stores should be described as local diagnostic execution records,
dev-only execution audit entries, non-authoritative broker-result models, or
manual-confirmation evidence placeholders. They are not production execution
persistence, not Supabase execution writes, not broker-confirmed executions,
and not evidence of actual BUY/SELL order submission.

No storage key migration, runtime behavior change, API route activation,
Supabase write, Trade UI behavior change, or execution gate change was made by
Task 341.
