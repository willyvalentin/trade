# Semi-Auto Agent Local Dev Flow Persistence

## Purpose

Action 988 adds browser-local-only dev flow persistence for semi-auto agent
review snapshots.

Result status: `semi_auto_agent_local_dev_flow_persistence_added`

Recommended next action: Action 989 - Add Semi-Auto Agent Local Dev Flow
History Viewer.

Follow-up status: Action 989 added
`components/execution/SemiAutoAgentLocalDevFlowHistoryViewer.tsx`,
`tests/e2e/semi-auto-agent-local-dev-flow-history-viewer.spec.ts`, and
`docs/semi-auto-agent-local-dev-flow-history-viewer.md` with result status
`semi_auto_agent_local_dev_flow_history_viewer_added`.

Recommended next action for the semi-auto Avanza planning track: Action 990 -
Semi-Auto Agent Dev Flow End-to-End QA Pass.

Follow-up status: Action 990 created
`docs/semi-auto-agent-dev-flow-end-to-end-qa.md` with result status
`semi_auto_agent_dev_flow_e2e_qa_passed_with_warnings`.

Recommended next action for the semi-auto Avanza planning track: Action 991 -
Prepare Semi-Auto Agent Real Browser Automation Feasibility Review.

Follow-up status: Action 991 created
`docs/semi-auto-agent-real-browser-automation-feasibility-review.md` with
result status
`semi_auto_agent_real_browser_automation_feasibility_review_created`.

Recommended next action for the semi-auto Avanza planning track: Action 992 -
Add Browser Automation Safety Boundary Spec.

This is not Supabase persistence, not audit writer persistence, not real
Avanza/broker capture, and not a broker execution record. It stores bounded
local review snapshots in browser `localStorage` only.

## Store Source

- Store helper: `lib/semi-auto-agent-local-dev-flow-store.ts`
- Review helper source: `lib/semi-auto-agent-dev-flow-review.ts`
- UI save surface:
  `components/execution/SemiAutoAgentDevFlowReviewPanel.tsx`
- Focused tests:
  `tests/e2e/semi-auto-agent-local-dev-flow-persistence.spec.ts`
- History viewer:
  `components/execution/SemiAutoAgentLocalDevFlowHistoryViewer.tsx`
- History viewer tests:
  `tests/e2e/semi-auto-agent-local-dev-flow-history-viewer.spec.ts`

Local storage key:

- `ture_semi_auto_agent_local_dev_flow_v1`

Bounded history limit:

- `100` latest events.

## Event Shape

Each stored event includes:

- `event_id`
- `created_at`
- `payload_id`
- `ticker`
- `action`
- `quantity`
- `dev_flow_state`
- `selected_local_result`
- `terminal_local_outcome`
- `warnings`
- `blocked_reasons`
- `source_context`
- `local_only: true`
- `dev_only: true`
- `manual_final_confirmation_required: true`
- `automatic_submit_allowed: false`
- `automatic_submit_attempted: false`
- `no_avanza_order_placed: true`
- `no_broker_submit_attempted: true`
- `not_sent_to_supabase: true`
- `not_audit_record: true`
- `trade_stats_pnl_mutated: false`

## Store Behavior

- Returns empty arrays when `window` or `localStorage` is unavailable.
- Handles malformed JSON without throwing.
- Handles non-array JSON as an empty history.
- Normalizes stored entries and discards invalid items.
- Sorts events latest-first by `created_at`.
- Bounds history to the latest 100 events.
- Supports appending one event at a time.
- Supports clearing the local history.
- Handles quota or `setItem` errors fail-soft by returning `false`.

## UI Behavior

The dev flow review panel now includes a manual save action:

- button: `Save local dev flow event`
- success copy: `Saved locally only`
- safety copy: `Not sent to Supabase`, `not an audit record`, and
  `no broker action`
- latest local event count after save

Saving is manual and writes only to browser `localStorage`. It does not persist
to Supabase, call routes, call providers, invoke scans, write audit records, or
mutate trades/stats/PnL.

## Safety Invariants

- No Supabase write.
- No client audit writer invocation.
- No trade/stats/PnL mutation.
- No browser automation.
- No Avanza DOM or navigation behavior.
- No broker submit/click behavior.
- No automatic order submission.
- No provider, route, scan, or live-market invocation.
- No credential/env/service-role access.
- No payload/state/result mutation outside a local storage snapshot.
- No migration, type generation, generated type edits, or `.env.local`
  changes.

## Validation Results

Validation for Action 988 is recorded in
`docs/execution-agent-checkpoint.md` and
`docs/execution-agent-qa-notes.md`.

Focused persistence tests cover:

- unavailable storage;
- malformed JSON;
- non-array JSON;
- append behavior;
- latest-first ordering;
- local/dev-only safety flags;
- automatic submit false flags;
- manual confirmation required flag;
- bounded history;
- clear behavior;
- fail-soft storage write errors;
- UI save copy and source scans for no Supabase, audit writer, service-role,
  route, provider, scan, browser automation, broker submit, or persistence
  outside localStorage.

## Not Performed

- No real browser automation.
- No Avanza integration.
- No broker behavior.
- No automatic submit.
- No provider call.
- No route invocation.
- No scan invocation.
- No live market scan.
- No database write.
- No Supabase manual call.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No service-role value printed.
- No audit writer UI/browser/client invocation.
- No real trade.
- No trade/stats/PnL mutation.
