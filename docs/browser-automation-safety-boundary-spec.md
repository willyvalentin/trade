## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Browser safety boundary remains unchanged: no browser automation, DOM query,
  fill, click, submit, credential/session capture, or 2FA bypass occurred.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Browser automation safety remains unchanged: no automation, DOM query, fill,
  click, submit, credential handling, or session capture was added.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Action 1030 Gated Adapter Skeleton Update

- Created `docs/gated-real-avanza-fill-only-adapter-skeleton.md`.
- Result status: `gated_real_avanza_fill_only_adapter_skeleton_added`.
- Browser automation safety boundary remains intact: the skeleton imports no
  browser automation libraries, performs no DOM query, and exposes no launch,
  click, fill, or submit capability.
- Recommended next action: Action 1031 - Add Gated Adapter Operator Setup
  Checklist.

## Action 1029 Real-Run Readiness Gate Update

- Created `docs/first-real-avanza-fill-only-poc-real-run-readiness-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_real_run_readiness_gate_added`.
- Readiness decision:
  `ready_for_first_fill_only_poc_implementation_gate`.
- The next step may add a gated adapter skeleton, but browser automation safety
  still requires disabled-by-default behavior and no review/final click.
- Recommended next action: Action 1030 - Add Gated Real Avanza Fill-Only
  Adapter Skeleton.

## Action 1028 Manual Approval Capture Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-capture.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_capture_added`.
- Approval decision:
  `approved_for_first_fill_only_poc`.
- Browser automation safety boundary remains unchanged: approval capture does
  not add automation, Avanza access, field fill, review click, final click, or
  order placement.
- Recommended next action: Action 1029 - Add First Fill-Only POC Real-Run
  Readiness Gate.

## Action 1027 Manual Approval Message Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-message.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_message_added`.
- The browser automation safety boundary remains unchanged: no real Avanza
  automation, no review click, no final click, and no unattended mode.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1028 - Capture First Fill-Only POC Manual
  Approval.

## Action 1026 Runbook Update

- Created `docs/first-real-avanza-fill-only-poc-runbook.md`.
- Result status: `first_real_avanza_fill_only_poc_runbook_added`.
- The runbook preserves the browser automation safety boundary: no Avanza
  access from code, no review click, no final click, and no unattended mode.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1027 - Add First Fill-Only POC Manual
  Approval Message.

## Action 1025 Implementation Stub Update

- Action 1025 added the non-executing implementation stub.
- Result status:
  `first_real_avanza_fill_only_poc_implementation_stub_added`.
- Stub capability flags are all false: Avanza access, browser launch, DOM
  query, field fill, review click, final confirm, and order submit.
- Recommended next action: Action 1026 - Add First Fill-Only POC Runbook.

## Action 1024 Approval Decision Update

- Action 1024 created
  `docs/first-real-avanza-fill-only-poc-approval-decision.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_decision_created`.
- The decision remains documentation/decision only and adds no browser
  automation, DOM query, field fill, click, submit, or Avanza access.
- Recommended next action: Action 1025 - Add First Real Avanza Fill-Only POC
  Implementation Stub.

## Action 1023 Local Simulation Report Update

- Action 1023 created
  `docs/first-real-avanza-fill-only-poc-local-simulation-report.md`.
- Result status:
  `first_real_avanza_fill_only_poc_local_simulation_report_added`.
- The report explicitly records all real-action flags as false:
  real Avanza access, browser automation, DOM querying, field filling,
  clicking, submit, review click, and final confirm.
- Browser automation remains unapproved for real Avanza.
- Recommended next action: Action 1024 - Review Local Simulation And Decide
  First Real Fill-Only POC Approval.

## Action 1022 Approval State Contract Update

- Action 1022 added
  `lib/first-real-avanza-fill-only-poc-approval-state-contract.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_state_contract_added`.
- The contract is pure/static and adds no browser automation, DOM query, Avanza
  access, field fill, click, submit, or order execution.
- Recommended next action: Action 1023 - Add First Fill-Only POC Local
  Simulation Report.

## Action 1021 Harness Stub Update

- Action 1021 added
  `lib/first-real-avanza-fill-only-poc-dry-run-harness.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_harness_stub_added`.
- The harness is pure/local and explicitly returns all real-action flags false:
  no real Avanza access, browser automation, DOM querying, field filling,
  clicking, submit, review click, or final confirm.
- Recommended next action: Action 1022 - Add First Fill-Only POC Approval
  State Contract.

## Action 1020 Approval Checklist Update

- Action 1020 created
  `docs/first-real-avanza-fill-only-poc-approval-checklist.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_checklist_created`.
- The checklist does not authorize browser automation; it defines approval and
  evidence requirements before any future real fill-only POC can be considered.
- Final confirmation remains permanently forbidden.
- Recommended next action: Action 1021 - Add First Fill-Only POC Dry-Run
  Harness Stub.

## Action 1019 Dry-Run Plan Update

- Action 1019 created the first real Avanza fill-only POC dry-run plan.
- This is planning only and adds no browser automation, DOM access, Avanza
  access, field filling, clicking, submit path, or broker behavior.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_plan_created`.
- Recommended next action: Action 1020 - Add First Fill-Only POC Approval
  Checklist.

## Action 1018 Selector Contract Integration Update

- Action 1018 integrated selector policy into the fill-only guard as pure static
  metadata.
- No browser automation, DOM access, Avanza access, field filling, clicking, or
  submit path was added.
- Result status:
  `real_avanza_fill_only_guard_selector_contract_integration_added`.
- Recommended next action: Action 1019 - Add First Fill-Only POC Dry-Run Plan.

## Action 1017 Selector Mapping Contract Update

- Action 1017 created `lib/real-avanza-selector-mapping-contract.ts` as a
  pure/static selector contract.
- The contract contains no browser automation and performs no Avanza access.
- Final confirmation selector `button[data-e2e="confirmOrderButton"]` remains
  a hard-stop forbidden selector.
- Recommended next action: Action 1018 - Add Selector Contract To Fill-Only
  Guard.

## Action 1016 DOM/Selector Evidence Update

- Action 1016 documented operator-provided real Avanza DOM/selector evidence.
- This action remains documentation/evidence capture only and does not add or
  approve real Avanza browser automation.
- Final confirmation selector `button[data-e2e="confirmOrderButton"]` is a
  hard-stop forbidden selector and must never be clicked by Ture/agent.
- Any future fill-only POC remains separately approved and must stop before
  `Granska köp`.
- Recommended next action: Action 1017 - Create Real Avanza Selector Mapping
  Contract.

# Browser Automation Safety Boundary Spec

## Purpose

Action 992 defines the safety boundary for future semi-auto browser automation.

Result status: `browser_automation_safety_boundary_spec_created`

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

This is documentation and static guard coverage only. It does not implement
browser automation, Avanza integration, broker behavior, automatic execution,
real order submission, credential handling, 2FA bypass, Supabase persistence,
audit writer client calls, provider calls, scan invocation, database writes,
migrations, type generation, generated type edits, or `.env.local` changes.

The boundary exists so future semi-auto agent work can move toward a sandbox
browser POC without accidentally widening into real broker automation or
automatic trading.

## Scope

This safety boundary applies to:

- future browser-agent adapter work;
- future sandbox broker POC work;
- any future real Avanza/manual-browser exploration;
- buy handoffs from recommendations;
- sell/exit handoffs from live positions;
- local result capture after a human action;
- static tests and scans that guard the future browser-agent namespace.

The boundary does not approve real browser automation, real Avanza access, live
broker interaction, production rollout, automatic submit, or any unattended
order behavior.

## Allowed Future Behavior

Only after a separate explicit future action, future sandbox/browser-agent code
may be allowed to:

- consume a validated semi-auto payload;
- render a safety checklist;
- open or focus a controlled sandbox page;
- fill sandbox order fields;
- prepare browser state up to but not including final submit;
- pause for human final confirmation;
- expose a clear cancel/kill control;
- capture a local-only result after human action;
- run only when the payload is fresh and `mode` is semi-auto;
- run only when human final confirmation remains required;
- run only when automatic submit remains disabled.

The first implementation target must be sandbox-only. Any real Avanza/manual
browser exploration requires the later feasibility gate in this document.

## Forbidden Behavior

The following are hard forbiddens:

- final `KOP` or `SALJ` click automation;
- final `KÖP` or `SÄLJ` click automation;
- automatic submit;
- unattended trading;
- direct real broker order placement;
- credential storage;
- 2FA bypass;
- account-setting modification;
- navigation outside the intended order flow;
- running on stale, expired, invalid, or blocked payloads;
- Supabase write from browser-agent or client code;
- client/UI audit writer invocation;
- provider, route, or scan invocation;
- market-loop/scanner/automation invocation;
- trade/stats/PnL mutation;
- service-role use in client/UI code;
- environment secret exposure;
- final sell/exit confirmation by an agent;
- hiding final broker risk/confirmation information from the user.

## Required Invariants

Future sandbox/browser-agent work must preserve these invariants:

- `mode` must be semi-auto.
- Human final confirmation required must be `true`.
- Automatic submit allowed must be `false`.
- Automatic submit attempted must be `false`.
- Payload must be fresh.
- Ticker, action, and quantity must be validated.
- Stop, target, and risk context must be visible where applicable.
- Duplicate handoff guard must be present.
- User explicit start action must be required.
- Visible pause before final broker action must be present.
- Kill switch/cancel must be available.
- Local-only result capture must come first.
- No credential or service-role value may be read, printed, or persisted.
- No browser-agent/client path may write to Supabase.
- No browser-agent/client path may call the audit writer.

## Proposed Future Namespace/Path Model

Recommended future paths:

- `lib/browser-agent-safety-boundary.ts`
- `lib/sandbox-browser-agent-adapter.ts`
- `app/sandbox-broker/page.tsx`
- `components/execution/SandboxBrokerOrderForm.tsx`
- `components/execution/SandboxBrokerAgentPanel.tsx`
- `tests/e2e/*browser-agent*`

The real Avanza adapter namespace must remain absent until a future explicit
action approves it. Examples that should remain absent for now:

- `lib/avanza-browser-agent-adapter.ts`
- `lib/real-avanza-browser-agent-adapter.ts`
- `components/execution/AvanzaBrowserAgentPanel.tsx`

Future sandbox files must stay separate from existing server-only audit writer
paths, provider/scan paths, and production runtime execution mutation paths.

## Static Guard Model

Static tests should enforce these rules:

- no imports from `@playwright/test`, `playwright`, `puppeteer`, or browser
  automation libraries outside approved sandbox tests/adapters;
- no `avanza.se` URL constants outside docs/tests until explicitly approved;
- no final submit/click wording in executable code;
- no `KOP`, `SALJ`, `KÖP`, or `SÄLJ` submit automation selectors in executable
  code;
- no credential or environment secret access;
- no Supabase write methods;
- no service-role references;
- no audit writer client imports;
- no provider, route, or scan imports;
- no trade/stats/PnL mutation imports;
- no automatic submit true flags in executable semi-auto/browser-agent code;
- no browser-agent files that call app routes with `fetch`.

Action 992 adds `tests/e2e/browser-automation-safety-boundary.spec.ts` as a
static guard over the current semi-auto/future-agent namespace. It does not
launch a browser, call Avanza, call routes, call providers, invoke scans, read
credentials, or write data.

Action 993 extends that guard to include the sandbox broker route and order
form. The sandbox page is a fake local target only and remains separate from
real Avanza/manual-browser work.

Action 994 extends the sandbox/browser-agent namespace with a pure preparation
adapter for `/sandbox-broker`. It validates target and payload readiness,
returns prepared fields for a local fake form, and still performs no browser
navigation, browser clicks, route calls, Supabase access, audit writer calls,
or broker/Avanza behavior.

## Sandbox-First Requirement

Before any real Avanza path is attempted, Ture must build and pass a sandbox
broker page/POC. The sandbox POC must prove:

- fill-only behavior;
- pause-before-submit behavior;
- no final submit;
- deterministic local result capture;
- kill switch/cancel control;
- local-only history;
- no credential handling;
- no provider/route/scan calls;
- no Supabase writes;
- no client audit writer invocation;
- no trade/stats/PnL mutation.

## Real Avanza Feasibility Gate

No real Avanza/manual-browser work may begin until all of the following are
true:

- market-window dry run is completed;
- Production data health is clean enough for trial work;
- sandbox POC passed;
- browser automation safety guards passed;
- explicit user approval exists for the next exact action;
- broker terms/risk review is clear enough to proceed;
- human final confirmation copy is verified;
- automatic submit remains disabled;
- full-auto remains out of scope.

Any real Avanza exploration must remain manually started, visible to the user,
and stopped before final broker confirmation.

## Full-Auto Boundary

Full-auto remains out of scope.

Automatic submit remains disabled. Any full-auto feasibility work requires a
separate roadmap, safety review, legal/broker/risk review, static tests,
runtime proof plan, rollback plan, and explicit user approval. No semi-auto
artifact, sandbox POC, or browser-agent guard may be interpreted as full-auto
approval.

## Risk Acceptance Matrix

| Behavior | Sandbox | Local manual POC | Production | Boundary |
| --- | --- | --- | --- | --- |
| Render safety checklist | Acceptable | Acceptable | Acceptable after approval | Must preserve human confirmation copy. |
| Fill sandbox order fields | Acceptable | Acceptable | Not production behavior | Sandbox only until later approval. |
| Pause before final submit | Required | Required | Required | Must be visible and testable. |
| Local-only result capture | Acceptable | Acceptable | Acceptable after approval | Must not imply broker confirmation by Ture. |
| Real Avanza page observation | Not needed | Requires later approval | Not acceptable yet | Needs feasibility gate. |
| Final broker click automation | Never acceptable | Never acceptable | Never acceptable | Hard forbidden. |
| Automatic submit | Never acceptable in this track | Never acceptable in this track | Never acceptable in this track | Full-auto requires separate track. |
| Credential storage | Never acceptable | Never acceptable | Never acceptable | Hard forbidden. |
| 2FA bypass | Never acceptable | Never acceptable | Never acceptable | Hard forbidden. |
| Supabase write from browser/client | Not acceptable | Not acceptable | Not acceptable | Server-only persistence only by separate approval. |
| Client audit writer invocation | Not acceptable | Not acceptable | Not acceptable | Hard forbidden. |
| Provider/route/scan invocation | Not acceptable | Not acceptable | Not acceptable | Outside browser-agent boundary. |
| Trade/stats/PnL mutation | Not acceptable | Not acceptable | Not acceptable | Outside browser-agent boundary. |

## Progress Update

- Ture production/data-health: 92-95%.
- Market-window live dry-run: 70-75%, blocked until Monday/open US session.
- Semi-auto agent foundation: 92-95%.
- Semi-auto Avanza/browser-agent readiness: 80-85%.
- Real browser automation readiness: 25-35%.
- Full-auto readiness: 10-15%, intentionally deferred.
- Total Ture toward semi-auto MVP: 90-93%.

## Not Performed

- No browser automation.
- No Playwright/Puppeteer browser control against Avanza.
- No Avanza access.
- No Avanza integration.
- No broker behavior.
- No automatic submit.
- No automatic mode enablement.
- No real order submit path.
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

Follow-up status: Action 1001 added sandbox selector-stability QA while
preserving the browser automation safety boundary. Result status:
`sandbox_browser_agent_selector_stability_qa_added`.

Recommended next action: Action 1002 - Run Production Market-Window Dry Run
During Open US Session.

## Action 1007 Real Avanza UI Training Safety Protocol

- Result status: `real_avanza_ui_training_protocol_created`.
- Protocol artifact:
  `docs/real-avanza-ui-training-safety-protocol.md`.
- Boundary update: real Avanza UI training begins with human-led read-only
  reconnaissance only. No browser automation, field filling, credential
  storage, 2FA bypass, or final `KOP`/`SALJ` or `KÖP`/`SÄLJ` click is approved.
- Recommended next action: Action 1008 - Run Human-Led Real Avanza UI
  Reconnaissance.

## Action 1008 Human-Led Real Avanza UI Reconnaissance

- Result status: `real_avanza_ui_reconnaissance_blocked`.
- Result artifact: `docs/real-avanza-ui-reconnaissance-results.md`.
- Browser automation boundaries remain unchanged: no real Avanza automation,
  no field filling, no credential/2FA handling, no final `KOP`/`SALJ` or
  `KÖP`/`SÄLJ` click, and no broker action.
- Real UI selector/field mapping remains blocked pending human-provided
  reconnaissance evidence.
- Recommended next action: Action 1009 - Provide Human-Led Real Avanza UI
  Reconnaissance Evidence.

## Action 1009 Human-Led Real Avanza UI Reconnaissance Evidence

- Result status: `real_avanza_ui_reconnaissance_passed_with_warnings`.
- Result artifact: `docs/real-avanza-ui-reconnaissance-results.md`.
- Safety boundary update: the final hard stop for real Avanza remains before
  `Bekräfta köp` or `Bekräfta sälj` in the confirmation modal.
- Browser automation remains not approved; the next step is mapping spec only.
- Recommended next action: Action 1010 - Create Real Avanza UI Mapping Spec.

## Action 1010 Real Avanza UI Mapping Spec

- Result status: `real_avanza_ui_mapping_spec_created`.
- Mapping spec artifact: `docs/real-avanza-ui-mapping-spec.md`.
- Safety boundary remains unchanged: the agent must never click
  `Bekräfta köp`, `Bekräfta sälj`, or any final submit action.
- Recommended next action: Action 1011 - Define Real Avanza Fill-Only POC Gate
  And Max Amount Policy.

## Action 1011 Fill-Only POC Gate And Max Amount Policy

- Result status:
  `real_avanza_fill_only_poc_gate_and_max_amount_policy_created`.
- Policy artifact:
  `docs/real-avanza-fill-only-poc-gate-and-max-amount-policy.md`.
- Safety boundary update: a future fill-only POC must be separately approved,
  capped, human-supervised, and blocked before any final submit action.
- Recommended next action: Action 1012 - Add Max Amount And Final-Submit Guard
  Contract Tests.
## Action 1012 - Max Amount And Final-Submit Guard Contract Tests

- Added pure fill-only guard `lib/real-avanza-fill-only-guard.ts`.
- Added contract test
  `tests/e2e/real-avanza-fill-only-guard-contract.spec.ts`.
- Added proof doc `docs/real-avanza-fill-only-guard-contract-tests.md`.
- Result status:
  `real_avanza_fill_only_guard_contract_tests_added`.
- Browser automation remains blocked for real Avanza. The new guard only
  encodes static policy invariants and has no browser APIs, no Avanza runtime
  integration, no network calls, no Supabase calls, and no service-role/env
  access.
- Final submit remains forbidden and human-only.
- Recommended next action: Action 1013 - Add Real Avanza Fill-Only POC
  Readiness Review.

## Action 1013 - Real Avanza Fill-Only POC Readiness Review

- Created `docs/real-avanza-fill-only-poc-readiness-review.md`.
- Result status:
  `real_avanza_fill_only_poc_readiness_review_created`.
- Readiness decision:
  `real_avanza_fill_only_poc_deferred_pending_dom_mapping`.
- Browser automation safety remains intact: no real Avanza automation, no field
  filling, no final click, and no order placement were added.
- Recommended next action: Action 1014 - Prepare Real Avanza DOM/Selector
  Reconnaissance Plan.

## Action 1014 - Real Avanza DOM/Selector Reconnaissance Plan

- Created `docs/real-avanza-dom-selector-reconnaissance-plan.md`.
- Result status:
  `real_avanza_dom_selector_recon_plan_created`.
- Browser automation remains absent. The plan allows only human-led manual
  observation and forbids agent-controlled clicks, field filling, credentials,
  2FA handling, final clicks, and order placement.
- Recommended next action: Action 1015 - Run Human-Led Real Avanza
  DOM/Selector Reconnaissance.

## Action 1015 - Real Avanza DOM/Selector Reconnaissance Results

- Created `docs/real-avanza-dom-selector-reconnaissance-results.md`.
- Result status:
  `real_avanza_dom_selector_recon_blocked`.
- Browser automation safety boundary remains intact: no Avanza access,
  automation, field filling, click, final confirmation, or order placement was
  performed.
- Recommended next action: Action 1016 - Repeat Human-Led Real Avanza
  DOM/Selector Reconnaissance With Evidence.
