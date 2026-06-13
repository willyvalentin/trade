# Avanza Order Page Open Phase Design

## Purpose

Define the future order-page-open phase after a verified instrument page has
been identified.

This phase may eventually open the order page only. It must stop after verifying
that the order page opened for the requested action and instrument. It does not
fill forms, click review, click final confirmation, submit orders, create broker
results, write Supabase, or mutate trades.

This document is a design checkpoint only. It does not implement browser
control, Avanza selectors, Avanza URLs, or an Avanza runner.

The pure result contract now exists in
`lib/avanza-order-page-open-contract.ts`. It models sanitized
order-page-open diagnostics without controlling a browser.

The later review-click phase is documented in
`docs/avanza-review-click-phase-design.md`. Order-page-open and Advanced
form-fill phases still forbid `Granska`; the review-click design is only a
future safety plan and adds no runtime review behavior.

## Scope

Allowed in a future separately approved runner:

- consume a `page_identified` instrument-page result
- verify the requested action from the dry-run request is `buy` or `sell`
- click only the matching entry control: `Kop` for buy or `Salj` for sell
- verify that an order page opened
- verify the opened order page action context is buy or sell
- verify visible instrument identity on the order page when safely available
- return an order-page-open result such as opened, mismatch, or blocked
- emit local diagnostics

Forbidden:

- fill quantity
- fill price
- change account
- change order type
- click `Granska kop` or `Granska salj`
- click `Bekrafta kop` or `Bekrafta salj`
- submit any form
- trigger keyboard Enter or Space submit
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
- Dry-run request is valid.
- Requested action is `buy` or `sell`.
- Capability gate is `dry_run_only`.
- Broker submission is disabled.
- Final confirmation is disabled.
- User is watching the browser.

If any prerequisite is missing, the future runner must stop before any click.

## Planned Inputs

- `dryRunOrderInput.action`
- `dryRunOrderInput.instrument`
- `instrumentPageResult` with status `page_identified`
- expected action: `buy` or `sell`
- source request id
- optional sanitized order-page identity observed by a future runner
- sanitized metadata only

No account numbers, balances, holdings, credentials, raw DOM, unsanitized
screenshots, or broker confirmations should be included.

## Planned Statuses

- `unavailable`
- `instrument_page_not_ready`
- `action_not_supported`
- `order_page_opened`
- `order_page_mismatch`
- `wrong_action_opened`
- `prohibited_form_interaction_detected`
- `blocked`
- `failed`

`order_page_opened` means only that the page opened and the future runner
stopped. It must not mean an order was prepared, reviewed, submitted, or
captured.

## Order Page Opening Policy

- Click only one explicit matching entry control.
- For buy, the target must clearly be the entry `Kop` control.
- For sell, the target must clearly be the entry `Salj` control.
- Never click a generic primary button.
- Never click when the action is ambiguous.
- Never click when both buy and sell controls cannot be distinguished.
- Never click if safe-action validation flags the target as final-confirm-like.
- Never click `Granska` or `Bekrafta`.
- After the entry click, verify order-page context and stop immediately.

If the page opens with the wrong action, wrong instrument, order-form side
effects, or sensitive account data, the result must be blocked or failed.

## Safe Action Requirements

- Every click must go through the safe action wrapper.
- The entry buy/sell click is high risk and allowed only in this specific
  future phase.
- The final-confirm denylist remains active.
- `Granska` / review buttons remain forbidden in this phase.
- Any form-fill action is forbidden.
- Keyboard submit is forbidden.
- Any attempt to click final confirmation must be blocked before execution.
- Diagnostics must distinguish entry buy/sell click from review and final
  confirmation controls.

## Hard Stops

- instrument page is not identified
- requested action is missing or unsupported
- buy/sell controls are ambiguous
- wrong action opened
- wrong instrument opened
- order form is auto-filled unexpectedly
- account data is visible or detected
- balance or holdings are visible or detected
- review button click is attempted
- final confirmation is detected
- unexpected UI state
- session timeout or login challenge
- user abort

Hard stops must return blocked/failed diagnostics only. They must not retry into
form fill, review, final confirmation, broker result creation, Supabase writes,
or trade mutation.

## Privacy And Data Minimization

- Store only sanitized order page identity, action, and instrument fields.
- Do not store account numbers.
- Do not store balances.
- Do not store holdings.
- Do not store personal identifiers.
- Do not store raw DOM dumps.
- Do not store credentials.
- Do not store unsanitized screenshots.
- Keep diagnostics local by default.

Any future persistence of sanitized diagnostics requires a separate persistence
design.

## UI Behavior

A future UI may show an informational panel such as:

- `Order page open preview`
- opened/mismatch/blocked state
- action context buy/sell
- sanitized instrument identity
- no form fill
- no review click
- no final confirmation
- no broker submission

The UI must not imply that an order was prepared or submitted. It must not
create broker results, execution records, Supabase writes, or trade mutation.

## Test Plan

Before implementation:

- pure order-page-open result contract tests
- synthetic order page identity fixtures
- bridge stub request/response tests
- safe action tests for entry `Kop`/`Salj` versus forbidden review/final
  confirm controls
- keyboard submit blocking tests
- mismatch and wrong-action fixtures
- prohibited form interaction fixtures
- manual Avanza mapping refresh
- no real order-page opening until explicit user approval

Current contract coverage:

- `page_identified` plus matching buy order page -> `order_page_opened`
- `page_identified` plus matching sell order page -> `order_page_opened`
- instrument page not identified -> `instrument_page_not_ready`
- unsupported action -> `action_not_supported`
- wrong attempted action -> `wrong_action_opened`
- opened order page action mismatch -> `wrong_action_opened`
- ticker mismatch -> `order_page_mismatch`
- currency mismatch -> `order_page_mismatch`
- missing order page identity -> `unavailable`
- confirmation modal context -> `blocked`
- final confirm visible -> `blocked`
- review/final-confirm click attempt metadata -> `blocked`
- keyboard submit metadata -> `blocked`
- prefilled form -> `prohibited_form_interaction_detected`
- account/balance/holdings/sensitive signals -> `blocked`
- review button visible only -> allowed with warning by default
- review button visible with strict option ->
  `prohibited_form_interaction_detected`
- summaries and labels include no form fill, no `Granska`, no `Bekrafta`, no
  broker submission, and no trade mutation

Current bridge stub coverage:

- `POST /order-page-open` exists on the localhost bridge as a non-executing
  contract/stub endpoint.
- The endpoint accepts a validated dry-run order input plus optional
  instrument-page result, sanitized order-page identity, and attempted action.
- Stub modes cover synthetic buy/sell opened states, wrong action, ticker and
  currency mismatch, prefilled form hard-stop, final-confirm block,
  review/`Granska` attempt block, keyboard submit block, sensitive-data block,
  instrument-page-not-ready, and missing order-page identity.
- Smoke and e2e/client normalization coverage assert no browser actions, no
  Avanza page touched, no Avanza URLs/selectors, no form fill, no review click,
  no final-confirm click, no broker result, no Supabase write, and no trade
  mutation.

Current UI preview coverage:

- The Execution Handoff Preview Modal includes a dev-gated, read-only
  `Order page open preview` panel.
- The panel can manually call `POST /order-page-open` through
  `checkLocalhostBridgeOrderPageOpen(...)`.
- It displays opened, wrong-action, mismatch, blocked, field-check, risk-flag,
  blocker, warning, and safety metadata.
- Readiness rows show order-page-open status, opened true/false, wrong action,
  mismatch, no form fill, and no `Granska`/`Bekrafta`.
- `order_page_opened` shows `Ready for future form-fill design`, but no
  form-fill behavior is enabled.
- The panel has no Avanza open/run/start button and does not navigate, control a
  browser, fill forms, click `Granska`, click `Bekrafta`, submit orders, create
  broker results, write Supabase, or mutate trades.

## Graduation Criteria To Form-Fill Design

Can proceed only when:

- order-page-open result contract is implemented and tested
- safe action wrapper distinguishes entry buy/sell from review/final confirm
- order-page-open mismatch handling is tested
- wrong-action handling is tested
- prohibited form interaction handling is tested
- no form-fill behavior exists
- no review click behavior exists
- no final-confirm behavior exists
- user explicitly approves the next phase

The next phase should still be a design phase before implementation. Filling an
order form requires a separate safety design and explicit approval.

## Next Phase Design

The next phase design now exists in
`docs/avanza-advanced-form-fill-phase-design.md`.

That document scopes a future Advanced form-fill phase to allowed quantity and
price/course field population plus verification only. It still forbids
`Granska`, `Bekrafta`, keyboard submit, broker results, Supabase writes, and
trade mutation.

The pure Advanced form-fill result contract now exists in
`lib/avanza-advanced-form-fill-contract.ts`. It can evaluate sanitized form
state against a dry-run request and `order_page_opened` result without browser
control or real form fill.

## Recommended Next Action

Recommended next action:

- Action 291 - Advanced Form Fill Bridge Stub Contract

Any next action must remain pure contract/stub work unless separately approved.
It must not add browser control, Avanza selectors, Avanza URLs,
order-page/run/start buttons, runtime form fills, review clicks, final-confirm
clicks, broker results, Supabase writes, or trade mutation without separate
explicit approval.
