# Semi-Auto Avanza Agent Payload Contract Tests

## Purpose

Action 981 adds tests for the semi-automatic Avanza/browser-agent payload
contract.

This locks down the first safe implementation seam from
`docs/semi-automatic-avanza-agent-integration-inventory.md`: a typed,
prepare-only payload contract for a future semi-auto agent. It is not browser
automation, not Avanza integration, not broker behavior, and not automatic
order submission.

Result status: `semi_auto_avanza_agent_payload_contract_tests_added`

Recommended next action: Action 984 - Add Semi-Auto Agent Handoff Preview
Wiring.

Follow-up status: Action 982 added
`docs/semi-auto-avanza-agent-payload-builder.md`,
`lib/semi-auto-agent-payload-builder.ts`, and
`tests/e2e/semi-auto-avanza-agent-payload-builder.spec.ts` with result status
`semi_auto_avanza_agent_payload_builder_added`.

Completed follow-up recommendation for the semi-auto Avanza planning track:
Action 983 - Add Mock Semi-Auto Browser Agent Adapter.

Follow-up status: Action 983 added
`docs/mock-semi-auto-browser-agent-adapter.md`,
`lib/mock-semi-auto-browser-agent-adapter.ts`, and
`tests/e2e/mock-semi-auto-browser-agent-adapter.spec.ts` with result status
`mock_semi_auto_browser_agent_adapter_added`.

Recommended next action for the semi-auto Avanza planning track: Action 984 -
Add Semi-Auto Agent Handoff Preview Wiring.

## Contract Source

- Contract/helper module:
  `lib/semi-auto-agent-payload-contract.ts`
- Test file:
  `tests/e2e/semi-auto-avanza-agent-payload-contract.spec.ts`

The helper module is pure and non-executing. It defines the payload shape,
human-only authority flags, deterministic identity helper, and validation
rules. It does not import browser APIs, Avanza adapters, Supabase clients,
service-role helpers, provider code, route callers, or scan code.

## Fields Covered

The focused tests cover:

- `version`
- `mode`
- `payload_id`
- `created_at`
- `recommendation_id`
- `recommendation_fingerprint`
- `position_id`
- `payload_fingerprint`
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

## Safety Invariants

- Semi-auto payloads must use `mode: "semi_auto"`.
- Human final confirmation is required.
- Automatic submit is always false.
- The final confirmation actor is human.
- The agent may prepare broker fields but may not submit the order.
- Buy payloads require entry/manual-entry intent.
- Sell/exit payloads require exit intent and the same human-confirmation
  model.
- Recommendation-source payloads are buy/entry oriented.
- Live-position payloads are sell/exit oriented.
- Stale or expired payloads are blocked.
- Missing ticker, missing side/action, invalid quantity, and failed safety
  checks are blocked.
- Deterministic payload identity changes when meaningful order input changes.
- No payload can silently switch from semi-auto to automatic authority.

## Action 984 Follow-Up

Action 984 wired the contract into the existing handoff preview through the
pure builder, pure mock adapter, and preview-only UI component.

The preview keeps the same contract invariants visible in the UI: semi-auto
mode, human final confirmation required, automatic submit false, stale/invalid
payloads blocked, and sell/exit payloads using the same confirmation model.

Result status: `semi_auto_agent_handoff_preview_wiring_added`

Recommended next action: Action 985 - Add Semi-Auto Agent Result Capture UI
Stub.

Action 985 added a local-only result capture UI stub after valid mock
semi-auto prepare previews. The contract invariants remain unchanged:
semi-auto mode, human final confirmation required, automatic submit false, and
no payload mutation.

Result status: `semi_auto_agent_result_capture_ui_stub_added`

Recommended next action: Action 986 - Add Semi-Auto Agent Dev Flow State
Machine.

Action 986 added `lib/semi-auto-agent-dev-flow-state-machine.ts` and
`tests/e2e/semi-auto-agent-dev-flow-state-machine.spec.ts`. The state machine
preserves the contract authority model by accepting only semi-auto payloads
with human final confirmation required, automatic submit false, and agent
submit authority false.

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

Static test assertions and source scans confirm:

- No Playwright/browser automation was added to the contract module.
- No Avanza DOM or URL navigation behavior was added.
- No broker submit/click function was added.
- No credential/env access was added.
- No service-role import or value exposure was added.
- No Supabase write/query behavior was added.
- No provider, route, or scan invocation was added.
- No real trade or trade/stats/PnL mutation behavior was added.

## Validation Results

- Focused payload contract tests passed:
  `npx playwright test tests/e2e/semi-auto-avanza-agent-payload-contract.spec.ts`
  after rerunning with escalation because the Playwright web server bind to
  port 3010 is sandbox-restricted.
- Related execution/handoff tests passed:
  `npx playwright test tests/e2e/execution-lifecycle-ui-state-adapter.spec.ts tests/e2e/execution-ui-component-extraction-baseline.spec.ts`.
- `./node_modules/.bin/tsc --noEmit` passed.
- Additional static scans were retained as required safety checks for browser,
  Avanza, broker, automatic-submit, route, scan, Supabase, env, and
  service-role boundaries.

## Not Performed

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
