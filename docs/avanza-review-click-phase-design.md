# Avanza Review Click Phase Design

Status: design plus pure TypeScript result contract; no browser runtime.

This document does not approve or implement Avanza automation. It adds no
Avanza URLs, selectors, Playwright imports, browser control, review/run/start
button, `Granska` click, `Bekrafta` click, order submission, broker result,
Supabase write, or trade mutation.

Action 294 added `lib/avanza-review-click-contract.ts`, a pure TypeScript
contract for future review-click and confirmation-modal readback diagnostics.
It evaluates a valid dry-run request, a `form_filled` Advanced form result, and
sanitized confirmation modal readback. It does not click `Granska`, click
`Bekrafta`, control a browser, use Avanza URLs/selectors, submit orders, create
broker results, write Supabase, or mutate trades.

Action 295 added a non-executing localhost bridge `POST /review-click` stub for
this contract. It returns synthetic `AvanzaReviewClickResult` diagnostics from
explicit local modes, including confirmation-ready, mismatch, validation,
final-confirm-visible read-only, final-confirm-click blocked, keyboard-submit
blocked, and sensitive-data blocked states. It still does not control a
browser, touch Avanza, perform real `Granska`, click `Bekrafta`, submit orders,
create broker results, write Supabase, or mutate trades.

## Purpose

Define the future review-click phase after an Advanced order form has been
filled and verified.

Review-click means a future separately approved runner may click only the
matching `Granska kop` or `Granska salj` control, read and verify the resulting
confirmation modal, and then stop at the manual confirmation boundary.

The terminal successful state is `waiting_for_manual_confirmation`. The runner
must never click final confirmation.

## Scope

Allowed in a future separately approved runner:

- consume an Advanced form-fill result with status `form_filled`
- verify action, instrument, quantity, and price again before review
- click only matching `Granska kop` for buy or `Granska salj` for sell
- detect the confirmation modal
- read sanitized modal values:
  - action
  - instrument
  - account label only when safe and sanitized
  - quantity
  - price/course
  - fees/courtage
  - currency and FX details when visible
  - total amount
  - valid-until when visible
- verify modal readback against the dry-run request
- return confirmation-ready, mismatch, validation-error, or blocked diagnostics
- emit local diagnostics
- transition a future lifecycle to `waiting_for_manual_confirmation`

Forbidden:

- click `Bekrafta kop`
- click `Bekrafta salj`
- submit any form
- trigger keyboard Enter or Space submit
- edit fields after the confirmation modal opens
- change account
- create a broker result
- mark a trade as executed
- mutate live positions, History, or Statistics
- persist sensitive account data

## Required Prerequisites

- Manual mapping refresh is green or explicitly acknowledged.
- Session detection is `ready_for_search_only`.
- Search-only result is `exact_match`.
- Instrument verification result is `verified`.
- Instrument page result is `page_identified`.
- Order page open result is `order_page_opened`.
- Advanced form-fill result is `form_filled`.
- The filled form matches requested action, instrument, quantity, and price.
- Dry-run request is valid.
- Capability gate is `dry_run_only`.
- Broker submission is disabled.
- Final confirm is disabled.
- User is watching the browser.

If any prerequisite is missing, the future runner must stop before clicking
`Granska`.

## Planned Inputs

- `dryRunOrderInput`
  - action
  - instrument
  - quantity
  - price
  - account policy
- `advancedFormFillResult` with status `form_filled`
- sanitized confirmation modal state if a future approved runner observes it
- source request id, recommendation id, or execution intent id when available
- sanitized metadata only

Do not include account numbers, balances, holdings, personal identifiers,
credentials, raw DOM, page HTML, cookies, tokens, or unsanitized screenshots.

## Planned Statuses

- `unavailable`
- `form_not_ready`
- `review_click_allowed`
- `confirmation_detected`
- `confirmation_ready`
- `confirmation_mismatch`
- `validation_error`
- `prohibited_final_confirm_detected`
- `blocked`
- `failed`

`confirmation_ready` means only that the confirmation modal readback matches the
request and the runner has stopped for manual confirmation. It must not mean the
order was submitted, captured, confirmed, or persisted.

The Action 294 contract implements these statuses as diagnostic states. It
allows final-confirm visibility as read-only evidence by default, records it as
a risk flag and warning, and blocks any final-confirm click attempt. A
successful `confirmation_ready` result includes `waitingForManualConfirmation:
true` metadata and safety labels for manual final confirmation, no `Bekrafta`
click, no broker result, and no order submission.

## Review-Click Policy

- Click only exact matching `Granska kop` for buy.
- Click only exact matching `Granska salj` for sell.
- Never click a generic primary button.
- Never click when the review label is ambiguous.
- Never click when the expected action is ambiguous or missing.
- Never click if a final-confirm-like target is detected as the click target.
- Never click if form-fill verification is missing or not `form_filled`.
- Never click if validation errors are visible.
- Stop immediately after confirmation modal detection and readback.
- If no confirmation modal appears after the review click, return failed or
  blocked diagnostics and do not retry into final confirmation.

## Confirmation Modal Verification Policy

Required verification:

- instrument matches expected ticker/name/market/currency/type where available
- action matches expected buy/sell
- quantity matches expected
- price/course matches expected within an explicit tolerance
- order mode or Advanced context remains consistent when visible
- final button label may be visible but is read-only and never clicked
- cancel/back control is visible when safely detectable
- fees/totals/currency/FX fields are read-only diagnostics when available

Mismatch behavior:

- any core mismatch returns `confirmation_mismatch` or `blocked`
- missing action, instrument, quantity, or price returns blocked/manual-review
  diagnostics
- missing non-critical fee, total, currency, FX, or valid-until fields returns a
  warning when the core fields still match
- account label mismatch returns blocked unless a future account policy
  explicitly allows manual review

## Final-Confirm Hard Block

- `Bekrafta kop` and `Bekrafta salj` remain denylisted.
- Any attempted final-confirm click is critically blocked.
- Keyboard submit is blocked.
- Final confirm visibility is expected after a confirmation modal opens, but it
  is read-only evidence only.
- The future runner must enter `waiting_for_manual_confirmation` after a
  verified confirmation modal.
- The future runner must have no state transition from
  `waiting_for_manual_confirmation` to broker submission.

## Safe Action Requirements

- The review click must go through the safe action wrapper.
- The review target must be explicitly allowlisted for this phase.
- Final-confirm denylist validation remains active before every action.
- Direct raw click calls are forbidden.
- Keyboard submit is forbidden.
- Generic primary CTA clicks are forbidden.
- The action diagnostics must prove which `Granska` target was clicked and that
  no `Bekrafta` target was clicked.

## Hard Stops

Stop immediately when any of these occur:

- form-fill result is missing, blocked, mismatched, or not `form_filled`
- review label mismatch
- review target ambiguity
- validation error
- confirmation modal not detected
- modal action mismatch
- modal instrument mismatch
- modal quantity mismatch
- modal price mismatch
- final confirm clicked or attempted
- keyboard submit detected
- account, balance, holding, or other sensitive data detected
- unexpected UI
- session timeout or login challenge
- user abort

Hard stops must not retry into final confirmation, broker result creation,
Supabase writes, execution record creation, or trade mutation.

## Privacy And Data Minimization

- Store only sanitized confirmation modal readback.
- Do not store account numbers.
- Do not store balances.
- Do not store holdings.
- Do not store personal identifiers.
- Do not store credentials.
- Do not store raw DOM dumps or page HTML.
- Do not store unsanitized screenshots.
- Keep diagnostics local by default.

Any future persistence of sanitized confirmation diagnostics requires a separate
persistence design.

## UI Behavior

A future UI may show an informational panel such as:

- `Review click preview`
- `confirmation_ready`, mismatch, validation, blocked, or failed status
- sanitized confirmation modal readback fields
- `waiting_for_manual_confirmation`
- no `Bekrafta`
- no broker submission
- no broker result
- no trade mutation

The UI must not show or enable:

- Avanza review/run/start button before separate approval
- `Bekrafta` button
- broker submission button
- broker result capture button
- execution record creation
- trade-state mutation action

## Contract Test Coverage

Action 294 added pure e2e/contract coverage for:

- `form_filled` plus matching sanitized confirmation readback returning
  `confirmation_ready`
- form not ready returning `form_not_ready`
- missing confirmation readback returning `unavailable`
- missing confirmation modal returning `failed`
- review label mismatch returning `blocked`
- action, ticker, quantity, and price mismatches returning
  `confirmation_mismatch`
- visible validation errors returning `validation_error`
- final-confirm visibility allowed as read-only warning/risk evidence
- final-confirm click attempts returning `prohibited_final_confirm_detected`
- keyboard submit and sensitive account/balance/holding signals returning
  `blocked`
- missing optional fee/total/valid-until fields returning warnings only

## Test Plan

Before implementation:

- pure review-click result contract tests
- synthetic confirmation modal fixtures
- bridge stub request/response tests
- safe action tests for allowed `Granska` versus forbidden `Bekrafta`
- keyboard submit blocking tests
- confirmation mismatch fixtures
- final-confirm denylist tests
- manual Avanza mapping refresh
- no real review click until explicit user approval

## Graduation Criteria To Confirmation-Readback / Manual-Final-Confirm Wait Design

Can proceed only when:

- review-click result contract is implemented and tested
- final-confirm denylist is tested
- confirmation mismatch handling is tested
- lifecycle `waiting_for_manual_confirmation` state is designed
- no final-confirm behavior exists
- user explicitly approves the next phase

## Action 296 UI Preview

Action 296 added a dev-gated, read-only `Review click preview` section to the
Execution Handoff Preview Modal. The button text is `Check review-click stub`;
it calls only the localhost `/review-click` stub for the current dry-run
request and latest `form_filled` Advanced result when available.

The preview displays summary/status, expected action/quantity/price,
confirmation readback, field checks, risk flags, blockers/errors/warnings,
manual-confirmation wait state, safety labels, and no-action metadata. The
readiness panel now includes informational review-click rows for status,
confirmation readiness, mismatch, manual-confirmation wait, no `Bekrafta`, and
no broker result.

This UI does not add browser control, Avanza URLs, runtime selectors, real
`Granska`, `Bekrafta`, broker result capture, Supabase writes, execution-record
creation, or trade mutation.

## Action 297 Manual Confirmation Wait Design

Action 297 added
[`docs/avanza-manual-confirmation-wait-phase-design.md`](avanza-manual-confirmation-wait-phase-design.md).
It defines the future phase after `confirmation_ready`: Ture may display
`waiting_for_manual_confirmation`, but the human remains final authority and
the agent must not click `Bekrafta kop`, click `Bekrafta salj`, keyboard-submit,
create a broker result, write Supabase, or mutate trade state.

## Action 298 Manual Confirmation Wait Result Contract

Action 298 added `lib/avanza-manual-confirmation-wait-contract.ts`, a pure
TypeScript result contract for waiting after `confirmation_ready`. It models
waiting, cancelled, timed-out, user-confirmed-unverified, and blocked states
without adding browser control, `Bekrafta`, broker results, Supabase writes, or
trade mutation.

## Action 300 Broker Confirmation Capture Design

Action 300 added
[`docs/avanza-broker-confirmation-capture-phase-design.md`](avanza-broker-confirmation-capture-phase-design.md).
It keeps review-click and manual-wait separate from any future broker
confirmation capture. A future capture phase may read sanitized receipt
evidence after a human final action, but it must not click `Bekrafta`, infer
execution from `user_confirmed_unverified`, create `BrokerExecutionResult`,
write Supabase, or mutate trades.

## Recommended Next Action

Recommended next action:

- `Action 301 - Broker Confirmation Capture Result Contract`

That action should remain pure contract work unless separately approved.
