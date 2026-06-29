# First Real Avanza Fill-Only POC Approval Checklist

## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Approval checklist remains separate from missing browser/Avanza setup
  evidence.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Approval checklist remains separate from browser/Avanza manual setup evidence.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Action 1030 Gated Adapter Skeleton Update

- Created `docs/gated-real-avanza-fill-only-adapter-skeleton.md`.
- Result status: `gated_real_avanza_fill_only_adapter_skeleton_added`.
- The checklist now feeds a disabled-by-default skeleton setup decision only.
- Required operator setup and evidence-plan snapshots remain blockers before
  `ready_for_manual_run_setup`.
- Recommended next action: Action 1031 - Add Gated Adapter Operator Setup
  Checklist.

## Action 1029 Real-Run Readiness Gate Update

- Created `docs/first-real-avanza-fill-only-poc-real-run-readiness-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_real_run_readiness_gate_added`.
- Readiness decision:
  `ready_for_first_fill_only_poc_implementation_gate`.
- Approval checklist passed into readiness, but any future implementation must
  remain disabled by default and stop before `Granska köp`.
- Recommended next action: Action 1030 - Add Gated Real Avanza Fill-Only
  Adapter Skeleton.

## Action 1028 Manual Approval Capture Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-capture.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_capture_added`.
- Approval decision:
  `approved_for_first_fill_only_poc`.
- All required manual approval fields passed, including cap 1,000 SEK or lower,
  stop before `Granska köp`, no final confirmation, and no order placement.
- Recommended next action: Action 1029 - Add First Fill-Only POC Real-Run
  Readiness Gate.

## Action 1027 Manual Approval Message Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-message.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_message_added`.
- The checklist now points to the exact approval phrase template and still
  rejects vague approvals such as `go ahead`, `approved`, or `klart`.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1028 - Capture First Fill-Only POC Manual
  Approval.

## Action 1026 Runbook Update

- Created `docs/first-real-avanza-fill-only-poc-runbook.md`.
- Result status: `first_real_avanza_fill_only_poc_runbook_added`.
- The runbook keeps the approval checklist as a required pre-run gate and adds
  operator roles, hard stops, evidence capture, pass/fail criteria, and abort
  procedure.
- No real run, Avanza access, browser automation, DOM query, field fill, click,
  submit, broker behavior, Supabase call, migration, typegen, generated type
  edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1027 - Add First Fill-Only POC Manual
  Approval Message.

## Action 1025 Implementation Stub Update

- Added the non-executing implementation stub:
  `lib/first-real-avanza-fill-only-poc-implementation-stub.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_implementation_stub_added`.
- The checklist boundaries remain unchanged: no `Granska köp`, no final
  confirm, no credentials/2FA handling, no unattended run, and no order
  placement.
- Recommended next action: Action 1026 - Add First Fill-Only POC Runbook.

## Action 1024 Approval Decision Update

- Created `docs/first-real-avanza-fill-only-poc-approval-decision.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_decision_created`.
- Decision state:
  `approved_for_first_fill_only_poc`.
- Approval remains conditional on explicit operator confirmation text before
  any implementation or real run.
- Recommended next action: Action 1025 - Add First Real Avanza Fill-Only POC
  Implementation Stub.

## Action 1023 Local Simulation Report Update

- Created
  `docs/first-real-avanza-fill-only-poc-local-simulation-report.md`.
- Result status:
  `first_real_avanza_fill_only_poc_local_simulation_report_added`.
- The checklist remains unapproved for a real dry-run; the local simulation
  report confirms the future evidence package and safety stops only.
- Real approval still requires a separate explicit operator decision after
  reviewing the local simulation report.
- Recommended next action: Action 1024 - Review Local Simulation And Decide
  First Real Fill-Only POC Approval.

## Action 1022 Approval State Contract Update

- Added the pure approval state contract:
  `lib/first-real-avanza-fill-only-poc-approval-state-contract.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_state_contract_added`.
- The checklist requirements are now encoded as a pure/static evaluator with
  default `not_approved_yet` and separate `approved_for_stub_only` versus
  `approved_for_first_fill_only_poc` states.
- Recommended next action: Action 1023 - Add First Fill-Only POC Local
  Simulation Report.

## Action 1021 Harness Stub Update

- Added the local/static first fill-only POC dry-run harness stub:
  `lib/first-real-avanza-fill-only-poc-dry-run-harness.ts`.
- Added harness tests:
  `tests/e2e/first-real-avanza-fill-only-poc-dry-run-harness.spec.ts`.
- Created implementation doc:
  `docs/first-real-avanza-fill-only-poc-dry-run-harness-stub.md`.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_harness_stub_added`.
- The approval decision remains `not_approved_yet` for any real dry-run; the
  harness can only approve a local/static simulation as `approved_for_stub_only`.
- Recommended next action: Action 1022 - Add First Fill-Only POC Approval
  State Contract.

## Purpose

Action 1020 defines the final approval checklist before any first real Avanza
fill-only POC dry-run can be performed.

This is not implementation. This is not automatic execution. This checklist
does not authorize browser automation, Avanza access from code, DOM querying,
field filling, clicking, review-stage behavior, final confirmation, or order
placement.

This checklist must be explicitly approved in a separate future message before
any real Avanza fill-only dry-run can occur.

## Approval Status

Result status:

`first_real_avanza_fill_only_poc_approval_checklist_created`

Default approval decision:

`not_approved_yet`

## Required Human Approval

A future dry-run requires a separate explicit approval message from the
operator.

That approval must include:

- Date/time window.
- Max cap.
- Instrument or `operator-selected instrument`.
- Sizing mode.
- Stop point.
- Acknowledgement that no `Granska köp` click is allowed in the first POC.
- Acknowledgement that no `Bekräfta köp` or `Bekräfta sälj` click is ever
  allowed.

## Scope Lock

All items must be true before a future first fill-only POC dry-run:

- Scope is buy-only.
- Order type is Avancerad / Limit only.
- Amount-based sizing is used by default.
- Max cap is 1,000 SEK or lower.
- User is logged in manually.
- User opens Avanza manually.
- User opens the correct instrument/order form manually unless search-stage is
  separately approved.
- Agent/Ture does not handle login.
- Agent/Ture does not handle 2FA.
- Agent/Ture does not access credentials or session tokens.

## Required Guard Pass

All guard checks must pass:

- Mode is semi-auto/human-confirmed.
- Automatic submit is false.
- Payload/recommendation is fresh if linked to a Ture recommendation.
- Side is buy.
- Order type is Limit/Avancerad.
- Account is human-verified.
- Instrument is human-verified.
- Amount cap is calculable.
- Total amount selector exists.
- Total amount parses as SEK.
- Total amount is less than or equal to cap.
- Generated selector strategy is rejected.
- Final selectors are forbidden.
- Review button is blocked.
- No validation errors are visible.

## Required Selector Readiness

The selector contract must contain and classify these readiness selectors:

- `[data-e2e="orderMarketInfoPanel"]`
- `button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]`
- `input[type="radio"][value="Limit"]`
- `input[data-e2e="inputAmount"]`
- `input[data-e2e="inputPrice"]`
- `output[data-e2e="expandOrderAmount"]`
- Account selected/read-only selector metadata.

The forbidden final selector must remain present in the contract:

- `button[data-e2e="confirmOrderButton"]`

The review buy selector must remain blocked for the first POC:

- `button[data-e2e="orderButton"][data-mint-button-theme="buy"]`

## Explicitly Forbidden During First POC

- No `Granska köp` click.
- No `Granska sälj` click.
- No `Bekräfta köp`.
- No `Bekräfta sälj`.
- No order submit.
- No sell mode.
- No side switch click.
- No account selector change.
- No `Välj alla på kontot`.
- No steppers.
- No Stop Loss.
- No Glidande.
- No review modal.
- No unattended run.
- No credential/session capture.
- No Supabase, audit, provider, route, or scan writes/calls.

## Required Operator Setup

- User/operator is present.
- Browser is ready.
- Avanza is logged in manually.
- Correct account is preselected manually.
- Correct instrument/order page is open manually.
- DevTools use is optional.
- Screen recording/screenshot plan is defined.
- Sensitive values are redacted where possible.
- Kill switch/cancel plan is understood.
- Browser can be closed immediately if anything unexpected happens.

## Evidence Package Required After Future Dry-Run

- Before screenshot.
- After-fill screenshot.
- Guard decision output.
- Cap decision output.
- Selector policy output.
- Visible amount.
- Visible price.
- Visible total.
- Visible buy side.
- Visible Avancerad/Limit.
- No review click statement.
- No modal opened statement.
- No final click statement.
- No order placed statement.
- Warnings/validation notes.

## Block Conditions

Any of these blocks the future dry-run:

- Approval missing.
- Cap missing or above 1,000 SEK.
- Instrument/account not verified.
- Selector readiness missing.
- Total amount cannot be parsed.
- Total above cap.
- Order type not Limit.
- Side not buy.
- Review button clicked or requested.
- Final selector targeted.
- Any validation error.
- UI changed materially.
- User not present.
- Any uncertainty about order state.

## Approval Decision Statuses

- `not_approved_yet`
- `approved_for_first_fill_only_poc`
- `deferred_pending_operator_setup`
- `blocked_by_safety_condition`
- `cancelled_by_operator`

## Recommended Next Action

Action 1021 - Add First Fill-Only POC Dry-Run Harness Stub.

Reason: after the checklist, the next safe implementation step is a local/stub
harness that can exercise guard and selector decisions without Avanza access or
DOM automation. It should not perform the real dry-run yet.

## Safety Statement

This checklist does not authorize real automation by itself. Explicit user
approval is required later. Final confirm is permanently forbidden for
Ture/agent. The first POC stops before `Granska köp`.

## Validation Results

- Documentation/static review completed.
- Focused docs/path/status checks passed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`.
- Audit writer runtime path import search returned no app/components/hooks
  matches.
- Route invocation, UI/app-shell audit writer import, market-loop/scanner,
  `NEXT_PUBLIC_*SERVICE*`, service-role leakage,
  first-fill-only-poc-approval-checklist executable safety, automatic-mode,
  dead-doc/path, status string, and next-action scans passed or returned
  expected docs-only, test-only, existing app, selector-literal, or policy
  references without invoking runtime behavior or printing secrets.
- `git diff --check` passed.
- Touched-file trailing whitespace scan returned no matches.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.

## Not Performed

- No runtime code change.
- No browser automation.
- No Avanza access from code.
- No Avanza integration.
- No DOM querying.
- No field filling.
- No clicking.
- No submit.
- No `Granska köp` click.
- No `Bekräfta köp`.
- No `Bekräfta sälj`.
- No order placement.
- No credential handling.
- No session-token capture.
- No 2FA bypass.
- No provider call.
- No scan route invocation.
- No DB write.
- No manual Supabase call.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No service-role value printed.
- No audit writer UI/browser/client invocation.
- No trade/stats/PnL mutation.
