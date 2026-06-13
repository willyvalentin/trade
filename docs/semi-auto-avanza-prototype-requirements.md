# Semi-auto Avanza Prototype Requirements

Date: 2026-06-11

Status: Documentation-only requirements specification for a possible future semi-automatic Avanza prototype. No Avanza automation was implemented, no Avanza URL or selector was added to runtime code, no credential was added, no browser automation was added, and no order submission is in scope.

Related:

- `docs/safe-browser-action-contract.md`
- `docs/avanza-dry-run-capability-spec.md`
- `lib/avanza-dry-run-request-contract.ts`
- `lib/execution-intent-to-avanza-dry-run.ts`
- `lib/avanza-dry-run-runner-self-check.ts`
- `lib/safe-browser-action-runner.ts`
- `lib/browser-runner-capability-gate.ts`
- `docs/avanza-final-confirm-block-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/avanza-review-click-phase-design.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Define requirements for the first future semi-automatic Avanza prototype before any Avanza automation code is written.

This is not implementation approval. It is not live automation approval. It does not authorize Avanza URLs, runtime selectors, credentials, browser automation, final confirmation clicks, broker result capture, Supabase writes, or trade mutation.

Action 244 added `docs/avanza-final-confirm-block-design.md`, which turns the "never click final confirmation" requirement into layered architecture guards for any future implementation. That design is documentation-only and does not add automation.

Action 245 added `lib/safe-browser-action-contract.ts` and `docs/safe-browser-action-contract.md`, a pure validation contract for future browser action plans. It blocks semi-auto final-confirm-like click/select actions without importing browser automation.

Action 246 added `lib/safe-browser-action-runner.ts`, a no-op runner interface that accepts safe action batches, validates them, reports validated/blocked/skipped status, and executes no browser actions.

Action 252 added `lib/browser-runner-capability-gate.ts`, a pure capability gate that labels mock browser diagnostics separately from future Avanza/broker capabilities. Avanza, broker submission, final-confirm click, automatic-capable, and unknown browser capabilities remain blocked by default unless future explicit gates are added.

Action 253 added `docs/avanza-dry-run-capability-spec.md`, a documentation-only specification for a possible future Avanza dry-run capability. Dry-run means semi-automatic navigation/fill/review/readback only; it remains separate from broker execution and continues to prohibit final confirmation, broker results, Supabase writes, and trade mutation.

Action 254 extended the pure browser runner capability gate so an explicitly allowed, non-submitting Avanza dry-run capability can validate as `dry_run_only`. This is classification only and does not add Avanza automation, selectors, URLs, browser execution, broker results, or order submission.

Action 255 added `lib/avanza-dry-run-request-contract.ts`, a pure input contract for future dry-run order preparation. It defaults to Advanced mode, manual account review, and stop-at-confirmation behavior, and it rejects unsafe metadata such as `allowFinalSubmit` or broker-submission support. It does not add automation.

Action 256 added `lib/execution-intent-to-avanza-dry-run.ts`, a pure adapter that converts Ture execution intent/handoff data into a validated `AvanzaDryRunOrderInput`. It remains input-shaping only and does not add Avanza browser automation, selectors, URLs, broker results, or order submission.

Action 257 added a dev-only read-only Avanza dry-run request preview to the Execution Handoff Preview Modal. It displays the validated adapter output and safety labels without adding a run button, Avanza navigation, browser runner, broker result, Supabase write, or trade mutation.

Action 258 added a dev-only read-only Avanza dry-run readiness checklist to the Execution Handoff Preview Modal. It distinguishes valid request data from the still-missing runner implementation and keeps the overall status `Not ready to run`.

Action 259 added `docs/avanza-dry-run-runner-implementation-plan.md`, a documentation-only plan for the first future dry-run runner. It keeps the runner out of code and defines the required architecture, flags, stop states, diagnostics, staged testing, and UI behavior before implementation.

Action 260 added `lib/avanza-dry-run-runner-self-check.ts`, a pure self-check contract for future runner readiness. It lets a runner report capability and blockers without controlling a browser, and it keeps mock-only, unavailable, blocked, and dry-run-only states distinct.

Action 293 added `docs/avanza-review-click-phase-design.md`, a
documentation-only design for a future `Granska`-only review click and
confirmation-modal readback phase. It keeps final confirmation with the user
and adds no browser control, Avanza selectors/URLs, review runtime, broker
result, Supabase write, or trade mutation.

## Prototype Scope

In scope:

- `semi_automatic` only
- Advanced order only
- buy and sell
- one instrument at a time
- order preparation and review only
- confirmation modal readback
- manual final confirmation by the user

Out of scope:

- automatic mode
- `Stop Loss`
- `Glidande`
- final `Bekräfta köp` click
- final `Bekräfta sälj` click
- brokerResult capture
- order status polling
- History or Statistics updates
- credentials/session automation
- account scraping
- Supabase execution persistence from Avanza
- trade-state mutation

## Functional Requirements

The future prototype must:

- consume an `AvanzaAgentRequest` or equivalent `ExecutionIntent`
- verify requested action is buy or sell
- verify instrument identity before order entry
- open or search for the requested instrument in a manually provided browser/session context
- choose the exact instrument only after verification
- open order entry for the verified instrument
- select or verify Advanced order mode
- fill quantity
- fill price/course
- optionally verify account or accepted default-account policy
- click only `Granska köp` or `Granska sälj`
- detect the confirmation modal
- read back key confirmation fields
- report `waiting_for_manual_confirmation`
- stop without taking final action

The future prototype must not continue after the confirmation modal except to report status and wait for the user.

## Verification Requirements

### Before Review

Before clicking `Granska köp` or `Granska sälj`, the future prototype must verify:

- instrument name
- ticker
- market
- currency
- instrument type
- requested action
- account or accepted default-account policy
- quantity
- price/course
- Advanced mode
- absence of validation errors
- review button label matches action

If any verification fails, the prototype must stop and emit a failure state.

### At Confirmation

At the confirmation modal, the future prototype must verify:

- instrument matches the request
- account matches the expected or accepted account
- quantity matches the request
- price/course matches the request or accepted price policy
- totals and fees are visible when expected
- final button label matches the action
- `Avbryt` is visible
- no final confirmation click occurs

After confirmation verification, the only acceptable terminal state is `waiting_for_manual_confirmation` or a safe failure.

## Safety Requirements

The future prototype must:

- hardcode a block on final confirm clicks
- ignore or block automatic mode
- avoid retry loops without user visibility
- stop on ambiguity
- stop on validation errors
- stop on session timeout or login challenge
- avoid account data storage
- avoid credential storage
- avoid raw sensitive screenshots or logs
- make all progress events auditable
- keep Avanza confirmation readback separate from `brokerResult`
- keep Ture trade state unchanged
- require user approval for any watched dry run

## Failure States

The future prototype must report clear failure states:

- `instrument_not_found`
- `ambiguous_instrument_candidates`
- `instrument_identity_mismatch`
- `order_mode_not_advanced`
- `validation_failed`
- `account_mismatch`
- `quantity_mismatch`
- `price_mismatch`
- `confirmation_not_detected`
- `confirmation_mismatch`
- `final_button_detected_safe_stop`
- `session_timeout`
- `unexpected_layout`
- `user_cancelled`
- `agent_failed`

Failure output should include a sanitized reason, the last safe progress event, and suggested user action. It must not include credentials, balances, holdings, cookies, tokens, raw DOM dumps, or unsanitized screenshots.

## Progress Event Requirements

Future progress events should use stable names and sanitized payloads:

| Event | Payload expectations |
| --- | --- |
| `avanza_session_detected` | session present/absent, no credentials or tokens |
| `avanza_search_opened` | search state only |
| `avanza_instrument_candidates_detected` | candidate count and sanitized identity fields |
| `avanza_instrument_verified` | ticker/name/market/currency/type verification result |
| `avanza_order_entry_opened` | requested action and instrument identity |
| `avanza_advanced_mode_verified` | order mode verification status |
| `avanza_order_form_filled` | quantity/price/account verification status, not account balances |
| `avanza_order_validation_failed` | sanitized validation reason and affected field |
| `avanza_review_clicked` | review button label and action |
| `avanza_confirmation_detected` | modal detected, final button visible as stop boundary |
| `avanza_confirmation_verified` | readback verification status |
| `waiting_for_manual_confirmation` | terminal safe wait state |
| `avanza_agent_safe_stopped` | stop reason and last safe state |
| `avanza_agent_failed` | sanitized failure reason |

## Data Minimization And Logging

The future prototype must:

- log field labels and verification status, not account balances
- redact account identifiers
- avoid raw DOM dumps
- avoid screenshots unless sanitized
- avoid credentials
- avoid cookies, session tokens, and browser storage
- avoid holdings or portfolio data
- keep logs scoped to the current order-preparation attempt
- treat all local observations as sensitive until reviewed

## Test Plan

### Phase 1 - Mock Page Only

- Use existing mock order and mock confirmation pages.
- Verify Advanced-only flow.
- Verify validation-failure handling.
- Verify final submit remains disabled.
- Verify no brokerResult is created.

### Phase 2 - Avanza Manual Observation Only

- Use `docs/avanza-manual-mapping-qa-checklist.md`.
- Record sanitized results in `docs/avanza-manual-mapping-session-notes.md`.
- Update mapping/gap docs before prototype implementation.

### Phase 3 - Avanza Semi-auto Dry Run In Watched Browser

- Use dev/staging Ture only.
- Use a watched browser/session.
- Keep automatic mode off.
- Do not click final confirmation.
- Avoid high-risk market moments.
- Stop immediately on mismatch or uncertainty.

### Phase 4 - Repeated Dry Runs

- Repeat with different tickers.
- Repeat buy and sell paths.
- Repeat currency differences where safe.
- Repeat validation and cancellation paths without submitting.

### Phase 5 - Broader Test Consideration

- Only after explicit approval.
- Only after the final-confirm block has been designed and tested.
- Still no automatic mode and no brokerResult capture unless separately approved.

## Acceptance Criteria For Prototype

The prototype is acceptable only if it:

- stops at the confirmation modal
- never clicks `Bekräfta köp`
- never clicks `Bekräfta sälj`
- correctly verifies instrument
- correctly verifies action
- correctly verifies quantity
- correctly verifies price/course
- reports validation errors
- produces progress events
- lets the user cancel or manually confirm outside the agent
- creates no brokerResult
- mutates no trade state
- blocks automatic mode
- stores no credentials or sensitive account data
- runs only in the approved dev/staging context

The manual confirmation boundary is further defined in
[`docs/avanza-manual-confirmation-wait-phase-design.md`](avanza-manual-confirmation-wait-phase-design.md).
That phase may display `waiting_for_manual_confirmation` after verified
confirmation readback, but it must not click `Bekrafta`, keyboard-submit,
create a broker result, write Supabase, or mutate trades.

The future broker confirmation capture boundary is defined in
[`docs/avanza-broker-confirmation-capture-phase-design.md`](avanza-broker-confirmation-capture-phase-design.md).
Capture may only read sanitized receipt evidence after a human final action in
a separately approved phase. It remains separate from final-click behavior,
`BrokerExecutionResult` conversion, execution record creation, Supabase
persistence, History/Statistics updates, and live trade mutation.

The future conversion boundary is defined in
[`docs/avanza-broker-execution-result-conversion-boundary-design.md`](avanza-broker-execution-result-conversion-boundary-design.md).
It states that sanitized capture evidence is not automatically a
`BrokerExecutionResult`. Filled/executed evidence, matching action/instrument/
quantity/price fields, idempotency, future feature gates, and explicit approval
are required before conversion may be considered. Placed/accepted/unfilled
evidence must not be treated as realized execution.

## Pre-implementation Checklist

- [ ] Manual mapping updated.
- [ ] Requirements reviewed.
- [ ] Mock tests passing.
- [ ] Safety plan reviewed.
- [ ] Final-confirm block designed.
- [ ] Final-confirm block reviewed.
- [ ] Manual confirmation wait phase design reviewed.
- [ ] Broker confirmation capture phase design reviewed.
- [ ] BrokerExecutionResult conversion boundary design reviewed.
- [ ] Safe browser action contract reviewed.
- [ ] Safe browser action runner interface reviewed.
- [ ] Test environment chosen.
- [ ] User approval obtained.
- [ ] Dev/staging-only boundary confirmed.
- [ ] Sensitive-data logging policy reviewed.
- [ ] Failure states and progress events agreed.

## Recommended Next Action

Recommended:

- Action 261 - Avanza Dry-Run Safe Action Plan Contract

This should define pure safe-action planning for a future dry-run request before any browser control exists. It should not add Avanza automation, URLs, selectors, broker results, or order submission.
