# First Real Avanza Fill-Only POC Implementation Stub

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
- The adapter composes this implementation stub and blocks unless the stub
  remains safe.
- Recommended next action: Action 1036 - Add First Fill-Only POC Manual Run
  Setup Simulation.

## Action 1034 Manual Run Setup Gate Update

- Created `docs/first-real-avanza-fill-only-poc-manual-run-setup-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_run_setup_gate_added`.
- Gate decision: `manual_run_setup_gate_ready`.
- The implementation stub remains non-executing; Action 1034 adds only a
  documentation decision gate.
- Recommended next action: Action 1035 - Add First Fill-Only POC Manual Run
  Setup Adapter.

## Action 1033 Operator Setup Evidence Completion Update

- Updated
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_ready_for_manual_run_setup`.
- This remains documentation-only; the implementation stub remains
  non-executing.
- Recommended next action: Action 1034 - Add First Fill-Only POC Manual Run
  Setup Gate.

## Action 1032 Operator Setup Evidence Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-evidence.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_evidence_added`.
- Setup readiness decision: `operator_setup_deferred`.
- Operator setup evidence capture is documentation-only; the implementation
  stub remains non-executing.
- Recommended next action: Action 1033 - Complete Operator Setup Evidence.

## Action 1031 Operator Setup Checklist Update

- Created
  `docs/gated-real-avanza-fill-only-adapter-operator-setup-checklist.md`.
- Result status:
  `gated_real_avanza_fill_only_adapter_operator_setup_checklist_added`.
- Setup readiness decision: `operator_setup_deferred`.
- This update is documentation-only; the implementation stub and gated
  skeleton remain non-executing.
- Recommended next action: Action 1032 - Capture Gated Adapter Operator Setup
  Evidence.

## Action 1030 Gated Adapter Skeleton Update

- Created `docs/gated-real-avanza-fill-only-adapter-skeleton.md`.
- Added `lib/gated-real-avanza-fill-only-adapter-skeleton.ts`, which composes
  this implementation stub with the approval, dry-run, guard, and selector
  contracts.
- Result status: `gated_real_avanza_fill_only_adapter_skeleton_added`.
- The adapter skeleton is disabled by default and remains non-executing; this
  implementation stub remains a decision/metadata helper only.
- Recommended next action: Action 1031 - Add Gated Adapter Operator Setup
  Checklist.

## Action 1029 Real-Run Readiness Gate Update

- Created `docs/first-real-avanza-fill-only-poc-real-run-readiness-gate.md`.
- Result status:
  `first_real_avanza_fill_only_poc_real_run_readiness_gate_added`.
- Readiness decision:
  `ready_for_first_fill_only_poc_implementation_gate`.
- The current implementation stub remains non-executing. The next step may add
  a gated adapter skeleton, disabled by default.
- Recommended next action: Action 1030 - Add Gated Real Avanza Fill-Only
  Adapter Skeleton.

## Action 1028 Manual Approval Capture Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-capture.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_capture_added`.
- Approval decision:
  `approved_for_first_fill_only_poc`.
- The implementation stub remains non-executing; approval capture does not add
  Avanza access, browser automation, DOM query, field fill, click, submit, or
  order placement.
- Recommended next action: Action 1029 - Add First Fill-Only POC Real-Run
  Readiness Gate.

## Action 1027 Manual Approval Message Update

- Created `docs/first-real-avanza-fill-only-poc-manual-approval-message.md`.
- Result status:
  `first_real_avanza_fill_only_poc_manual_approval_message_added`.
- The implementation stub remains non-executing and the manual approval state
  remains `not_approved_yet` until the exact approval phrase is captured.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, Supabase call, migration, typegen, generated
  type edit, `.env.local` change, real trade, or trade/stats/PnL mutation was
  performed.
- Recommended next action: Action 1028 - Capture First Fill-Only POC Manual
  Approval.

## Action 1026 Runbook Update

- Created `docs/first-real-avanza-fill-only-poc-runbook.md`.
- Result status: `first_real_avanza_fill_only_poc_runbook_added`.
- The runbook is operator-facing documentation only. It defines required
  approval, roles, pre-run checklist, locked scope, future conditional sequence,
  hard stops, evidence capture, pass/fail criteria, abort/kill switch, and
  post-run documentation template.
- No runtime code, Avanza access, browser automation, DOM query, field fill,
  click, submit, broker behavior, provider/route/scan invocation, Supabase
  call, migration, type generation, generated type edit, `.env.local` change,
  real trade, or trade/stats/PnL mutation was performed.
- Recommended next action: Action 1027 - Add First Fill-Only POC Manual
  Approval Message.

## Purpose

Action 1025 adds a first real Avanza fill-only POC implementation stub.

This is non-executing scaffolding. It is not the real run. It does not access
Avanza, launch or control a browser, query the DOM, fill fields, click buttons,
open `Granska köp`, click `Bekräfta köp`, click `Bekräfta sälj`, submit an
order, call providers/routes/scans, call Supabase, or mutate trades/stats/PnL.

## Implementation

- Helper path:
  `lib/first-real-avanza-fill-only-poc-implementation-stub.ts`.
- Test path:
  `tests/e2e/first-real-avanza-fill-only-poc-implementation-stub.spec.ts`.
- Dependencies:
  - Approval state contract:
    `lib/first-real-avanza-fill-only-poc-approval-state-contract.ts`.
  - Dry-run harness:
    `lib/first-real-avanza-fill-only-poc-dry-run-harness.ts`.
  - Fill-only guard and selector policy through the dry-run harness.
  - Selector mapping contract:
    `lib/real-avanza-selector-mapping-contract.ts`.

Result statuses:

- `not_approved`
- `stub_ready`
- `blocked`
- `failed_safety`

The exported decision builder is:

`buildFirstRealAvanzaFillOnlyPocImplementationStubDecision(input)`

It evaluates the approval state, evaluates the dry-run harness with the
approval decision, exposes planned selector/evidence metadata, and returns a
decision only. It never performs actions.

## Capability Flags

All capability flags are false:

- `can_access_avanza: false`
- `can_launch_browser: false`
- `can_query_dom: false`
- `can_fill_fields: false`
- `can_click_review: false`
- `can_click_final_confirm: false`
- `can_submit_order: false`

## Planned Future Field Targets

- Amount: `input[data-e2e="inputAmount"]`
- Price: `input[data-e2e="inputPrice"]`
- Total: `output[data-e2e="expandOrderAmount"]`
- Instrument summary: `[data-e2e="orderMarketInfoPanel"]`
- Buy-side verification:
  `button[data-e2e="switchSideButton"][aria-label="Byt till sälj"]`
- Limit/Avancerad verification: `input[type="radio"][value="Limit"]`

These are metadata only in this action. They are not executable selectors in a
browser session.

## Forbidden And Blocked Selectors

Permanently forbidden final selectors:

- `button[data-e2e="confirmOrderButton"]`
- `button[data-e2e="confirmOrderButton"][data-mint-button-theme="buy"]`
- `button[data-e2e="confirmOrderButton"][data-mint-button-theme="sell"]`

Blocked first POC review selectors:

- Review buy button:
  `button[data-e2e="orderButton"][data-mint-button-theme="buy"]`
- Review sell button:
  `button[data-e2e="orderButton"][data-mint-button-theme="sell"]`

## Stop Point

Stop point:

`before_review_button`

The first POC remains stopped before `Granska köp`; no modal is opened and no
final confirm is allowed.

## Safety Confirmation

- No runtime Avanza access.
- No browser automation.
- No DOM query.
- No field filling.
- No clicking.
- No submit.
- No Supabase/audit/provider/route/scan call.
- No trade/PnL mutation.

## Test Coverage

New test file:

`tests/e2e/first-real-avanza-fill-only-poc-implementation-stub.spec.ts`

The tests cover:

- Default not approved without explicit approval.
- `stub_ready` only with valid approval contract and safe harness decision.
- Avanza access capability remains false.
- Browser launch/control capability remains false.
- DOM query capability remains false.
- Field filling capability remains false.
- Review click capability remains false.
- Final confirm capability remains false.
- Order submit capability remains false.
- Planned amount, price, total, instrument, side, and order type selectors are
  exposed.
- Forbidden final selectors are exposed.
- Review selector is blocked for first POC.
- Stop point is before review button.
- Missing approval blocks.
- Review-click approval blocks.
- Final-confirm approval blocks.
- Cap above 1,000 SEK blocks.
- Invalid side blocks.
- Invalid order type blocks.
- Selector policy/harness failure blocks.
- Module imports remain pure and non-executing.

## Result Status

`first_real_avanza_fill_only_poc_implementation_stub_added`

## Recommended Next Action

Action 1026 - Add First Fill-Only POC Runbook.

Reason: after the non-executing implementation stub exists, the next step is a
manual runbook for the eventual real POC. Still no real run.

## Validation Results

- New implementation stub tests passed with 21/21 assertions.
- Focused approval, guard, selector, semi-auto, and sandbox safety suite passed
  with 170/170 assertions. Playwright required local web-server bind escalation
  because the sandbox blocks port 3010 with `EPERM`; no Avanza network or
  browser automation against Avanza was used.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`.
- Audit writer runtime path import search returned no app/components/hooks
  matches.
- Stub executable safety scan returned no forbidden browser, Playwright,
  Puppeteer, DOM, fetch, Supabase, environment, service-role, provider, route,
  audit-writer, broker, click, locator, goto, or fill behavior.
- Route/provider and service-role broad scans returned expected existing
  app/docs/test/lib references only; no routes were invoked and no secrets were
  printed.
- Automatic-mode safety scan returned expected block-policy and test references
  only.
- Referenced-path, result-status, next-action, `git diff --check`, touched-file
  trailing whitespace, zero-byte docs, and `.env.local` diff checks passed.

## Not Performed

- No real Avanza access.
- No browser automation.
- No DOM query.
- No runtime Avanza integration.
- No field filling.
- No click.
- No submit.
- No `Granska köp`.
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
