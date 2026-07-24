# Avanza Disabled Local-Dev Invocation Adapter Contract

Status: `avanza_disabled_local_dev_invocation_adapter_contract_added`

## Purpose

The disabled local-dev invocation adapter contract defines the future adapter shape between the model-only bridge dry-run layer and the local smoke-runner invocation layer.

It is model/docs/dev-QA only. It answers what an adapter would receive, what safe summary fields it could pass forward in a later approved phase, which gates it must check, where it stops today, and which actions remain impossible.

## Contract Boundary

The contract requires design-only approval from the manual local-dev invocation approval runbook. That approval is for contract design only and does not approve runtime.

The contract does not cross the invocation boundary. It does not invoke smoke runners. It does not import terminal scripts. It does not start browser automation. It cannot call APIs. It cannot access or carry credentials. It cannot carry cookies, session tokens, account numbers, or order ids. It cannot submit orders. It cannot click final KÖP/SÄLJ. It does not write Supabase.

## Request Shape

The modeled request shape is terminal-only, local-dev-only, and model-only by default. It requires design approval, later runtime approval, explicit env opt-in, manual terminal confirmation, and a separate real-run flag before any future runtime path could be considered.

The safe payload summary may include selected ticker, side, quantity, limit price, request kind, dry-run id, bridge checkpoint id, and approval runbook id. Sensitive payload is forbidden.

Forbidden payload fields include raw credentials, cookies, session tokens, account numbers, order ids, BankID artifacts, unredacted screenshots, and raw broker confirmations.

## Required Gates

- Design-only approval gate.
- Runtime approval gate locked.
- Invocation boundary gate locked.
- Env opt-in future gate.
- Manual terminal confirmation future gate.
- Real-run flag future gate.
- Smoke runner invocation gate locked.
- Terminal script invocation gate locked.
- Browser automation gate locked.
- Credential gate locked.
- Cookies/session forbidden gate.
- BankID automation forbidden gate.
- Order submission forbidden gate.
- Final KÖP/SÄLJ human-only gate.
- Supabase write locked gate.
- Trade UI execution locked gate.
- API route activation locked gate.

## Safety Guarantees

- Runtime remains locked.
- Runtime invocation remains forbidden.
- Real-run remains forbidden.
- Invocation boundary remains locked.
- Smoke runner invocation remains locked.
- Terminal script invocation remains locked.
- Browser automation remains locked.
- Credential access remains locked.
- Cookies/session remain forbidden.
- BankID automation remains forbidden/manual-action only.
- Order submission remains forbidden.
- Final confirmation remains human-only.
- Final KÖP/SÄLJ remains human-only.
- Supabase writes remain locked.
- Trade UI execution remains locked.
- API route activation remains locked.
- UI remains simple.
- Not production-ready.

## Dev QA Visibility

The isolated dev-only visual QA route may render the disabled contract harness with static fixtures. The section is fixture/model-only, disabled contract only, hidden under the surface, and agent-readable/UI-hidden.

It adds no visible Trade UI changes, active handoff, prepare action, buy/sell CTA, browser automation, API route call, fetch/polling, credential access, order submission, final KÖP/SÄLJ click, or Supabase write.

## Next Allowed Step

The manual approval runbook can now feed disabled invocation adapter contract design. Runtime remains locked. Any runtime adapter, smoke-runner invocation, terminal script invocation, browser automation, credential access, order submission, final KÖP/SÄLJ click, Supabase write, API route activation, or production readiness remains a separate future approval task.

## Disabled Invocation Adapter Payload Validator

`docs/avanza-disabled-invocation-adapter-payload-validator.md` now validates
disabled invocation adapter design-review payloads only. The disabled
invocation adapter contract now has payload validation for safe summaries,
sensitive payload rejection, runtime capability blocking, and invocation
boundary locking. Runtime remains locked.

## Invocation Adapter Design Checkpoint

`docs/avanza-invocation-adapter-design-checkpoint.md` now checkpoints the
disabled adapter contract and payload validator together for design review only.
Runtime remains locked.

## Sharp Semi Auto Execution Phase Checkpoint

`docs/avanza-sharp-semi-auto-execution-phase-checkpoint.md` now closes the
current design phase as complete. Future work must pick a separate workstream,
and runtime remains locked.
