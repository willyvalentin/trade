# Sandbox Browser Agent Fill-Only Playwright POC

## Purpose

Action 996 adds the first fill-only Playwright proof of concept against the
controlled local `/sandbox-broker` page.

Result status: `sandbox_browser_agent_fill_only_playwright_poc_added`

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

This is test-only browser automation. It is not Avanza automation, not a real
broker integration, not real execution, not automatic order submission, and not
a production runtime browser-agent path.

## Test Source

- Fill-only test:
  `tests/e2e/sandbox-browser-agent-fill-only-poc.spec.ts`
- Sandbox page: `app/sandbox-broker/page.tsx`
- Sandbox component: `components/execution/SandboxBrokerOrderForm.tsx`
- Sandbox adapter: `lib/sandbox-browser-agent-adapter.ts`
- Payload builder: `lib/semi-auto-agent-payload-builder.ts`

No component test-id changes were needed. The existing sandbox fields already
expose stable `data-sandbox-broker-field` attributes, and the fake final
control exposes `data-sandbox-broker-final-control="disabled"`.

## Fill-Only Behavior

The POC test:

- builds a valid semi-auto payload;
- asks the sandbox adapter for a `/sandbox-broker` fill plan;
- opens only the local `/sandbox-broker` page;
- fills ticker;
- fills side/action;
- fills quantity;
- fills order type;
- fills entry/limit price;
- fills stop;
- fills target;
- fills planned risk;
- fills payload id;
- verifies filled values are visible in the local preview;
- verifies the safety checklist remains visible;
- verifies the fake final `KÖP`/`SÄLJ` control remains disabled;
- verifies no final click happens;
- verifies no external navigation or `/api/` request happens.

## Safety Invariants

- No Avanza order.
- No broker submit.
- No automatic submit.
- No final `KÖP`/`SÄLJ` click.
- No credentials or environment values.
- No Supabase write.
- No audit writer invocation.
- No provider, route, or scan invocation.
- No trade/stats/PnL mutation.
- No external navigation.
- Browser control remains in test code only.

## Not Performed

- No production runtime browser automation.
- No Avanza access.
- No Avanza URL constant.
- No real broker integration.
- No automatic order submission.
- No automatic mode enablement.
- No final `KÖP`/`SÄLJ` click.
- No fake final button enablement.
- No real submit path.
- No credential storage.
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

Follow-up status: Action 1001 added
`docs/sandbox-browser-agent-selector-stability-qa.md` and
`tests/e2e/sandbox-browser-agent-selector-stability.spec.ts`, and updated the
fill-only POC to use stable sandbox `data-testid` selectors. Result status:
`sandbox_browser_agent_selector_stability_qa_added`.

Recommended next action: Action 1002 - Run Production Market-Window Dry Run
During Open US Session.
