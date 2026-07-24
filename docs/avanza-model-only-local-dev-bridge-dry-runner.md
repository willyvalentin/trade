# Avanza Model-Only Local-Dev Bridge Dry Runner

Status: `avanza_model_only_local_dev_bridge_dry_runner_added`

## Current Status

The model-only local-dev bridge dry runner now exists as a pure
model/helper/docs/dev-QA layer after the disabled local-dev bridge runner
skeleton.

It answers what a future local-dev bridge run attempt would look like and where
it would stop. It simulates the bridge run to the invocation boundary only.

## Dry-Run Boundary

The dry runner requires a disabled runner report, local-dev bridge contract, and
activation checklist. Even when those inputs are valid and the checklist is
approved for disabled runner design, the dry-run remains model-only.

`model_dry_run_ready` means the dry-run report can describe the simulated path
to the invocation boundary. It is not runtime activation.

## Simulated Outcome

Successful model-only reports stop with:

- `dry_run_completed_to_invocation_boundary`
- `no_runtime_invocation`
- `bridge_gate_still_locked`
- `final_human_confirmation_preserved`

The dry runner may simulate receiving the bridge request candidate, validating
the activation checklist, validating terminal-only requirements, validating env
opt-in/manual confirmation/real-run flag requirements, and preparing a
smoke-runner request summary.

## Safety Guarantees

The dry runner does not open the bridge gate, invoke smoke runners, import
terminal scripts, start browser automation, call APIs, fetch or poll, access
credentials, read cookies, export sessions, automate BankID, submit orders,
click final KOP/SALJ, or write Supabase.

Cookies/session remain forbidden. BankID remains manual-only. Final
confirmation remains human-only. Controls remain disabled and the gate remains
locked.

## UI Boundary

The dev-only visual QA route can render fixture/model-only dry-run reports.
Default Trade UI remains visually unchanged and no active handoff, prepare
action, buy/sell CTA, browser automation, API route call, fetch/polling,
credential access, order submission, final KOP/SALJ click, or Supabase write is
added.

## Next Step

Any runtime bridge, model-to-runner handoff, terminal script invocation, smoke
runner invocation, browser automation, credential access, order submission, or
Supabase write remains a separate future approval task. This dry-run layer does
not approve those actions and is not production-ready.

## Bridge Readiness Checkpoint At Invocation Boundary

`docs/avanza-local-dev-bridge-readiness-checkpoint.md` now records the bridge
stack at the invocation boundary. It confirms that the bridge contract,
activation checklist, disabled runner skeleton, and model-only dry-run layer are
modeled, and that the dry-run reaches the invocation boundary only. Future work
must explicitly decide the next allowed design step. Runtime remains locked:
smoke runner invocation, terminal script invocation, browser automation,
credential access, cookies/session handling, BankID automation, order
submission, final KOP/SALJ agent clicks, Supabase writes, Trade UI active
handoff, API route activation, and production readiness remain blocked.

## Manual Invocation Approval Runbook

`docs/avanza-manual-local-dev-invocation-approval-runbook.md` now gates any
future invocation adapter design after this dry-run layer. The runbook can only
record manual evidence for design-only work. Runtime remains locked.

## Disabled Invocation Adapter Contract

`docs/avanza-disabled-local-dev-invocation-adapter-contract.md` now defines the
future adapter shape after the model-only dry-run layer. It remains disabled
contract only, models safe payload summaries, forbids sensitive payload, and
keeps runtime locked.

## Disabled Invocation Adapter Payload Validator

`docs/avanza-disabled-invocation-adapter-payload-validator.md` now validates
disabled invocation adapter design-review payloads only. It rejects sensitive
payload and runtime capabilities, and runtime remains locked.
