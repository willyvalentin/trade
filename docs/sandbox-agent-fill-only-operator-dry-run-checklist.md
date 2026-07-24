# Sandbox Agent Fill-Only Operator Dry-Run Checklist

## Purpose

Action 997 creates an operator dry-run checklist for the sandbox fill-only
agent POC.

Result status: `sandbox_agent_fill_only_operator_dry_run_checklist_created`

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

This checklist is for the controlled local sandbox only. It is not Avanza, not
real broker execution, not automatic trading, not production runtime browser
automation, and not approval for any final `KOP`/`SALJ` or `KÖP`/`SÄLJ`
action.

## Preconditions

Before starting the operator dry run, confirm:

- Local dev server is running.
- `/sandbox-broker` is reachable in the local app.
- The fill-only Playwright POC has passed.
- The human-final-confirmation guard tests have passed.
- The browser automation boundary tests have passed.
- No Production market-window dry-run is required for this sandbox check.

## Operator Setup Checklist

- Open `/sandbox-broker`.
- Confirm the page says sandbox, fake, or local-only.
- Confirm the page states there is no Avanza or broker connection.
- Confirm the page states no real order will be placed.
- Confirm the fake final `KOP`/`SALJ` or `KÖP`/`SÄLJ` control is disabled.
- Confirm the safety checklist is visible.

## Fill-Only Observation Checklist

During the dry run, verify:

- Ticker field can be filled.
- Side/action can be selected.
- Quantity can be filled.
- Order type can be selected.
- Entry/limit price can be filled.
- Stop can be filled.
- Target can be filled.
- Planned risk can be filled.
- Payload id can be filled.
- Local preview reflects entered fields.
- No external navigation occurs.
- No network or broker call appears.
- Final button remains disabled.

## Safety Copy Checklist

Visible copy should make these boundaries clear:

- Local sandbox only.
- No Avanza order.
- No broker submit.
- No automatic submit.
- Final confirmation remains manual.
- Fake order form.
- Not real execution.

## Pass/Warn/Block Criteria

Pass if:

- Sandbox page works.
- Fields fill correctly.
- Final button remains disabled.
- Safety copy is clear.
- No external calls occur.
- No errors appear.

Warn if:

- Copy is unclear.
- Layout is awkward.
- Field order is confusing.
- Operator needs better payload visibility.

Block if:

- Final button becomes enabled.
- Any external URL appears.
- Any real broker or Avanza copy implies real execution.
- Any Supabase, audit, or trade mutation appears.
- Any automatic submit behavior appears.

## Observation Log Template

Use this template for the manual dry-run observation:

- Date:
- Local time:
- Browser:
- Route opened:
- Test payload used:
- Fields filled:
- Final button state:
- Warnings/errors:
- Pass/warn/block result:
- Notes:
- Recommended follow-up:

## Not Performed

- No runtime code change.
- No production runtime browser automation.
- No Avanza integration.
- No real broker behavior.
- No automatic order submission.
- No automatic mode enablement.
- No final click behavior.
- No fake final button enablement.
- No real submit path.
- No Avanza access.
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
