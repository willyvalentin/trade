# Avanza Manual Local-Dev Invocation Approval Runbook

Status: `avanza_manual_local_dev_invocation_approval_runbook_added`

## Purpose

The manual local-dev invocation approval runbook records what a human/operator must review before any future separate task may design an invocation adapter for the Sharp Semi Auto Execution Agent.

This runbook is model/docs/dev-QA only. It is required before any invocation adapter design, but it does not approve invocation.

## Scope

The runbook is approval evidence for design only. It may model approval for a disabled invocation adapter design or a model-only invocation adapter design after the operator, safety, and evidence reviews are complete.

It does not open the bridge gate. It does not cross the invocation boundary. It does not invoke smoke runners. It does not import terminal scripts. It does not start browser automation. It cannot call APIs. It cannot access credentials. It cannot submit orders. It cannot click final KÖP/SÄLJ. It does not write Supabase.

## Required Review Items

- Bridge readiness checkpoint reviewed.
- Invocation boundary stop confirmed.
- Model-only dry-run report reviewed.
- Disabled runner report reviewed.
- Activation checklist reviewed.
- Operator review completed.
- Safety review completed.
- Evidence review completed.
- No smoke runner invocation confirmed.
- No terminal script invocation confirmed.
- No browser automation confirmed.
- No credential access confirmed.
- Cookies/session forbidden confirmed.
- BankID automation forbidden/manual-only confirmed.
- Order submission forbidden confirmed.
- Final KÖP/SÄLJ human-only confirmed.
- Trade UI execution remains locked.
- API route activation remains locked.
- Supabase writes locked.
- UI simplicity protected.
- Production readiness blocked.

## Evidence Boundary

Evidence may include bridge readiness checkpoint summaries, model-only dry-run reports, disabled runner reports, activation checklist notes, operator attestations, safety review notes, redacted logs, and redacted screenshots.

Sensitive evidence must be redacted or rejected. Unredacted screenshots, unredacted logs, credentials, cookies, session material, account identifiers, BankID material, and broker secrets are not allowed to persist through this runbook.

## Safety Guarantees

- Runtime remains locked.
- Local-dev bridge gate remains locked.
- Invocation boundary cannot be crossed now.
- Smoke runner invocation remains blocked.
- Terminal script invocation remains blocked.
- Browser automation remains locked.
- Credential access remains locked.
- Cookies/session remain forbidden.
- BankID automation remains forbidden/manual-only.
- Order submission remains forbidden.
- Final confirmation remains human-only.
- Final KÖP/SÄLJ remains human-only.
- Trade UI execution remains locked.
- API route activation remains locked.
- Supabase writes remain locked.
- Real run remains forbidden.
- Production readiness remains forbidden.
- UI remains simple.
- Not production-ready.

## Dev QA Visibility

The isolated dev-only visual QA route may render the runbook harness with static fixtures. That section is fixture/model-only, hidden under the surface, and agent-readable/UI-hidden. It adds no visible Trade UI changes and no active handoff, prepare action, buy/sell CTA, browser automation, API route call, fetch/polling, credential access, order submission, final KÖP/SÄLJ click, or Supabase write.

## Next Allowed Step

The next allowed step is design-only: plan a disabled or model-only invocation adapter in a separate future task after manual review evidence is accepted.

The next allowed step is not runtime activation.

## Disabled Invocation Adapter Contract

`docs/avanza-disabled-local-dev-invocation-adapter-contract.md` now defines the
future adapter shape only. The manual approval runbook can feed disabled
invocation adapter contract design, but runtime remains locked. The contract
models target request shape and safe payload summary while keeping sensitive
payload forbidden.

## Disabled Invocation Adapter Payload Validator

`docs/avanza-disabled-invocation-adapter-payload-validator.md` now validates
disabled invocation adapter design-review payloads only. It rejects sensitive
payload and runtime capabilities, and runtime remains locked.

## Invocation Adapter Design Checkpoint

`docs/avanza-invocation-adapter-design-checkpoint.md` now checkpoints the
current invocation adapter design stack after manual approval, bridge readiness,
disabled contract modeling, and payload validation. It validates design review
only. Runtime remains locked.

## Sharp Semi Auto Execution Phase Checkpoint

`docs/avanza-sharp-semi-auto-execution-phase-checkpoint.md` now closes the
current design phase as complete. Future work must pick a separate workstream,
and runtime remains locked.
