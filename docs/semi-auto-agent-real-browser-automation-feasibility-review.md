# Semi-Auto Agent Real Browser Automation Feasibility Review

## Purpose

Action 991 prepares a feasibility review for future real semi-auto browser
automation, focused on the Avanza/manual-browser handoff path.

Result status:
`semi_auto_agent_real_browser_automation_feasibility_review_created`

Recommended next action: Action 992 - Add Browser Automation Safety Boundary
Spec.

Follow-up status: Action 992 created
`docs/browser-automation-safety-boundary-spec.md` and
`tests/e2e/browser-automation-safety-boundary.spec.ts` with result status
`browser_automation_safety_boundary_spec_created`.

Recommended next action: Action 993 - Add Sandbox Broker Page for Semi-Auto
Agent POC.

Follow-up status: Action 993 added `app/sandbox-broker/page.tsx`,
`components/execution/SandboxBrokerOrderForm.tsx`,
`tests/e2e/sandbox-broker-page.spec.ts`, and
`docs/sandbox-broker-page-for-semi-auto-agent-poc.md` with result status
`sandbox_broker_page_for_semi_auto_agent_poc_added`.

Recommended next action: Action 994 - Add Local Browser Agent Adapter Against
Sandbox Page.

Follow-up status: Action 994 added `lib/sandbox-browser-agent-adapter.ts`,
`tests/e2e/sandbox-browser-agent-adapter.spec.ts`, and
`docs/sandbox-browser-agent-adapter-poc.md` with result status
`sandbox_browser_agent_adapter_poc_added`.

Recommended next action: Action 995 - Add Human-Final-Confirmation Guard
Tests.

Follow-up status: Action 995 added
`tests/e2e/human-final-confirmation-guard.spec.ts` and
`docs/human-final-confirmation-guard-tests.md` with result status
`human_final_confirmation_guard_tests_added`.

Recommended next action: Action 996 - Add Sandbox Browser Agent Fill-Only
Playwright POC.

Follow-up status: Action 996 added
`tests/e2e/sandbox-browser-agent-fill-only-poc.spec.ts` and
`docs/sandbox-browser-agent-fill-only-playwright-poc.md` with result status
`sandbox_browser_agent_fill_only_playwright_poc_added`.

Recommended next action: Action 997 - Add Sandbox Agent Fill-Only Operator
Dry-Run Checklist.

Follow-up status: Action 997 created
`docs/sandbox-agent-fill-only-operator-dry-run-checklist.md` with result
status `sandbox_agent_fill_only_operator_dry_run_checklist_created`.

Recommended next action: Action 998 - Run Sandbox Agent Fill-Only Operator Dry
Run.

Follow-up status: Action 998 created
`docs/sandbox-agent-fill-only-operator-dry-run-results.md` with result status
`sandbox_agent_fill_only_operator_dry_run_passed`.

Recommended next action: Action 999 - Add Sandbox Agent Fill-Only Result
Capture Dry-Run.

Follow-up status: Action 999 added
`tests/e2e/sandbox-agent-fill-only-result-capture-dry-run.spec.ts` and
`docs/sandbox-agent-fill-only-result-capture-dry-run.md` with result status
`sandbox_agent_fill_only_result_capture_dry_run_passed`.

Recommended next action: Action 1000 - Semi-Auto Agent Sandbox Phase Final QA
And Roadmap.

This is documentation-only. It does not implement browser automation, Avanza
integration, broker behavior, automatic execution, a real order submit path,
credential handling, 2FA bypass, Supabase persistence, audit writer client
calls, provider calls, scan invocation, DB writes, migrations, type generation,
generated type edits, or `.env.local` changes.

## Current Foundation

The safe semi-auto dev loop now has the following non-executing pieces:

- Payload contract:
  `lib/semi-auto-agent-payload-contract.ts`
- Payload builder:
  `lib/semi-auto-agent-payload-builder.ts`
- Mock semi-auto adapter:
  `lib/mock-semi-auto-browser-agent-adapter.ts`
- Handoff preview:
  `lib/semi-auto-agent-handoff-preview.ts` and
  `components/execution/SemiAutoAgentHandoffPreview.tsx`
- Local result capture stub:
  `lib/semi-auto-agent-result-capture-stub.ts` and
  `components/execution/SemiAutoAgentResultCaptureStub.tsx`
- Dev flow state machine:
  `lib/semi-auto-agent-dev-flow-state-machine.ts`
- Review panel:
  `lib/semi-auto-agent-dev-flow-review.ts` and
  `components/execution/SemiAutoAgentDevFlowReviewPanel.tsx`
- Local dev flow persistence:
  `lib/semi-auto-agent-local-dev-flow-store.ts`
- Settings history viewer:
  `components/execution/SemiAutoAgentLocalDevFlowHistoryViewer.tsx`
- End-to-end QA pass:
  `docs/semi-auto-agent-dev-flow-end-to-end-qa.md`

This foundation proves payload validation, local-only preview/capture, manual
confirmation copy, bounded local history, and safety scans without connecting
to a browser or broker.

## Product Target

The target semi-auto behavior is:

1. Ture recommends a limited number of trades.
2. The user chooses a trade.
3. Ture creates a validated semi-auto payload.
4. A local agent prepares the browser/order flow.
5. The agent stops before final broker confirmation.
6. The user manually clicks final `KÖP` or `SÄLJ`.
7. Ture captures or lets the user record the result/status.
8. Ture never performs automatic submit in this phase.

## Explicit Non-Goals

- No full-auto trading in this phase.
- No automatic final click.
- No credential storage.
- No 2FA bypass.
- No assumption of a direct Avanza API.
- No unattended trading.
- No production broker automation before dry-run proof and explicit approval.
- No silent background execution.
- No sell/exit automation without human final confirmation.

## Technical Options

| Option | Feasibility | Security Risk | Reliability Risk | UX Quality | Maintenance Cost | User Control | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Local desktop browser automation | Medium | Medium-high if allowed near real account state | High because broker DOM can change | Strong if fields can be prepared reliably | High | Good if final click is blocked | Possible for a tightly gated POC only. |
| Browser extension | Medium | Medium; extension permissions need careful scoping | Medium; can inspect page context more safely than remote control | Strong if user sees all actions | High | Strong | Promising later, after boundary spec. |
| Remote controlled browser/session | Low-medium | High because session/credential handling is sensitive | High | Mixed | High | Weaker | Not recommended for first POC. |
| Human-in-the-loop local agent runner | Medium-high | Medium if local-only and user-initiated | Medium | Good | Medium | Strong | Recommended first real-world direction. |
| Pure manual copy/checklist handoff | High | Low | Low | Moderate | Low | Strongest | Best fallback and baseline. |
| Future legitimate broker/API path | Unknown | Depends on broker/API terms | Medium | Strong | Medium-high | Depends on API design | Explore only if officially available and compliant. |

## Recommended First Real-World Proof Of Concept

The first POC should be conservative:

- Local-only and manually operator controlled.
- No credentials stored by Ture.
- User is already logged in manually.
- Agent may only open/focus the browser and fill non-final fields.
- Agent must pause before final confirmation.
- Agent must not click final `KÖP` or `SÄLJ`.
- Start against a sandbox/mock broker page, not Avanza, unless separately
  approved after sandbox proof.
- No live order initially.
- Screenshot or DOM observation only if safe and separately approved.
- Outcome recorded locally only.
- No Supabase persistence or audit writer client invocation.

## Browser Automation Boundary Model

Allowed in a future separately approved POC:

- Consume validated semi-auto payloads.
- Open target page or bring a browser to foreground.
- Fill ticker/order fields in a controlled sandbox or approved manual session.
- Display a checklist before the user acts.
- Pause before final submit.
- Capture a local-only result after user action.

Forbidden:

- Click final `KÖP` or `SÄLJ`.
- Modify account settings.
- Navigate outside the approved order flow.
- Store credentials.
- Bypass 2FA.
- Place orders unattended.
- Auto-confirm sell/exit.
- Run when payload is stale or blocked.
- Attempt submit while `automatic_submit_allowed` is false.
- Hide actions from the user.

## Safety Gates For Real Browser POC

A future POC must require:

- Semi-auto mode only.
- Human final confirmation required.
- `automatic_submit_allowed: false`.
- `automatic_submit_attempted: false`.
- Fresh payload.
- Valid ticker, action, and quantity.
- Stop, target, and risk context visible where applicable.
- Duplicate handoff guard.
- Market/session check if applicable.
- Explicit user start action.
- Visible pause before final broker action.
- Kill switch/cancel control.
- Local-only result capture.
- No credential or service-role exposure.

## Capture Model

Future capture options, in increasing risk:

- User manually selects result in Ture.
- User pastes or records confirmation details in Ture.
- Agent reads confirmation page text after the user manually clicked.
- Screenshot/manual evidence stored locally.
- Local dev record first.
- Server persistence only after separate approval.

Client UI must not call the audit writer. Any future persistence beyond local
dev history requires separate server-side approval.

## Risk Assessment

| Risk | Classification | Notes |
| --- | --- | --- |
| Financial execution risk | High | Any mistaken final action can create real financial exposure. |
| Wrong ticker/quantity risk | High | Must be guarded by validation, preview, and visible user confirmation. |
| Stale payload risk | High | Payload age and duplicate guards must block automation. |
| DOM fragility risk | High | Broker UI selectors can change without warning. |
| Account/security risk | High | Ture must not store credentials or bypass 2FA. |
| Privacy/credential risk | High | Browser observation must avoid secrets and account data leakage. |
| Regulatory/compliance risk | Medium-high | Broker terms and local regulations need review. |
| UX trust risk | Medium-high | User must see and understand every prepared action. |
| Auditability risk | Medium | Local proof is enough for POC; server audit needs separate approval. |
| Recovery/cancel risk | High | Kill switch and no-retry behavior are required. |

## Open Questions

- Is the Avanza web UI stable enough for automation?
- Can order fields be safely identified without brittle selectors?
- What is the safest way to keep final click human-only?
- How should Ture handle partial fills, rejections, and cancelled orders?
- How should sell/exit capture work?
- What broker terms/rules apply to local browser assistance?
- Should the first POC use a sandbox page instead of Avanza?
- Should a browser extension be preferred over remote browser control?
- How should screenshots or DOM observations avoid exposing account data?
- What confirmation evidence is acceptable before server persistence exists?

## Phased Roadmap

1. Action 992 - Add Browser Automation Safety Boundary Spec.
2. Action 993 - Add Sandbox Broker Page for Semi-Auto Agent POC.
3. Action 994 - Add Local Browser Agent Adapter Against Sandbox Page.
4. Action 995 - Add Human-Final-Confirmation Guard Tests.
5. Action 996 - Add Sandbox Browser Agent Fill-Only Playwright POC.
6. Action 997 - Add Sandbox Agent Fill-Only Operator Dry-Run Checklist.
7. Action 998 - Operator Dry-Run of Sandbox Agent Flow.
8. Later only: real Avanza/manual-browser feasibility gate.

## Progress Update

- Ture production/data-health: 92-95%.
- Market-window live dry-run: 70-75%, still waiting for open-session
  observation.
- Semi-auto agent foundation: 91-94%.
- Semi-auto Avanza/browser-agent readiness: 78-83%.
- Full-auto readiness: 10-15%, intentionally deferred.
- Total Ture toward semi-auto MVP: 90-93%.

## Not Performed

- No browser automation.
- No Playwright/Puppeteer browser control.
- No Avanza access.
- No Avanza integration.
- No broker behavior.
- No automatic submit.
- No credential handling.
- No 2FA bypass.
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

## Action 1000 Follow-Up

Follow-up status: Action 1000 created
`docs/semi-auto-agent-sandbox-phase-final-qa-and-roadmap.md` with result
status `sandbox_phase_complete_with_warnings`.

Recommended next action: Action 1001 - Run Production Market-Window Dry Run
During Open US Session.

Follow-up status: Action 1001 added sandbox selector-stability QA. The real
Avanza/browser automation feasibility gate remains planning-only and no real
Avanza automation was added. Result status:
`sandbox_browser_agent_selector_stability_qa_added`.

Recommended next action: Action 1002 - Run Production Market-Window Dry Run
During Open US Session.
