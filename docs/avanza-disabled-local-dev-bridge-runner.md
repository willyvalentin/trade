# Avanza Disabled Local-Dev Bridge Runner

Status: `avanza_disabled_local_dev_bridge_runner_skeleton_added`

## Current Status

The disabled local-dev bridge runner skeleton now exists as a pure
model/helper/docs/dev-QA layer. It accepts the local-dev bridge contract and
activation checklist only as explicit model inputs and produces a disabled
runner readiness report.

The report is not a runtime bridge. It does not open runtime and does not open
the local-dev bridge gate. It does not invoke smoke runners. It is
hidden/headless, agent-readable, and not production-ready.

## Runner Boundary

The skeleton can report whether the bridge contract exists, whether the
activation checklist exists, and whether the checklist is approved for disabled
runner design. Disabled runner design approval is not runtime approval.

`ready_disabled_report` means only that the disabled skeleton report is valid.
It does not mean a runner can execute, call a route, start a browser, access
credentials, or prepare a real order.

## Disabled Steps

The runner report models these steps as disabled, blocked, modeled, or
forbidden:

1. Receive bridge contract.
2. Verify activation checklist.
3. Verify terminal-only path.
4. Verify env opt-in.
5. Verify manual terminal confirmation.
6. Verify real-run flag status.
7. Prepare smoke request candidate.
8. Invoke login smoke runner.
9. Invoke order smoke runner.
10. Invoke browser automation.
11. Capture result.
12. Reconcile settlement.

Invocation steps remain disabled or forbidden. Settlement reconciliation is
future-only.

## Safety Guarantees

The runner cannot open the bridge gate, invoke smoke runners, run terminal
scripts, start browser automation, call APIs, fetch or poll, access credentials,
read cookies, export sessions, automate BankID, submit orders, click final
KOP/SALJ, or write Supabase.

Cookies/session handling remains forbidden. BankID remains manual-only. Final
KOP/SALJ remains human-only. Controls remain disabled and the gate remains
locked.

## UI Boundary

The dev-only visual QA route can render fixture/model-only runner reports.
Default Trade UI remains visually unchanged and no active handoff, prepare
action, buy/sell CTA, browser automation, API route call, fetch/polling,
credential access, order submission, final KOP/SALJ click, or Supabase write is
added.

## Next Step

Next work may design a model-only dry-run runner through a separate task and
gate. That future work still must not open runtime, invoke smoke runners, start
browser automation, access credentials, submit orders, click final KOP/SALJ, or
write Supabase unless another explicit approval phase defines and approves
those boundaries.

## Model-Only Dry Runner

`docs/avanza-model-only-local-dev-bridge-dry-runner.md` now adds that
model-only dry-run layer after the disabled runner skeleton. The dry-run layer
can consume the disabled runner report, bridge contract, and activation
checklist as model inputs and simulate the path to the invocation boundary. It
stops before smoke runner invocation, terminal script invocation, browser
automation, credential access, order submission, final KOP/SALJ, and Supabase
writes. It is not runtime activation.

## Bridge Readiness Checkpoint

`docs/avanza-local-dev-bridge-readiness-checkpoint.md` now adds the checkpoint
at the invocation boundary. The bridge stack has a checkpoint at invocation
boundary, future work must explicitly decide the next allowed design step, and
runtime remains locked. The checkpoint does not approve runtime activation,
Trade UI active handoff, API route activation, browser automation, credentials,
order submission, final KOP/SALJ agent clicks, or Supabase writes.

## Manual Invocation Approval Runbook

`docs/avanza-manual-local-dev-invocation-approval-runbook.md` now gates any
future invocation adapter design after the disabled runner skeleton. The
runbook is manual-review evidence only and does not invoke the runner. Runtime
remains locked.

## Disabled Invocation Adapter Contract

`docs/avanza-disabled-local-dev-invocation-adapter-contract.md` now defines the
future adapter shape only. It may receive disabled runner and dry-run summaries
as model inputs, but it does not invoke the runner. Runtime remains locked.
