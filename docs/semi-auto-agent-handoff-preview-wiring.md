# Semi-Auto Agent Handoff Preview Wiring

## Purpose

Action 984 wires the semi-auto agent chain into the existing execution handoff
preview UI as a preview-only, non-executing surface.

Result status: `semi_auto_agent_handoff_preview_wiring_added`

Recommended next action: Action 985 - Add Semi-Auto Agent Result Capture UI
Stub.

Follow-up status: Action 985 added
`docs/semi-auto-agent-result-capture-ui-stub.md`,
`lib/semi-auto-agent-result-capture-stub.ts`,
`components/execution/SemiAutoAgentResultCaptureStub.tsx`, and
`tests/e2e/semi-auto-agent-result-capture-ui-stub.spec.ts` with result status
`semi_auto_agent_result_capture_ui_stub_added`.

Recommended next action for the semi-auto Avanza planning track: Action 986 -
Add Semi-Auto Agent Dev Flow State Machine.

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

This is not real browser automation and not Avanza integration. The preview
uses the pure payload builder and pure mock adapter to show what a future
semi-auto handoff would prepare while keeping final broker confirmation manual.

## UI Source

- Pure preview helper: `lib/semi-auto-agent-handoff-preview.ts`
- UI component: `components/execution/SemiAutoAgentHandoffPreview.tsx`
- Existing modal composition:
  `components/execution/ExecutionHandoffModalComposition.tsx`
- Existing handoff modal:
  `components/execution/execution-handoff-preview-modal.tsx`
- Focused tests:
  `tests/e2e/semi-auto-agent-handoff-preview-wiring.spec.ts`
- Payload contract: `lib/semi-auto-agent-payload-contract.ts`
- Payload builder: `lib/semi-auto-agent-payload-builder.ts`
- Mock adapter: `lib/mock-semi-auto-browser-agent-adapter.ts`

## Preview Behavior

The preview derives a semi-auto payload from the selected execution intent and
ready Avanza handoff. It then runs the mock semi-auto browser agent adapter in
memory.

Shown fields include:

- adapter mode;
- payload id;
- ticker;
- action;
- quantity;
- order type;
- entry/reference price;
- limit price;
- stop;
- target;
- planned risk;
- manual final confirmation required;
- automatic submit attempted;
- automatic submit allowed.

Valid recommendation/buy and live-position sell/exit handoffs show
`waiting_for_manual_confirmation`. Invalid, stale, expired, automatic-mode, or
not-ready handoffs show a blocked preview state and do not show a successful
prepare state.

## Safety Copy

The UI states that this is a mock/non-executing semi-auto preview. It also
states:

- no Avanza order has been placed;
- no automatic submit is enabled;
- final broker confirmation remains manual.

## Safety Invariants

- Semi-auto mode only.
- Human final confirmation is required.
- Automatic submit is false.
- Automatic submit attempted is false.
- Stale, invalid, or authority-violating payloads are blocked.
- Sell/exit handoff uses the same human-confirmation model as buy handoff.
- The mock adapter does not mutate payloads.
- Preview results are not persisted.
- No audit records are written from the UI.
- No trade/stats/PnL behavior is mutated.
- Action 986 now models the preview handoff as a pure dev state-machine
  transition from `payload_ready` to `preview_ready` to
  `waiting_for_manual_confirmation`; the UI wiring remains unchanged.
- Action 987 visualizes that state-machine path in the existing handoff modal
  as a read-only local review panel.

## No-Automation Confirmation

Action 984 did not add:

- browser automation;
- Playwright/Puppeteer automation against Avanza;
- Avanza DOM interaction or navigation;
- broker submit/click behavior;
- credential or env access;
- service-role import or value exposure;
- Supabase query/write behavior;
- provider, route, scan, or live-market invocation;
- audit writer UI/browser/client invocation;
- automatic mode enablement;
- automatic order submission;
- trade/stats/PnL mutation.

## Validation Results

Validation for Action 984 is recorded in
`docs/execution-agent-checkpoint.md` and
`docs/execution-agent-qa-notes.md`.

The focused preview wiring tests cover:

- valid recommendation/buy preview;
- valid live-position sell/exit preview;
- blocked stale/expired preview;
- automatic-mode blocking before mock adapter execution;
- static UI/helper scans for no fetch, Supabase, service-role, browser
  automation, broker submit, or persistence behavior.

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
