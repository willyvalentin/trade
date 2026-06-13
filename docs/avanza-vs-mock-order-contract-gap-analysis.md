# Avanza vs Mock Order Contract Gap Analysis

Date: 2026-06-11

Status: Actions 235-238 implemented the P0 mock order Advanced fields, mock confirmation readback fields, mock Advanced-order validation/error behavior, and mock-agent Advanced-only fill verification in local mock/dev code only. Actions 239-241 added manual visible-label/anchor notes, a manual QA checklist, and a session-notes intake template for future research. No Avanza automation was added, no Avanza URL or selector was added, no credential was added, no browser automation against Avanza was added, no order was submitted, and no broker result was created.

Related:

- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/mock-agent-prototype-checkpoint.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-checkpoint.md`
- `lib/mock-order-page-agent-contract.ts`
- `lib/mock-order-confirmation-contract.ts`

## Purpose

This document compares the observed Avanza UI research mapping with the current mock order and mock confirmation contracts.

The goal is to identify which mock fields, states, selectors, validation paths, and readback contracts should be added before any real Avanza automation research or prototype is considered.

This is not an automation design. It is a mock-contract gap analysis that keeps the next work safely inside local/dev mock pages.

## Current First Avanza Scope

The first future Avanza scope should remain narrow:

- `semi_automatic` only.
- Advanced order only.
- Buy and sell.
- Search/select instrument.
- Fill quantity and price.
- Click `Granska köp` or `Granska sälj`.
- Stop at the confirmation modal.
- Read/verify modal details.
- No final `Bekräfta köp` click.
- No final `Bekräfta sälj` click.
- No automatic mode.
- No brokerResult capture yet.

Primary safety boundary:

- The agent stops at the confirmation modal and waits for the user to manually confirm or cancel.

## Current Mock Contract Summary

Current `MockOrderPageFillPlan` fields:

- `ticker`
- `action`
- `quantity`
- `orderType`
- `limitPrice`
- `intendedPrice`
- `targetPrice`
- `stopLossPrice`
- `mode`
- `account`
- `amountSek`
- `priceCurrency`
- `instrumentMarket`
- `instrumentCurrency`
- `instrumentType`
- `orderMode`
- `reviewButtonLabel`
- `confirmButtonLabel`
- `cancelButtonLabel`
- `validUntil`
- `estimatedFees`
- `estimatedCourtage`
- `estimatedFxFee`
- `estimatedTotalAmount`
- `preliminaryFxRate`
- `requireManualFinalConfirmation`
- `allowAutomaticFinalSubmit`
- `requestId`
- `intentId`

Current mock order coverage:

- stable mock order page fill fields
- review-only path
- disabled final submit
- Advanced-only mock order mode
- account, currency, market, validity, estimate, and button-label readback
- request/intent metadata
- no real broker transport

Current mock confirmation coverage:

- status
- ticker
- action
- quantity
- requested/executed price style values
- order id and request/intent metadata
- message/status diagnostics

## Avanza Observed Fields And States

Observed Avanza fields/states from sanitized mapping:

- account selector
- amount in SEK
- quantity
- price/course with currency
- condition / `Villkor`
- fees / courtage
- FX fee / valutaväxling
- preliminary FX rate
- valid until date
- order mode tabs:
  - Advanced
  - Stop Loss
  - Glidande
- review button labels:
  - `Granska köp`
  - `Granska sälj`
- final confirmation labels:
  - `Bekräfta köp`
  - `Bekräfta sälj`
- cancel label:
  - `Avbryt`
- order depth context
- instrument metadata:
  - market
  - currency
  - instrument type
  - instrument name/ticker identity

## Field Gap Table

| Avanza field/state | Exists in mock today? | Needed for first Advanced scope? | Proposed mock field/key | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| account selector | No | Yes | `account` | P0 | Needed to verify the order is prepared for the expected/default account or to stop if unknown. |
| amount in SEK | No | Yes as readback/calculated field | `amountSek` | P0 | Avanza displays amount/total context; mock should expose it for review/readback even if not a primary fill input. |
| quantity / `Antal` | Yes | Yes | `quantity` | P0 | Already present; may need Avanza-style validation copy. |
| price/course | Partial | Yes | `limitPrice` / `intendedPrice` | P0 | Existing price fields map, but currency label is missing. |
| price currency | No | Yes | `priceCurrency` | P0 | Needed because Avanza can show `Kurs i USD` or another currency. |
| instrument market | No | Yes | `instrumentMarket` | P0 | Needed for search-result and stock-detail identity verification. |
| instrument currency | No | Yes | `instrumentCurrency` | P0 | Distinct from displayed price currency in some instruments. |
| instrument type | No | Yes | `instrumentType` | P0 | Helps avoid selecting a similarly named wrong instrument. |
| order mode tab | Partial | Yes | `orderMode` | P0 | First scope should assert `advanced`; Stop Loss/Glidande remain out of scope. |
| Advanced order mode | Partial | Yes | `orderMode: "advanced"` | P0 | Mock should make this explicit before Avanza work. |
| review button label | No | Yes | `reviewButtonLabel` | P0 | Must differ by action: `Granska köp` / `Granska sälj`. |
| final confirmation label | Policy only | Yes as readback/guard | `confirmButtonLabel` | P0 | Must be read/verified, never clicked by semi-auto agent. |
| cancel label | No | Yes | `cancelButtonLabel` | P0 | Useful as stop-state escape/readback metadata. |
| fees / courtage | No | Yes as confirmation readback | `courtage` / `fees` | P0 | Confirmation modal should show fee context before user final confirmation. |
| FX fee / valutaväxling | No | Yes as confirmation readback | `fxFee` | P0 | Required for non-SEK instruments. |
| preliminary FX rate | No | Yes as confirmation readback | `preliminaryFxRate` | P0 | Required when Avanza shows exchange-rate context. |
| valid until date | No | Yes as confirmation readback | `validUntil` | P0 | Avanza confirmation includes validity; mock should cover it. |
| amount excluding fees | No | Yes as confirmation readback | `amountExcludingFees` | P0 | Needed to compare total vs fees. |
| total amount including fees | Partial | Yes as confirmation readback | `totalAmount` | P0 | Mock should show total amount separately from price/quantity. |
| confirmation account | No | Yes | `confirmation.account` | P0 | Readback must verify account. |
| confirmation instrument | Partial | Yes | `confirmation.instrumentName` / `ticker` | P0 | Ticker alone may be insufficient. |
| confirmation quantity | Yes | Yes | `confirmation.quantity` | P0 | Already conceptually present. |
| confirmation price/course | Partial | Yes | `confirmation.price` / `priceCurrency` | P0 | Needs currency-aware display. |
| required-field validation | Partial | Yes | `validation.requiredFields` | P0 | Mock should model missing account/amount/quantity/price. |
| minimum amount validation | No | Yes | `validation.minAmountSek` | P0 | Observed Avanza error state. |
| unsupported order mode validation | No | Yes | `validation.unsupportedOrderMode` | P0 | Stop Loss/Glidande should fail first-scope automation tests. |
| condition / `Villkor` | No | Maybe | `condition` | P1 | Needed if Advanced always exposes a condition value. |
| order depth context | No | No | `orderDepthContext` | P2 | Helpful for manual review, not needed for first fill/review contract. |
| Stop Loss fields | Partial via stopLossPrice only | No | `stopLossOrderFields` | P1 | Later scope; existing `stopLossPrice` is not enough for Avanza Stop Loss order mode. |
| Glidande fields | No | No | `trailingOrderFields` | P1 | Later scope. |
| deep instrument metadata | Partial | No | `instrumentMetadata` | P2 | Add only if search/selection ambiguity remains. |

## Selector And Contract Gap

Action 239 added `docs/avanza-manual-selector-notes.md` for visible-label and anchor observations. It does not define real Avanza selectors and does not authorize automation.

Mock order selectors added in Action 235 before any Avanza automation prototype:

- `mock-order-account`
- `mock-order-amount-sek`
- `mock-order-price-currency`
- `mock-order-instrument-market`
- `mock-order-instrument-currency`
- `mock-order-instrument-type`
- `mock-order-mode-advanced`
- `mock-order-review-label`
- `mock-order-confirm-label`
- `mock-order-cancel-label`
- `mock-order-valid-until`
- `mock-order-estimated-fees`
- `mock-order-estimated-courtage`
- `mock-order-estimated-fx-fee`
- `mock-order-estimated-total-amount`
- `mock-order-preliminary-fx-rate`

Future mock confirmation selectors to add before any Avanza automation prototype:

- `mock-confirmation-courtage`
- `mock-confirmation-fx-fee`
- `mock-confirmation-preliminary-fx-rate`
- `mock-confirmation-valid-until`
- `mock-confirmation-total-amount`

Contract additions to consider:

- extend mock confirmation payload with fee, FX, validity, total amount, and button labels
- add validation result shape for Avanza-like missing/minimum/unsupported states

Do not add Avanza selectors. These are mock-page selectors only.

## Confirmation Modal And Readback Gap

Avanza confirmation modal shows:

- account
- quantity
- price/course
- amount excluding fees
- courtage
- FX fee
- preliminary exchange rate
- valid until
- total amount
- final confirm button
- cancel

Current mock confirmation should eventually include:

- account
- instrument name
- instrument market/currency/type
- amount excluding fees
- courtage
- FX fee
- preliminary FX rate
- valid until
- total amount
- confirm button label
- cancel button label
- explicit semi-auto stop-state marker

Action 236 added the mock confirmation contract/readback fields for account, instrument market/currency/type, amount excluding fees, courtage, FX fee, preliminary FX rate, valid until, total amount, order mode, review label, confirm label, and cancel label. The final confirm/cancel labels are rendered only as disabled/readback controls.

Recommended mock readback rule:

- mock confirmation can display final confirm labels, but any automated helper must verify they exist and must not click them.

## Validation Gap

Observed Avanza validation:

- required fields
- minimum amount
- wrong or empty input
- form-level and field-level validation text

Proposed mock validation additions:

- missing account
- missing amount
- missing quantity
- missing price
- minimum amount not met
- unsupported order mode
- review blocked while validation errors exist
- review blocked when account cannot be verified

Action 237 added pure mock order form validation and UI error rendering for required fields, invalid quantity/price/amount values, minimum amount, and unsupported order modes. Review is blocked while errors are present and the final submit placeholder remains disabled.

Future mock agent behavior:

- stop on validation failure
- report exact validation text/reason
- do not force review
- do not retry blindly
- do not switch order modes to bypass validation

Action 238 hardened the local mock-agent runners to do this against the mock page: unsupported order modes fail, validation errors stop the runner, valid review requires the review panel and confirmation link, and final submit must remain disabled.

## Agent Progress Gap

Future progress states needed before any Avanza prototype:

- `search_opened`
- `instrument_candidates_found`
- `instrument_selected`
- `instrument_identity_verified`
- `instrument_identity_mismatch`
- `buy_clicked`
- `sell_clicked`
- `advanced_tab_selected`
- `unsupported_order_tab_detected`
- `form_filled`
- `validation_failed`
- `review_clicked`
- `confirmation_modal_detected`
- `confirmation_verified`
- `confirmation_mismatch`
- `waiting_manual_confirmation`
- `manual_cancel_available`

These should first be exercised against mock pages and local diagnostics.

## Recommended Implementation Sequence

1. Action 235 - Mock Order Contract Avanza Advanced Fields
   - Add P0 Avanza Advanced metadata to the mock fill/review contract.
   - Keep it mock-only.

2. Action 236 - Mock Confirmation Avanza Readback Fields
   - Add account, fees, FX, validity, total, and final/cancel labels to mock confirmation.
   - Keep final submit disabled/not automated.

3. Action 237 - Mock Validation Avanza-like Errors
   - Add missing field, minimum amount, price missing, account missing, and unsupported order-mode validation to the mock order page.

4. Action 238 - Mock Agent Advanced-only Fill Verification
   - Extend Playwright/mock runner coverage to verify Advanced-only fill/review/readback.
   - Still mock-only and no final submit.

5. Action 239 - Avanza Manual Selector Notes, Still No Automation
   - Document manual selector observations after mock gaps are covered.
   - Do not implement automation.

6. Action 240 - Avanza Manual Mapping QA Checklist
   - Use a safety-first checklist for the next manual session.
   - Do not implement automation.

7. Action 241 - Avanza Manual Mapping Session Notes Intake
   - Record sanitized manual session observations in a consistent template.
   - Feed results back into this gap analysis before any automation proposal.

## Safety Boundaries

- No Avanza automation.
- No Avanza URLs in runtime.
- No Avanza selectors.
- No credentials.
- No browser automation against Avanza.
- No final submit.
- No real broker result.
- No Supabase write.
- No trade mutation.
- Mock only.
- Semi-auto stop remains the confirmation modal.
- User manually confirms or cancels.

## Recommended Next Action

Preferred:

- Action 243 - Avanza Prototype Requirements Spec

Alternative:

- Action 243 - Avanza Manual Mapping Update From New Screenshots

Actions 235-238 completed the mock order page fields, mock confirmation readback, mock validation/error behavior, and Advanced-only mock-agent fill verification for the first scope. Actions 239-242 captured manual visible-label notes, QA checklist structure, session-notes intake, and the semi-auto prototype safety plan only.

Use `docs/semi-auto-avanza-prototype-safety-plan.md` as the safety reference before turning any gap-analysis item into a future prototype requirement.
