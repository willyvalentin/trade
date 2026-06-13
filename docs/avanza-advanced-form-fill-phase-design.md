# Avanza Advanced Form Fill Phase Design

Status: documentation-only design for a future phase.

This document does not approve or implement Avanza automation. It adds no
Avanza URLs, selectors, Playwright imports, browser control, form-fill button,
`Granska` click, `Bekrafta` click, order submission, broker result, Supabase
write, or trade mutation.

The pure result contract now exists in
`lib/avanza-advanced-form-fill-contract.ts`. It models sanitized Advanced
form-fill diagnostics without controlling a browser or filling a real form.

Action 291 added a non-executing localhost bridge stub for this contract:
`POST /advanced-form-fill`. It accepts a dry-run order input plus optional
order-page-open result and sanitized form state, then returns synthetic
`AvanzaAdvancedFormFillResult` metadata from explicit local stub modes. The
stub does not control a browser, touch Avanza, add selectors/URLs, fill a real
form, click `Granska`, click `Bekrafta`, submit orders, create broker results,
write Supabase, or mutate trades.

Action 292 added a dev-gated, read-only `Advanced form-fill preview` panel to
the Execution Handoff Preview Modal. The panel can manually call the localhost
`/advanced-form-fill` stub for the current dry-run request and latest
order-page-open result when available. It displays filled, mismatch,
validation-error, unsupported-mode, prohibited-review, prohibited-final-confirm,
blocked, field-check, risk-flag, and safety metadata. It adds no real form-fill
behavior, browser control, Avanza selectors/URLs, `Granska`, `Bekrafta`, broker
result, Supabase write, or trade mutation.

Action 293 added `docs/avanza-review-click-phase-design.md`, a
documentation-only design for the next future phase after `form_filled`. It
keeps `Granska` as a future separately approved action and keeps `Bekrafta`,
broker submission, broker results, Supabase writes, and trade mutation
forbidden.

Action 294 added `lib/avanza-review-click-contract.ts`, the pure diagnostic
contract for that next phase. It consumes a `form_filled` Advanced result plus
sanitized confirmation modal readback and can report `confirmation_ready`,
mismatch, validation, final-confirm, blocked, failed, or unavailable states. It
still does not click `Granska`, click `Bekrafta`, control a browser, submit
orders, create broker results, write Supabase, or mutate trades.

## Purpose

Define the future Advanced form-fill phase after an order page has been opened
and verified.

Advanced form fill means allowed field population and verification only. The
phase may eventually fill quantity and price/course fields on an already-opened
Advanced order page, verify the readback values, and stop.

It does not review the order, click final confirmation, submit any order,
create broker results, write Supabase, mutate trades, or update
History/Statistics.

## Scope

Allowed in a future separately approved runner:

- consume an `order_page_opened` result
- verify the order page action and instrument again
- verify the Advanced order mode
- fill quantity / `antal`
- fill price / course / `kurs`
- optionally read amount, estimated total, currency, and fee fields as
  read-only diagnostics
- verify filled values after fill
- return `form_filled`, mismatch, validation-error, or blocked diagnostics
- emit sanitized local diagnostics

Forbidden:

- click `Granska kop` or `Granska salj`
- click `Bekrafta kop` or `Bekrafta salj`
- submit any form
- trigger keyboard Enter or Space submit
- change account unless a future explicit policy allows it
- use the Stop Loss tab
- use the Glidande tab
- change unsupported order modes
- read balances, holdings, account identifiers, or personal identifiers
- create a broker result
- mutate trade state
- persist sensitive data

## Required Prerequisites

- Manual mapping refresh is green or explicitly acknowledged.
- Session detection is `ready_for_search_only`.
- Search-only result is `exact_match`.
- Instrument verification result is `verified`.
- Instrument page result is `page_identified`.
- Order page open result is `order_page_opened`.
- The opened order page matches the requested action and instrument.
- Dry-run request is valid.
- `orderMode` is `advanced`.
- Capability gate is `dry_run_only`.
- Broker submission is disabled.
- Final confirmation is disabled.
- User is watching the browser.

If any prerequisite is missing, the future runner must stop before form fill.

## Planned Inputs

- `dryRunOrderInput`
  - action
  - instrument
  - quantity
  - price
  - orderMode
- `orderPageOpenResult` with status `order_page_opened`
- current sanitized form identity/state, if a future approved runner observes it
- account policy from the dry-run request
- source request id, recommendation id, or execution intent id when available
- sanitized metadata only

Do not include account numbers, balances, holdings, personal identifiers,
credentials, raw DOM, page HTML, cookies, tokens, or unsanitized screenshots.

## Planned Statuses

The contract models these statuses:

- `unavailable`
- `order_page_not_ready`
- `unsupported_order_mode`
- `form_filled`
- `field_mismatch`
- `validation_error`
- `prohibited_review_detected`
- `prohibited_final_confirm_detected`
- `blocked`
- `failed`

`form_filled` means only that allowed fields were filled and verified. It must
not mean the order was reviewed, submitted, captured, or confirmed.

## Field Policy

Allowed fields:

- quantity / `antal`
- price / course / `kurs`
- Advanced order mode only if it is already visible and selected, or if a later
  approved policy explicitly allows safe selection
- amount, estimated fees, estimated totals, and currency fields as read-only
  diagnostics

Not allowed:

- account changes unless a later explicit policy allows them
- Stop Loss fields
- Glidande fields
- hidden unsupported controls
- unsupported advanced controls not documented by manual mapping
- review controls
- final confirmation controls
- any submit-capable control

## Advanced Mode Policy

- Advanced order mode must be selected or verified before filling.
- If Stop Loss or Glidande is active, the result must be blocked.
- If order mode is ambiguous, the result must be blocked.
- If Avanza remembers a previous tab, the first design should block for manual
  review instead of switching tabs.
- A future tab-switching policy must be separate, explicit, and tested before
  any runner changes order mode.

## Verification Policy

After fill, the future runner must verify:

- quantity matches the dry-run request
- price matches the dry-run request
- action still matches the dry-run request
- instrument still matches the dry-run request
- order mode is Advanced
- no validation errors are visible
- no `Granska` click occurred
- no final confirmation appeared or was clicked
- no unintended account change occurred
- no unsupported fields were touched
- no broker result, execution record, Supabase write, History/Statistics update,
  or trade mutation occurred

Any mismatch must stop as `field_mismatch`, `validation_error`, `blocked`, or
`failed` diagnostics only.

## Safe Action Requirements

- All future fill actions must go through the safe action wrapper.
- The review button is forbidden in this phase.
- The final-confirm denylist remains active before every action.
- Keyboard submit is forbidden.
- Direct DOM/page actions are forbidden.
- Generic primary button clicks are forbidden.
- Unknown controls are forbidden.
- Safe action diagnostics must distinguish allowed fills from forbidden review
  and final-confirm actions.

## Hard Stops

Stop immediately when any of these occur:

- order page is not ready
- wrong action
- wrong instrument
- unsupported tab or mode
- validation error
- quantity mismatch after fill
- price mismatch after fill
- account mismatch
- account-sensitive data detected
- balance or holdings detected
- review button clicked or attempted
- final confirmation detected
- keyboard submit detected
- unexpected UI
- session timeout or login challenge
- user abort

Hard stops must not retry into review, final confirmation, broker result
creation, Supabase writes, execution record creation, or trade mutation.

## Privacy And Data Minimization

- Store only sanitized action, instrument, quantity, price, and order mode.
- Do not store account numbers.
- Do not store balances.
- Do not store holdings.
- Do not store personal identifiers.
- Do not store credentials.
- Do not store raw DOM dumps or page HTML.
- Do not store unsanitized screenshots.
- Keep diagnostics local by default.

Any future persistence of sanitized diagnostics requires a separate persistence
design.

## UI Behavior

A future UI may show an informational panel such as:

- `Advanced form-fill preview`
- `form_filled`, mismatch, validation, blocked, or failed status
- filled field readback
- Advanced mode verification
- validation errors if present
- no `Granska`
- no `Bekrafta`
- no broker submission
- no broker result

The UI must not show or enable:

- Avanza form-fill/run/start button before separate approval
- `Granska` button
- `Bekrafta` button
- broker submission button
- broker result capture button
- execution record creation
- trade-state mutation action

## Test Plan

Before implementation:

- pure Advanced form-fill result contract tests
- synthetic form-state fixtures
- bridge stub tests
- safe action tests for allowed fills versus forbidden review/final confirm
- keyboard submit blocking tests
- validation-error fixtures
- field mismatch fixtures
- unsupported mode fixtures
- manual Avanza mapping refresh
- no real form fill until explicit user approval

Current contract coverage:

- matching Advanced action/ticker/quantity/price -> `form_filled`
- order page not `order_page_opened` -> `order_page_not_ready`
- missing sanitized form state -> `unavailable`
- Stop Loss, Glidande, or unknown order mode -> `unsupported_order_mode`
- action mismatch -> `field_mismatch`
- ticker mismatch -> `field_mismatch`
- missing, invalid, or mismatched quantity -> `field_mismatch`
- missing, invalid, or mismatched price/course -> `field_mismatch`
- visible validation messages -> `validation_error`
- review/`Granska` click attempt -> `prohibited_review_detected`
- final-confirm visible or attempted -> `prohibited_final_confirm_detected`
- keyboard submit, account change, unsupported field touch, account/balance/
  holdings/sensitive signals -> `blocked`
- review button visible only -> allowed with warning by default
- review button visible with strict option -> `field_mismatch`
- summaries and labels include Advanced form fill only, no `Granska`, no
  `Bekrafta`, no keyboard submit, no broker submission, and no trade mutation

## Graduation Criteria To Review-Click Design

Can proceed to a later review-click design only when:

- Advanced form-fill result contract is implemented and tested
- safe action wrapper distinguishes allowed fields from review/final confirm
- validation errors are tested
- field mismatch handling is tested
- unsupported order modes are tested
- no review-click behavior exists in the form-fill phase
- user explicitly approves the next phase

## Recommended Next Action

Recommended Action 294:

- `Action 294 - Avanza Review Click Result Contract`

That action should add only pure TypeScript types and helpers for review-click
and confirmation-modal readback diagnostics. It should still add no browser
control, Avanza URLs, selectors, Playwright imports, review click runtime,
final-confirm click, broker result, Supabase write, or trade mutation.
