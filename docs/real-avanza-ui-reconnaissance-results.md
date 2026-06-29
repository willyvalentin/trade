## Action 1017 Selector Mapping Contract Update

- Action 1017 created the pure/static selector mapping contract from the
  screenshot/DevTools evidence trail.
- Contract module: `lib/real-avanza-selector-mapping-contract.ts`.
- Result status:
  `real_avanza_selector_mapping_contract_created`.
- No Avanza automation, field filling, review click, final click, or broker
  behavior is approved.
- Recommended next action: Action 1018 - Add Selector Contract To Fill-Only
  Guard.

## Action 1016 DOM/Selector Evidence Update

- Action 1016 repeated the DOM/selector reconnaissance with operator-provided
  screenshot/DevTools evidence.
- Results doc: `docs/real-avanza-dom-selector-reconnaissance-results.md`.
- Result status:
  `real_avanza_dom_selector_recon_passed_with_warnings`.
- The evidence updates the prior screenshot/manual mapping with concrete
  selector candidates and forbidden final confirmation selectors.
- Recommended next action: Action 1017 - Create Real Avanza Selector Mapping
  Contract.

# Real Avanza UI Reconnaissance Results

## Purpose

Action 1009 documents human-led real Avanza UI reconnaissance using
operator-provided screenshots and notes.

This is not automation. This is not order execution. Final `Bekräfta köp` or
`Bekräfta sälj` remains human-only and was not clicked by Ture or an agent.

## Evidence Source

Evidence source: operator-provided screenshots/notes, manually captured outside
Codex.

Uploaded/referenced evidence files:

- `1-Search.png`
- `2-Search-Result.png`
- `3-Stock-Page.png`
- `4-Order-Page.png`
- `5-Order-Confirmation.png`
- `Full-Buy-Flow.jpeg`
- `Form-Errors.png`
- `BUY-Order-Forms-Filled.png`
- `BUY-Order-Forms-Not-Filled.png`
- `SELL-Order-Forms-Filled.png`

Evidence characteristics:

- Manual/screenshot-based evidence only.
- No code accessed Avanza.
- No agent/browser automation was used.
- No credentials were stored or handled by Ture.
- No 2FA flow was handled or bypassed by Ture.
- No order was placed by Ture or an agent.

## Observed Order Flow Map

1. Search entry point is available through top-right `Sök`.
2. Search opens a drawer/panel on the right.
3. User can type a ticker/name query.
4. Matching instruments appear in a list.
5. User selects an instrument from the search result list.
6. Instrument detail page opens.
7. Buy/sell buttons are visible near the quote panel.
8. The instrument page includes `Om depåbeviset`, useful for instrument
   verification.
9. Buy/sell buttons open the order page/form.
10. Order page/form exposes order type options:
    - `Avancerad`
    - `Stop Loss`
    - `Glidande`
11. User fills order fields according to the selected order type.
12. Buy flow review button is `Granska köp`.
13. Sell flow review button is `Granska sälj`.
14. `Granska köp`/`Granska sälj` opens a confirmation modal.
15. Confirmation modal displays full order information.
16. Final irreversible action appears to be `Bekräfta köp` for buy or
    `Bekräfta sälj` for sell.
17. `Avbryt` is available in the modal as a safe cancel/abort path.

## Field Mapping Observations

| Field | Observed label/detail | Classification | Notes |
| --- | --- | --- | --- |
| Account selector | Account selector visible in order form evidence. | Human-verify required. | High-risk field; future automation must not assume the correct account. |
| Instrument/ticker | Search result and instrument page evidence includes example Nokia ADR. | Human-verify required; possible future fill candidate only after mapping. | Instrument verification should use both ticker/name and instrument detail context. |
| Buy/sell side | Buy and sell entry buttons plus buy/sell-specific forms observed. | Human-verify required. | Wrong-side risk is high; side must be explicit and visible. |
| Amount in SEK | Visible amount field/area in order form evidence. | Possible future fill candidate after approval; human-verify required. | Amount and quantity ambiguity must be resolved before automation. |
| Quantity / antal | Visible quantity/`antal` field in order form evidence. | Possible future fill candidate after approval; human-verify required. | Must be checked against max amount and price. |
| Order type | `Avancerad`, `Stop Loss`, `Glidande` observed. | Human-verify required. | First future automation should target one simple order type only. |
| Price / kurs | Visible price/`kurs` field in order form evidence. | Possible future fill candidate after approval; human-verify required. | Price precision/default behavior needs mapping. |
| Trigger fields | Stop loss/glidande variants show order-type-specific fields. | Blocked for future automation until separately mapped. | More complex than basic advanced/limit flow. |
| Validity / active-until | Validity/date behavior appears order-type dependent if visible. | Human-verify required. | Needs explicit mapping before fill automation. |
| Fees / avgifter | Fees/`avgifter` area visible in order evidence. | Human-verify required. | Should be readback/verification, not agent-controlled. |
| Total amount | Total amount display visible in evidence. | Human-verify required. | Must be used as a safety readback. |
| Order depth/quote area | Quote/order context visible near the instrument/order flow. | Human-verify required. | Useful for sanity checks but not sufficient for order safety. |
| Confirmation modal details | Full order information displayed in confirmation modal. | Human-verify required. | Final review area; agent must not confirm. |
| Final confirmation | `Bekräfta köp` / `Bekräfta sälj`. | Forbidden/final action. | Agent must never click. |

## Order Type Observations

- Advanced order form observed.
- Stop Loss form observed.
- Glidande form observed.
- Buy and sell versions exist.
- Form fields and validation vary by order type.
- First future automation should target one simple order type after explicit
  approval, likely the `Avancerad`/limit-style form, not all order types at
  once.

## Validation/Error Observations

- Required fields display validation errors when empty or invalid.
- Purple arrows in the provided screenshot indicate form error locations.
- Validation behavior must be mapped before any fill automation.
- Agent must not proceed when form errors are present.
- Error handling must be blocking, visible, and recorded as a non-submit state.

## Final Confirmation Boundary

- `Granska köp`/`Granska sälj` opens a confirmation modal.
- The irreversible order action appears to be `Bekräfta köp` or
  `Bekräfta sälj`.
- Future semi-auto hard stop must be before this final confirmation button.
- Agent must never click `Bekräfta köp` or `Bekräfta sälj`.
- Agent must never submit final broker action.
- `Avbryt` exists and should be the safe exit path if a modal is open.
- Operator notes state clicking `Bekräfta` sends the order to market.

## Safety Observations

- No Ture/agent final click.
- No Ture/agent order placed.
- No code interaction with Avanza.
- No credentials captured.
- No 2FA handling.
- No account settings changed.
- Evidence is manual screenshots/notes only.
- User states final confirmation sends the order to market.

## Ambiguities And Risks

- Screenshots do not provide DOM selectors.
- UI may differ depending on account type, instrument type, market state, and
  selected order type.
- Account selector is a high-risk field.
- Buy/sell side is a high-risk control.
- Amount versus quantity ambiguity remains a core risk.
- Order type differences increase complexity.
- Final confirmation modal is high-risk.
- Validation messages must be handled explicitly.
- Real Avanza fill automation must not start until a mapping spec is complete.
- Max-amount enforcement is not implemented yet.
- No Avanza fill-only POC is approved yet.

## Result Status

`real_avanza_ui_reconnaissance_passed_with_warnings`

Warnings:

- Manual screenshot-based evidence only.
- No DOM/selector verification.
- No live safe-read session record beyond screenshots/notes.
- No automated mapping.
- No max-amount enforcement implemented.
- No Avanza fill-only POC approved yet.

## Recommended Next Action

Action 1010 - Create Real Avanza UI Mapping Spec.

## Progress Update

- Ture production/data-health: 95-97%.
- Market-window live dry-run: 92-95%.
- Semi-auto agent foundation: 98-99%.
- Semi-auto Avanza/browser-agent readiness: 96-98%.
- Real browser automation readiness: 90-94%.
- Full-auto readiness: 10-15%.
- Total Ture toward semi-auto MVP: 97-98%.

## Validation Results

- Documentation/static review completed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`.
- Audit writer runtime path import search returned no app/components/hooks
  matches.
- Route/provider/scan static search was not invoked as runtime behavior; it
  returned existing source and legacy edit-conflict references only.
- UI/app-shell audit writer import scan returned no matches.
- Market-loop/scanner search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` and service-role leakage search returned existing
  server-support aliases in `lib/supabase-server.ts` and
  `lib/active-scan-trace.ts`; no secret values were printed.
- Avanza-recon-evidence executable-code safety scan returned existing
  sandbox/test-only Avanza skeleton, mock-broker, localhost bridge, and audit
  denial harness references; no new executable Avanza integration was added by
  this action.
- Automatic-mode safety scan returned existing human-confirmation and boundary
  language only.
- Dead-doc/path scan returned no missing files.
- Result-status and next-action consistency scans passed.
- `git diff --check` passed.
- Touched-file trailing whitespace scan returned no matches.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.

## Action 1010 Real Avanza UI Mapping Spec

- Result status: `real_avanza_ui_mapping_spec_created`.
- Mapping spec artifact: `docs/real-avanza-ui-mapping-spec.md`.
- The spec maps Ture payload concepts to observed Avanza UI concepts and
  classifies each field as future agent-fill candidate, human-verify required,
  or forbidden/final action.
- Final `Bekräfta köp` / `Bekräfta sälj` remains forbidden for agent.
- Recommended next action: Action 1011 - Define Real Avanza Fill-Only POC Gate
  And Max Amount Policy.

## Action 1011 Fill-Only POC Gate And Max Amount Policy

- Result status:
  `real_avanza_fill_only_poc_gate_and_max_amount_policy_created`.
- Policy artifact:
  `docs/real-avanza-fill-only-poc-gate-and-max-amount-policy.md`.
- The reconnaissance evidence now feeds a gate/policy document; it does not
  approve real Avanza field filling.
- Recommended next action: Action 1012 - Add Max Amount And Final-Submit Guard
  Contract Tests.

## Not Performed

- No runtime code change.
- No browser automation.
- No Avanza integration.
- No Avanza access from code.
- No Avanza URL constant in runtime code.
- No real Avanza field filling by agent.
- No final `KOP`/`SALJ`, `KÖP`/`SÄLJ`, `Bekräfta köp`, or `Bekräfta sälj`
  click.
- No order placement.
- No credential storage.
- No login handling in code.
- No 2FA bypass.
- No provider call.
- No scan route invocation.
- No live market scan.
- No database write.
- No manual Supabase call.
- No service-role adapter call.
- No migration.
- No type generation.
- No generated type edit.
- No `.env.local` change.
- No service-role value printed.
- No audit writer UI/browser/client invocation.
- No trade/stats/PnL mutation.
## Action 1012 - Max Amount And Final-Submit Guard Contract Tests

- Added pure guard contract coverage for the real Avanza fill-only POC gate.
- Guard/test/proof paths:
  `lib/real-avanza-fill-only-guard.ts`,
  `tests/e2e/real-avanza-fill-only-guard-contract.spec.ts`, and
  `docs/real-avanza-fill-only-guard-contract-tests.md`.
- Result status:
  `real_avanza_fill_only_guard_contract_tests_added`.
- Reconnaissance remains human-led evidence only. No real Avanza access,
  automation, field filling, final click, or order placement was added.
- Recommended next action: Action 1013 - Add Real Avanza Fill-Only POC
  Readiness Review.

## Action 1013 - Real Avanza Fill-Only POC Readiness Review

- Created `docs/real-avanza-fill-only-poc-readiness-review.md`.
- Result status:
  `real_avanza_fill_only_poc_readiness_review_created`.
- Readiness decision:
  `real_avanza_fill_only_poc_deferred_pending_dom_mapping`.
- Reconnaissance remains passed with warnings, but actual fill-only readiness is
  deferred because real DOM/selectors have not been verified.
- Recommended next action: Action 1014 - Prepare Real Avanza DOM/Selector
  Reconnaissance Plan.

## Action 1014 - Real Avanza DOM/Selector Reconnaissance Plan

- Created `docs/real-avanza-dom-selector-reconnaissance-plan.md`.
- Result status:
  `real_avanza_dom_selector_recon_plan_created`.
- Reconnaissance remains human-led. The next evidence collection should record
  generic labels/selectors only, with sensitive values redacted and no field
  filling.
- Recommended next action: Action 1015 - Run Human-Led Real Avanza
  DOM/Selector Reconnaissance.

## Action 1015 - Real Avanza DOM/Selector Reconnaissance Results

- Created `docs/real-avanza-dom-selector-reconnaissance-results.md`.
- Result status:
  `real_avanza_dom_selector_recon_blocked`.
- No operator evidence was available to confirm labels/selectors, so
  reconnaissance must be repeated with the evidence template.
- Recommended next action: Action 1016 - Repeat Human-Led Real Avanza
  DOM/Selector Reconnaissance With Evidence.
