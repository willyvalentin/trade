# Avanza Instrument Page Phase Design

Status: documentation-only design for a future phase.

This document does not approve or implement Avanza automation. It adds no
Avanza URLs, selectors, Playwright imports, browser control, order-page
behavior, buy/sell clicks, form filling, order submission, broker results,
Supabase writes, or trade mutation.

## Purpose

Define the future instrument-page phase after a verified instrument result.

Instrument page means viewing or confirming a non-order instrument page only.
The phase may eventually identify that the selected instrument page is visible
and verify page-level identity. It must not enter order entry.

The phase answers one narrow question:

- Does the visible or selected instrument page match the verified instrument
  identity strongly enough to proceed to a later design phase?

## Scope

Allowed:

- Consume a verified instrument-verification result.
- Open or identify a non-order instrument page in a future approved runner.
- Verify visible page identity: ticker, name, market, currency, and instrument
  type.
- Detect buy/sell buttons only as prohibited or guarded elements.
- Return page-identified, not-identified, mismatch, blocked, unavailable, or
  failed status.
- Emit sanitized diagnostics.

Forbidden:

- Click `Köp`, `Sälj`, trade, or order actions.
- Open an order page.
- Fill quantity, price, amount, account, order type, validity, or any order
  field.
- Read balances, holdings, account numbers, account labels, personal
  identifiers, credentials, cookies, or raw browser storage.
- Submit anything.
- Create broker results.
- Create execution records.
- Mutate trade state.
- Write Supabase.
- Persist sensitive data.

## Required Prerequisites

- Manual mapping refresh is green.
- Session detection status is `ready_for_search_only`.
- Search-only result status is `exact_match`.
- Instrument verification status is `verified`.
- Selected candidate has no critical risk flags.
- Avanza dry-run request is valid.
- Capability gate remains `dry_run_only`.
- Broker submission is disabled.
- Final confirm is disabled.
- Automatic mode is disabled.
- User is watching the browser if a later browser-adjacent implementation is
  approved.

## Planned Inputs

Planned input fields:

- `expectedInstrument`
  - ticker
  - name
  - market
  - currency
  - instrumentType
- `verifiedInstrumentResult`
  - status
  - selected candidate
  - field checks
  - risk flags
  - warnings
- `selectedCandidate`
  - displayName
  - ticker
  - market
  - currency
  - instrumentType
  - sanitizedSource
- source dry-run order input or bridge request id
- source recommendation id or execution intent id if available
- sanitized page identity if a future approved runner observes the page
- sanitized metadata only

Do not include account, balance, holdings, personal identifiers, credentials,
raw DOM, raw HTML, screenshots, cookies, or tokens.

## Result Contract

The pure result contract now exists in
`lib/avanza-instrument-page-contract.ts`. It models sanitized
instrument-page identity checks without controlling a browser.

## Statuses

The contract models these statuses:

- `unavailable`
- `verification_not_ready`
- `page_not_open`
- `page_identified`
- `page_mismatch`
- `prohibited_order_controls_detected`
- `blocked`
- `failed`

Status meaning:

| Status | Meaning | Next behavior |
| --- | --- | --- |
| `unavailable` | Instrument-page capability is not available. | Stop. |
| `verification_not_ready` | Instrument verification is missing or not `verified`. | Stop. |
| `page_not_open` | No non-order instrument page is identified. | Stop or wait, depending on future design. |
| `page_identified` | Page-level identity matches the verified instrument. | May proceed only to the next approved design phase. |
| `page_mismatch` | Visible page identity does not match the verified instrument. | Stop and report mismatch. |
| `prohibited_order_controls_detected` | Buy/sell/order controls were detected near the boundary. | Stop and report guarded controls. |
| `blocked` | Critical safety risk or forbidden context detected. | Stop. |
| `failed` | Contract or unexpected processing failure. | Stop safely. |

## Page Identity Policy

The helper `evaluateAvanzaInstrumentPage(...)` implements this policy for
sanitized page identity input.

- Ticker, name, market, currency, and instrument type should match the verified
  instrument when available.
- Missing market, currency, or instrument type should warn or block depending
  on risk.
- Buy/sell buttons may be detected only as guard elements. They must never be
  clicked.
- Order-entry fields must not be present.
- Account, balance, and holding fields must not be read or stored.
- If the page appears to be an order page, return `blocked`.
- If identity mismatches the verified instrument, return `page_mismatch` or
  `blocked`.
- If the page identity is incomplete, stop for manual review unless a later
  contract defines safe ambiguity handling.
- Buy/sell button visibility may produce warnings and risk flags while still
  allowing `page_identified` when identity matches and no order page/form/final
  confirmation/sensitive signal is present.

## Prohibited Control Policy

- Buy/sell buttons are allowed to be detected only as prohibited controls.
- Any attempt to click buy/sell must be blocked by the safe action layer.
- Any order-page navigation from this phase is a failure.
- Any order-entry form target is blocked.
- Any final-confirm-like control is critical blocked.
- Keyboard submit or shortcut behavior must be blocked if detected.
- Prohibited controls may be reported as sanitized labels/risk flags only.

## Hard Stops

Stop immediately when any of these occur:

- instrument verification is not `verified`
- selected candidate is missing
- wrong instrument page
- page identity mismatch
- order page detected
- buy/sell click attempted
- order/trade action target detected
- quantity, price, amount, account, or order field detected
- account, balance, holding, or personal data detected
- sensitive data detected
- unexpected UI
- manual mapping is stale or red
- user abort
- bridge or runner self-check fails

Hard stops must produce diagnostics only. They must not create broker results,
execution records, Supabase writes, or trade mutations.

## Privacy And Data Minimization

- Store only sanitized instrument-page identity.
- Do not store account numbers.
- Do not store account labels.
- Do not store balances.
- Do not store holdings.
- Do not store personal identifiers.
- Do not store credentials.
- Do not store cookies or tokens.
- Do not store raw DOM dumps or page HTML.
- Do not store unsanitized screenshots.
- Keep diagnostics local until a separate persistence design explicitly
  approves otherwise.

## UI Behavior

A future UI may show:

- `Instrument page preview`
- page identified, page mismatch, blocked, failed, or unavailable state
- visible identity fields
- selected candidate summary
- verified instrument summary
- detected prohibited controls as warnings
- local diagnostics timestamp

The UI must not show:

- Avanza instrument-page/run/start button
- order button
- buy/sell button
- open order page button
- broker submission button
- broker result capture button
- trade-state mutation action

If page identity succeeds, the UI may say:

- `Ready for future order-page-open design`

That label is informational only and must not enable order-page behavior without
a separate approved phase.

## Test Plan

Before implementation:

Current contract coverage:

- verified instrument plus matching page identity -> `page_identified`
- verification not verified -> `verification_not_ready`
- missing page identity -> `page_not_open`
- ticker mismatch -> `page_mismatch`
- currency mismatch -> `page_mismatch`
- missing page currency -> `page_mismatch`
- order-page context -> `blocked`
- order form visible -> `blocked`
- final confirm visible -> `blocked`
- account/balance/holdings/sensitive signals -> `blocked`
- buy/sell buttons visible while identity matches -> `page_identified` with
  warnings/risk flags
- buy/sell buttons visible with strict prohibited-control policy ->
  `prohibited_order_controls_detected`
- summaries and safety labels include no order page, no buy/sell click, no form
  fill, no broker submission, and no trade mutation

Current bridge stub coverage:

- `POST /instrument-page` exists on the localhost bridge as a non-executing
  synthetic response stub.
- Stub modes cover page identified, buy/sell-visible warnings, ticker/currency
  mismatches, missing page field, strict prohibited controls, order-page block,
  order-form block, final-confirm block, sensitive-data block, verification not
  ready, page not open, unavailable, and malformed request failures.
- The endpoint returns response-level safety metadata for no browser actions,
  no Avanza page touched, no order page opened, no buy/sell click, no form fill,
  no broker result, and no trade mutation.

Current UI preview coverage:

- The Execution Handoff Preview Modal includes a dev-gated, read-only
  `Instrument page preview` panel.
- The panel can manually check the localhost `/instrument-page` stub using the
  current dry-run request instrument and, when available, the latest verified
  instrument result.
- The panel displays status, summary, sanitized page identity, field checks,
  warnings, blockers, risk flags, and safety metadata.
- The preview remains informational only. It does not control a browser, touch
  Avanza, open an order page, click buy/sell controls, fill forms, submit
  orders, create broker results, write Supabase, or mutate trades.

Before any browser-adjacent implementation:

- bridge stub tests if a localhost endpoint is later proposed
- manual Avanza mapping refresh review
- no real browser page opening until explicit approval

Any future browser-adjacent test must remain separate from this design and
require explicit approval.

## Graduation Criteria To Order-Page-Open Design

Can proceed only when:

- instrument page result contract is implemented and tested
- page identity match policy is clear
- prohibited control detection policy is clear
- page mismatch stops safely
- prohibited controls stop safely
- no order-entry behavior exists
- no buy/sell behavior exists
- no form-fill behavior exists
- no final-submit behavior exists
- user explicitly approves the next phase

The next phase should still be a design phase before implementation. Opening an
order page or preparing an order requires a separate safety design and explicit
approval.

That design now exists in `docs/avanza-order-page-open-phase-design.md`. It is
documentation-only and scopes the next future phase to opening and verifying an
order page only. It still forbids form fill, `Granska`, `Bekrafta`, final
confirmation, broker results, Supabase writes, and trade mutation.

The following form-fill design now exists in
`docs/avanza-advanced-form-fill-phase-design.md`. It is also
documentation-only and scopes the later phase to Advanced quantity/price field
population and verification only. It still forbids `Granska`, `Bekrafta`,
submit, broker results, Supabase writes, and trade mutation.

The pure order-page-open result contract now exists in
`lib/avanza-order-page-open-contract.ts`. It can compare expected action and
instrument against sanitized order-page identity and return safe
`order_page_opened`, mismatch, wrong-action, prohibited-form-interaction,
blocked, unavailable, or failed states without browser control.

## Recommended Next Action

Recommended next action:

- Action 290 - Avanza Advanced Form Fill Result Contract

Action 290 should add pure TypeScript result types/helpers only. It should
still add no browser control, Avanza selectors, Avanza URLs, form-fill runtime,
review clicks, final-confirm clicks, broker results, Supabase writes, or trade
mutation.
