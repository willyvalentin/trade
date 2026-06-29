## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Guard/selector integration remains local metadata; no new operator Avanza
  page evidence was supplied.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- The checklist keeps selector/guard readiness as local prerequisites and does
  not execute selectors against Avanza.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Action 1030 Gated Adapter Skeleton Update

- Created `docs/gated-real-avanza-fill-only-adapter-skeleton.md`.
- Result status: `gated_real_avanza_fill_only_adapter_skeleton_added`.
- The skeleton consumes the guard and selector integration as prerequisites and
  exposes planned sequence and forbidden-action metadata only.
- No Avanza access, browser automation, DOM query, fill, click, submit, or
  broker behavior was added.
- Recommended next action: Action 1031 - Add Gated Adapter Operator Setup
  Checklist.

## Action 1029 Real-Run Readiness Gate Update

- Created `docs/first-real-avanza-fill-only-poc-real-run-readiness-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_real_run_readiness_gate_added`.
- Readiness decision:
  `ready_for_first_fill_only_poc_implementation_gate`.
- Guard/selector prerequisites pass for a future gated implementation skeleton;
  no Avanza DOM query, field fill, click, submit, or order placement occurred.
- Recommended next action: Action 1030 - Add Gated Real Avanza Fill-Only
  Adapter Skeleton.

## Action 1028 Manual Approval Capture Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-capture.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_capture_added`.
- Approval decision:
  `approved_for_first_fill_only_poc`.
- Selector/guard integration remains a pre-run gate; this action does not
  access Avanza, query DOM, fill fields, click, submit, or place orders.
- Recommended next action: Action 1029 - Add First Fill-Only POC Real-Run
  Readiness Gate.

## Action 1027 Manual Approval Message Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-message.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_message_added`.
- The selector/guard integration remains blocked from real use until exact
  manual approval text is captured.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1028 - Capture First Fill-Only POC Manual
  Approval.

## Action 1026 Runbook Update

- Created `docs/first-real-avanza-fill-only-poc-runbook.md`.
- Result status: `first_real_avanza_fill_only_poc_runbook_added`.
- The runbook preserves the selector contract as a pre-run gate and keeps
  review/final selectors blocked for the first POC.
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
- The stub exposes selector-contract metadata for planned amount, price, total,
  instrument, side, and order-type checks while keeping review/final selectors
  blocked.
- Recommended next action: Action 1026 - Add First Fill-Only POC Runbook.

## Action 1024 Approval Decision Update

- Action 1024 created
  `docs/first-real-avanza-fill-only-poc-approval-decision.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_decision_created`.
- The conditional decision preserves the selector contract integration:
  review click remains blocked and final confirm selectors remain hard
  forbidden.
- Recommended next action: Action 1025 - Add First Real Avanza Fill-Only POC
  Implementation Stub.

## Action 1023 Local Simulation Report Update

- Action 1023 created
  `docs/first-real-avanza-fill-only-poc-local-simulation-report.md`.
- Result status:
  `first_real_avanza_fill_only_poc_local_simulation_report_added`.
- The report summarizes how the guard and selector contract behave in
  local-only scenarios, including blocked cap, total amount, side, order type,
  review, and final-confirm cases.
- No real Avanza access, browser automation, DOM query, field fill, click, or
  submit was performed.
- Recommended next action: Action 1024 - Review Local Simulation And Decide
  First Real Fill-Only POC Approval.

## Action 1022 Approval State Contract Update

- Action 1022 added a pure approval state contract for the first fill-only POC.
- Result status:
  `first_real_avanza_fill_only_poc_approval_state_contract_added`.
- The contract separates stub-only simulation approval from future real dry-run
  approval and preserves the existing guard/selector boundary.
- Recommended next action: Action 1023 - Add First Fill-Only POC Local
  Simulation Report.

## Action 1021 Harness Stub Update

- Action 1021 added
  `lib/first-real-avanza-fill-only-poc-dry-run-harness.ts`.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_harness_stub_added`.
- The harness wraps the existing fill-only guard and selector policy with
  static operator-approval, selector-readiness, human-verification, cap, and
  evidence gates.
- The harness remains pure/local and adds no Avanza, browser, DOM, route,
  provider, Supabase, broker, audit-writer, or env integration.
- Recommended next action: Action 1022 - Add First Fill-Only POC Approval
  State Contract.

## Action 1020 Approval Checklist Update

- Action 1020 created
  `docs/first-real-avanza-fill-only-poc-approval-checklist.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_checklist_created`.
- Default approval decision: `not_approved_yet`.
- The checklist preserves selector contract integration as a guard input only;
  it does not authorize real Avanza automation, field filling, review clicks,
  final clicks, or order placement.
- Recommended next action: Action 1021 - Add First Fill-Only POC Dry-Run
  Harness Stub.

## Action 1019 Dry-Run Plan Update

- Action 1019 created `docs/first-real-avanza-fill-only-poc-dry-run-plan.md`.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_plan_created`.
- The next step is an approval checklist before any real dry-run; the plan does
  not approve automation, field filling, clicking, review-stage behavior, final
  confirmation, or order execution.
- Recommended next action: Action 1020 - Add First Fill-Only POC Approval
  Checklist.

# Real Avanza Fill-Only Guard Selector Contract Integration

## Purpose

Action 1018 integrates the pure/static Real Avanza selector mapping contract
into the pure Real Avanza fill-only guard.

This is pure/static guard and contract integration only. This is not Avanza
automation. This is not fill-only POC approval. This is not order execution.
The implementation does not access Avanza, query the DOM, automate a browser,
fill fields, click buttons, submit orders, call routes, call Supabase, or mutate
trades.

## Implementation

Touched implementation and test files:

- `lib/real-avanza-fill-only-guard.ts`
- `lib/real-avanza-selector-mapping-contract.ts`
- `tests/e2e/real-avanza-fill-only-guard-contract.spec.ts`

The fill-only guard now imports the static selector mapping contract and exposes
string/metadata-only selector policy helpers:

- `evaluateSelectorPolicyForFirstFillOnlyPoc(...)`
- `getForbiddenFinalSelectors()`
- `getRequiredFirstFillOnlySelectors(...)`
- `getRequiredFirstFillOnlySelectorKeys(...)`
- `isSelectorForbiddenFinalAction(...)`
- `isSelectorBlockedForFirstPoc(...)`
- `isSelectorAllowedReadForFirstPoc(...)`
- `isSelectorFutureFillCandidate(...)`
- `isGeneratedSelectorStrategyRejected(...)`

The main `evaluateRealAvanzaFillOnlyGuard(...)` decision now includes
`selector_policy` metadata while preserving the existing cap, side, order type,
automatic-submit, and human-final-confirmation behavior.

## Encoded Selector Policy

Forbidden final selectors:

- `button[data-e2e="confirmOrderButton"]`
- `button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]`
- `button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]`

Blocked first-POC selectors include:

- `button[data-e2e="orderButton"][data-mint-button-theme="buy"]`
- `button[data-e2e="orderButton"][data-mint-button-theme="sell"]`
- sell-side selector state
- Stop Loss selector
- Glidande selector
- search-stage selectors
- confirmation modal selectors

Allowed read selectors include:

- `[data-e2e="orderMarketInfoPanel"]`
- `button[aria-haspopup="listbox"]`
- `button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]`
- `input[type="radio"][value="Limit"]`
- `[data-e2e="totalFees"]`
- `output[data-e2e="expandOrderAmount"]`

Future fill candidate selectors include:

- `input[data-e2e="inputAmount"]`
- `input[data-e2e="inputVolume"]`
- `input[data-e2e="inputPrice"]`

Required first future fill-only readiness selectors include:

- `[data-e2e="orderMarketInfoPanel"]`
- account selector read-only metadata
- `button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]`
- `input[type="radio"][value="Limit"]`
- `input[data-e2e="inputAmount"]` or approved sizing-mode equivalent
- `input[data-e2e="inputPrice"]`
- `output[data-e2e="expandOrderAmount"]`

Generated selector strategies are rejected, including Angular `_ngcontent-*`,
`_nghost-*`, generated ids such as `aza-select-id-3`, `generated-*`, and
`#list-item-link-0`.

## Guard Impact

- The guard now combines cap/order policy with selector policy metadata.
- Final selectors are hard stops regardless of cap.
- Review buttons are blocked for the first POC.
- Total amount selector metadata is required for cap verification.
- Account selector metadata remains read-only and human-verify only.
- Amount, quantity, and price remain future fill candidates only after explicit
  approval.
- Generated selector strategies are rejected by selector policy.

## Safety Confirmation

- No browser automation.
- No DOM access.
- No Avanza access.
- No field filling.
- No clicking.
- No submit.
- No final click.
- No `Bekräfta köp`.
- No `Bekräfta sälj`.
- No Supabase/audit/provider/route/scan call.
- No trade/stats/PnL mutation.
- No `.env.local` change.
- No migration, type generation, or generated type edit.

## Result Status

`real_avanza_fill_only_guard_selector_contract_integration_added`

## Recommended Next Action

Action 1019 - Add First Fill-Only POC Dry-Run Plan.

Reason: once guard and selector contract are integrated, the next safe step is a
dry-run plan, not real automation.

## Validation Results

- `npx playwright test tests/e2e/real-avanza-fill-only-guard-contract.spec.ts`
  passed with 25 tests.
- `npx playwright test tests/e2e/real-avanza-fill-only-guard-contract.spec.ts tests/e2e/real-avanza-selector-mapping-contract.spec.ts tests/e2e/human-final-confirmation-guard.spec.ts tests/e2e/browser-automation-safety-boundary.spec.ts`
  passed with 48 tests.
- Focused semi-auto/sandbox stack:
  `tests/e2e/semi-auto-avanza-agent-payload-contract.spec.ts` passed in the
  combined run; `tests/e2e/sandbox-browser-agent-selector-stability.spec.ts`
  initially hit `ERR_CONNECTION_REFUSED` for the local web server in the
  combined run and then passed when rerun alone with 3 tests.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`.
- Audit writer runtime path import search returned no app/components/hooks
  matches.
- Source scan for `lib/real-avanza-fill-only-guard.ts` and
  `lib/real-avanza-selector-mapping-contract.ts` found no executable
  browser/DOM/fetch/Supabase/env/service-role/provider/route/audit code.
- Dead-doc/path, status string, next-action, `git diff --check`,
  trailing-whitespace, zero-byte docs, and `.env.local` diff checks passed.
