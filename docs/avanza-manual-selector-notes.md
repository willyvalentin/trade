# Avanza Manual Selector Notes

Date: 2026-06-11

Status: Documentation-only manual observation notes. No Avanza automation was added, no Avanza URL or selector was added to runtime code, no credential was added, no Avanza page was opened from code, no scraping was added, and no order submission is in scope.

Related:

- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/semi-auto-avanza-prototype-requirements.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`
- `docs/mock-execution-e2e-checkpoint.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

These notes capture manual visible-label and visual-anchor observations for future Avanza UI research.

They are input for a later selector and automation safety review, not selector definitions. They do not add real Avanza selectors, URLs, browser automation, credentials, scraping, or order submission behavior.

Before any session-detection/search-only design, refresh these manual anchors
with `docs/avanza-manual-mapping-refresh-pack.md`. Do not translate refreshed
labels into runtime selectors until a separate explicit automation safety review
is approved.

The current future scope remains:

- `semi_automatic` only.
- Advanced order only.
- Buy and sell.
- Search/select instrument.
- Fill quantity and price.
- Click `Granska köp` or `Granska sälj`.
- Stop at the confirmation modal.
- Read/verify modal details.
- No final `Bekräfta köp` or `Bekräfta sälj` click.
- No automatic mode.
- No brokerResult capture yet.

## Safety Boundary

- Do not click `Bekräfta köp`.
- Do not click `Bekräfta sälj`.
- Do not automate Avanza.
- Do not store credentials, account numbers, balances, holdings, or personal identifiers.
- Use sanitized observations only.
- Do not store screenshots unless all sensitive account details are removed.
- Do not scrape Avanza pages.
- Do not submit real or mock orders from this research.
- Stop at the confirmation modal and let the user manually cancel or confirm outside Ture.

## Search Drawer Anchors

Observed or expected visible anchors:

- Search entry point in the top navigation area.
- Right-side search drawer after opening search.
- Search input for ticker or instrument/company name.
- Result tabs or result categories when multiple result types are present.
- Instrument result rows with visible identity details.
- Result row pieces that may include name, ticker, current price, market, and instrument type.

Future mock concepts:

- instrument search opened
- candidates detected
- exact instrument selected
- instrument identity verified
- instrument identity mismatch

Manual notes to capture next:

- Whether result rows consistently show ticker and market.
- Whether currency is visible before opening the instrument page.
- Whether instrument type is visible in the row or only on the detail page.
- How multiple similarly named instruments are ordered.
- Whether search state changes after session timeout.

## Stock Page Anchors

Observed or expected visible anchors:

- Instrument title/name.
- Metadata area near the instrument title.
- Market, currency, instrument type, or related identity metadata.
- `Köp` button.
- `Sälj` button.
- Order depth area.
- Details/about section.

Mapping to mock concepts:

- `action` selection maps to `Köp` or `Sälj`.
- `ticker`, `instrumentMarket`, `instrumentCurrency`, and `instrumentType` map to identity verification before order entry.
- Order depth is contextual only for the first scope and does not currently map to a required mock field.

Manual notes to capture next:

- Exact visible metadata labels around the instrument title.
- Whether `Köp` and `Sälj` are stable visible button labels across viewport sizes.
- Whether the order form opens inline, as a new view, or as a separate panel.
- Whether the selected action is still visible on the order page.

## Order Page Advanced Anchors

Observed visible labels:

- `Advanced`
- `Stop Loss`
- `Glidande`
- `Konto`
- `Belopp i SEK`
- `Antal`
- `Kurs`
- `Villkor`
- `Avgifter`
- `Totalt belopp inkl. avgifter`
- `Granska köp`
- `Granska sälj`

Mapping to mock order fields:

- `Konto` -> `account`
- `Belopp i SEK` -> `amountSek`
- `Antal` -> `quantity`
- `Kurs` -> `limitPrice` / `intendedPrice`
- `Advanced` -> `orderMode: "advanced"`
- `Stop Loss` / `Glidande` -> unsupported order mode for the first scope
- `Avgifter` -> `estimatedFees` / `estimatedCourtage` / `estimatedFxFee`
- `Totalt belopp inkl. avgifter` -> `estimatedTotalAmount`
- `Granska köp` / `Granska sälj` -> `reviewButtonLabel`

Manual notes to capture next:

- Whether `Kurs` includes the currency in the label for every market.
- Whether `Villkor` has a default value that must be verified.
- Whether account selection can default to the wrong account.
- Whether Avanza remembers the last selected order tab.
- Whether the form blocks review until all required fields are valid.

## Confirmation Modal Anchors

Observed visible labels:

- `Instrument`
- `Konto`
- `Antal`
- `Kurs`
- `Belopp exkl. avg.`
- `Courtage`
- `Valutaväxling`
- `Preliminär växlingskurs`
- `Giltig t.o.m.`
- `Totalt belopp`
- `Bekräfta köp`
- `Bekräfta sälj`
- `Avbryt`

Mapping to mock confirmation fields:

- `Instrument` -> `ticker` plus future instrument name/metadata
- `Konto` -> `account`
- `Antal` -> `quantity`
- `Kurs` -> `requestedPrice` / `executedPrice` plus `priceCurrency`
- `Belopp exkl. avg.` -> `amountExcludingFees`
- `Courtage` -> `courtage`
- `Valutaväxling` -> `fxFee`
- `Preliminär växlingskurs` -> `preliminaryFxRate`
- `Giltig t.o.m.` -> `validUntil`
- `Totalt belopp` -> `totalAmount`
- `Bekräfta köp` / `Bekräfta sälj` -> `confirmButtonLabel`
- `Avbryt` -> `cancelButtonLabel`

Manual notes to capture next:

- Whether US stock confirmations always include FX fee and preliminary FX rate.
- Whether Swedish stock confirmations omit currency/FX fields.
- Whether sell confirmations show the same readback field set as buy confirmations.
- Whether the final button label changes with market, account type, or order state.

## Validation And Error Anchors

Observed validation classes:

- missing required fields
- minimum amount
- field-level validation text
- form-level validation text
- review blocked until required fields are valid

Known or expected Swedish text anchors:

- minimum amount copy similar to `Lägsta belopp för köp är ...`
- required field copy near account, quantity, price, or amount fields

Mapping to mock validation:

- missing required fields -> `required`
- minimum amount -> `minimum_amount`
- unsupported order mode -> `unsupported_order_mode`
- invalid quantity/price/amount -> `invalid_number` / `invalid_price`
- future progress event -> `validation_failed`

Manual notes to capture next:

- Exact Swedish copy for empty account, empty quantity, empty price, and minimum amount.
- Whether validation appears immediately while typing or only after review.
- Whether error text remains visible after correcting the field.
- Whether Stop Loss or Glidande tabs show different validation rules.

## Selector Strategy Notes

Do not define real Avanza selectors yet.

Any future selector proposal must satisfy the hard stops and verification gates in `docs/semi-auto-avanza-prototype-safety-plan.md` before implementation is considered.

Any future selector proposal must also satisfy the functional and verification requirements in `docs/semi-auto-avanza-prototype-requirements.md`. These notes remain manual observations, not runtime selectors.

Preferred future strategy, pending separate approval:

- Use accessible names and visible labels first.
- Verify exact visible text inside the correct section context.
- Verify surrounding page/section headings before interacting.
- Verify instrument identity using name, ticker, market, currency, and type.
- Avoid brittle CSS paths.
- Do not rely only on colors, position, or icons.
- Do not trust a single visible label when multiple similar controls exist.
- Always verify final modal readback before waiting for the user.
- Treat the final confirmation button as a danger boundary, not an automation target.

## Risk Notes

- Multiple similar instruments may appear in search results.
- Visible language or label text may change.
- Account selector choices may differ between users or account types.
- Responsive layouts may move buttons, drawers, or modal content.
- Market and currency labels may vary by instrument.
- Session timeout may interrupt the flow or hide state.
- Validation messages can be dynamic.
- Avanza may retain the last selected order mode.
- Stop Loss or Glidande may remain selected from an earlier user session.
- Final confirmation buttons are close to the safe stop point.
- Accidental submit risk is the highest risk in the flow.

## Mock Contract Alignment

| Avanza visible anchor | Mock field/selector | Confidence | Risk | Notes |
| --- | --- | --- | --- | --- |
| Search input | future instrument search state | medium | Similar results | Manual notes only; no mock selector yet. |
| Result row name/ticker | `ticker` plus future instrument name | medium | Similar instruments | Must verify market/currency too. |
| Market/currency metadata | `instrumentMarket`, `instrumentCurrency` | medium | Inconsistent visibility | Confirm on detail page before order entry. |
| `Köp` / `Sälj` | `action` | high | Wrong side | Verify requested side before opening order form. |
| `Advanced` tab | `orderMode` / `mock-order-mode-advanced` | high | Retained previous tab | First scope supports Advanced only. |
| `Konto` | `account` / `mock-order-account` | high | Wrong account | Must stop if unknown. |
| `Belopp i SEK` | `amountSek` / `mock-order-amount-sek` | high | Calculated/required behavior | Mock validation covers minimum amount. |
| `Antal` | `quantity` / `mock-order-quantity` | high | Empty or invalid quantity | Mock validation blocks invalid quantity. |
| `Kurs` | `limitPrice`, `intendedPrice` | medium | Currency-specific label | Verify price currency separately. |
| `Avgifter` | `estimatedFees`, `estimatedCourtage`, `estimatedFxFee` | medium | Fee breakdown varies | Confirmation readback is more authoritative. |
| `Totalt belopp inkl. avgifter` | `estimatedTotalAmount` | medium | Calculation timing | Must not be treated as broker result. |
| `Granska köp` / `Granska sälj` | `reviewButtonLabel` | high | Final button confusion | Safe review click only. |
| Confirmation `Konto` | `account` / `mock-confirmation-account` | high | Wrong account | Required readback before manual final step. |
| Confirmation `Belopp exkl. avg.` | `amountExcludingFees` | high | Formatting/currency | Readback only. |
| Confirmation `Courtage` | `courtage` | high | Fee variability | Readback only. |
| Confirmation `Valutaväxling` | `fxFee` | medium | May be absent for SEK | Field presence depends on instrument. |
| Confirmation `Preliminär växlingskurs` | `preliminaryFxRate` | medium | May be absent for SEK | Required for non-SEK research notes. |
| Confirmation `Giltig t.o.m.` | `validUntil` | high | Date formatting | Verify exact date semantics manually. |
| Confirmation `Totalt belopp` | `totalAmount` | high | Formatting/currency | Readback only. |
| `Bekräfta köp` / `Bekräfta sälj` | `confirmButtonLabel` | high | Critical submit risk | Never click in semi-automatic scope. |
| `Avbryt` | `cancelButtonLabel` | high | Exit behavior | Manual user action only. |

## Open Questions

- Use `docs/avanza-manual-mapping-qa-checklist.md` to resolve these during the next manual session.
- Record answers and evidence in `docs/avanza-manual-mapping-session-notes.md` before updating selector notes or gap analysis.

- Does search result expose market/currency clearly for all instruments?
- Does Avanza remember the last selected tab?
- Does the confirmation modal always show the same fields for US stocks?
- Are fields accessible by label?
- What happens with insufficient holdings on sell?
- What happens with insufficient funds on buy?
- How does session timeout appear?
- What does cancel/back do from the confirmation modal?
- Does `Villkor` need a first-scope mock field?
- Are fee fields delayed or recalculated after review?
- Does the final modal differ between buy and sell beyond button labels?

## Recommended Next Action

Preferred:

- Action 244 - Avanza Prototype Final-Confirm Block Design

Alternative:

- Action 244 - Avanza Manual Mapping Update From New Screenshots

If new manual observations exist, update the selector notes and mapping first. Otherwise, design the final-confirm guard without adding runtime selectors or automation.
