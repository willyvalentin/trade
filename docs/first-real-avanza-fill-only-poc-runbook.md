# First Real Avanza Fill-Only POC Runbook

## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- The runbook remains the manual procedure; this action records that actual
  operator setup evidence is still missing.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- The runbook now has an operator setup checklist covering manual login,
  account/instrument verification, hard stops, locked values, and evidence
  setup.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Action 1030 Gated Adapter Skeleton Update

- Created `docs/gated-real-avanza-fill-only-adapter-skeleton.md`.
- Result status: `gated_real_avanza_fill_only_adapter_skeleton_added`.
- The runbook now points to a disabled-by-default skeleton that can only report
  `disabled`, `blocked`, `ready_for_manual_run_setup`, or `failed_safety`.
- The skeleton does not perform the run and does not enable Avanza access,
  browser automation, DOM query, field fill, review click, final confirmation,
  submit, or order placement.
- Recommended next action: Action 1031 - Add Gated Adapter Operator Setup
  Checklist.

## Action 1029 Real-Run Readiness Gate Update

- Created `docs/first-real-avanza-fill-only-poc-real-run-readiness-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_real_run_readiness_gate_added`.
- Readiness decision:
  `ready_for_first_fill_only_poc_implementation_gate`.
- The runbook prerequisites are satisfied for a future gated implementation
  skeleton, but no run or automation is performed by this action.
- Recommended next action: Action 1030 - Add Gated Real Avanza Fill-Only
  Adapter Skeleton.

## Action 1028 Manual Approval Capture Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-capture.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_capture_added`.
- Approval decision:
  `approved_for_first_fill_only_poc`.
- The runbook remains the operator procedure for a future separately gated run;
  this action does not perform that run.
- Recommended next action: Action 1029 - Add First Fill-Only POC Real-Run
  Readiness Gate.

## Action 1027 Manual Approval Message Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-message.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_message_added`.
- Current manual approval state remains `not_approved_yet` because the exact
  approval phrase has not been supplied.
- The latest operator message, `Klart.`, is not the exact approval phrase and
  does not approve a real run.
- Recommended next action: Action 1028 - Capture First Fill-Only POC Manual
  Approval.

## Purpose

Action 1026 adds the operator runbook for the first future real Avanza
fill-only POC.

This is not the real run. This is not implementation. This is not order
execution. It does not access Avanza, launch or control a browser, query the
DOM, fill fields, click buttons, open `Granska köp`, click `Bekräfta köp`,
click `Bekräfta sälj`, submit an order, call providers/routes/scans, call
Supabase, mutate trades/stats/PnL, or change `.env.local`.

Final confirmation remains forbidden.

## Required Approval Before Use

This runbook cannot be used for a real POC until explicit operator approval
text is captured and checked against the approval contract.

The approval must match the locked scope:

- Buy-only.
- Avancerad/Limit.
- Amount-based.
- Cap less than or equal to 1,000 SEK.
- User present.
- User manually logs in.
- User manually opens Avanza.
- User manually opens the correct instrument/order form unless a search stage
  is later separately approved.
- Stop before `Granska köp`.
- No review modal.
- No final confirmation.
- No order placement.

## Roles

Operator/user:

- Logs in manually.
- Opens Avanza manually.
- Opens the correct instrument/order form manually.
- Verifies account.
- Verifies instrument.
- Stays present for the entire run.
- Can kill, close, or cancel the browser/session at any time.

Ture/future agent:

- May only perform an approved fill-only action in a future separately approved
  run action.
- Must not click review.
- Must not click confirm.
- Must not submit.
- Must stop before `Granska köp`.

Codex:

- Does not access Avanza.
- Does not run browser automation against Avanza.
- Does not fill fields.
- Does not click.
- Documents implementation and safety artifacts only.

## Pre-Run Checklist

- Explicit approval text is present.
- Approval contract passes.
- Implementation stub returns safe readiness.
- Dry-run harness passes.
- Fill-only guard passes.
- Selector policy passes.
- Cap is less than or equal to 1,000 SEK.
- Correct account is preselected.
- Correct instrument page/order form is open.
- Buy side is visible.
- Avancerad/Limit is selected.
- Total amount selector is available:
  `output[data-e2e="expandOrderAmount"]`.
- Final confirm forbidden selector is present in the contract:
  `button[data-e2e="confirmOrderButton"]`.
- Browser/session is stable.
- Screenshots/evidence plan is ready.
- Kill switch/cancel plan is ready.

## Locked POC Scope

- Buy only.
- Avancerad/Limit only.
- Amount-based only.
- No quantity mode unless separately approved.
- No search stage unless separately approved.
- No sell.
- No Stop Loss.
- No Glidande.
- No review modal.
- No final submit.

## Intended Future Fill-Only Sequence

This sequence is future and conditional. It is not performed by this action.

1. Operator manually logs in to Avanza.
2. Operator manually opens the correct instrument/order form.
3. Future agent verifies the instrument selector.
4. Future agent verifies account read-only.
5. Future agent verifies buy side.
6. Future agent verifies Avancerad/Limit.
7. Future agent fills `Belopp i SEK` under cap.
8. Future agent fills `Kurs i USD`.
9. Future agent reads total amount.
10. Future agent verifies total is less than or equal to cap.
11. Future agent stops before `Granska köp`.
12. Operator confirms no review click happened.
13. Operator closes/cancels manually if needed.

## Hard Stops

Abort immediately if any of these occur:

- `Granska köp` would be clicked.
- `Granska sälj` appears.
- Confirmation modal opens.
- `Bekräfta köp` appears.
- `Bekräfta sälj` appears.
- Final selector is targeted:
  `button[data-e2e="confirmOrderButton"]`.
- Account mismatch.
- Instrument mismatch.
- Side is not buy.
- Order type is not Limit.
- Total cannot be parsed.
- Total exceeds cap.
- Validation errors appear.
- UI changed materially.
- User/operator is not present.
- Any uncertainty exists.

## Evidence Capture Checklist

- Before screenshot.
- After-fill screenshot.
- Approval decision output.
- Implementation stub decision output.
- Dry-run harness decision output.
- Guard decision output.
- Selector policy output.
- Cap decision output.
- Visible account verification.
- Visible instrument verification.
- Visible buy side.
- Visible Avancerad/Limit.
- Visible amount.
- Visible price.
- Visible total.
- No review click statement.
- No modal opened statement.
- No final click statement.
- No order placed statement.

## Pass/Fail Criteria

Pass only if all of these are true:

- Approved scope matched.
- Amount and price were filled as intended.
- Total was parsed and less than or equal to cap.
- No review click occurred.
- No modal opened.
- No final confirm occurred.
- No order was placed.
- Evidence was captured.

Fail or safety fail if any of these are true:

- Any forbidden click occurs.
- Modal opens unexpectedly.
- Total exceeds cap.
- Final selector appears as target.
- Account, instrument, side, or order type mismatches.
- Operator intervenes due uncertainty.

## Abort/Kill Switch

- Operator may close the tab, window, or browser.
- Operator may cancel manually.
- Operator may stop the run immediately.
- No automated recovery is allowed.
- If any uncertainty exists, abort and document the reason.

## Post-Run Documentation Template

- Date/time:
- Operator:
- Instrument:
- Account verified: yes/no
- Amount:
- Price:
- Total:
- Cap:
- Guard status:
- Selector status:
- Approval status:
- Result: passed / passed_with_warnings / blocked / failed_safety
- No review click: yes/no
- No modal: yes/no
- No final click: yes/no
- No order placed: yes/no
- Notes:

## Result Status

`first_real_avanza_fill_only_poc_runbook_added`

## Recommended Next Action

Action 1027 - Add First Fill-Only POC Manual Approval Message.

Reason: before any further implementation or real run, the operator approval
message should be captured exactly and checked against the approval contract.

## Validation Results

- Documentation/static review completed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`.
- Audit writer runtime path import search returned no app/components/hooks
  matches.
- Route/provider/scanner and service-role scans returned expected
  documentation/historical references only; no routes, providers, scans,
  Supabase calls, or service-role adapter calls were invoked, and no secrets
  were printed.
- Runbook-specific executable safety scan returned documentation-only boundary
  references and no executable Avanza, browser, broker, automatic-submit,
  fetch, Supabase, environment, service-role, provider, route, scan, audit
  writer, click, locator, goto, or fill code.
- Automatic-mode safety scan returned expected human-confirmation and
  forbidden-action policy references only.
- Referenced-path, result-status, next-action, `git diff --check`,
  touched-file trailing whitespace, zero-byte docs, and `.env.local` diff
  checks passed.

## Not Performed

- No runtime code.
- No browser automation.
- No Avanza access from code.
- No Avanza integration.
- No DOM query.
- No field filling.
- No click.
- No submit.
- No `Granska köp`.
- No `Bekräfta köp`.
- No `Bekräfta sälj`.
- No order placement.
- No credential handling.
- No session-token capture.
- No 2FA bypass.
- No provider call.
- No scan route invocation.
- No DB write.
- No Supabase call.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No audit writer UI/browser/client invocation.
- No trade/stats/PnL mutation.
