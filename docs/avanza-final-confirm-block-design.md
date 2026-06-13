# Avanza Final-Confirm Block Design

Date: 2026-06-11

Status: Documentation-only technical safety design for a possible future Avanza runner. No Avanza automation was implemented, no Avanza URL or selector was added to runtime code, no credential was added, no browser automation was added, and no order submission is in scope.

Related:

- `docs/safe-browser-action-contract.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-review-click-phase-design.md`
- `lib/safe-browser-action-runner.ts`
- `lib/browser-runner-capability-gate.ts`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Prevent a future Avanza runner from clicking final confirmation in `semi_automatic` mode.

This document defines a hard architecture boundary before implementation. It is not Avanza automation, not a selector contract, not a runtime URL plan, and not approval for live broker interaction.

Action 245 added `lib/safe-browser-action-contract.ts` and `docs/safe-browser-action-contract.md`, a pure contract/helper layer for validating future safe browser action plans before any browser action is executed. It does not import Playwright or automate Avanza.

Action 246 added `lib/safe-browser-action-runner.ts`, a no-op runner interface that validates safe action batches and reports validated/blocked/skipped results without executing browser actions.

Action 252 added `lib/browser-runner-capability-gate.ts`, which separates mock-only browser diagnostics from future Avanza/broker runner capabilities. Final-confirm and broker-submission capability remain blocked by default at the runner-capability layer, in addition to per-action validation.

Action 253 added `docs/avanza-dry-run-capability-spec.md`, which defines a future Avanza dry-run as semi-automatic browser navigation/fill/review/readback only. Dry-run still forbids final confirmation, broker submission, broker results, Supabase writes, and trade mutation.

Action 254 extended the pure capability gate so a valid Avanza dry-run can classify as `dry_run_only` only when explicitly allowed and only without broker submission, final-confirm click, or automatic capability. The final-confirm block remains unchanged.

Action 259 added `docs/avanza-dry-run-runner-implementation-plan.md`, a documentation-only plan for a future Avanza dry-run runner. It requires all click/fill/read actions to pass through the safe action boundary, treats confirmation-modal verification as the terminal semi-auto state, and still forbids final confirmation.

Action 293 added `docs/avanza-review-click-phase-design.md`, a
documentation-only design for a future `Granska` click and confirmation-modal
readback phase. It keeps final-confirm visibility read-only, requires a stop at
`waiting_for_manual_confirmation`, and still forbids `Bekrafta`, keyboard
submit, broker results, Supabase writes, and trade mutation.

## Threat Model

The final-confirm block must defend against:

- accidental click on `Bekräfta köp` or `Bekräfta sälj`
- selector confusion between `Granska` and `Bekräfta`
- action mismatch between buy and sell
- automatic mode accidentally enabled
- UI layout shifts moving buttons or modal content
- retry logic clicking the wrong button
- stale state after the confirmation modal opens
- keyboard `Enter` triggering submit
- keyboard `Space` activating a focused final button
- test code leaking into a live flow
- generic "primary button" helpers choosing the final confirmation button
- fuzzy text matching treating review and confirmation labels as equivalent

## Core Principle

- A semi-auto runner may click the review button.
- A semi-auto runner must never click final confirm.
- Final confirm belongs to the human.
- Confirmation modal detection is a terminal success state for semi-auto.

For `semi_automatic`, reaching a verified confirmation modal means the runner has succeeded and must transition to `waiting_for_manual_confirmation`.

## Architecture Guard Layers

### A. Mode Authority Guard

The future runner must receive an explicit execution authority object before any browser action.

In `semi_automatic`:

- `ExecutionAuthority.requireHumanFinalClick` must be `true`.
- `allowFinalSubmit` must be `false`.
- Any request with `allowFinalSubmit=true` must be rejected for the semi-auto runner path.
- Automatic mode flags must not be inferred from UI state.

### B. Action Allowlist

Allowed semi-auto actions:

- search
- select instrument
- click buy/sell entry
- fill fields
- click review
- read confirmation
- report status
- wait for user

Forbidden semi-auto actions:

- click final confirm
- keyboard submit
- submit form
- click generic primary action after confirmation modal
- switch to automatic mode
- continue clicking after `waiting_for_manual_confirmation`

### C. Selector Denylist

Any element text matching final-confirm language must be read-only in semi-auto.

Denylisted labels include:

- `Bekräfta köp`
- `Bekräfta sälj`
- `Confirm buy`
- `Confirm sell`
- obvious localized equivalents recorded in manual mapping notes

In semi-auto, denylisted elements may be:

- detected
- read
- logged as sanitized labels
- used as evidence for `waiting_for_manual_confirmation`

They must not be clicked, focused for keyboard submission, or treated as generic primary buttons.

### D. State Machine Guard

Required semi-auto terminal state:

- `waiting_for_manual_confirmation`

Forbidden semi-auto transition:

```text
waiting_for_manual_confirmation -> submit_broker_order
```

The semi-auto state machine must have no transition to `submit_broker_order`, `final_submit_clicked`, or any equivalent broker-submit state.

### E. Browser Action Wrapper

All future runner click actions must go through a safe action wrapper, for example:

- `safeClick(...)`
- `safeFill(...)`
- `safeRead(...)`

`safeClick(...)` must check:

- execution mode
- current runner state
- action allowlist
- final-confirm denylist
- target role/label
- stale modal state
- stop-state flags

Direct raw click calls such as `page.click(...)`, locator `.click(...)`, or a generic "click primary" helper should be forbidden in future Avanza runner code.

The pure action contract in `lib/safe-browser-action-contract.ts` is the first building block for this wrapper. It validates planned actions, final-confirm-like targets, mode, and risk level without touching a browser.

The no-op runner in `lib/safe-browser-action-runner.ts` is the first runner boundary. Future real browser runners must implement the same interface and keep validation ahead of execution.

### F. Test Guard

Future unit/e2e tests must prove:

- semi-auto can click review
- semi-auto cannot click final confirm
- keyboard submit is blocked
- final button visibility transitions to `waiting_for_manual_confirmation`
- retry logic does not click final confirm
- automatic-off mode blocks final confirm even when the button is visible

The local mock page should keep a disabled or blocked final-confirm analogue so tests can exercise this boundary before any Avanza prototype exists.

### G. Runtime Emergency Stop

If a final confirm button is detected, the future runner must:

- stop click/fill actions
- emit `final_confirm_blocked` or `avanza_agent_safe_stopped`
- report the visible final button label as sanitized text
- transition to `waiting_for_manual_confirmation` if confirmation verification passed
- otherwise transition to a safe failure state

No further click actions are allowed except an optional close/cancel action if it has been separately designed and explicitly allowed.

## Automatic Mode Separation

Automatic mode remains out of scope for the first prototype.

Automatic mode requires:

- separate explicit feature flag
- explicit user opt-in
- `allowFinalSubmit=true`
- automatic mode enabled in execution authority
- all safety checks passed
- final modal verified
- separate tests proving the path cannot be reached from semi-auto

Automatic mode must not accidentally share the semi-auto runner path. A future automatic runner should be a separate capability with a separate approval trail, not a boolean branch that weakens semi-auto safety.

## Required Future Implementation Rules

- No raw click calls in Avanza runner code.
- No keyboard `Enter` or `Space` submit after modal detection.
- No generic "click primary button."
- No fuzzy-click on final button text.
- Review button and final button must be distinct action types.
- Entry `Kop`/`Salj` controls in a future order-page-open phase must be
  distinct from review and final-confirm controls.
- The order-page-open phase described in
  `docs/avanza-order-page-open-phase-design.md` may only open and verify the
  order page, then stop.
- The order-page-open phase must not fill forms, click `Granska`, click
  `Bekrafta`, or submit.
- The Advanced form-fill phase described in
  `docs/avanza-advanced-form-fill-phase-design.md` may only fill allowed
  Advanced quantity/price fields and verify readbacks, then stop.
- The Advanced form-fill phase must not click `Granska`, click `Bekrafta`,
  keyboard-submit, or create broker results.
- The manual confirmation wait phase described in
  `docs/avanza-manual-confirmation-wait-phase-design.md` begins only after a
  verified `confirmation_ready` readback and must still treat `Bekrafta` as a
  human-only action. It may display `waiting_for_manual_confirmation`, but it
  must not click, keyboard-submit, create broker results, write Supabase, or
  mutate trades.
- The manual confirmation wait result contract in
  `lib/avanza-manual-confirmation-wait-contract.ts` models wait/cancel/timeout/
  user-confirmed-unverified states and blocks agent final-confirm attempts,
  keyboard submit, unexpected broker results, unexpected trade mutations, and
  sensitive data signals.
- The broker confirmation capture phase described in
  `docs/avanza-broker-confirmation-capture-phase-design.md` is separate from
  final-click behavior. It may only read sanitized confirmation evidence after
  a human final action in a future approved phase, and it must not click
  `Bekrafta`, keyboard-submit, create broker results directly, write Supabase,
  or mutate trades.
- Confirmation modal verification returns success and stops.
- Retry loops must re-run safety checks before every action.
- Test-only helpers must not be imported into the live runner path.
- The runner must fail closed when action type, mode, label, or state is unknown.

## Progress Events

Recommended future progress events:

- `avanza_confirmation_detected`
- `avanza_confirmation_verified`
- `waiting_for_manual_confirmation`
- `final_confirm_blocked`
- `unsafe_final_confirm_attempt_blocked`
- `avanza_agent_safe_stopped`

Expected behavior:

- `avanza_confirmation_detected` may include sanitized modal label evidence.
- `avanza_confirmation_verified` may include verification status only.
- `waiting_for_manual_confirmation` is the semi-auto terminal success event.
- `final_confirm_blocked` records that a final button was visible and treated as a stop boundary.
- `unsafe_final_confirm_attempt_blocked` records a prevented unsafe action.
- `avanza_agent_safe_stopped` records the stop reason.

## Test Scenarios

Future tests must cover:

- semi-auto review click allowed
- semi-auto final confirm click blocked
- keyboard submit blocked
- final button visible triggers `waiting_for_manual_confirmation`
- automatic off blocks final confirm
- action mismatch blocks
- wrong final button label blocks
- retry loop does not click final confirm
- generic primary-button helper cannot click final confirm
- direct raw click calls are disallowed by code review or lint/test convention
- test-only click helpers cannot be imported into future live runner code

## Acceptance Criteria For Future Implementation

Before a future Avanza runner can be considered safe:

- all clicks go through a safe action wrapper
- final confirm denylist exists
- semi-auto cannot reach submit action
- semi-auto state machine has no submit transition
- tests prove blocked final confirm
- keyboard submit is blocked after confirmation modal detection
- manual QA confirms stop at modal
- no automatic mode path is enabled
- no brokerResult is created from Avanza
- no trade state is mutated
- no credentials or sensitive account data are stored

## Recommended Next Action

Recommended:

- Action 290 - Avanza Advanced Form Fill Result Contract

This should define pure result types/helpers for Advanced form-fill diagnostics
only. It should still add no browser control, Avanza selectors, Avanza URLs,
runtime form fills, review clicks, final-confirm clicks, broker results,
Supabase writes, or trade mutation.
