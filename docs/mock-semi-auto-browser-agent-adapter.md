# Mock Semi-Auto Browser Agent Adapter

## Purpose

Action 983 adds a pure mock semi-auto browser agent adapter.

The adapter consumes semi-auto payloads from
`lib/semi-auto-agent-payload-contract.ts` and simulates the future
browser-agent lifecycle without opening a browser, navigating to Avanza,
clicking anything, submitting orders, using credentials, calling external
services, writing to a database, or mutating trades.

Result status: `mock_semi_auto_browser_agent_adapter_added`

Recommended next action: Action 984 - Add Semi-Auto Agent Handoff Preview
Wiring.

Follow-up status: Action 984 added
`docs/semi-auto-agent-handoff-preview-wiring.md`,
`lib/semi-auto-agent-handoff-preview.ts`,
`components/execution/SemiAutoAgentHandoffPreview.tsx`, and
`tests/e2e/semi-auto-agent-handoff-preview-wiring.spec.ts` with result status
`semi_auto_agent_handoff_preview_wiring_added`.

Recommended next action for the semi-auto Avanza planning track: Action 985 -
Add Semi-Auto Agent Result Capture UI Stub.

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

Follow-up status: Action 987 added the read-only dev flow review panel with
result status `semi_auto_agent_dev_flow_review_panel_added`.

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

## Adapter Source

- Adapter module: `lib/mock-semi-auto-browser-agent-adapter.ts`
- Adapter tests: `tests/e2e/mock-semi-auto-browser-agent-adapter.spec.ts`
- Contract module: `lib/semi-auto-agent-payload-contract.ts`
- Builder module: `lib/semi-auto-agent-payload-builder.ts`

The adapter imports only the pure contract module. It does not import browser
automation, Avanza runtime adapters, broker adapters, Supabase clients,
service-role helpers, provider code, route handlers, scan code, audit writer
modules, or app runtime UI.

## Supported Inputs

- Valid recommendation/buy payloads.
- Valid live-position sell/exit payloads.
- Invalid, stale, expired, or authority-violating payloads.

Valid payloads return a deterministic prepare-only result with
`waiting_for_manual_confirmation`. Invalid or stale payloads return `blocked`
and do not include a prepared order summary.

## Adapter Result Shape

The adapter result includes:

- adapter name;
- adapter mode;
- payload id;
- payload fingerprint;
- action;
- ticker;
- quantity;
- status;
- lifecycle-compatible status;
- prepared order summary;
- manual final confirmation required flag;
- automatic submit attempted flag;
- automatic submit allowed flag;
- requested automatic-submit flag;
- blocking reason;
- warnings;
- errors;
- validation result;
- deterministic generated timestamp when injected.

The prepared order summary includes ticker, side/action, quantity, order type,
entry price, limit price, stop, target, and broker target label.

## Safety Invariants

- Semi-auto mode only.
- Human final confirmation is always required.
- Automatic submit is always false.
- Automatic submit is never attempted.
- Sell/exit payloads use the same human-confirmation model as buy payloads.
- Stale, expired, invalid, non-semi-auto, automatic-submit, and
  missing-manual-confirmation payloads are blocked.
- Blocked payloads do not prepare order summaries.
- The adapter does not mutate the payload.
- Action 986 consumes adapter results in a pure dev state machine; blocked
  adapter results cannot advance to `waiting_for_manual_confirmation`.

## No-Automation Confirmation

Action 983 did not add:

- real browser automation;
- Playwright/Puppeteer automation against Avanza;
- Avanza DOM interaction or navigation;
- broker submit/click behavior;
- credential or env access;
- service-role import or value exposure;
- Supabase query/write behavior;
- provider, route, scan, or live-market invocation;
- runtime UI wiring;
- audit writer UI/browser/client invocation;
- trade/stats/PnL mutation.

## Validation Results

- Focused adapter, builder, and contract tests passed:
  `npx playwright test tests/e2e/mock-semi-auto-browser-agent-adapter.spec.ts tests/e2e/semi-auto-avanza-agent-payload-builder.spec.ts tests/e2e/semi-auto-avanza-agent-payload-contract.spec.ts`
  after rerunning with escalation because the Playwright web server bind to
  port 3010 is sandbox-restricted.
- Related execution/handoff tests passed:
  `npx playwright test tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts tests/e2e/execution-ui-component-extraction-baseline.spec.ts`.
- `./node_modules/.bin/tsc --noEmit` passed before documentation updates.
- Final lint, static scans, and repo safety checks are recorded in the
  checkpoint/QA notes for this action.

## Not Performed

- No runtime UI wiring.
- No browser automation.
- No Avanza integration.
- No broker behavior.
- No automatic order submission.
- No automatic mode enablement.
- No real order submit path.
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
- No trade/stats/PnL mutation.
