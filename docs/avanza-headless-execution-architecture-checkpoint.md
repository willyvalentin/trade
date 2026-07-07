# Avanza Headless Execution Architecture Checkpoint

## Current Status

The headless execution architecture is now checkpointed for the Sharp Semi Auto
Execution Agent. The full under-surface agent brain loop is now checkpointed:
contract -> selector -> plan -> session -> orchestration.

This checkpoint is model/docs/dev-QA only. It does not execute anything and does
not open any activation gate.

## Architecture Chain

The checkpoint covers:

- headless execution data contract
- headless execution contract selector
- headless Avanza agent plan builder
- headless execution session state machine
- headless execution orchestration pipeline
- local-dev login smoke scaffold
- local-dev order smoke scaffold
- local-dev order/search executor and binding as modeled/local-dev-only
- settlement reconciliation as model/mock-only
- Settings passive readiness panel
- default-off Trade card visual readiness
- safety guards

The UI remains intentionally simple. Execution behavior stays under the surface.

## Activation Gates

Next work must pass through activation gates:

- UI simplicity gate is locked.
- Trade UI execution gate is locked.
- API route execution gate is locked.
- Local-dev bridge gate is not open.
- Browser automation gate is locked.
- Credential access gate is locked.
- Cookie/session gate is forbidden.
- BankID automation is forbidden and BankID remains manual-only for the user.
- Order submit gate is forbidden.
- Final KOP/SALJ gate is forbidden for the agent and human-only for the user.
- Supabase execution write gate is locked.
- Settlement reconciliation write gate is locked.
- Production readiness is blocked.

## Current Ready Capabilities

Ready capabilities are review capabilities only: contract review, selector
review, plan-builder review, session state-machine review, orchestration
pipeline review, passive Settings readiness review, default-off Trade card
readiness review, safety guard review, and local-dev bridge design discussion.

## Blocked Capabilities

Blocked capabilities include active Trade UI execution, enabled API route
execution, browser automation now, credential access, cookies/session handling,
BankID automation, order submission, final KOP/SALJ click by agent, Supabase
execution writes, settlement reconciliation writes, and production readiness.

## Local-Dev Bridge

Local-dev bridge is the next possible design step but still locked. A future
bridge must be planned separately, manually reviewed, local-dev only, and must
not imply production readiness.

## Safety Boundary

This checkpoint does not start handoff, does not prepare orders now, does not
run smoke tests from UI, does not call API routes, does not fetch or poll, does
not start browser automation now, does not access credentials, does not read
cookies or export sessions, does not automate BankID, does not submit orders,
does not click final KOP/SALJ, does not write Supabase, and does not claim
production readiness.

Final KOP/SALJ remains human-only.

## Not Production Ready

This checkpoint is not production-ready. It is a safety and activation gate map
for deciding what must be reviewed before any local-dev execution bridge or real
browser run is attempted.

## Local-Dev Bridge Contract

`docs/avanza-local-dev-bridge-contract.md` now models the next locked bridge
contract from a ready headless orchestration report to a future terminal-only
smoke-runner request candidate. The local-dev bridge contract is modeled but
locked; it does not open the local-dev bridge gate, invoke smoke runners,
import terminal scripts, start browser automation, call APIs, access
credentials, handle cookies/session, automate BankID, submit orders, click
final KOP/SALJ, or write Supabase.
It is the next locked review step before any actual bridge invocation.

## Local-Dev Bridge Activation Checklist

`docs/avanza-local-dev-bridge-activation-checklist.md` now models the approval
checklist that must pass before any disabled bridge runner design. It can approve
design review only; it does not open runtime, invoke smoke runners, start
browser automation, access credentials, submit orders, click final KOP/SALJ, or
write Supabase. Real-run remains forbidden.

## Disabled Local-Dev Bridge Runner Skeleton

`docs/avanza-disabled-local-dev-bridge-runner.md` now models the disabled
runner skeleton after the bridge contract and activation checklist. It is
report-only and hidden/headless. It can accept the bridge contract plus
activation checklist as model inputs, but disabled runner design approval does
not open runtime. The bridge gate remains locked, smoke runner invocation and
terminal script invocation remain blocked, browser automation and credential
access remain locked, cookies/session remain forbidden, BankID remains
manual-only, order submission remains forbidden, final KOP/SALJ remains
human-only, Supabase writes remain locked, and production readiness remains
blocked.

## Model-Only Local-Dev Bridge Dry Runner

`docs/avanza-model-only-local-dev-bridge-dry-runner.md` now models the next
model-only dry-run layer after the disabled runner skeleton. It simulates the
future bridge run to the invocation boundary only. The local-dev bridge gate remains
locked, smoke runner invocation and terminal script invocation remain blocked,
browser automation and credential access remain locked, cookies/session remain
forbidden, BankID remains manual-only, order submission remains forbidden,
final KOP/SALJ remains human-only, Supabase writes remain locked, and
production readiness remains blocked.

## Local-Dev Bridge Readiness Checkpoint

`docs/avanza-local-dev-bridge-readiness-checkpoint.md` now adds the bridge
readiness checkpoint at the invocation boundary. The bridge stack has a
checkpoint at invocation boundary, future work must explicitly decide the next
allowed design step, and runtime remains locked. The checkpoint remains
model/docs/dev-QA only and does not open smoke runners, terminal scripts,
browser automation, credentials, cookies/session, BankID automation, order
submission, final KOP/SALJ agent clicks, Supabase writes, Trade UI active
handoff, API route activation, or production readiness.

## Manual Invocation Approval Runbook

`docs/avanza-manual-local-dev-invocation-approval-runbook.md` now gates any
future invocation adapter design. It can approve only design-only adapter work
after manual review evidence is accepted. Runtime remains locked.

## Disabled Invocation Adapter Contract

`docs/avanza-disabled-local-dev-invocation-adapter-contract.md` now defines the
future adapter shape only. It models target request shape and safe payload
summary between the dry-run layer and local smoke-runner layer, but runtime
remains locked.
