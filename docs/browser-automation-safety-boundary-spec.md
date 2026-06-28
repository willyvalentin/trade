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
