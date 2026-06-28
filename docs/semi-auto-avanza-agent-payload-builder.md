# Semi-Auto Avanza Agent Payload Builder

## Purpose

Action 982 adds a pure semi-auto Avanza agent payload builder.

The builder converts recommendation/buy-style inputs and live-position
sell/exit-style inputs into the contract from
`lib/semi-auto-agent-payload-contract.ts`. It is a testable, non-executing
helper only. It is not browser automation, not Avanza integration, not broker
behavior, and not automatic order submission.

Result status: `semi_auto_avanza_agent_payload_builder_added`

Recommended next action: Action 984 - Add Semi-Auto Agent Handoff Preview
Wiring.

Follow-up status: Action 983 added
`docs/mock-semi-auto-browser-agent-adapter.md`,
`lib/mock-semi-auto-browser-agent-adapter.ts`, and
`tests/e2e/mock-semi-auto-browser-agent-adapter.spec.ts` with result status
`mock_semi_auto_browser_agent_adapter_added`.

Recommended next action for the semi-auto Avanza planning track: Action 984 -
Add Semi-Auto Agent Handoff Preview Wiring.

## Builder Source

- Builder module: `lib/semi-auto-agent-payload-builder.ts`
- Contract module: `lib/semi-auto-agent-payload-contract.ts`
- Builder tests: `tests/e2e/semi-auto-avanza-agent-payload-builder.spec.ts`
- Contract tests:
  `tests/e2e/semi-auto-avanza-agent-payload-contract.spec.ts`

The builder imports only the pure contract module. It does not import browser
automation, Avanza adapters, broker adapters, Supabase clients, service-role
helpers, provider code, routes, scans, audit writer modules, or app runtime UI.

## Supported Inputs

- Recommendation/buy input through
  `buildSemiAutoRecommendationBuyPayload(...)`.
- Live-position/sell or exit input through
  `buildSemiAutoLivePositionSellPayload(...)`.
- Generic explicit source input through
  `buildSemiAutoAvanzaAgentPayload(...)`.

Normal user/data issues return a blocked result. The builder does not throw for
missing ticker, missing side/action, invalid quantity, missing stop/target,
missing risk fields, stale payloads, or expired payloads.

## Normalized Fields

The builder normalizes or derives:

- `version`
- `mode`
- `payload_id`
- `payload_fingerprint`
- `created_at`
- `recommendation_id`
- `recommendation_fingerprint`
- `position_id`
- `ticker`
- `side`
- `action`
- `quantity`
- `order_type`
- `entry_price`
- `limit_price`
- `stop_price`
- `target_price`
- `risk_per_share`
- `total_planned_risk`
- `expires_at`
- `stale_after`
- `broker_target_label`
- `source_context`
- `intent`
- `authority`
- `safety_check_summary`
- `warnings`
- `errors`

Identity is deterministic for the same core input and changes when meaningful
order details such as action, ticker, or quantity change.

## Safety Invariants

- `mode` is always semi-auto.
- Human final confirmation is always required.
- Automatic submit is always false.
- Agent submit authority is always false.
- Sell/exit payloads use the same human-confirmation model as buy payloads.
- Stop-loss/target exit payloads may prepare an order payload but may not
  submit it.
- Stale or expired payloads are blocked by contract validation.
- Missing or invalid ticker, quantity, side/action, stop, target, or risk
  fields block the result.
- Failed safety checks block the result.

## Action 984 Follow-Up

Action 984 added preview-only UI wiring for the builder through
`lib/semi-auto-agent-handoff-preview.ts` and
`components/execution/SemiAutoAgentHandoffPreview.tsx`.

The builder is still pure and non-executing. It now feeds a handoff preview
that runs the mock adapter in memory, shows `waiting_for_manual_confirmation`
for valid semi-auto buy/sell payloads, and shows blocked states for invalid or
stale payloads.

Result status: `semi_auto_agent_handoff_preview_wiring_added`

Recommended next action: Action 985 - Add Semi-Auto Agent Result Capture UI
Stub.

Action 985 added a local-only result capture UI stub in
`components/execution/SemiAutoAgentResultCaptureStub.tsx`, backed by
`lib/semi-auto-agent-result-capture-stub.ts`. The builder remains pure and
non-executing; result capture selections are component-local stub states only.

Result status: `semi_auto_agent_result_capture_ui_stub_added`

Recommended next action: Action 986 - Add Semi-Auto Agent Dev Flow State
Machine.

Action 986 added a pure dev flow state machine in
`lib/semi-auto-agent-dev-flow-state-machine.ts`, with focused coverage in
`tests/e2e/semi-auto-agent-dev-flow-state-machine.spec.ts`. The builder
remains pure and non-executing; the state machine accepts ready builder
results and blocks stale, invalid, automatic-mode, or automatic-submit-authority
payloads from reaching the mock prepare/waiting states.

Result status: `semi_auto_agent_dev_flow_state_machine_added`

Recommended next action: Action 987 - Add Semi-Auto Agent Dev Flow Review
Panel.

Action 987 added the read-only/local-only dev flow review panel with result
status `semi_auto_agent_dev_flow_review_panel_added`.

Recommended next action: Action 988 - Add Semi-Auto Agent Local Dev Flow
Persistence.

Action 988 added browser-local-only dev flow persistence with result status
`semi_auto_agent_local_dev_flow_persistence_added`.

Recommended next action: Action 989 - Add Semi-Auto Agent Local Dev Flow
History Viewer.

Action 989 added the local-only dev flow history viewer with result status
`semi_auto_agent_local_dev_flow_history_viewer_added`.

Recommended next action: Action 990 - Semi-Auto Agent Dev Flow End-to-End QA
Pass.

Action 990 created `docs/semi-auto-agent-dev-flow-end-to-end-qa.md` with
result status `semi_auto_agent_dev_flow_e2e_qa_passed_with_warnings`.

Recommended next action: Action 991 - Prepare Semi-Auto Agent Real Browser
Automation Feasibility Review.

Action 991 created
`docs/semi-auto-agent-real-browser-automation-feasibility-review.md` with
result status
`semi_auto_agent_real_browser_automation_feasibility_review_created`.

Recommended next action: Action 992 - Add Browser Automation Safety Boundary
Spec.

## No-Automation Confirmation

Action 982 did not add:

- browser automation;
- Avanza DOM interaction or navigation;
- broker submit/click behavior;
- credential or env access;
- service-role import or value exposure;
- Supabase query/write behavior;
- provider, route, scan, or live-market invocation;
- audit writer UI/browser/client invocation;
- trade/stats/PnL mutation.

## Validation Results

- Focused builder and contract tests passed:
  `npx playwright test tests/e2e/semi-auto-avanza-agent-payload-builder.spec.ts tests/e2e/semi-auto-avanza-agent-payload-contract.spec.ts`
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
