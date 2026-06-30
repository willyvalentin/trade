# First Real Avanza Fill-Only POC Execution Dry-Run Adapter Skeleton

## Purpose

Action 1038 adds a pure, non-executing execution dry-run adapter skeleton for
the first real Avanza fill-only POC.

This is not the real run. The skeleton is disabled by default. It does not
access Avanza, launch or control a browser, query the DOM, fill fields, click
buttons, click `Granska kop`, click `Bekrafta kop`, click `Bekrafta salj`,
submit an order, call providers/routes/scans, call Supabase, invoke audit
writer client paths, or mutate trades/stats/PnL.

## Implementation

- Helper path:
  `lib/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton.ts`.
- Test path:
  `tests/e2e/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton.spec.ts`.
- Dependencies composed: manual run setup adapter, gated adapter skeleton,
  implementation stub, approval state contract, dry-run harness, fill-only
  guard, and selector mapping contract.
- Result statuses: `disabled`, `blocked`,
  `ready_for_execution_dry_run_setup`, and `failed_safety`.

## Disabled-By-Default Behavior

- Default status is `disabled`.
- The skeleton can only move past disabled when
  `execution_dry_run_adapter_enabled` is explicitly true in the input object.
- The enable flag only allows readiness and future dry-run setup metadata
  evaluation. It does not authorize real Avanza access, browser automation,
  DOM query, field fill, review click, final confirmation, submit, or order
  placement.
- The skeleton is enabled by test/config input only, not by environment
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

`ready_for_execution_dry_run_setup` means future dry-run setup metadata is
ready for a later separately approved local simulation or run step.

It does not perform fill. It does not approve clicking. It does not open the
review modal. It does not approve final confirmation. It does not access
Avanza. It does not place an order.

## Planned Dry-Run Steps Metadata

The skeleton returns metadata for:

- Verify operator/browser state.
- Verify instrument.
- Verify account.
- Verify buy side.
- Verify Limit/Avancerad.
- Prepare amount fill instruction for a future separate run action only.
- Prepare price fill instruction for a future separate run action only.
- Prepare total read instruction for a future separate run action only.
- Stop before review.

## Blockers

The skeleton blocks on:

- Missing manual setup readiness.
- Missing approval.
- Missing operator setup.
- Missing payload, selector, or operator approval snapshots.
- Cap above 1,000 SEK.
- Wrong side.
- Wrong order type.
- Review requested.
- Final confirm requested.
- Submit/order placement requested.
- Forbidden action requested.
- Missing evidence plan.
- Missing screenshot redaction acknowledgement.
- Any safety failure from the composed setup adapter, skeleton, stub, harness,
  guard, or selector policy.

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
`tests/e2e/first-real-avanza-fill-only-poc-execution-dry-run-adapter-skeleton.spec.ts`.

Coverage confirms:

- Adapter defaults to disabled.
- Disabled result has all capability flags false.
- Enabled without manual setup readiness blocks.
- Enabled without approval blocks.
- Enabled without operator setup blocks.
- Cap above 1,000 SEK blocks.
- Wrong side blocks.
- Wrong order type blocks.
- Review requested blocks.
- Final confirmation requested blocks.
- Safe setup can return `ready_for_execution_dry_run_setup`.
- Ready result still has all capability flags false.
- Planned dry-run steps, stop point, evidence requirements, hard forbidden
  selectors, and blocked review selectors are exposed.
- Exported result/function names do not imply submit/order placement.
- Module imports remain pure and local.

## Result Status

`first_real_avanza_fill_only_poc_execution_dry_run_adapter_skeleton_added`

## Recommended Next Action

Action 1039 - Add First Fill-Only POC Execution Dry-Run Simulation.

Reason: after the execution dry-run adapter skeleton exists, simulate the
dry-run setup locally before any real execution path is attempted.

## Progress Update

- Ture production/data-health: 95-97%.
- Market-window live dry-run: 92-95%.
- Semi-auto agent foundation: 98-99%.
- Semi-auto Avanza/browser-agent readiness: 99%.
- Real browser automation readiness: 98-99%.
- First Avanza fill-only POC readiness: 99%.
- Full-auto readiness: 10-15%.
- Total Ture toward semi-auto MVP: 98-99%.
