# Avanza UI Research Mapping

Date: 2026-06-11

Status: Documentation-only mapping intake from a sanitized Avanza UI research screenshot package. No Avanza automation was added, no Avanza page was opened from code, no Avanza URL was added to app runtime, no credentials were added, no browser automation was added, no broker result was created, and no order submission is in scope.

Related:

- `docs/avanza-ui-research-plan.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`
- `docs/execution-agent-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-qa-notes.md`
- `lib/mock-order-page-agent-contract.ts`
- `lib/mock-order-confirmation-contract.ts`

## Research Package Summary

The provided sanitized screenshot package covers the manual Avanza order flow from discovery to final confirmation modal.

Before any Avanza session-detection/search-only runner proposal, perform a
fresh manual validation pass using
`docs/avanza-manual-mapping-refresh-pack.md`. Update this mapping if the
current search flow, instrument identity readback, Advanced order form, review
step, confirmation modal, cancel behavior, validation copy, keyboard behavior,
or focus behavior differs from the existing notes.

Observed steps:

- Step 1: Search entry point.
- Step 2: Search drawer/results.
- Step 3: Stock detail page.
- Step 4: Order page/form.
- Step 5: Confirmation modal.

Observed variants:

- Buy form variants.
- Sell form variants.
- Advanced order tab.
- Stop Loss order tab.
- Glidande order tab.
- Empty form states.
- Filled form states.
- Field and form validation errors.
- Review actions through `Granska köp` and `Granska sälj`.
- Final confirmation actions through `Bekräfta köp` and `Bekräfta sälj`.
- Cancel action through `Avbryt`.

## Observed End-To-End Flow

Inferred manual flow:

```text
Search
  -> type ticker/name
  -> select instrument
  -> stock detail page
  -> click Köp or Sälj
  -> order page
  -> choose order tab
  -> fill order form
  -> click Granska köp or Granska sälj
  -> confirmation modal
  -> user manually clicks Bekräfta köp/sälj or Avbryt
```

The flow has two major risk transitions:

- selecting the correct instrument from search results
- reaching the confirmation modal without clicking the final confirmation button

## Semi-Automatic Stop Point

The semi-automatic safety boundary is the confirmation modal.

A future semi-automatic agent may be designed to:

- navigate manually-approved browser state
- search for an instrument
- select the verified instrument
- open buy or sell order placement
- fill the order form
- click `Granska köp` or `Granska sälj`
- read back the confirmation modal

A future semi-automatic agent must not:

- click `Bekräfta köp`
- click `Bekräfta sälj`
- submit a real order
- treat the confirmation modal as a broker result

The user performs final confirmation manually. This is the primary safety boundary.

## Search Flow Mapping

Observed:

- Search entry appears in the top-right area.
- Activating search opens a right-side drawer.
- The search input accepts ticker or company/instrument name.
- Results can include multiple instrument candidates.
- Result selection navigates to the stock detail page.

Risk points:

- Similar instruments can appear.
- Names may be similar across markets.
- Instrument type can differ.
- Market and currency can differ.

Future verification requirements before selecting:

- instrument name
- ticker
- market
- currency
- instrument type

Automation note:

- Do not define Avanza selectors yet.
- Future selector strategy must be proposed separately after manual notes are reviewed.
- See `docs/avanza-manual-selector-notes.md` for manual visible-label and anchor notes. Those notes are not runtime selectors and do not authorize automation.
- Use `docs/avanza-manual-mapping-qa-checklist.md` during the next manual session to answer open questions consistently and safely.
- Record the session output in `docs/avanza-manual-mapping-session-notes.md` before updating this mapping.

## Stock Detail Page Mapping

Observed areas:

- instrument name
- market, depository, or instrument metadata
- chart
- order depth
- `Köp` button
- `Sälj` button
- `Om depåbeviset` or instrument details section

Mapping:

- The stock detail page is the bridge between instrument selection and order placement.
- `Köp` and `Sälj` are the observed entry points to the order page.
- The page should be used as a verification stop before entering an order form.

Required future checks:

- selected instrument still matches Ture request
- action button matches requested side
- visible market/currency metadata does not conflict with the request

## Order Page Mapping

Observed order page areas:

- order mode selector/tabs:
  - `Advanced`
  - `Stop Loss`
  - `Glidande`
- account selector
- amount field / `Belopp i SEK`
- quantity / `Antal`
- price / `Kurs i USD` or equivalent currency-specific price
- condition / `Villkor`
- fees / `Avgifter`
- total amount / `Totalt belopp inkl. avgifter`
- review button:
  - `Granska köp`
  - `Granska sälj`
- order depth panel

Order form notes:

- Empty states show required fields and disabled or invalid review readiness.
- Filled states show calculated fee/total areas.
- Validation can appear at field level and/or form level.
- Currency labels can depend on the selected instrument.

## Order Type Support Decision

First supported Avanza scope, for a future separate implementation proposal:

- Advanced order only.
- Buy and sell.
- Quantity.
- Price/limit/current price.
- Review step.
- Confirmation modal readback.

Explicitly out of scope initially:

- Avanza Stop Loss order type.
- Avanza Glidande order type.
- Account switching unless the safe/default account is verified.
- Final confirmation click.
- Automatic mode.
- Broker result parsing.
- Real order submission.

Rationale:

- Advanced order maps most closely to the existing mock order fill plan.
- Stop Loss and Glidande add distinct order semantics and should not be included in the first mapping-to-agent step.

## Buy Order Variants

| Variant | Visible fields | Review button | Risk level | Support status |
| --- | --- | --- | --- | --- |
| Advanced buy | account, amount, quantity, price/course, condition, fees, total including fees | `Granska köp` | High | Future first candidate |
| Stop Loss buy | stop-loss-specific controls plus buy order fields | `Granska köp` or tab-specific buy review state | Critical | Later/out of scope |
| Glidande buy | trailing/gliding-specific controls plus buy order fields | `Granska köp` or tab-specific buy review state | Critical | Later/out of scope |

Buy safety checks:

- requested action is buy
- selected tab is Advanced
- instrument identity matches
- quantity matches
- price/course matches the requested limit or intended price
- account is the expected/default account
- confirmation modal says buy before user final confirmation

## Sell Order Variants

| Variant | Visible fields | Review button | Risk level | Support status |
| --- | --- | --- | --- | --- |
| Advanced sell | account, amount, quantity, price/course, condition, fees, total including fees | `Granska sälj` | High | Future first candidate |
| Stop Loss sell | stop-loss-specific controls plus sell order fields | `Granska sälj` or tab-specific sell review state | Critical | Later/out of scope |
| Glidande sell | trailing/gliding-specific controls plus sell order fields | `Granska sälj` or tab-specific sell review state | Critical | Later/out of scope |

Sell safety checks:

- requested action is sell
- selected tab is Advanced
- instrument identity matches
- quantity matches
- price/course matches the requested limit or intended price
- account is the expected/default account
- confirmation modal says sell before user final confirmation

## Form Validation And Error States

Observed error classes:

- missing required fields
- minimum amount errors
- field-level validation text
- form-level validation text

Future agent behavior:

- stop and report validation failure
- do not force review
- do not retry blindly
- do not change order type to bypass validation
- surface error text to Ture audit/progress events
- keep the order in semi-automatic/manual review state

Validation risk examples:

- quantity missing
- amount below minimum
- price missing
- wrong currency price assumption
- order form not ready for review

## Confirmation Modal Mapping

Observed modal fields:

- instrument
- account
- quantity
- price/course
- amount excluding fees
- courtage
- FX fee / valutaväxling
- preliminary exchange rate
- valid until date
- total amount
- final button:
  - `Bekräfta köp`
  - `Bekräfta sälj`
- cancel:
  - `Avbryt`

Mapping:

- This is the semi-automatic stop state.
- This is where future Ture should read back and verify order details.
- In semi-automatic mode, the user manually clicks the final button.
- In this phase, the modal is not a broker result and should not create a broker execution record.

Required future readback checks:

- instrument matches request
- action matches request
- account matches expectation
- quantity matches request
- price/course matches request or permitted tolerance
- fees and FX values are visible when applicable
- total amount is visible
- final button label matches intended action
- cancel button is available

## Risk Points And Safety Checks

Risk points:

- wrong instrument selected
- wrong market or currency
- wrong action: buy instead of sell, or sell instead of buy
- wrong account
- wrong quantity
- wrong price/course
- wrong order type tab
- validation error ignored
- confirmation modal mismatch
- final button accidentally clicked
- session timeout or login state change
- dynamic UI labels or layout changes

Required future safety checks:

- verify instrument identity before order page
- verify order action before filling
- verify Advanced tab before filling
- verify account or stop if account cannot be verified
- verify quantity/price after fill
- verify review button text before click
- verify confirmation modal values after review
- never click final confirmation in semi-automatic mode
- surface mismatches as audit/progress failures

## Comparison To Mock Order Page Contract

For the detailed mock-contract gap analysis and recommended mock-first implementation sequence, see `docs/avanza-vs-mock-order-contract-gap-analysis.md`.

Current mock fields:

- `ticker`
- `action`
- `quantity`
- `orderType`
- `limitPrice`
- `intendedPrice`
- `targetPrice`
- `stopLossPrice`
- `mode`
- `requireManualFinalConfirmation`
- `allowAutomaticFinalSubmit`
- `requestId`
- `intentId`

Observed Avanza field coverage:

| Avanza observed concept | Current mock field | Gap |
| --- | --- | --- |
| instrument ticker/name | `ticker` | instrument name and market may need explicit fields |
| buy/sell action | `action` | no gap |
| quantity / `Antal` | `quantity` | no gap |
| order tab `Advanced` | `orderType` | may need `orderMode` for Avanza tab |
| price / `Kurs` | `limitPrice`, `intendedPrice` | currency-specific price label needs metadata |
| account selector | none | needs future `account` or account verification policy |
| amount / `Belopp i SEK` | none | may need `amountSek` as readback/calculated metadata |
| fees / courtage | none | confirmation readback addition |
| FX fee / valutaväxling | none | confirmation readback addition |
| preliminary exchange rate | none | confirmation readback addition |
| valid until date | none | confirmation readback addition |
| review button label | none | future readback/control metadata |
| final confirmation label | `requireManualFinalConfirmation` / `allowAutomaticFinalSubmit` policy only | future readback metadata, not an action |
| cancel label | none | future modal safety metadata |

Potential Avanza-specific additions:

- `account`
- `amountSek`
- `priceCurrency`
- `orderMode: advanced | stop_loss | trailing`
- `fees`
- `courtage`
- `fxFee`
- `preliminaryFxRate`
- `validUntil`
- `reviewButtonLabel`
- `confirmButtonLabel`
- `cancelButtonLabel`
- `instrumentMarket`
- `instrumentCurrency`
- `instrumentType`

Recommendation:

- Update the mock contract first if these fields become required.
- Keep Avanza-specific fields as readback/verification metadata before they become fill inputs.

## Automation Readiness Assessment

Current readiness:

- The manual flow is understood at a high level.
- The semi-automatic stop point is clear.
- Advanced buy/sell appears to be the first plausible future scope.

Not ready:

- no selector strategy
- no completed sanitized session-notes intake yet
- no instrument identity verification contract
- no account verification policy
- no confirmation readback contract
- no Avanza-specific mock contract extension
- no approved automation implementation plan

Safety planning now exists in `docs/semi-auto-avanza-prototype-safety-plan.md`, but that plan is documentation-only and does not approve live automation.

Prototype requirements now exist in `docs/semi-auto-avanza-prototype-requirements.md`, but those requirements are documentation-only and do not add selectors, URLs, browser automation, or order submission.

Next safe step:

- fill `docs/avanza-manual-mapping-session-notes.md` during the next manual session, then update this mapping and the gap-analysis docs from those notes

## Out Of Scope

- Avanza automation.
- Opening Avanza from code.
- Avanza URLs in runtime.
- Avanza selectors for automation.
- Credential storage.
- Browser automation.
- Scraping.
- Final confirmation click.
- Real order submission.
- Broker result capture from Avanza.
- `TureExecutionRecord` creation from Avanza.
- Supabase writes.
- Trade mutation.
- History or Statistics integration.

## Recommended Next Action

Preferred:

- Action 244 - Avanza Prototype Final-Confirm Block Design

Alternative:

- Action 244 - Avanza Manual Mapping Update From New Screenshots

If new manual observations exist, update this mapping first. Otherwise, design the final-confirm guard before any automation code is considered.
