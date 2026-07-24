# Semi-Auto Agent Dev Flow State Machine

## Purpose

Action 986 adds a pure semi-auto agent dev flow state machine that connects
the existing safe semi-auto pieces conceptually and testably:

- payload contract: `lib/semi-auto-agent-payload-contract.ts`
- payload builder: `lib/semi-auto-agent-payload-builder.ts`
- mock adapter: `lib/mock-semi-auto-browser-agent-adapter.ts`
- handoff preview: `lib/semi-auto-agent-handoff-preview.ts`
- local result capture stub: `lib/semi-auto-agent-result-capture-stub.ts`

Result status: `semi_auto_agent_dev_flow_state_machine_added`

Recommended next action: Action 987 - Add Semi-Auto Agent Dev Flow Review
Panel.

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

This is local/dev-only and non-executing. It is not real Avanza integration,
not browser automation, not broker behavior, and not automatic submission.

## State Machine Source

- Helper module: `lib/semi-auto-agent-dev-flow-state-machine.ts`
- Focused tests:
  `tests/e2e/semi-auto-agent-dev-flow-state-machine.spec.ts`
- Related UI surfaces:
  `components/execution/SemiAutoAgentHandoffPreview.tsx` and
  `components/execution/SemiAutoAgentResultCaptureStub.tsx`

The helper is pure TypeScript. It imports only types from the existing
payload, mock adapter, and local result capture helper modules. It does not
import React, browser APIs, route handlers, providers, Supabase clients,
service-role helpers, audit writer modules, or app runtime code.

## States

The implemented states are:

- `idle`
- `payload_ready`
- `payload_blocked`
- `preview_ready`
- `waiting_for_manual_confirmation`
- `result_captured_local`
- `completed_local`
- `cancelled_local`
- `broker_rejected_local`
- `failed_local`
- `timeout_local`
- `unknown_needs_review`

Terminal states are local-only and do not imply that Ture captured a real
broker confirmation or submitted an order.

## Events

The implemented events are:

- `BUILD_PAYLOAD_SUCCEEDED`
- `BUILD_PAYLOAD_BLOCKED`
- `MOCK_PREPARE_SUCCEEDED`
- `MOCK_PREPARE_BLOCKED`
- `MANUAL_CONFIRMATION_WAITING`
- `LOCAL_RESULT_SELECTED`
- `RESET`

Invalid transitions return the unchanged state plus a warning or blocked
reason. Normal flow issues do not throw.

## Transition Behavior

Valid payloads can transition from `idle` to `payload_ready` only when the
builder result is ready, contract validation is valid, `mode` is `semi_auto`,
human final confirmation is required, automatic submit is false, final
confirmation actor is human, and agent submit authority is false.

Blocked, stale, expired, invalid, automatic-mode, or automatic-submit-authority
payloads transition to `payload_blocked` or reject the transition with warning
metadata. They cannot reach `preview_ready` or
`waiting_for_manual_confirmation`.

Valid mock prepare results can transition from `payload_ready` to
`preview_ready` only when the mock adapter is
`waiting_for_manual_confirmation`, manual final confirmation is required,
automatic submit was not attempted, automatic submit is not allowed, and
adapter validation is valid.

`MANUAL_CONFIRMATION_WAITING` moves `preview_ready` to
`waiting_for_manual_confirmation`. Local result capture is accepted only from
that waiting state.

Local result capture maps to terminal local states:

- `user_confirmed` -> `completed_local`
- `user_cancelled` -> `cancelled_local`
- `broker_rejected` -> `broker_rejected_local`
- `failed` -> `failed_local`
- `timeout` -> `timeout_local`
- `unknown_needs_review` -> `unknown_needs_review`
- `capture_not_available` -> `unknown_needs_review`

`RESET` returns to `idle`.

## Safety Invariants

- Semi-auto only.
- Manual final confirmation required.
- Automatic submit false.
- Agent submit authority false.
- Stale, invalid, blocked, automatic-mode, or automatic-submit-authority
  payloads cannot prepare or wait for confirmation.
- Result capture is accepted only after `waiting_for_manual_confirmation`.
- Capture results must keep local-only safety flags:
  `local_only`, `mock_only`, no Avanza confirmation captured, no broker order
  submitted by Ture, automatic submit disabled, no Supabase write, no audit
  writer invocation, and no trade/stats/PnL mutation.
- Previous state, payload result, adapter result, and capture result objects
  are not mutated.

## No-Automation Confirmation

Action 986 did not add:

- browser automation;
- Playwright/Puppeteer automation against Avanza;
- Avanza DOM interaction or navigation;
- broker submit/click behavior;
- credential/env access;
- service-role import or value exposure;
- Supabase query/write behavior;
- provider, route, scan, or live-market invocation;
- runtime UI wiring;
- audit writer UI/browser/client invocation;
- trade/stats/PnL mutation;
- migration, type generation, generated type edits, or `.env.local` changes.

## Validation Results

Validation for Action 986 is recorded in
`docs/execution-agent-checkpoint.md` and
`docs/execution-agent-qa-notes.md`.

The focused state-machine tests cover:

- valid payload -> preview -> waiting flow;
- blocked/stale payload behavior;
- automatic-mode and automatic-submit authority blocking;
- local result capture terminal mapping;
- rejected capture before waiting state;
- reset behavior;
- no mutation of previous state, payload result, adapter result, or capture
  result objects;
- source scans for no React, fetch, Supabase, service-role, route, provider,
  browser automation, persistence, or mutation calls.

Action 987 added a read-only panel that visualizes this state machine inside
the existing handoff modal without changing state-machine transitions or adding
execution behavior.

## Not Performed

- No UI review panel.
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
