# Sandbox Agent Fill-Only Result Capture Dry-Run

## Purpose

Action 999 adds a sandbox fill-only result capture dry run.

This dry run is sandbox/local-only. It is not Avanza, not real broker capture,
not real execution, not automatic trading, and not approval for any final
`KOP`/`SALJ` or `KÖP`/`SÄLJ` action.

## Preconditions

- Action 998 passed:
  `sandbox_agent_fill_only_operator_dry_run_passed`.
- Fill-only Playwright POC passed.
- Human-final-confirmation guard tests passed.
- Browser automation boundary tests passed.
- Sandbox page remains local/fake only.

## Dry-Run Behavior

The dry-run test
`tests/e2e/sandbox-agent-fill-only-result-capture-dry-run.spec.ts` verifies a
local-only chain:

- Builds a valid sandbox fill-only payload for `AAPL`, `buy`, quantity `8`,
  limit order, entry/limit `212.10`, stop `209.10`, target `218.10`.
- Prepares the sandbox fill plan through
  `prepareSandboxBrowserAgentFill(...)`.
- Confirms the prepared sandbox state remains no-final-submit,
  no-automatic-submit, no-Avanza-order, and no-broker-action.
- Builds local result capture states through
  `buildSemiAutoAgentResultCaptureStubResult(...)`.
- Saves one representative local event to the memory-backed local dev flow
  history store.
- Clears the memory-backed history store after the dry-run assertion.
- Performs no external request and no `/api/` request.
- Does not click the fake final `KOP`/`SALJ` or `KÖP`/`SÄLJ` control.

Observed request counts during the preceding Action 998 sandbox operator dry
run remain:

- External request count: `0`.
- `/api/` request count: `0`.

## Result Capture States

The dry run verifies every supported local result capture status:

- `user_confirmed`
- `user_cancelled`
- `broker_rejected`
- `unknown_needs_review`
- `failed`
- `timeout`
- `capture_not_available`

Each state remains a local stub result only. Even `user_confirmed` means the
local operator chose a local stub outcome; it does not mean Ture captured a
real Avanza confirmation or submitted a broker order.

## Local History Result

The memory-backed local dev flow event includes:

- payload id
- ticker
- action
- quantity
- selected local result
- terminal local outcome
- warnings
- blocked reasons
- source context
- `local_only: true`
- `dev_only: true`
- `manual_final_confirmation_required: true`
- `automatic_submit_allowed: false`
- `automatic_submit_attempted: false`
- `no_avanza_order_placed: true`
- `no_broker_submit_attempted: true`
- `not_sent_to_supabase: true`
- `not_audit_record: true`
- `trade_stats_pnl_mutated: false`

The dry run uses memory-backed local storage only. It proves append, read, and
clear behavior without touching Supabase, the audit writer, routes, providers,
scans, broker systems, or trade/PnL mutation paths.

## Safety Invariants

- No Avanza order.
- No broker submit.
- No final click.
- No automatic submit.
- No external calls.
- No Supabase write.
- No audit writer invocation.
- No provider/route/scan invocation.
- No trade/stats/PnL mutation.
- No credential, environment, or service-role value access.
- No migration, type generation, or generated type edit.
- No `.env.local` change.

## Result Status

Result status: `sandbox_agent_fill_only_result_capture_dry_run_passed`

## Recommended Next Action

Action 1000 - Semi-Auto Agent Sandbox Phase Final QA And Roadmap.

## Not Performed

- No production runtime browser automation.
- No Avanza integration.
- No real broker behavior.
- No real Avanza/broker confirmation capture.
- No automatic order submission.
- No automatic mode enablement.
- No final `KOP`/`SALJ` or `KÖP`/`SÄLJ` click.
- No fake final button enablement.
- No real submit path.
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
`tests/e2e/sandbox-browser-agent-selector-stability.spec.ts` with result
status `sandbox_browser_agent_selector_stability_qa_added`.

Recommended next action: Action 1002 - Run Production Market-Window Dry Run
During Open US Session.
