# Avanza Manual Mapping Refresh Pack

Date: 2026-06-11

Status: Documentation-only refresh pack for the next manual Avanza UI mapping session. No Avanza automation was added, no Avanza URL or selector was added to runtime code, no Playwright import was added, no browser control was added, no run/start button was added, no order submission is in scope, no broker result is created, no Supabase write occurs, and no trade state is mutated.

Related:

- `docs/avanza-ui-research-plan.md`
- `docs/avanza-ui-research-mapping.md`
- `docs/avanza-manual-selector-notes.md`
- `docs/avanza-manual-mapping-qa-checklist.md`
- `docs/avanza-manual-mapping-session-notes.md`
- `docs/avanza-vs-mock-order-contract-gap-analysis.md`
- `docs/avanza-dry-run-capability-spec.md`
- `docs/avanza-session-detection-only-design.md`
- `docs/avanza-search-only-phase-design.md`
- `docs/avanza-dry-run-runner-implementation-plan.md`
- `docs/execution-agent-checkpoint.md`
- `docs/execution-agent-qa-notes.md`

## Purpose

Prepare a fresh manual Avanza UI mapping pass before any Avanza session-detection or search-only runner proposal.

The refresh pass should confirm whether the current manual mapping docs, mock order/confirmation contracts, dry-run request contract, and dry-run readiness assumptions still match the live UI. This is manual research only. It does not authorize automation, selectors, URLs, browser control, scraping, broker result capture, Supabase persistence, trade mutation, or order submission.

Action 273 added `docs/avanza-search-only-phase-design.md`. Any future
search-only proposal should use this refresh pack to confirm search entry
points, candidate-list behavior, and ambiguity risks manually before code is
written. The refresh still must not authorize browser control or order flow.

## Safety Rules

- Manual only.
- Use `semi_automatic` assumptions only.
- Keep automatic execution off.
- Do not click final `Bekräfta köp`.
- Do not click final `Bekräfta sälj`.
- Prefer outside market/high-stress moments.
- Use a tiny or non-submitting scenario.
- Stop at the confirmation modal.
- Cancel or exit before final order submission.
- Hide or redact account numbers, account labels if identifying, balances, holdings, personal data, session tokens, cookies, and browser storage.
- Do not capture BankID, login, personnummer, credentials, or security prompts.
- Do not store credentials in notes, screenshots, transcripts, or docs.
- Do not document personal identifiers.
- Store only sanitized screenshots and notes.

## Session Setup

Capture this before inspecting the order flow:

| Field | Value |
| --- | --- |
| Date/time |  |
| Researcher |  |
| Browser/version |  |
| Operating system |  |
| Screen size / viewport |  |
| Logged-in state | logged in / logged out / timed out |
| Language |  |
| Market open/closed status |  |
| Instrument(s) tested |  |
| Buy flow tested | yes/no |
| Sell flow tested | yes/no |
| Order mode tab state | Advanced / Stop Loss / Glidande / remembered |
| Account selector behavior |  |
| Remembered previous tab/account/order type? | yes/no/unknown |
| Sensitive data hidden before screenshots? | yes/no |
| Final confirmation avoided? | yes/no |

## Required Flows To Inspect Manually

### A. Search Entry Point

- Search input location or visible label.
- Search drawer, modal, or page behavior.
- Candidate fields shown in search results.
- Whether ticker, market, currency, and instrument type are visible before selection.
- Similar-name or ambiguity cases.
- No-result, partial ticker, and wrong ticker behavior.
- How to close or back out safely.

### B. Instrument Page

- Instrument identity fields.
- Visible ticker/name/market/currency/type.
- Buy button label and placement.
- Sell button label and placement.
- Any market-state warnings.
- Whether selected instrument can be verified before opening the order page.

### C. Order Page / Advanced

- Active tab behavior.
- Whether Advanced is default or remembered.
- Account field and account selector behavior.
- Quantity field.
- Price/course field and currency label.
- Amount field.
- Order validity field.
- Fee/courtage preview.
- FX fee or preliminary FX rate.
- Total amount preview.
- Validation messages and placement.
- Whether errors appear while typing, on blur, or after review click.
- Whether quantity/price can be verified after fill without clicking
  `Granska`.
- Whether Advanced form-fill readback is sufficient for
  `docs/avanza-advanced-form-fill-phase-design.md`.

### D. Review Step

- `Granska köp` label.
- `Granska sälj` label.
- Disabled/enabled review state.
- Validation trigger timing.
- Whether review click opens a modal, drawer, or page.
- Whether any keyboard action can trigger review unexpectedly.

### E. Confirmation Modal

Do not click final confirmation.

- Fields displayed.
- Final buy button text.
- Final sell button text.
- Cancel button text.
- Fee/courtage fields.
- FX and total fields.
- Account readback.
- Instrument readback.
- Whether keyboard Enter can submit.
- Whether modal focus defaults to confirm, cancel, close, or another element.
- Whether the final-confirm button is visually near other controls.

### F. Cancel / Exit Path

- How to close the modal safely.
- What happens after cancel.
- Whether order form state remains after cancel.
- Whether navigation/back closes the modal or changes the page.
- Whether session timeout changes the form or modal state.

## Screenshot / Notes Index Template

| Screenshot ID | Flow step | Sensitive data removed? | Key observations | Open questions | Doc section to update |
| --- | --- | --- | --- | --- | --- |
| AVZ-REFRESH-001 | Search entry | yes/no |  |  |  |
| AVZ-REFRESH-002 | Search results | yes/no |  |  |  |
| AVZ-REFRESH-003 | Instrument page | yes/no |  |  |  |
| AVZ-REFRESH-004 | Advanced order form empty | yes/no |  |  |  |
| AVZ-REFRESH-005 | Advanced order form filled | yes/no |  |  |  |
| AVZ-REFRESH-006 | Validation state | yes/no |  |  |  |
| AVZ-REFRESH-007 | Confirmation modal | yes/no |  |  |  |
| AVZ-REFRESH-008 | Cancel/exit result | yes/no |  |  |  |

## Field Mapping Table Template

| UI area | Visible label | Purpose | Expected dry-run field | Mock equivalent | Required for runner? | Risk level | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Search |  | Instrument lookup | `instrument.ticker` / `instrument.name` | instrument identity | yes | high |  |
| Instrument page |  | Verify selected instrument | `instrument.market` / `instrument.currency` / `instrumentType` | `instrumentMarket` / `instrumentCurrency` / `instrumentType` | yes | high |  |
| Order form | Account | Account review | `accountPolicy` / `expectedAccountLabel` | `account` | yes | high |  |
| Order form | Antal | Quantity | `quantity` | `quantity` | yes | high |  |
| Order form | Kurs | Price | `price` | `limitPrice` / `intendedPrice` | yes | high |  |
| Order form | Belopp i SEK | Amount | metadata / future amount field | `amountSek` | maybe | medium |  |
| Order form | Villkor | Validity | metadata / future validity field | `validUntil` | maybe | medium |  |
| Order form | Avgifter | Fee preview | diagnostics/readback | `estimatedFees` / `estimatedCourtage` | maybe | medium |  |
| Order form | Totalt belopp | Total preview | diagnostics/readback | `estimatedTotalAmount` | maybe | medium |  |
| Review | Granska köp/sälj | Review transition | safe review action | `reviewButtonLabel` | yes | high |  |
| Confirmation | Bekräfta köp/sälj | Final submit boundary | forbidden final confirm | `confirmButtonLabel` read-only | yes, block only | critical |  |
| Confirmation | Avbryt | Safe exit | stop/cancel note | `cancelButtonLabel` read-only | yes | high |  |

## Validation Mapping Table Template

| Scenario | Input values | Observed message | Blocking? | Expected runner behavior | Mock equivalent | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Empty account |  |  | yes/no | stop and report validation | required account |  |
| Empty quantity |  |  | yes/no | stop and report validation | required/invalid quantity |  |
| Empty price |  |  | yes/no | stop and report validation | required/invalid price |  |
| Invalid quantity format |  |  | yes/no | stop and report validation | invalid number |  |
| Invalid price format |  |  | yes/no | stop and report validation | invalid price |  |
| Minimum amount |  |  | yes/no | stop and report validation | minimum amount |  |
| Insufficient funds |  |  | yes/no | stop and report validation | future mock gap |  |
| Insufficient holdings for sell |  |  | yes/no | stop and report validation | future mock gap |  |
| Market closed |  |  | yes/no | stop and report blocked state | future mock gap |  |
| Session timeout |  |  | yes/no | stop and report session unavailable | future self-check/session state |  |

## Confirmation Readback Mapping Table Template

| Readback field | Observed label | Matches request field? | Required verification? | Sensitive? | Notes |
| --- | --- | --- | --- | --- | --- |
| Instrument name/ticker |  | yes/no | yes | no |  |
| Action buy/sell |  | yes/no | yes | no |  |
| Account |  | yes/no | yes | yes | sanitize |
| Quantity |  | yes/no | yes | no |  |
| Price/course |  | yes/no | yes | no |  |
| Amount excluding fees |  | yes/no | maybe | no |  |
| Courtage |  | yes/no | maybe | no |  |
| FX fee |  | yes/no | maybe | no |  |
| Preliminary FX rate |  | yes/no | maybe | no |  |
| Valid until |  | yes/no | maybe | no |  |
| Total amount |  | yes/no | maybe | no |  |
| Final confirm button |  | n/a | yes, forbidden click | no | read only |
| Cancel button |  | n/a | yes | no | safe exit |

## Decision Checklist After Session

- [ ] Search mapping unchanged.
- [ ] Instrument identity mapping unchanged.
- [ ] Instrument verification fields are sufficient for `docs/avanza-instrument-verification-phase-design.md`.
- [ ] Instrument page identity fields are sufficient for `docs/avanza-instrument-page-phase-design.md`.
- [ ] Order-page-open entry controls are sufficient for `docs/avanza-order-page-open-phase-design.md`.
- [ ] Advanced form-fill fields are sufficient for `docs/avanza-advanced-form-fill-phase-design.md`.
- [ ] Review-click and confirmation-modal readback fields are sufficient for `docs/avanza-review-click-phase-design.md`.
- [ ] Prohibited buy/sell controls are identifiable as guarded elements only.
- [ ] Entry `Kop`/`Salj` controls can be distinguished from `Granska` and `Bekrafta`.
- [ ] Advanced order form unchanged.
- [ ] Account selector behavior understood.
- [ ] Quantity/price/amount fields still match dry-run assumptions.
- [ ] Quantity/price readback can be verified without review click.
- [ ] Review labels unchanged.
- [ ] Confirmation modal fields unchanged.
- [ ] Cancel behavior safe.
- [ ] Keyboard Enter cannot unexpectedly submit, or risk is documented.
- [ ] Modal focus behavior is safe, or risk is documented.
- [ ] No mismatch versus `MockOrderPageFillPlan`.
- [ ] No mismatch versus mock confirmation contract.
- [ ] No mismatch versus `AvanzaDryRunOrderInput`.
- [ ] No blocker before instrument-verification planning.
- [ ] No blocker before instrument-page identity planning.
- [ ] No blocker before order-page-open planning.
- [ ] No blocker before review-click result contract planning.

## Outcome Categories

Green:

- Mapping is unchanged or only low-risk wording changed.
- Mock contracts still cover required Advanced fields.
- Dry-run request contract still has required fields.
- Confirmation boundary remains clear.
- Instrument verification contract/bridge/UI preview still match the refreshed
  notes.
- Instrument page contract/bridge/UI preview still match the refreshed notes.
- Proceed to `Action 294 - Avanza Review Click Result Contract` only when
  Advanced form-fill and confirmation-modal mapping remain green.

Yellow:

- UI changed in a way that affects labels, field order, validation timing, or readback naming.
- Mock contracts or dry-run request docs need updates first.
- Use `Action 282 - Avanza Mapping Refresh Update`.

Red:

- Final confirmation boundary is unclear.
- Keyboard/focus behavior creates final-submit risk.
- Account/instrument verification is ambiguous.
- Validation cannot be reliably detected manually.
- Stop Avanza runner path until the risk is resolved.

## Recommended Next Actions

If mapping is unchanged:

- Action 290 - Avanza Advanced Form Fill Result Contract

If mapping changed:

- Action 290 - Avanza Mapping Refresh Update

If screenshots are provided:

- Action 290 - Avanza Screenshot Mapping Review

All next actions should remain documentation or read-only planning unless a separate explicit safety approval is given.
