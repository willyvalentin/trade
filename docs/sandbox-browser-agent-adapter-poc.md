# Sandbox Browser Agent Adapter POC

## Purpose

Action 994 adds a local sandbox-only browser-agent preparation adapter for the
fake `/sandbox-broker` page.

Result status: `sandbox_browser_agent_adapter_poc_added`

Recommended next action: Action 995 - Add Human-Final-Confirmation Guard Tests.

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

This is a local preparation POC only. It does not open a browser, navigate to
Avanza, connect to a broker, submit an order, call routes/providers/scans,
write Supabase, invoke the audit writer, mutate trades/stats/PnL, run
migrations, generate types, edit generated types, or change `.env.local`.

## Adapter Source

- Adapter: `lib/sandbox-browser-agent-adapter.ts`
- Focused tests: `tests/e2e/sandbox-browser-agent-adapter.spec.ts`
- Sandbox route target: `/sandbox-broker`
- Related sandbox page: `app/sandbox-broker/page.tsx`
- Related sandbox component:
  `components/execution/SandboxBrokerOrderForm.tsx`

The adapter consumes already validated semi-auto payload shapes through the
existing payload contract and returns a typed fill-preparation result. It does
not import Playwright, Puppeteer, browser drivers, Supabase clients, route
callers, providers, scanners, service-role helpers, or audit-writer modules.

## Supported Target

The only supported target is `/sandbox-broker`.

The adapter also accepts local URLs whose path is `/sandbox-broker`, including
localhost-style hosts. External hosts, real/broker-like hosts, and any other
path are blocked before payload preparation.

## Adapter Behavior

For a fresh valid semi-auto payload, the adapter returns:

- `status: "ready"`;
- prepared fields for ticker, action, quantity, order type, entry/limit price,
  stop, target, planned risk, and payload id;
- `human_final_confirmation_required: true`;
- `automatic_submit_allowed: false`;
- `final_submit_attempted: false`;
- `no_avanza_order: true`;
- `no_broker_action: true`;
- `sandbox_only: true`.

For stale, expired, invalid, automatic-submit, non-semi-auto, or non-sandbox
targets, the adapter returns `status: "blocked"` with no prepared fields.

## Sandbox Playwright Behavior

No Playwright browser fill runtime was implemented in Action 994. The
Playwright coverage is test-only and exercises the adapter as a pure local
preparation function plus static safety scans.

Future browser-control work must be separately approved and must still stop
before any final `KÖP`/`SÄLJ` style action.

## Safety Invariants

- Sandbox target only.
- No Avanza URL constant.
- No Avanza access.
- No broker submit.
- No final click.
- No automatic submit.
- No browser driver import.
- No route invocation.
- No provider invocation.
- No scan invocation.
- No Supabase read or write.
- No audit writer invocation.
- No service-role or environment access.
- No credential handling.
- No 2FA bypass.
- No localStorage/sessionStorage persistence.
- No trade/stats/PnL mutation.

## Not Performed

- No browser automation runtime.
- No Avanza access.
- No broker behavior.
- No automatic submit.
- No real order submit path.
- No credential handling.
- No 2FA bypass.
- No route/provider/scan call.
- No live scan.
- No database write.
- No Supabase call.
- No service-role use.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No audit writer UI/client invocation.
- No real trade.
- No trade/stats/PnL mutation.

## Action 1000 Follow-Up

Follow-up status: Action 1000 created
`docs/semi-auto-agent-sandbox-phase-final-qa-and-roadmap.md` with result
status `sandbox_phase_complete_with_warnings`.

Recommended next action: Action 1001 - Run Production Market-Window Dry Run
During Open US Session.

Follow-up status: Action 1001 added
`docs/sandbox-browser-agent-selector-stability-qa.md` and
`tests/e2e/sandbox-browser-agent-selector-stability.spec.ts` with result
status `sandbox_browser_agent_selector_stability_qa_added`.

Recommended next action: Action 1002 - Run Production Market-Window Dry Run
During Open US Session.
