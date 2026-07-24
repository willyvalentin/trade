# Avanza Local-Dev Bridge Activation Checklist

Status: `avanza_local_dev_bridge_activation_checklist_added`

## Current Status

The local-dev bridge activation checklist is now modeled as a locked,
under-surface approval gate before any disabled bridge runner design. It is
model/docs/dev-QA only and does not open the bridge gate.

The checklist is required before disabled bridge runner design. Disabled runner
design approval is not runtime approval.

## Checklist Boundary

The checklist reviews the headless execution architecture checkpoint, the
local-dev bridge contract, the orchestration report shape, and the safety
policies that must remain locked before any future disabled runner design.

It does not invoke smoke runners, does not import terminal scripts, does not
start browser automation, cannot call APIs, cannot fetch or poll, cannot access
credentials, cannot read cookies or export sessions, cannot automate or bypass
BankID, cannot submit orders, cannot click final KOP/SALJ, and does not write
Supabase.

## Approval Levels

The default state is ready for manual review when the bridge contract and
architecture checkpoint exist. The checklist can model approval for disabled
runner design only after operator review, safety review, credential-provider
review, cookie/session policy review, BankID policy review, final-click policy
review, order-submit policy review, Supabase write policy review, and explicit
disabled-runner-design request are all present.

Model-only dry-run is not yet approved by this task. Real-run remains
forbidden. Production readiness remains blocked.

## Required Future Gates

Future work still requires explicit env opt-in, manual terminal confirmation,
and a separate real-run flag before any local-dev run can even be discussed.
Those gates are modeled as requirements only.

Cookies/session handling remains forbidden. BankID automation is forbidden and
manual-only for the user. Final confirmation remains human-only; the agent
never clicks final KOP/SALJ.

## UI Boundary

The Ture UI remains minimal and visually simple. The checklist is
agent-readable and UI-hidden by default. The dev-only visual QA route can show
fixture/model-only checklist states, but the default Trade UI receives no
visible execution controls, active handoff, prepare action, buy/sell CTA,
browser automation, API route call, fetch/polling, credential access, order
submission, final KOP/SALJ click, or Supabase write.

## Next Step

The next possible step is a separate design task for a disabled bridge runner,
and only if this checklist approves disabled runner design. Runtime remains
locked unless a later explicit activation task opens new gates; this document
does not approve that.

## Disabled Runner Skeleton

`docs/avanza-disabled-local-dev-bridge-runner.md` now adds that disabled bridge
runner skeleton as report-only/model-only infrastructure. It accepts the bridge
contract and activation checklist only as model inputs. Disabled runner design
approval still does not open runtime: the bridge gate remains locked, smoke
runner invocation is blocked, terminal script invocation is blocked, browser
automation remains locked, credentials remain locked, cookies/session remain
forbidden, BankID remains manual-only, order submission remains forbidden,
final KOP/SALJ remains human-only, Supabase writes remain locked, and the layer
is not production-ready.

## Model-Only Dry Runner

`docs/avanza-model-only-local-dev-bridge-dry-runner.md` now models the next
model-only dry-run layer. Disabled runner design approval can feed a dry-run
report, but the dry-run stops at the invocation boundary and does not open
runtime.
Smoke runners, terminal scripts, browser automation, credentials,
cookies/session, BankID automation, order submission, final KOP/SALJ, and
Supabase writes remain blocked.

## Bridge Readiness Checkpoint

`docs/avanza-local-dev-bridge-readiness-checkpoint.md` now records a
model/docs/dev-QA checkpoint at the invocation boundary. It summarizes the
bridge contract, activation checklist, disabled runner skeleton, and model-only
dry-run layer. Future work must explicitly decide the next allowed design step.
Runtime remains locked, including smoke runners, terminal scripts, browser
automation, credentials, cookies/session, BankID automation, order submission,
final KOP/SALJ agent clicks, Supabase writes, Trade UI active handoff, API route
activation, and production readiness.

## Manual Invocation Approval Runbook

`docs/avanza-manual-local-dev-invocation-approval-runbook.md` now gates any
future invocation adapter design. The runbook is manual-review evidence only
and cannot open the bridge gate or approve runtime. Runtime remains locked.

## Disabled Invocation Adapter Contract

`docs/avanza-disabled-local-dev-invocation-adapter-contract.md` now defines the
future adapter shape only. The checklist can support design-only contract
review, but runtime remains locked.
