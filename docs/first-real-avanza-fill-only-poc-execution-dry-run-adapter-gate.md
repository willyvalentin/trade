# First Real Avanza Fill-Only POC Execution Dry-Run Adapter Gate

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

## Purpose

Action 1037 adds the decision gate for a future first real Avanza fill-only
POC execution dry-run adapter.

This is documentation and gate decision only. It is not the real run. It is
not implementation. It is not order execution. It does not access Avanza, open
or control a browser, query the DOM, fill fields, click buttons, click
`Granska kop`, click `Bekrafta kop`, click `Bekrafta salj`, submit an order,
or place a trade.

## Gate Basis

The gate basis is:

- Manual approval captured:
  `approved_for_first_fill_only_poc`.
- Operator setup evidence:
  `operator_setup_ready_for_manual_run_setup`.
- Manual run setup gate:
  `manual_run_setup_gate_ready`.
- Gated adapter skeleton exists.
- Manual run setup adapter exists.
- Manual run setup simulation passed.
- The setup adapter can reach `ready_for_fill_only_manual_setup`.
- Every execution capability flag remains false.
- Final confirmation remains permanently forbidden for Ture/agent behavior.

## Execution Dry-Run Adapter Prerequisites

| Prerequisite | Status | Notes |
| --- | --- | --- |
| Manual approval captured | Pass | Scope remains buy-only, Avancerad/Limit, amount-based, cap <= 1,000 SEK. |
| Operator setup ready | Pass | Operator handles login, account verification, instrument verification, credentials, and 2FA. |
| Manual run setup gate ready | Pass | Gate allows only future setup/dry-run planning, not real execution. |
| Manual run setup adapter exists | Pass | Adapter is disabled by default and non-executing. |
| Manual run setup simulation passed | Pass | Ready simulation keeps all execution capability flags false. |
| Guard/selector/cap/harness ready | Pass | Existing guard, selector mapping, cap policy, and dry-run harness remain the safety basis. |
| Execution adapter not added yet | Warn/expected | Future Action 1038 may add a disabled-by-default skeleton only. |
| No real fill performed yet | Warn/expected | No field fill, review click, final confirmation, submit, or order placement has occurred. |
| No run evidence package yet | Warn/expected | Evidence package belongs to a later separately approved run action. |

## Future Execution Dry-Run Adapter Scope

A future execution dry-run adapter must:

- Be disabled by default.
- Use an explicit input flag only.
- Support fill-only dry-run behavior only.
- Remain buy-only.
- Remain Avancerad/Limit only.
- Remain amount-based.
- Keep cap <= 1,000 SEK.
- Stop before `Granska kop`.
- Avoid opening the review modal.
- Keep review click false.
- Keep final confirmation false.
- Avoid submit/order placement.
- Require user/operator presence.
- Avoid unattended operation.
- Avoid credential handling.
- Avoid 2FA handling.
- Avoid session-token storage or capture.

## Required Hard Blocks

The future execution dry-run adapter must hard-block:

- Review click requested.
- Final confirmation requested.
- Submit/order placement requested.
- Browser or Avanza access without an explicit separately approved run action.
- DOM querying outside approved run mode.
- Sell side.
- Stop Loss.
- Glidande.
- Cap above 1,000 SEK.
- Account mismatch.
- Instrument mismatch.
- User/operator not present.
- Credentials handled by Ture/agent.
- 2FA handled by Ture/agent.
- Unattended operation.
- Any uncertainty about account, instrument, side, amount, price, total, or
  stop point.

## Gate Decision

`execution_dry_run_adapter_gate_ready`

This means the project is ready to add a future disabled-by-default execution
dry-run adapter. It does not mean ready to run that adapter against Avanza.
It does not approve Avanza access, browser automation, DOM querying, field
fill, review click, final confirmation, submit, order placement, or production
rollout.

## Required Constraints For Next Adapter

Action 1038 must:

- Be disabled by default.
- Use an explicit input flag only.
- Keep final confirmation false.
- Keep review click false.
- Avoid submit.
- Avoid order placement.
- Expose planned fill selectors.
- Expose blocked selectors.
- Expose evidence requirements.
- Not store credentials.
- Not store session tokens.
- Not mutate DB/trades/PnL.
- Not call Supabase.
- Not invoke providers, routes, scans, service-role adapters, or audit writer
  client paths.

## Result Status

`first_real_avanza_fill_only_poc_execution_dry_run_adapter_gate_added`

## Recommended Next Action

Action 1038 - Add First Fill-Only POC Execution Dry-Run Adapter Skeleton.

Reason: after the gate, the next step can add a disabled-by-default execution
dry-run adapter skeleton. It must still avoid real Avanza access unless a later
separate run action explicitly approves and enables it.

## Progress Update

- Ture production/data-health: 95-97%.
- Market-window live dry-run: 92-95%.
- Semi-auto agent foundation: 98-99%.
- Semi-auto Avanza/browser-agent readiness: 99%.
- Real browser automation readiness: 98-99%.
- First Avanza fill-only POC readiness: 99%.
- Full-auto readiness: 10-15%.
- Total Ture toward semi-auto MVP: 98-99%.
