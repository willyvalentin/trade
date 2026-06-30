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
- The adapter uses selector mapping entries only as metadata for planned
  instructions and forbidden selector reporting; it does not query DOM.
- Recommended next action: Action 1036 - Add First Fill-Only POC Manual Run
  Setup Simulation.

## Action 1034 Manual Run Setup Gate Update

- Created `docs/first-real-avanza-fill-only-poc-manual-run-setup-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_run_setup_gate_added`.
- Gate decision: `manual_run_setup_gate_ready`.
- Selector mapping remains metadata only; no DOM query was performed.
- Recommended next action: Action 1035 - Add First Fill-Only POC Manual Run
  Setup Adapter.

## Action 1033 Operator Setup Evidence Completion Update

- Updated
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_ready_for_manual_run_setup`.
- Screenshot evidence confirms the expected visible UI state from the operator,
  not from DOM automation.
- Recommended next action: Action 1034 - Add First Fill-Only POC Manual Run
  Setup Gate.

## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Selector mapping remains metadata only; no code queried Avanza DOM and no
  operator setup evidence was supplied.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Selector mapping remains metadata only; actual operator setup evidence must
  be manually captured next.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Action 1030 Gated Adapter Skeleton Update

- Created `docs/gated-real-avanza-fill-only-adapter-skeleton.md`.
- Result status: `gated_real_avanza_fill_only_adapter_skeleton_added`.
- The skeleton exposes selector mapping entries as metadata for verification,
  future fill candidates, hard stops, and forbidden actions; it does not query
  a real DOM.
- Recommended next action: Action 1031 - Add Gated Adapter Operator Setup
  Checklist.

## Action 1029 Real-Run Readiness Gate Update

- Created `docs/first-real-avanza-fill-only-poc-real-run-readiness-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_real_run_readiness_gate_added`.
- Readiness decision:
  `ready_for_first_fill_only_poc_implementation_gate`.
- Selector mapping remains a static prerequisite; final confirmation selectors
  remain hard forbidden.
- Recommended next action: Action 1030 - Add Gated Real Avanza Fill-Only
  Adapter Skeleton.

## Action 1028 Manual Approval Capture Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-capture.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_capture_added`.
- Approval decision:
  `approved_for_first_fill_only_poc`.
- Selector mappings remain metadata only; captured approval does not approve
  final confirmation or order placement.
- Recommended next action: Action 1029 - Add First Fill-Only POC Real-Run
  Readiness Gate.

## Action 1027 Manual Approval Message Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-message.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_message_added`.
- The selector mapping remains metadata only and does not approve any Avanza
  access, DOM query, field fill, review click, final click, or order placement.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1028 - Capture First Fill-Only POC Manual
  Approval.

## Action 1026 Runbook Update

- Created `docs/first-real-avanza-fill-only-poc-runbook.md`.
- Result status: `first_real_avanza_fill_only_poc_runbook_added`.
- The runbook references the selector mapping contract as evidence metadata and
  keeps final confirmation selectors hard-forbidden.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1027 - Add First Fill-Only POC Manual
  Approval Message.

## Action 1025 Implementation Stub Update

- Action 1025 added
  `lib/first-real-avanza-fill-only-poc-implementation-stub.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_implementation_stub_added`.
- The stub reads selector metadata from the mapping contract and exposes it as
  non-executing planned future targets only.
- Recommended next action: Action 1026 - Add First Fill-Only POC Runbook.

## Action 1024 Approval Decision Update

- Action 1024 created
  `docs/first-real-avanza-fill-only-poc-approval-decision.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_decision_created`.
- The decision relies on the static selector mapping contract and does not add
  real selector probing, DOM queries, field filling, clicks, or submit.
- Recommended next action: Action 1025 - Add First Real Avanza Fill-Only POC
  Implementation Stub.

## Action 1023 Local Simulation Report Update

- Action 1023 created
  `docs/first-real-avanza-fill-only-poc-local-simulation-report.md`.
- Result status:
  `first_real_avanza_fill_only_poc_local_simulation_report_added`.
- The report uses the selector mapping contract as static simulation basis and
  preserves forbidden final selector and review-click stops.
- Real selector/DOM probing remains unperformed in this action.
- Recommended next action: Action 1024 - Review Local Simulation And Decide
  First Real Fill-Only POC Approval.

## Action 1022 Approval State Contract Update

- Action 1022 added
  `lib/first-real-avanza-fill-only-poc-approval-state-contract.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_state_contract_added`.
- Selector mapping remains a static selector contract; approval state is now a
  separate pure contract that blocks real dry-run approval unless all human
  approval fields are present.
- Recommended next action: Action 1023 - Add First Fill-Only POC Local
  Simulation Report.

## Action 1021 Harness Stub Update

- Action 1021 added a local/static dry-run harness that consumes selector
  policy output from the existing guard.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_harness_stub_added`.
- The harness exposes forbidden selectors and fails safety if a final selector,
  review-click request, or generated selector strategy is present.
- Recommended next action: Action 1022 - Add First Fill-Only POC Approval
  State Contract.

## Action 1020 Approval Checklist Update

- Action 1020 created the first real Avanza fill-only POC approval checklist:
  `docs/first-real-avanza-fill-only-poc-approval-checklist.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_checklist_created`.
- Default approval decision remains `not_approved_yet`.
- The checklist requires selector readiness before a future dry-run and keeps
  final confirm selectors permanently forbidden.
- Recommended next action: Action 1021 - Add First Fill-Only POC Dry-Run
  Harness Stub.

## Action 1019 Dry-Run Plan Update

- Action 1019 created the first real Avanza fill-only POC dry-run plan:
  `docs/first-real-avanza-fill-only-poc-dry-run-plan.md`.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_plan_created`.
- The plan uses the selector contract as readiness input but does not approve
  selector execution, browser automation, field filling, clicking, or order
  placement.
- Recommended next action: Action 1020 - Add First Fill-Only POC Approval
  Checklist.

## Action 1018 Fill-Only Guard Integration Update

- Action 1018 integrated this selector mapping contract into
  `lib/real-avanza-fill-only-guard.ts`.
- Integration doc:
  `docs/real-avanza-fill-only-guard-selector-contract-integration.md`.
- Result status:
  `real_avanza_fill_only_guard_selector_contract_integration_added`.
- The guard now exposes selector policy metadata for hard forbidden selectors,
  required first future fill-only selectors, blocked review/final selectors,
  allowed read selectors, future fill candidates, and generated selector
  rejection.
- Recommended next action: Action 1019 - Add First Fill-Only POC Dry-Run Plan.

# Real Avanza Selector Mapping Contract

## Purpose

Action 1017 creates a pure/static Real Avanza selector mapping contract from
the Action 1016 human-led DOM/selector reconnaissance evidence.

This is not automation. This is not fill-only POC approval. This is not order
execution. The contract does not access Avanza, automate a browser, fill fields,
click buttons, submit orders, call routes, call Supabase, or mutate trades.

## Evidence Basis

- Evidence basis: Action 1016 operator-provided screenshots and browser
  DevTools observations.
- Code access to Avanza: not performed.
- Browser automation: not performed.
- Credentials/session tokens captured: no.
- Orders placed: no.
- Final confirmation clicked: no.

## Contract Module

- Module path: `lib/real-avanza-selector-mapping-contract.ts`.
- Test path: `tests/e2e/real-avanza-selector-mapping-contract.spec.ts`.
- Exported mapping: `realAvanzaSelectorMapping`.
- Lookup helper: `findRealAvanzaSelectorMappingEntry(...)`.
- Forbidden final selectors: `realAvanzaForbiddenFinalSelectors`.
- Required first future fill-only selectors:
  `realAvanzaFirstFillOnlyRequiredSelectorKeys`.
- Deferred selectors: `realAvanzaDeferredSelectorKeys`.
- Disallowed stable selector strategies:
  `realAvanzaDisallowedStableSelectorStrategies`.
- Preferred stable selector strategies:
  `realAvanzaPreferredStableSelectorStrategies`.

Classifications encoded:

- `read_only`
- `future_fill_candidate`
- `future_click_candidate`
- `forbidden_final_action`
- `human_verify_required`
- `deferred`

First POC behavior encoded:

- `allowed_read`
- `allowed_fill_after_approval`
- `allowed_click_after_separate_approval`
- `block`
- `forbidden`

## Selector Mapping Summary

| Area | Primary selector | First POC behavior | Notes |
| --- | --- | --- | --- |
| Search open | `button[data-e2e="menuSearchButton"]` | `block` | Deferred search-stage click. |
| Search input | `input[data-e2e="search-query"]` | `block` | Deferred search-stage fill. |
| Search result | `a[href*="/aktier/om-aktien.html/194698/gamestop"]` | `block` | Avoid `#list-item-link-0`. |
| Instrument panel | `[data-e2e="orderMarketInfoPanel"]` | `allowed_read` | Required instrument verification. |
| Account selector | `button[aria-haspopup="listbox"]` | `allowed_read` | Human-verify account; never change account. |
| Selected account option | `aza-select-option[role="option"][aria-selected="true"]` | `allowed_read` | Read-only if account list is open. |
| Buy-state switch | `button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]` | `allowed_read` | Confirms current side is buy. |
| Sell-state switch | `button[data-e2e="switchSideButton"][aria-label="Byt till köp"]` | `block` | First POC is buy-only. |
| Amount | `input[data-e2e="inputAmount"]` | `allowed_fill_after_approval` | Strong future amount-based fill candidate. |
| Quantity | `input[data-e2e="inputVolume"]` | `allowed_fill_after_approval` | Only if quantity mode is approved; no steppers or `Välj alla`. |
| Price | `input[data-e2e="inputPrice"]` | `allowed_fill_after_approval` | Verify currency label. |
| Limit/Avancerad | `input[type="radio"][value="Limit"]` | `allowed_read` | Required checked state. |
| Stop Loss | `mint-toggle-switch-option[data-e2e="selectOrderTypeOption_StopLossAbsolute"]` | `block` | Deferred. |
| Glidande | `mint-toggle-switch-option[data-e2e="selectOrderTypeOption_StopLossDelta"]` | `block` | Deferred. |
| Active indicator | `div[data-e2e="active-indicator"]` | `allowed_read` | Supplemental only. |
| Fees | `[data-e2e="totalFees"]` | `allowed_read` | Not cap source alone. |
| Total | `output[data-e2e="expandOrderAmount"]` | `allowed_read` | Primary cap verification field. |
| Expanded fees/FX | `aza-order-summary` | `allowed_read` | Review-stage read-only details. |
| Review buy | `button[data-e2e="orderButton"][data-mint-button-theme="buy"]` | `block` | Not final submit, but opens confirmation modal. |
| Review sell | `button[data-e2e="orderButton"][data-mint-button-theme="sell"]` | `block` | Sell/review deferred. |
| Confirmation modal | `form.order-screen-content.order-dialog` | `block` | Review-stage boundary. |
| Final confirm general | `button[data-e2e="confirmOrderButton"]` | `forbidden` | Hard stop. |
| Final confirm buy | `button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]` | `forbidden` | Hard stop; `Bekräfta köp`. |
| Final confirm sell | `button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]` | `forbidden` | Hard stop; `Bekräfta sälj`. |
| Cancel | `button[data-e2e="orderConfirmCancelLink"]` | `block` | Future review-stage safe-exit candidate only after approval. |

## Hard Forbidden Selectors

- `button[data-e2e="confirmOrderButton"]`
- `button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]`
- `button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]`

These are final broker submit actions. They must never be clicked by Ture or an
agent. Detection of these selectors is a hard stop, not an action target.

## First POC Implication

- First real Avanza POC is still not approved by this action.
- First future POC should be fill-only, buy-only, and require separate explicit
  approval.
- First future POC should stop before `Granska köp`.
- Review-modal click, cancel click, search-stage automation, sell side, Stop
  Loss, and Glidande remain deferred.
- Total amount readback must be used as the primary UI cap verification field.

## Test Coverage

`tests/e2e/real-avanza-selector-mapping-contract.spec.ts` verifies:

- all critical selector entries exist;
- final confirm general/buy/sell selectors are hard-stop forbidden;
- review buttons are not final submit but remain blocked for first POC;
- amount, quantity, and price are future fill candidates only after approval;
- total amount is read-only and required for cap verification;
- account selectors are read-only and human-verified;
- buy/sell side state is encoded;
- Avancerad/Limit state is required and read-only;
- Stop Loss, Glidande, and search-stage selectors are deferred;
- generated Angular ids/classes are disallowed as stable selector strategies;
- no final selector can ever be allowed;
- no first POC behavior permits review or confirm clicking;
- the module has no browser/fetch/Supabase/env/provider/route/audit imports.

## Result Status

`real_avanza_selector_mapping_contract_created`

## Recommended Next Action

Action 1018 - Add Selector Contract To Fill-Only Guard.

Reason: the next safe step is to make the max amount/final-submit guard aware
of the static selector contract, still without Avanza automation.

## Validation Results

- `npx playwright test tests/e2e/real-avanza-selector-mapping-contract.spec.ts`
  passed with 12 tests.
- `npx playwright test tests/e2e/real-avanza-fill-only-guard-contract.spec.ts tests/e2e/human-final-confirmation-guard.spec.ts tests/e2e/real-avanza-selector-mapping-contract.spec.ts`
  passed with 37 tests after rerunning with local web-server sandbox
  escalation; the first sandboxed attempt failed because port 3010 binding was
  denied.
- `npx playwright test tests/e2e/browser-automation-safety-boundary.spec.ts tests/e2e/semi-auto-avanza-agent-payload-contract.spec.ts tests/e2e/sandbox-browser-agent-selector-stability.spec.ts`
  passed with 13 tests.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`.
- Audit writer runtime path import search returned no app/components/hooks
  matches.
- Route invocation, UI/app-shell audit writer import, market-loop/scanner,
  `NEXT_PUBLIC_*SERVICE*`, service-role leakage, selector-contract executable
  safety, automatic-mode, dead-doc/path, status string, and next-action scans
  passed or returned expected docs-only/test-only/policy/selector-literal
  references without invoking runtime behavior or printing secrets.
- `git diff --check` passed.
- Touched-file trailing whitespace scan returned no matches.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.

## Not Performed

- No Avanza access from code.
- No browser automation.
- No runtime Avanza integration.
- No field filling.
- No clicking.
- No submit.
- No final click.
- No `Bekräfta köp`.
- No `Bekräfta sälj`.
- No broker behavior.
- No Supabase/DB write.
- No provider/scan route invocation.
- No audit writer client invocation.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No real trade.
- No trade/stats/PnL mutation.
