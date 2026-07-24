# Sandbox Broker Page For Semi-Auto Agent POC

## Purpose

Action 993 adds a controlled sandbox broker page for a future semi-auto browser
agent proof of concept.

Result status: `sandbox_broker_page_for_semi_auto_agent_poc_added`

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

This is fake, local, and sandbox-only. It is not Avanza, not a broker, not real
execution, not automatic execution, and not a real submit path. It does not
connect to Avanza, call a broker, submit externally, write Supabase, invoke the
audit writer, call providers/routes/scans, mutate trades/stats/PnL, run
migrations, generate types, edit generated types, or change `.env.local`.

## Page And Component Source

- Route path: `/sandbox-broker`
- Page source: `app/sandbox-broker/page.tsx`
- Component source: `components/execution/SandboxBrokerOrderForm.tsx`
- Focused tests: `tests/e2e/sandbox-broker-page.spec.ts`
- Static safety boundary tests:
  `tests/e2e/browser-automation-safety-boundary.spec.ts`

The page imports only the sandbox component. The component is a client
component because it uses local component state for the fake order fields.

## UI Behavior

The page is visibly labeled:

- `Sandbox broker`
- `Fake order form`
- `No real broker connection`
- `No Avanza order`
- `No order will be placed`

The fake order form renders local fields for:

- ticker
- side/action buy or sell
- quantity
- order type
- limit/entry price
- stop
- target
- planned risk
- payload id

The page renders a safety checklist:

- semi-auto only
- manual final confirmation required
- automatic submit allowed false
- automatic submit attempted false
- no Avanza order
- no broker submit
- local sandbox only

The fake final confirmation area shows a disabled, non-submitting
`KOP`/`SALJ`-style control using the visible labels `KÖP` and `SÄLJ`. The
control uses `type="button"` and is disabled. The page does not render a
server-submitting form and does not define form `action` behavior.

All field changes update local React state only. Query/pasted payload handling
is intentionally not implemented in this action, so there is no parsing path,
automatic action, persistence path, or route call.

## Safety Invariants

- No Avanza order.
- No broker submit.
- No external call.
- No fetch.
- No route invocation.
- No provider invocation.
- No scan invocation.
- No Supabase write.
- No audit writer invocation.
- No trade/stats/PnL mutation.
- No automatic submit.
- No automatic mode enablement.
- No real final click.
- No credential handling.
- No environment or service-role access.
- No localStorage/sessionStorage persistence.
- Local sandbox only.

## Browser-Agent Readiness

This page is the safe first target for future browser automation because it is
owned by Ture, local-only, and fake. A future separately approved local browser
agent can use it to prove field-fill behavior, safety checklist recognition,
pause-before-submit behavior, disabled final controls, and local result capture
patterns before any real Avanza/manual-browser exploration is considered.

What remains forbidden:

- real Avanza access;
- real broker interaction;
- final `KÖP`/`SÄLJ` click automation;
- automatic submit;
- unattended trading;
- credential storage;
- 2FA bypass;
- Supabase writes from browser/client paths;
- client audit writer invocation;
- provider/route/scan invocation;
- trade/stats/PnL mutation.

## Validation Plan

Action 993 validation covers:

- focused sandbox broker page tests;
- browser automation safety boundary tests;
- focused semi-auto E2E stack;
- related execution/handoff/settings non-live bundle;
- TypeScript and lint;
- runtime denial script availability check;
- static scans for audit writer, route/provider/scan, service-role,
  `NEXT_PUBLIC_*SERVICE*`, automatic-submit, browser/Avanza/broker behavior,
  docs/status consistency, path existence, whitespace, zero-byte docs, and
  `.env.local` changes.

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

Follow-up status: Action 1001 added stable `data-testid` selectors to
`components/execution/SandboxBrokerOrderForm.tsx`, created
`docs/sandbox-browser-agent-selector-stability-qa.md`, and added
`tests/e2e/sandbox-browser-agent-selector-stability.spec.ts` with result
status `sandbox_browser_agent_selector_stability_qa_added`.

Recommended next action: Action 1002 - Run Production Market-Window Dry Run
During Open US Session.
