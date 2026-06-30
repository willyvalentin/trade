# First Real Avanza Fill-Only POC Dry-Run Plan

## Action 1038 Execution Dry-Run Adapter Skeleton Update

- Created
  `lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton.ts`.
- Created
  `tests/e2e/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton.spec.ts`.
- Created
  `docs/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton.md`.
- Result status:
  `first_real_avanza_fill_only_poc_execution_dry_run_adapter_skeleton_added`.
- Ready status is `ready_for_execution_dry_run_setup`; it is metadata-only and
  still does not access Avanza, fill, click, submit, or place orders.
- Recommended next action: Action 1039 - Add First Fill-Only POC Execution
  Dry-Run Simulation.

## Action 1037 Execution Dry-Run Adapter Gate Update

- Created
  `docs/first-real-avanza-fill-only-poc-execution-dry-run-adapter-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_execution_dry_run_adapter_gate_added`.
- Gate decision: `execution_dry_run_adapter_gate_ready`.
- This means ready to add a future disabled-by-default execution dry-run
  adapter skeleton, not ready to run it against Avanza.
- Recommended next action: Action 1038 - Add First Fill-Only POC Execution
  Dry-Run Adapter Skeleton.

## Action 1036 Manual Run Setup Simulation Update

- Created
  `tests/e2e/first-real-avanza-fill-only-poc-manual-run-setup-simulation.spec.ts`.
- Created
  `docs/first-real-avanza-fill-only-poc-manual-run-setup-simulation.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_run_setup_simulation_added`.
- Local simulation proves the adapter can return
  `ready_for_fill_only_manual_setup` with all execution capability flags false.
- Negative simulations cover disabled adapter, missing setup evidence, review
  requested, final confirmation requested, and cap above 1,000 SEK.
- Recommended next action: Action 1037 - Add First Fill-Only POC Execution
  Dry-Run Adapter Gate.

## Action 1035 Manual Run Setup Adapter Update

- Created `lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_run_setup_adapter_added`.
- The adapter enables a future local setup simulation decision before any real
  execution path is attempted.
- Recommended next action: Action 1036 - Add First Fill-Only POC Manual Run
  Setup Simulation.

## Action 1034 Manual Run Setup Gate Update

- Created `docs/first-real-avanza-fill-only-poc-manual-run-setup-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_run_setup_gate_added`.
- Gate decision: `manual_run_setup_gate_ready`.
- Dry-run plan remains non-live; setup adapter is still required before any
  future real run action.
- Recommended next action: Action 1035 - Add First Fill-Only POC Manual Run
  Setup Adapter.

## Action 1033 Operator Setup Evidence Completion Update

- Updated
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_ready_for_manual_run_setup`.
- Dry-run planning remains non-live; final manual run setup gate is next.
- Recommended next action: Action 1034 - Add First Fill-Only POC Manual Run
  Setup Gate.

## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Dry-run planning remains non-live; actual operator setup evidence is not yet
  complete.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- The dry-run plan now points to operator setup evidence capture as the next
  manual prerequisite.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Action 1030 Gated Adapter Skeleton Update

- Created `docs/gated-real-avanza-fill-only-adapter-skeleton.md`.
- Result status: `gated_real_avanza_fill_only_adapter_skeleton_added`.
- The dry-run plan remains non-live. The skeleton adds only gated setup
  metadata and forbids review click, final confirm, sell, Stop Loss, Glidande,
  account change, side switch, steppers, and `Välj alla på kontot`.
- Recommended next action: Action 1031 - Add Gated Adapter Operator Setup
  Checklist.

## Action 1029 Real-Run Readiness Gate Update

- Created `docs/first-real-avanza-fill-only-poc-real-run-readiness-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_real_run_readiness_gate_added`.
- Readiness decision:
  `ready_for_first_fill_only_poc_implementation_gate`.
- The next implementation may be a gated skeleton only; no real dry-run or
  browser automation is approved by this action.
- Recommended next action: Action 1030 - Add Gated Real Avanza Fill-Only
  Adapter Skeleton.

## Action 1028 Manual Approval Capture Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-capture.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_capture_added`.
- Approval decision:
  `approved_for_first_fill_only_poc`.
- The next safe step is still a real-run readiness gate; this action performs
  no dry-run, Avanza access, field fill, click, submit, or order placement.
- Recommended next action: Action 1029 - Add First Fill-Only POC Real-Run
  Readiness Gate.

## Action 1027 Manual Approval Message Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-message.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_message_added`.
- The dry-run plan remains blocked from real use until the exact manual
  approval phrase is captured and checked.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1028 - Capture First Fill-Only POC Manual
  Approval.

## Action 1026 Runbook Update

- Created `docs/first-real-avanza-fill-only-poc-runbook.md`.
- Result status: `first_real_avanza_fill_only_poc_runbook_added`.
- The runbook turns the dry-run plan into an operator checklist for a future
  separately approved real fill-only POC, still stopping before `Granska köp`.
- No real run, Avanza access, browser automation, DOM query, field fill, click,
  submit, broker behavior, Supabase call, migration, typegen, generated type
  edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1027 - Add First Fill-Only POC Manual
  Approval Message.

## Action 1025 Implementation Stub Update

- Added `lib/first-real-avanza-fill-only-poc-implementation-stub.ts`.
- Created `docs/first-real-avanza-fill-only-poc-implementation-stub.md`.
- Result status:
  `first_real_avanza_fill_only_poc_implementation_stub_added`.
- This is still not a real run; the stub only models typed request/result
  decisions and planned future selectors.
- Recommended next action: Action 1026 - Add First Fill-Only POC Runbook.

## Action 1024 Approval Decision Update

- Created `docs/first-real-avanza-fill-only-poc-approval-decision.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_decision_created`.
- The first real fill-only POC planning decision is conditionally approved, but
  no real run is approved by this action alone.
- Scope remains buy-only, Avancerad/Limit, amount-based, capped at <= 1,000
  SEK, manually opened by the operator, and stopped before `Granska köp`.
- Recommended next action: Action 1025 - Add First Real Avanza Fill-Only POC
  Implementation Stub.

## Action 1023 Local Simulation Report Update

- Created
  `docs/first-real-avanza-fill-only-poc-local-simulation-report.md`.
- Result status:
  `first_real_avanza_fill_only_poc_local_simulation_report_added`.
- The report confirms local guard/approval/selector simulation readiness while
  keeping the real dry-run unapproved.
- The planned first real POC remains fill-only, buy-only, Limit/Avancerad,
  capped at 1,000 SEK or lower, and stopped before `Granska köp`.
- Recommended next action: Action 1024 - Review Local Simulation And Decide
  First Real Fill-Only POC Approval.

## Action 1022 Approval State Contract Update

- Added `lib/first-real-avanza-fill-only-poc-approval-state-contract.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_state_contract_added`.
- The approval contract keeps real dry-run approval separate from local/static
  harness simulation and defaults to `not_approved_yet`.
- Recommended next action: Action 1023 - Add First Fill-Only POC Local
  Simulation Report.

## Action 1021 Harness Stub Update

- Added `lib/first-real-avanza-fill-only-poc-dry-run-harness.ts`.
- Added
  `tests/e2e/first-real-avanza-fill-only-poc-dry-run-harness.spec.ts`.
- Created `docs/first-real-avanza-fill-only-poc-dry-run-harness-stub.md`.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_harness_stub_added`.
- The harness is local/static/pure and exercises the guard and selector policy
  without Avanza access, browser automation, DOM querying, field filling,
  clicking, submit, provider/route calls, Supabase calls, or trade mutation.
- Recommended next action: Action 1022 - Add First Fill-Only POC Approval
  State Contract.

## Action 1020 Approval Checklist Update

- Created `docs/first-real-avanza-fill-only-poc-approval-checklist.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_checklist_created`.
- Default approval decision remains `not_approved_yet`.
- The approval checklist must be explicitly approved before any real Avanza
  fill-only POC dry-run can occur.
- Recommended next action: Action 1021 - Add First Fill-Only POC Dry-Run
  Harness Stub.
- No runtime code, browser automation, Avanza access, DOM querying, field
  filling, clicking, submit, provider/route/scan call, Supabase/DB write,
  migration, type generation, generated type edit, `.env.local` change, audit
  writer client invocation, real trade, or trade/stats/PnL mutation was
  performed.

## Purpose

Action 1019 defines the first real Avanza fill-only POC dry-run plan.

This is not implementation. This is not approval to execute a real dry-run.
This is not order execution. Final confirm remains forbidden for Ture/agent.
The plan does not authorize browser automation, Avanza access from code, DOM
querying, field filling, clicking, review-stage behavior, final confirmation,
or order placement.

## Readiness Basis

- Real Avanza UI reconnaissance passed with warnings.
- Real Avanza DOM/selector reconnaissance passed with warnings.
- Static selector mapping contract exists.
- Selector contract is integrated into the fill-only guard.
- Max amount guard exists with a 1,000 SEK cap.
- Human-final-confirmation guards pass.
- Browser automation safety boundary exists.
- No real Avanza automation has been implemented.
- No real Avanza field filling has been attempted or approved.

## Proposed First POC Scope

- User logs in manually.
- User opens Avanza manually.
- User manually opens the correct instrument/order form unless search-stage
  automation is separately approved.
- First scope is buy-only.
- Order type must be Avancerad / Limit.
- Amount-based sizing is recommended because the cap is SEK.
- Max notional cap: 1,000 SEK or lower.
- Stop point: after fields are filled and total amount is verified, before
  clicking `Granska köp`.
- No confirmation modal by default.
- No sell.
- No Stop Loss.
- No Glidande.
- No review-stage behavior.
- No final submit.

## Explicitly Allowed Future Dry-Run Actions After Separate Approval

- Read instrument summary.
- Read selected account.
- Read side state.
- Read selected order type.
- Fill `Belopp i SEK` with an approved value under cap.
- Fill `Kurs i USD` with an approved price.
- Optionally fill `Antal` only if quantity-mode is explicitly approved.
- Read total amount.
- Read validation states.
- Stop.

## Blocked Actions For First POC

- Clicking `Granska köp`.
- Clicking `Granska sälj`.
- Clicking `Bekräfta köp`.
- Clicking `Bekräfta sälj`.
- Clicking side switch.
- Clicking account selector or changing account.
- Clicking `Välj alla på kontot`.
- Clicking steppers.
- Selecting Stop Loss.
- Selecting Glidande.
- Sell-side flow.
- Confirmation modal flow.
- Credentials/2FA handling.
- Unattended execution.

## Required Selector Readiness Before POC

Required:

- `[data-e2e="orderMarketInfoPanel"]`
- account selected/read-only metadata
- `button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]`
- `input[type="radio"][value="Limit"]`
- `input[data-e2e="inputAmount"]`
- `input[data-e2e="inputPrice"]`
- `output[data-e2e="expandOrderAmount"]`

Optional / deferred:

- search open button
- search input
- search result row
- quantity input, unless quantity-mode is approved
- review buy button
- cancel button
- modal selectors

Forbidden:

- `button[data-e2e="confirmOrderButton"]`
- `button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]`
- `button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]`

## Guard Checklist Before Future Dry-Run

All must pass:

- Recommendation/payload is fresh.
- Mode is semi-auto/human-confirmed.
- Automatic submit is false.
- Order type is Avancerad/Limit.
- Side is buy.
- Amount cap can be calculated.
- Displayed total amount selector exists.
- Total amount parses as SEK.
- Total amount is less than or equal to cap.
- Account is human-verified.
- Instrument is human-verified.
- Price/currency is human-verified.
- No validation errors are visible.
- No generated selector strategy is used.
- Review button remains blocked.
- Final confirm selectors remain hard forbidden.

## Evidence Requirements For Future Dry-Run

Required evidence:

- Before screenshot with sensitive values redacted.
- After-fill screenshot.
- Selector guard decision output.
- Cap decision output.
- Visible `Belopp i SEK`.
- Visible `Kurs i USD`.
- Visible total amount.
- Visible buy side / `Granska köp`.
- Visible Avancerad/Limit.
- No click on `Granska köp`.
- No modal opened.
- No final button visible/clicked.
- No order placed statement.

## Dry-Run Result Statuses

- `first_real_avanza_fill_only_poc_plan_created`
- `first_real_avanza_fill_only_poc_approved_for_manual_run`
- `first_real_avanza_fill_only_poc_deferred`
- `first_real_avanza_fill_only_poc_blocked`
- `first_real_avanza_fill_only_poc_passed`
- `first_real_avanza_fill_only_poc_passed_with_warnings`
- `first_real_avanza_fill_only_poc_failed_safety`

## Result Status

`first_real_avanza_fill_only_poc_dry_run_plan_created`

## Recommended Next Action

Action 1020 - Add First Fill-Only POC Approval Checklist.

Reason: before any real dry-run, require an explicit approval checklist separate
from this plan.

## Safety Statement

This plan does not authorize automation. This plan does not authorize clicking.
This plan does not authorize field filling yet. Separate explicit user approval
is required before any dry-run. Final confirm is permanently forbidden for
Ture/agent.

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
  `NEXT_PUBLIC_*SERVICE*`, service-role leakage, first-fill-only-poc-plan
  executable safety, automatic-mode, dead-doc/path, status string, and
  next-action scans passed or returned expected docs-only/policy references
  without invoking runtime behavior or printing secrets.
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
