# Avanza Disabled Invocation Adapter Payload Validator

Status: implemented as a disabled, model-only validator for Sharp Semi Auto Execution Agent design review.

## Purpose

The disabled invocation adapter payload validator checks whether a proposed local-dev invocation adapter payload is safe enough for design review only. It validates explicit, sanitized payload summaries against the disabled invocation adapter contract and reports why a payload is valid for design review, blocked, or invalid.

It does not approve runtime, does not cross the invocation boundary, does not invoke smoke runners, does not import terminal scripts, does not start browser automation, and cannot call APIs.

## Scope

- Validates design-review payloads only.
- Requires a disabled invocation adapter contract and request shape.
- Requires safe payload summary fields only.
- Rejects sensitive payload fields.
- Rejects runtime capability flags.
- Keeps the invocation boundary locked.
- Keeps the output agent-readable and UI-hidden.

## Sensitive Payload Forbidden

The validator rejects payloads containing raw credentials, cookies, session tokens, account numbers, order IDs, BankID artifacts, unredacted screenshots, raw broker confirmations, API route references, smoke script references, browser runtime handles, or Supabase write payloads.

The validator cannot access or carry credentials, cannot carry cookies/session/account/order IDs, cannot submit orders, cannot click final KOP/SALJ, and does not write Supabase.

## Runtime Capability Blocked

The validator rejects payloads that attempt to enable runtime capabilities such as approving runtime invocation, crossing the invocation boundary, invoking smoke runners, running terminal scripts, starting browser automation, calling API routes, accessing credentials, submitting orders, or writing Supabase records.

Runtime remains locked.

## Safety Flags

- validatorOnly: true
- designReviewOnly: true
- headlessOnly: true
- visibleInUi: false
- canApproveRuntimeInvocation: false
- canCrossInvocationBoundaryNow: false
- canInvokeSmokeRunnerNow: false
- canRunTerminalScriptNow: false
- canUseBrowserAutomationNow: false
- canCallApiRoute: false
- canFetch: false
- canPoll: false
- canAccessCredentials: false
- canCarryCredentials: false
- canReadCookies: false
- canCarrySessionTokens: false
- canAutomateBankId: false
- canSubmitOrder: false
- canClickFinalBuy: false
- canClickFinalSell: false
- canWriteSupabase: false
- canClaimProductionReady: false
- controlsEnabled: false
- gateLocked: true

## Dev QA Visibility

The fixture/model-only harness is rendered on the isolated dev-only visual QA route. It is not a visible Trade UI change and does not add handoff, prepare, buy/sell CTA, browser automation, API route call, fetch/polling, credential access, order submission, final KOP/SALJ click, or Supabase write behavior.

## Final Confirmation

Final confirmation remains human-only. The validator can describe payload readiness for review, but it cannot perform or authorize any real invocation.

## Production Readiness

This validator is not production ready. It is a disabled boundary model that keeps local-dev invocation planning inspectable while preserving the locked runtime boundary.

## Invocation Adapter Design Checkpoint

`docs/avanza-invocation-adapter-design-checkpoint.md` now summarizes the disabled
adapter contract and payload validator together for design review only. Runtime
remains locked.

## Sharp Semi Auto Execution Phase Checkpoint

`docs/avanza-sharp-semi-auto-execution-phase-checkpoint.md` now closes the
current design phase as complete. Future work must pick a separate workstream,
and runtime remains locked.
