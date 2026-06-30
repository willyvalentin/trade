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
- The adapter translates UI mapping into planned instruction metadata only and
  does not access the real Avanza UI.
- Recommended next action: Action 1036 - Add First Fill-Only POC Manual Run
  Setup Simulation.

## Action 1034 Manual Run Setup Gate Update

- Created `docs/first-real-avanza-fill-only-poc-manual-run-setup-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_run_setup_gate_added`.
- Gate decision: `manual_run_setup_gate_ready`.
- UI mapping remains documentation/metadata only in this action.
- Recommended next action: Action 1035 - Add First Fill-Only POC Manual Run
  Setup Adapter.

## Action 1033 Operator Setup Evidence Completion Update

- Updated
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_ready_for_manual_run_setup`.
- Screenshot evidence confirms the expected UI mapping state at a human
  observation level only.
- Recommended next action: Action 1034 - Add First Fill-Only POC Manual Run
  Setup Gate.

## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- UI mapping remains documentation only; visible Avanza page evidence was not
  supplied in Action 1032.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- UI mapping remains documentation/metadata only; operator setup evidence must
  confirm actual visible page state later.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Action 1030 Gated Adapter Skeleton Update

- Created `docs/gated-real-avanza-fill-only-adapter-skeleton.md`.
- Result status: `gated_real_avanza_fill_only_adapter_skeleton_added`.
- UI mappings are exposed to the skeleton as metadata for future manual setup
  and proof only; no browser automation or DOM access was added.
- Recommended next action: Action 1031 - Add Gated Adapter Operator Setup
  Checklist.

## Action 1029 Real-Run Readiness Gate Update

- Created `docs/first-real-avanza-fill-only-poc-real-run-readiness-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_real_run_readiness_gate_added`.
- Readiness decision:
  `ready_for_first_fill_only_poc_implementation_gate`.
- UI mapping is sufficient for a future gated skeleton, but no live UI
  interaction occurred in this action.
- Recommended next action: Action 1030 - Add Gated Real Avanza Fill-Only
  Adapter Skeleton.

## Action 1028 Manual Approval Capture Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-capture.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_capture_added`.
- Approval decision:
  `approved_for_first_fill_only_poc`.
- UI mapping remains planning/evidence only; no real field fill, click, modal,
  final confirmation, or order placement was performed.
- Recommended next action: Action 1029 - Add First Fill-Only POC Real-Run
  Readiness Gate.

## Action 1027 Manual Approval Message Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-message.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_message_added`.
- The UI mapping remains planning/evidence only and does not approve any real
  field fill, click, confirmation modal, or order placement.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1028 - Capture First Fill-Only POC Manual
  Approval.

## Action 1026 Runbook Update

- Created `docs/first-real-avanza-fill-only-poc-runbook.md`.
- Result status: `first_real_avanza_fill_only_poc_runbook_added`.
- The runbook uses the UI mapping spec as operator-facing procedure context and
  does not add executable Avanza mapping or integration.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1027 - Add First Fill-Only POC Manual
  Approval Message.

## Action 1025 Implementation Stub Update

- Action 1025 added the non-executing implementation stub.
- Result status:
  `first_real_avanza_fill_only_poc_implementation_stub_added`.
- Planned future field targets are now exposed as typed metadata for amount,
  price, total, instrument, side, and Limit/Avancerad verification.
- Recommended next action: Action 1026 - Add First Fill-Only POC Runbook.

## Action 1024 Approval Decision Update

- Action 1024 created
  `docs/first-real-avanza-fill-only-poc-approval-decision.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_decision_created`.
- The decision keeps account/instrument/order form setup manual and requires
  operator verification before any future real POC.
- Recommended next action: Action 1025 - Add First Real Avanza Fill-Only POC
  Implementation Stub.

## Action 1023 Local Simulation Report Update

- Action 1023 created
  `docs/first-real-avanza-fill-only-poc-local-simulation-report.md`.
- Result status:
  `first_real_avanza_fill_only_poc_local_simulation_report_added`.
- The report keeps UI mapping as static evidence only and confirms future
  dry-run evidence must include visible amount, price, total, side, order type,
  and no review/final action statements.
- No real UI access or DOM query occurred.
- Recommended next action: Action 1024 - Review Local Simulation And Decide
  First Real Fill-Only POC Approval.

## Action 1022 Approval State Contract Update

- Action 1022 added a pure approval state contract for first fill-only POC
  readiness.
- Result status:
  `first_real_avanza_fill_only_poc_approval_state_contract_added`.
- The contract requires account and instrument human verification before future
  real dry-run approval can be considered.
- Recommended next action: Action 1023 - Add First Fill-Only POC Local
  Simulation Report.

## Action 1021 Harness Stub Update

- Action 1021 added a local/static dry-run harness stub that consumes static
  selector-readiness snapshots.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_harness_stub_added`.
- The harness requires total amount selector availability, buy-side readiness,
  Limit/Avancerad readiness, account/instrument/price human verification, and
  no review/final/generated selector requests.
- Recommended next action: Action 1022 - Add First Fill-Only POC Approval
  State Contract.

## Action 1020 Approval Checklist Update

- Action 1020 created
  `docs/first-real-avanza-fill-only-poc-approval-checklist.md`.
- Result status:
  `first_real_avanza_fill_only_poc_approval_checklist_created`.
- The checklist requires account, instrument, side, order type, amount, price,
  and total visibility evidence before a future dry-run can be accepted.
- Review and final confirmation surfaces remain blocked for the first POC.
- Recommended next action: Action 1021 - Add First Fill-Only POC Dry-Run
  Harness Stub.

## Action 1019 Dry-Run Plan Update

- Action 1019 created `docs/first-real-avanza-fill-only-poc-dry-run-plan.md`.
- Result status:
  `first_real_avanza_fill_only_poc_dry_run_plan_created`.
- The plan uses this mapping only as a future readiness reference and does not
  approve automation, DOM querying, field filling, clicking, or order placement.
- Recommended next action: Action 1020 - Add First Fill-Only POC Approval
  Checklist.

## Action 1018 Selector Contract Integration Update

- Action 1018 connected the selector mapping contract to the fill-only guard.
- Result status:
  `real_avanza_fill_only_guard_selector_contract_integration_added`.
- Selector mapping is now available to guard decisions as pure metadata, with no
  browser automation or Avanza access.
- Recommended next action: Action 1019 - Add First Fill-Only POC Dry-Run Plan.

## Action 1017 Selector Mapping Contract Update

- Action 1017 encoded the mapping as `lib/real-avanza-selector-mapping-contract.ts`.
- Contract doc: `docs/real-avanza-selector-mapping-contract.md`.
- Result status:
  `real_avanza_selector_mapping_contract_created`.
- Generated Angular ids/classes are listed as disallowed stable selector
  strategies; the contract prefers `data-e2e`, semantic attributes, visible
  labels, formcontrol names, and stable component names.
- Recommended next action: Action 1018 - Add Selector Contract To Fill-Only
  Guard.

## Action 1016 DOM/Selector Evidence Update

- Action 1016 added operator-provided screenshot/DevTools DOM evidence to
  `docs/real-avanza-dom-selector-reconnaissance-results.md`.
- Result status:
  `real_avanza_dom_selector_recon_passed_with_warnings`.
- Mapping should now be converted into a pure/static selector mapping contract,
  preferring `data-e2e`, semantic attributes, visible labels, and form control
  names over generated Angular ids/classes.
- Final confirmation selectors remain hard-stop forbidden selectors.
- Recommended next action: Action 1017 - Create Real Avanza Selector Mapping
  Contract.

# Real Avanza UI Mapping Spec

## Purpose

Action 1010 creates the Real Avanza UI mapping spec from the Action 1009
human-led reconnaissance evidence.

This is documentation/spec only. This is not Avanza automation. This is not
order execution. Final `Bekräfta köp` or `Bekräfta sälj` remains human-only and
forbidden for any agent.

## Evidence Basis

- Based on Action 1009 operator-provided screenshots/notes.
- Evidence is manual/screenshot-based only.
- No DOM/selector verification exists yet.
- No code accessed Avanza.
- No agent/browser automation was used.
- No credentials were stored or handled by Ture.
- No 2FA was handled or bypassed by Ture.

Referenced evidence:

- `1-Search.png`
- `2-Search-Result.png`
- `3-Stock-Page.png`
- `4-Order-Page.png`
- `5-Order-Confirmation.png`
- `Full-Buy-Flow.jpeg`
- `Form-Errors.png`
- `BUY-Order-Forms-Filled.png`
- `BUY-Order-Forms-Not-Filled.png`
- `SELL-Order-Forms-Filled.png`

## Supported Mapped Flow

1. Top-right `Sök`.
2. Search drawer/panel opens.
3. User enters ticker/name query.
4. User selects matching instrument.
5. Instrument detail page opens.
6. User verifies instrument context, including the visible `Om depåbeviset`
   section when applicable.
7. User selects buy/sell entry point.
8. Order page/form opens.
9. User selects order type:
   - `Avancerad`
   - `Stop Loss`
   - `Glidande`
10. User enters or reviews order fields.
11. User selects `Granska köp` or `Granska sälj`.
12. Confirmation modal opens.
13. User reviews final modal summary.
14. User exits with `Avbryt` or, manually and outside agent authority, may use
    final `Bekräfta köp` / `Bekräfta sälj`.

## Payload-To-UI Mapping Table

| Ture payload field | Avanza UI concept/label observed | Required? | Future agent-fill candidate? | Human verification required? | Forbidden/final action? | Risk notes |
| --- | --- | --- | --- | --- | --- | --- |
| Broker target / Avanza | Avanza real broker UI | Yes | No | Yes | No | Broker target must be explicit; no fallback to another broker. |
| Account label | Account selector | Yes | No | Yes | No | High wrong-account risk; user must verify account manually. |
| Instrument/ticker | Search query, search result, instrument detail page, `Om depåbeviset` | Yes | Later, after mapping and approval | Yes | No | Must verify ticker/name/instrument type; ADR/depository receipt details can matter. |
| Side/action buy/sell | Buy/sell buttons and buy/sell-specific order forms | Yes | No until separately approved | Yes | No | Wrong-side risk is high; human verification required. |
| Quantity | Quantity / `antal` | Yes for share-count orders | Later, after mapping and approval | Yes | No | Must reconcile with amount, price, and max cap. |
| Amount in SEK | Amount field/display in SEK | Context-dependent | Later, after mapping and approval | Yes | No | Amount-vs-quantity ambiguity must be resolved before fill automation. |
| Order type | `Avancerad`, `Stop Loss`, `Glidande` | Yes | Later for one approved type only | Yes | No | Order-type-specific fields vary; first future scope should target only one type. |
| Entry / limit price | Price / `kurs` | Yes for limit-style flow | Later, after mapping and approval | Yes | No | Price precision/defaults require mapping; stale prices must block. |
| Stop | Stop Loss form trigger/condition fields | Only for stop flows | No for first POC | Yes | No | More complex; defer until stop form is separately mapped. |
| Target | Not an Avanza order field in observed screenshots | No | No | Yes | No | Ture target remains planning/verification context, not broker field. |
| Risk per share | Not an Avanza order field in observed screenshots | No | No | Yes | No | Ture risk metric only; must not imply broker-side stop unless explicitly mapped. |
| Planned risk | Not an Avanza order field in observed screenshots | No | No | Yes | No | Use for safety/readback, not direct broker fill. |
| Validity / active until | Validity/date area if visible, order-type-dependent | Context-dependent | No for first POC | Yes | No | Must be mapped per order type and market. |
| Fees / `avgifter` | Fees/cost display | Readback | No | Yes | No | Read-only verification; do not agent-fill. |
| Total amount | Total amount display | Readback | No | Yes | No | Must be checked against max amount before any future review step. |
| Payload id | No direct Avanza field | No | No | Yes | No | Use only in Ture logs/evidence; never place in broker UI unless approved. |
| Final confirmation | `Bekräfta köp` / `Bekräfta sälj` | Only for real order execution | Never | Yes | Yes | Agent must never click or submit final broker action. |

## Field Classification

Agent-fill candidates later, only after explicit approval:

- ticker/instrument search;
- quantity;
- amount;
- price/limit;
- order type, limited to one approved order type.

Human verification required:

- account;
- instrument identity;
- buy/sell side;
- quantity/amount;
- price;
- total amount;
- fees;
- final modal summary.

Forbidden/final action:

- `Bekräfta köp`;
- `Bekräfta sälj`;
- any final submit/click;
- any unattended order placement.

## Order Type Mapping

### Avancerad

- Likely first candidate for any future fill-only POC.
- Still no final click.
- Needs exact field mapping for account, side, quantity/amount, `kurs`, fees,
  total, and review behavior.

### Stop Loss

- More complex; defer.
- Requires trigger/condition mapping.
- Requires validation/error mapping for trigger-specific fields.

### Glidande

- More complex; defer.
- Requires trailing/condition mapping.
- Requires separate review of dynamic behavior and defaults.

First future scope should target one simple order type only.

## Confirmation Modal Mapping

- `Granska köp` / `Granska sälj` opens the modal.
- Modal shows order summary.
- Modal may include:
  - instrument;
  - account;
  - quantity;
  - price;
  - amount;
  - fees/courtage;
  - FX/currency information if applicable;
  - total;
  - validity.
- `Avbryt` is the safe exit.
- `Bekräfta köp` / `Bekräfta sälj` is hard-forbidden for agent.
- Future semi-auto may stop at the modal only if explicitly approved later.

## Validation/Error Mapping

- Missing/invalid fields display validation messages.
- Agent must not proceed if validation errors are present.
- Field-level validation must be mapped before fill automation.
- Future fill-only POC must include validation-error detection.
- Validation errors must be treated as a safe blocked state, not as a reason to
  guess or retry broadly.

## Safety Gates Before Any Future Avanza Fill-Only POC

- Mapping spec complete.
- Max amount policy implemented.
- Order type constrained.
- Account human-verified.
- Side/action human-verified.
- Ticker/instrument human-verified.
- Quantity/amount within cap.
- Stale/blocked payload rejected.
- Final confirmation hard stop.
- Kill switch/cancel plan.
- No automatic submit.
- No credential/2FA handling.
- Explicit user approval.

## Ambiguities And Open Questions

- No DOM selectors yet.
- UI may differ by account, instrument, market, currency, and order type.
- Exact behavior of the review modal may vary.
- Relationship between amount and quantity needs careful mapping.
- US currency/FX estimates need mapping.
- Validation-error detection must be reliable before any fill automation.
- It is not yet decided whether a future agent may safely open the review modal.
- It is not yet decided whether first Avanza fill-only POC should stop before
  or after `Granska köp`/`Granska sälj`.
- Max amount enforcement is not implemented yet.

## Result Status

`real_avanza_ui_mapping_spec_created`

## Recommended Next Action

Action 1011 - Define Real Avanza Fill-Only POC Gate And Max Amount Policy.

## Validation Results

- Documentation/static review completed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`.
- Audit writer runtime path import search returned no app/components/hooks
  matches.
- Route/provider/scan static search was not invoked as runtime behavior; it
  returned existing source and legacy edit-conflict references only.
- UI/app-shell audit writer import scan returned no matches.
- Market-loop/scanner search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` and service-role leakage search returned existing
  server-support aliases in `lib/supabase-server.ts` and
  `lib/active-scan-trace.ts`; no secret values were printed.
- Avanza-mapping-spec executable-code safety scan returned existing
  sandbox/test-only Avanza skeleton, mock-broker, localhost bridge, and safety
  contract references; no new executable Avanza integration was added by this
  action.
- Automatic-mode safety scan returned existing human-confirmation and boundary
  language only.
- Dead-doc/path scan returned no missing files.
- Result-status and next-action consistency scans passed.
- `git diff --check` passed.
- Touched-file trailing whitespace scan returned no matches.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.

## Action 1011 Fill-Only POC Gate And Max Amount Policy

- Result status:
  `real_avanza_fill_only_poc_gate_and_max_amount_policy_created`.
- Policy artifact:
  `docs/real-avanza-fill-only-poc-gate-and-max-amount-policy.md`.
- The policy defines the future fill-only scope, first allowed order type,
  1,000 SEK recommended initial max notional cap, allowed fill candidates,
  human-verification requirements, forbidden actions, POC gate checklist, block
  conditions, evidence requirements, and future POC result statuses.
- Final `Bekräfta köp` / `Bekräfta sälj` remains forbidden for agent.
- Recommended next action: Action 1012 - Add Max Amount And Final-Submit Guard
  Contract Tests.

## Not Performed

- No runtime code change.
- No browser automation.
- No Avanza integration.
- No Avanza access from code.
- No Avanza URL constant in runtime code.
- No real Avanza field filling by agent.
- No final `KOP`/`SALJ`, `KÖP`/`SÄLJ`, `Bekräfta köp`, or `Bekräfta sälj`
  click.
- No order placement.
- No credential storage.
- No login handling in code.
- No 2FA bypass.
- No provider call.
- No scan route invocation.
- No live market scan.
- No database write.
- No manual Supabase call.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No service-role value printed.
- No audit writer UI/browser/client invocation.
- No trade/stats/PnL mutation.
## Action 1012 - Max Amount And Final-Submit Guard Contract Tests

- Added `lib/real-avanza-fill-only-guard.ts` and
  `tests/e2e/real-avanza-fill-only-guard-contract.spec.ts`.
- Added proof doc `docs/real-avanza-fill-only-guard-contract-tests.md`.
- Result status:
  `real_avanza_fill_only_guard_contract_tests_added`.
- Mapping remains documentation/spec only for real Avanza. The new guard
  contract treats the first future POC as `Avancerad` buy only and blocks
  sell, `Stop Loss`, `Glidande`, cap-unknown, cap-exceeded, automatic-submit,
  and final-submit cases.
- Final `Bekräfta köp` / `Bekräfta sälj` remains human-only and forbidden for
  agent/Ture.
- Recommended next action: Action 1013 - Add Real Avanza Fill-Only POC
  Readiness Review.

## Action 1013 - Real Avanza Fill-Only POC Readiness Review

- Created `docs/real-avanza-fill-only-poc-readiness-review.md`.
- Result status:
  `real_avanza_fill_only_poc_readiness_review_created`.
- Readiness decision:
  `real_avanza_fill_only_poc_deferred_pending_dom_mapping`.
- The mapping spec is complete as screenshot/manual evidence, but it is not yet
  verified as real DOM selectors.
- Recommended next action: Action 1014 - Prepare Real Avanza DOM/Selector
  Reconnaissance Plan.

## Action 1014 - Real Avanza DOM/Selector Reconnaissance Plan

- Created `docs/real-avanza-dom-selector-reconnaissance-plan.md`.
- Result status:
  `real_avanza_dom_selector_recon_plan_created`.
- The plan upgrades the next mapping step from screenshot/manual evidence to
  human-led selector/label observation only. It still forbids agent field
  filling, final clicks, order placement, credentials, and session-token capture.
- Recommended next action: Action 1015 - Run Human-Led Real Avanza
  DOM/Selector Reconnaissance.

## Action 1015 - Real Avanza DOM/Selector Reconnaissance Results

- Created `docs/real-avanza-dom-selector-reconnaissance-results.md`.
- Result status:
  `real_avanza_dom_selector_recon_blocked`.
- Screenshot/manual mapping still exists, but DOM/selector mapping remains
  unverified because operator evidence was not available.
- Recommended next action: Action 1016 - Repeat Human-Led Real Avanza
  DOM/Selector Reconnaissance With Evidence.
