# Semi-Auto Agent Result Capture UI Stub

## Purpose

Action 985 adds a safe, local-only result capture UI stub for the semi-auto
agent handoff flow.

Result status: `semi_auto_agent_result_capture_ui_stub_added`

Recommended next action: Action 986 - Add Semi-Auto Agent Dev Flow State
Machine.

Follow-up status: Action 986 added
`docs/semi-auto-agent-dev-flow-state-machine.md`,
`lib/semi-auto-agent-dev-flow-state-machine.ts`, and
`tests/e2e/semi-auto-agent-dev-flow-state-machine.spec.ts` with result status
`semi_auto_agent_dev_flow_state_machine_added`.

Recommended next action for the semi-auto Avanza planning track: Action 987 -
Add Semi-Auto Agent Dev Flow Review Panel.

Follow-up status: Action 987 added
`docs/semi-auto-agent-dev-flow-review-panel.md`,
`lib/semi-auto-agent-dev-flow-review.ts`,
`components/execution/SemiAutoAgentDevFlowReviewPanel.tsx`, and
`tests/e2e/semi-auto-agent-dev-flow-review-panel.spec.ts` with result status
`semi_auto_agent_dev_flow_review_panel_added`.

Recommended next action for the semi-auto Avanza planning track: Action 988 -
Add Semi-Auto Agent Local Dev Flow Persistence.

Follow-up status: Action 988 added browser-local-only dev flow persistence
with result status `semi_auto_agent_local_dev_flow_persistence_added`.

Recommended next action for the semi-auto Avanza planning track: Action 989 -
Add Semi-Auto Agent Local Dev Flow History Viewer.

Follow-up status: Action 989 added the local-only dev flow history viewer with
result status `semi_auto_agent_local_dev_flow_history_viewer_added`.

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

This is not real Avanza or broker confirmation capture. It is a
mock/local-only UI stub for testing future result-capture flow states after a
valid mock semi-auto prepare preview.

## UI And Helper Source

- Pure capture stub helper: `lib/semi-auto-agent-result-capture-stub.ts`
- UI component: `components/execution/SemiAutoAgentResultCaptureStub.tsx`
- Existing modal composition:
  `components/execution/ExecutionHandoffModalComposition.tsx`
- Existing handoff modal:
  `components/execution/execution-handoff-preview-modal.tsx`
- Focused tests:
  `tests/e2e/semi-auto-agent-result-capture-ui-stub.spec.ts`
- Related preview helper: `lib/semi-auto-agent-handoff-preview.ts`
- Related preview component:
  `components/execution/SemiAutoAgentHandoffPreview.tsx`
- Payload builder and mock adapter:
  `lib/semi-auto-agent-payload-builder.ts` and
  `lib/mock-semi-auto-browser-agent-adapter.ts`

## Stub Behavior

The stub is visible in the existing handoff modal and activates only when the
semi-auto handoff preview is ready and the mock adapter is
`waiting_for_manual_confirmation`.

For blocked, stale, invalid, unavailable, or automatic-mode previews, the stub
shows a blocked message and disables successful result capture controls.

Selecting a result updates component-local state only. It does not persist,
append audit events, mutate trades, mutate stats/PnL, call routes, call
providers, open Avanza, or submit broker orders.

## Result Statuses

The implemented local stub statuses are:

- `user_confirmed`
- `user_cancelled`
- `broker_rejected`
- `unknown_needs_review`
- `failed`
- `timeout`
- `capture_not_available`

Each result includes local-only safety flags:

- `local_only: true`
- `mock_only: true`
- `no_avanza_confirmation_captured: true`
- `no_broker_order_submitted_by_ture: true`
- `automatic_submit_enabled: false`
- `supabase_write_attempted: false`
- `audit_writer_invoked: false`
- `trade_stats_pnl_mutated: false`

## Safety Copy

The UI states:

- local stub only;
- no Avanza confirmation was captured;
- no broker order was submitted by Ture;
- no automatic submit is enabled;
- use this to test the future result-capture flow.

## Safety Invariants

- No Supabase write.
- No client audit writer invocation.
- No trade/stats/PnL mutation.
- No browser automation.
- No Avanza DOM or navigation behavior.
- No broker submit/click behavior.
- No automatic order submission.
- No payload mutation.
- Blocked/stale/invalid previews do not expose successful capture controls.
- Action 986 accepts result capture in the dev flow state machine only after
  `waiting_for_manual_confirmation`.
- Action 986 maps local stub statuses to terminal local-only states without
  changing the capture helper or UI behavior.
- Action 987 reflects the selected local stub result in a read-only dev flow
  review panel via modal-local React state only.

## No-Automation Confirmation

Action 985 did not add:

- real browser automation;
- Playwright/Puppeteer automation against Avanza;
- Avanza integration;
- Avanza DOM interaction or navigation;
- broker behavior;
- broker submit/click behavior;
- automatic order submission;
- automatic mode enablement;
- provider, route, scan, or live-market invocation;
- Supabase query/write behavior;
- service-role adapter calls;
- audit writer UI/browser/client invocation;
- trade/stats/PnL mutation.

## Validation Results

Validation for Action 985 is recorded in
`docs/execution-agent-checkpoint.md` and
`docs/execution-agent-qa-notes.md`.

The focused result-capture tests cover:

- activation only after a valid mock prepare preview;
- blocked preview behavior;
- all local result statuses;
- local-only safety flags;
- modal wiring;
- source scans for no fetch, Supabase, service-role, browser automation,
  broker submit, or persistence behavior.

## Not Performed

- No real Avanza/broker confirmation capture.
- No browser automation.
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
