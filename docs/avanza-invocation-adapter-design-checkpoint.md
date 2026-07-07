# Avanza Invocation Adapter Design Checkpoint

Status: implemented as a fixture/model-only checkpoint for Sharp Semi Auto Execution Agent invocation adapter design review.

## Purpose

The invocation adapter design checkpoint summarizes the current disabled adapter-design stack:

- Manual local-dev invocation approval runbook.
- Local-dev bridge readiness checkpoint.
- Disabled local-dev invocation adapter contract.
- Disabled invocation adapter payload validator.
- Safe payload shape validation.
- Locked invocation boundary and runtime gates.

It answers whether the disabled invocation adapter contract is designed, whether the payload validator is present, whether the safe payload is valid for design review, whether design-only approval is modeled, and whether runtime remains blocked.

## Design Review Boundary

The checkpoint validates design review only. It does not approve runtime, does not cross the invocation boundary, does not invoke smoke runners, does not import terminal scripts, does not start browser automation, and cannot call APIs.

The checkpoint cannot access or carry credentials, cannot carry cookies/session/account/order IDs, cannot submit orders, cannot click final KÖP/SÄLJ, and does not write Supabase.

Runtime invocation remains forbidden. Real-run remains forbidden. Production readiness remains forbidden.

Runtime remains locked.

## Validated Payload

The checkpoint consumes the disabled invocation adapter payload validator report. A payload may be accepted only when the validator reports `valid_for_design_review`.

Safe payload shape can be validated for review. Sensitive payload is rejected. Runtime capability flags are blocked.

## Locked Gates

- Invocation boundary locked.
- Smoke runner invocation locked.
- Terminal script invocation locked.
- Browser automation locked.
- Credential access locked.
- Cookies/session forbidden.
- BankID automation forbidden/manual-action only.
- Order submission forbidden.
- Final KÖP/SÄLJ human-only.
- Supabase writes locked.
- Trade UI execution locked.
- API route activation locked.
- Production readiness blocked.

## Next Allowed Design Step

The next allowed design step may be disabled adapter shape review, model-only adapter validator review, or manual design review. It is not runtime invocation.

## UI Boundary

The checkpoint is visible only as fixture/model-only data on the isolated dev QA route. UI remains simple. No visible Trade UI changes are added.

## Production Readiness

This checkpoint is not production-ready. It records the state of the design stack and keeps all runtime and execution gates locked.

## Sharp Semi Auto Execution Phase Checkpoint

`docs/avanza-sharp-semi-auto-execution-phase-checkpoint.md` now closes the
current design phase as complete. Future work must pick a separate workstream,
and runtime remains locked.
