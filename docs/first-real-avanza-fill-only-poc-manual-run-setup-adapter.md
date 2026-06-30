# First Real Avanza Fill-Only POC Manual Run Setup Adapter

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

## Purpose

Action 1035 adds a pure manual run setup adapter for the first real Avanza
fill-only POC.

This is not the real run. The adapter is disabled by default. It does not
access Avanza, launch or control a browser, query the DOM, fill fields, click
buttons, click `Granska köp`, click `Bekräfta köp`, click `Bekräfta sälj`,
submit an order, call providers/routes/scans, call Supabase, invoke audit
writer client paths, or mutate trades/stats/PnL.

## Implementation

- Helper path:
  `lib/first-real-avanza-fill-only-poc-manual-run-setup-adapter.ts`.
- Test path:
  `tests/e2e/first-real-avanza-fill-only-poc-manual-run-setup-adapter.spec.ts`.
- Dependencies composed: gated adapter skeleton, implementation stub, approval
  state contract, dry-run harness, fill-only guard, and selector mapping
  contract.
- Result statuses: `disabled`, `blocked`,
  `ready_for_fill_only_manual_setup`, and `failed_safety`.

## Disabled-By-Default Behavior

- Default status is `disabled`.
- The adapter can only move past disabled when
  `manual_run_setup_adapter_enabled` is explicitly true in the input object.
- The enable flag only allows readiness and instruction generation. It does
  not authorize real fill behavior, clicking, review modal opening, final
  confirmation, order placement, or runtime Avanza access.
- The adapter is enabled by test/config input only, not by environment
  variables.

## Capability Flags

All capability flags remain false in every status:

| Capability | Value |
| --- | --- |
| `can_access_avanza` | `false` |
| `can_launch_browser` | `false` |
| `can_query_dom` | `false` |
| `can_fill_fields` | `false` |
| `can_click_review` | `false` |
| `can_click_final_confirm` | `false` |
| `can_submit_order` | `false` |

## Ready Status Meaning

`ready_for_fill_only_manual_setup` means the setup instructions are ready for a
future separately approved manual setup simulation/run step.

It does not perform fill. It does not approve clicking. It does not open the
review modal. It does not approve final confirmation. It does not place an
order.

## Planned Instruction Set

The adapter returns instruction metadata for:

- Verify instrument.
- Verify account.
- Verify buy side.
- Verify Limit/Avancerad.
- Carry planned amount value for a future separate run action only.
- Carry planned price value for a future separate run action only.
- Read total in a future separate run action only.
- Stop before review.

## Blockers

The adapter blocks on:

- Missing approval.
- Missing operator setup.
- Skeleton blocked.
- Guard/harness blocked.
- Cap above 1,000 SEK.
- Wrong side.
- Wrong order type.
- Review click requested.
- Final confirm requested.
- Missing evidence plan.
- Missing screenshot redaction acknowledgement.
- Any forbidden action requested.

## Safety Confirmation

- No runtime Avanza access.
- No browser automation.
- No DOM query.
- No actual field filling.
- No clicking.
- No submit.
- No Supabase/audit/provider/route/scan invocation.
- No trade/PnL mutation.
- No credentials/session token handling.
- No 2FA handling by Ture or agent.
- No `.env.local` dependency or change.

## Test Coverage

New test file:
`tests/e2e/first-real-avanza-fill-only-poc-manual-run-setup-adapter.spec.ts`.

Coverage confirms:

- Adapter defaults to disabled.
- Disabled result has all capability flags false.
- Enabled without approval blocks.
- Enabled without operator setup evidence blocks.
- Enabled with skeleton blocked blocks.
- Enabled with invalid guard/harness blocks.
- Cap above 1,000 SEK blocks.
- Wrong side blocks.
- Wrong order type blocks.
- Review click requested blocks.
- Final confirm requested blocks.
- Safe input can return `ready_for_fill_only_manual_setup`.
- Ready result still has all capability flags false.
- Planned instructions, stop point, evidence requirements, and forbidden
  selectors are exposed.
- Planned instructions do not imply submit/order placement.
- Module imports remain pure and local.

## Result Status

`first_real_avanza_fill_only_poc_manual_run_setup_adapter_added`

## Recommended Next Action

Action 1036 - Add First Fill-Only POC Manual Run Setup Simulation.

Reason: after the adapter exists, simulate the manual-run setup decision
locally before any real execution path is attempted.

## Progress Update

- Ture production/data-health: 95-97%.
- Market-window live dry-run: 92-95%.
- Semi-auto agent foundation: 98-99%.
- Semi-auto Avanza/browser-agent readiness: 99%.
- Real browser automation readiness: 99%.
- First Avanza fill-only POC readiness: 99%.
- Full-auto readiness: 10-15%.
- Total Ture toward semi-auto MVP: 98-99%.
