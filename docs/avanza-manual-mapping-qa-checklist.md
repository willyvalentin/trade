# Avanza Manual Mapping QA Checklist

Date: 2026-06-11

Status: Documentation-only manual QA checklist. No Avanza automation was added, no Avanza URL or selector was added to runtime code, no credential was added, no scraping was added, and no order submission is in scope.

Related:

- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-refresh-pack.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/semi-auto-avanza-prototype-safety-plan.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Use this checklist during a manual Avanza research session to verify the open questions from the mapping docs and capture missing details before any future automation research.

This checklist is manual-only. It does not authorize automation, selectors, URLs, credentials, scraping, order submission, broker result capture, Supabase writes, or trade mutation.

For the next fresh Avanza UI validation pass, use
`docs/avanza-manual-mapping-refresh-pack.md` as the session wrapper. This
checklist remains the detailed QA companion, while the refresh pack defines the
required flows, screenshot index, mapping tables, and outcome decision.

## Pre-Session Safety

- [ ] Automatic mode is off.
- [ ] Research is `semi_automatic` only.
- [ ] Do not press final `Bekräfta köp`.
- [ ] Do not press final `Bekräfta sälj`.
- [ ] Hide or blur account number, balance, holdings, personal information, and any identifying details.
- [ ] Do not capture BankID screens.
- [ ] Do not capture personnummer.
- [ ] Do not save credentials.
- [ ] Stop at the confirmation modal.
- [ ] Use sanitized notes and screenshots only.
- [ ] Do not copy cookies, local storage, browser storage, or session tokens.
- [ ] Do not submit any real order.

Use `docs/semi-auto-avanza-prototype-safety-plan.md` as the safety boundary reference if this checklist feeds a future prototype requirements discussion.

## Session Setup

- [ ] Browser/device:
- [ ] Screen size:
- [ ] Logged-in state:
- [ ] Language:
- [ ] Account type visible:
- [ ] Market/session state:
- [ ] Instrument used for test:
- [ ] Buy or sell flow:
- [ ] Existing holdings required for sell:
- [ ] Screenshots used:
- [ ] Sensitive info removed from screenshots:
- [ ] Session start time:
- [ ] Session stop point confirmed:

## Search Flow Checklist

- [ ] Search button is visible.
- [ ] Search drawer opens.
- [ ] Search input label or placeholder is visible.
- [ ] Results appear after typing.
- [ ] Multiple similar instruments appear, if applicable.
- [ ] Market is visible in result row.
- [ ] Currency is visible in result row.
- [ ] Instrument type is visible in result row.
- [ ] Exact instrument can be identified before selection.
- [ ] No-result behavior recorded.
- [ ] Wrong or partial ticker behavior recorded.
- [ ] Search drawer close/back behavior recorded.

Notes:

- Search input label/placeholder:
- Result row fields:
- Similar instrument risk:
- Open question answer:

## Stock Page Checklist

- [ ] Instrument title is visible.
- [ ] Ticker is visible.
- [ ] Market is visible.
- [ ] Currency is visible.
- [ ] Instrument type is visible.
- [ ] `Köp` button is visible.
- [ ] `Sälj` button is visible.
- [ ] Order depth is visible.
- [ ] Instrument details/about section is visible.
- [ ] Page layout changes at different widths are recorded.
- [ ] Selected instrument can be verified before entering the order flow.

Notes:

- Title/ticker format:
- Metadata labels:
- Buy/sell button placement:
- Responsive differences:

## Advanced Order Form Checklist

- [ ] `Advanced` tab is visible.
- [ ] `Advanced` tab is selected by default.
- [ ] Whether Avanza remembers last selected tab is recorded.
- [ ] `Stop Loss` tab is visible.
- [ ] `Glidande` tab is visible.
- [ ] Account selector behavior is recorded.
- [ ] `Belopp i SEK` field behavior is recorded.
- [ ] `Antal` field behavior is recorded.
- [ ] `Kurs` field behavior is recorded.
- [ ] `Villkor` field behavior is recorded.
- [ ] Fees/courtage are shown before review, if applicable.
- [ ] Total amount is shown before review, if applicable.
- [ ] Buy review button label is recorded.
- [ ] Sell review button label is recorded.
- [ ] Disabled/enabled review button behavior is recorded.
- [ ] Required fields are identified.
- [ ] Price currency label is recorded.
- [ ] Account default is recorded.

Notes:

- Review button buy label:
- Review button sell label:
- Required fields:
- Fee/total timing:
- Last selected tab behavior:

## Validation Checklist

- [ ] Empty form errors recorded.
- [ ] Missing quantity behavior recorded.
- [ ] Missing price behavior recorded.
- [ ] Missing account behavior recorded.
- [ ] Minimum amount behavior recorded.
- [ ] Insufficient funds behavior recorded.
- [ ] Insufficient holdings for sell behavior recorded.
- [ ] Invalid price format behavior recorded.
- [ ] Invalid quantity format behavior recorded.
- [ ] Unsupported or closed market behavior recorded.
- [ ] Session timeout behavior recorded.
- [ ] Whether errors appear on typing or on review is recorded.
- [ ] Whether errors clear after correction is recorded.

Notes:

- Exact error copy:
- Field-level vs form-level placement:
- Minimum amount copy:
- Session timeout copy:

## Confirmation Modal Checklist

- [ ] Modal appears after `Granska köp`.
- [ ] Modal appears after `Granska sälj`.
- [ ] Instrument is shown.
- [ ] Account is shown.
- [ ] Quantity is shown.
- [ ] Price/course is shown.
- [ ] Amount excluding fees is shown.
- [ ] Courtage is shown.
- [ ] FX fee is shown.
- [ ] Preliminary FX rate is shown.
- [ ] Valid until is shown.
- [ ] Total amount is shown.
- [ ] `Bekräfta köp` button label is recorded.
- [ ] `Bekräfta sälj` button label is recorded.
- [ ] `Avbryt` is visible.
- [ ] Cancel can be used safely.
- [ ] Modal close/back behavior is recorded.
- [ ] Form preservation after cancel/back is recorded.
- [ ] Page state after cancel is recorded.

Do not click final `Bekräfta köp` or `Bekräfta sälj`.

Notes:

- Confirmation fields present:
- Buy/sell differences:
- Cancel/back result:
- Missing fields:

## Stop Loss / Glidande Observation Only

These tabs are out of the first automation scope.

- [ ] Do not build support yet.
- [ ] Do not submit any order.
- [ ] Capture visible fields only.
- [ ] Record whether these tabs are remembered.
- [ ] Record validation differences.
- [ ] Record labels that are unique to Stop Loss.
- [ ] Record labels that are unique to Glidande.
- [ ] Keep these out of first automation scope.

Notes:

- Stop Loss visible fields:
- Glidande visible fields:
- Remembered tab behavior:
- Validation differences:

## Mapping To Mock Contract

Compare manual observations to the current mock contract:

- [ ] `account`
- [ ] `amountSek`
- [ ] `quantity`
- [ ] `priceCurrency`
- [ ] `instrumentMarket`
- [ ] `instrumentCurrency`
- [ ] `instrumentType`
- [ ] `orderMode`
- [ ] `estimatedCourtage`
- [ ] `estimatedFxFee`
- [ ] `estimatedTotalAmount`
- [ ] `preliminaryFxRate`
- [ ] `validUntil`
- [ ] `reviewButtonLabel`
- [ ] `confirmButtonLabel`
- [ ] `cancelButtonLabel`
- [ ] `amountExcludingFees`
- [ ] `courtage`
- [ ] `fxFee`
- [ ] `totalAmount`

Notes:

- Mock fields missing:
- Mock fields with low confidence:
- Mock validation gaps:
- Mock confirmation gaps:

## Open Questions To Resolve

- [ ] Does search result expose market/currency clearly for all instruments?
- [ ] Does Avanza remember last selected tab?
- [ ] Does confirmation modal always show same fields for US stocks?
- [ ] Are fields accessible by label?
- [ ] What happens with insufficient holdings on sell?
- [ ] What happens with insufficient funds on buy?
- [ ] How does session timeout appear?
- [ ] What does cancel/back do from confirmation modal?
- [ ] Does `Villkor` need a first-scope mock field?
- [ ] Are fee fields delayed or recalculated after review?
- [ ] Does the final modal differ between buy and sell beyond button labels?

## Research Output Template

Use `docs/avanza-manual-mapping-session-notes.md` as the primary intake document for sanitized session notes. The compact table below can be used as a quick scratchpad during the session and then copied into the full notes template.

| Step | Observation | Screenshot filename | Sensitive info removed? | Relevant mock field | Risk | Open question / answer |
| --- | --- | --- | --- | --- | --- | --- |
| Search |  |  |  | `ticker`, `instrumentMarket`, `instrumentCurrency`, `instrumentType` |  |  |
| Stock page |  |  |  | `ticker`, `action` |  |  |
| Advanced order form |  |  |  | `account`, `quantity`, `limitPrice`, `amountSek` |  |  |
| Validation |  |  |  | validation errors |  |  |
| Confirmation modal |  |  |  | `account`, `quantity`, `totalAmount`, `confirmButtonLabel` |  |  |
| Cancel/back |  |  |  | `cancelButtonLabel` |  |  |

## Recommended Next Action

Recommended:

- Action 243 - Avanza Prototype Requirements Spec

If new sanitized screenshots or notes exist, use Action 243 to update the mapping first. Otherwise, define a requirements spec against the safety plan before any automation code is considered.
