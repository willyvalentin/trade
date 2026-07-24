## Action 1017 Selector Mapping Contract Update

- Action 1017 created `lib/real-avanza-selector-mapping-contract.ts` and
  `docs/real-avanza-selector-mapping-contract.md`.
- Result status:
  `real_avanza_selector_mapping_contract_created`.
- The selector mapping remains pure/static and does not add Avanza automation,
  field filling, clicking, submit behavior, route calls, Supabase calls, or
  broker behavior.
- Recommended next action: Action 1018 - Add Selector Contract To Fill-Only
  Guard.

## Action 1016 Results Update

- Action 1016 repeated the previously blocked DOM/selector reconnaissance with
  operator-provided screenshot/DevTools evidence.
- Results doc: `docs/real-avanza-dom-selector-reconnaissance-results.md`.
- Result status:
  `real_avanza_dom_selector_recon_passed_with_warnings`.
- The evidence supports creating a pure/static selector mapping contract next,
  including forbidden final confirmation selectors.
- The evidence remains human-led/manual only; no Avanza automation, field
  filling, review click, final click, order placement, or runtime integration is
  approved.
- Recommended next action: Action 1017 - Create Real Avanza Selector Mapping
  Contract.

# Real Avanza DOM/Selector Reconnaissance Plan

## Purpose

Action 1014 prepares a human-led real Avanza DOM/selector reconnaissance plan.

This is not automation. This is not fill-only POC approval. This is not order
execution. This does not authorize field filling, final confirmation clicks, or
broker submission.

## Readiness Basis

- Screenshots/manual mapping completed.
- Real Avanza UI mapping spec created.
- Real Avanza fill-only POC gate and max amount policy created.
- Max amount and final-submit guard contract tests added.
- Fill-only POC readiness review created.
- Fill-only POC remains deferred pending DOM/selector mapping.

## Scope

- Human-led inspection only.
- User logs in manually.
- User navigates manually.
- Browser devtools may be used manually by the operator if safe.
- No automation.
- No field filling by agent.
- No final click.
- No order placement.
- No credentials or sensitive values copied into docs.
- No code reads Avanza page contents, credentials, session state, or tokens.

## What To Collect

- Visible label text.
- Input role/type if safely inspectable.
- Accessible name / `aria-label` if visible or safely inspectable.
- Placeholder text.
- Button text.
- Form section titles.
- Validation message text.
- Modal title/text.
- Final submit button label.
- Cancel/back button label.
- Whether stable data attributes exist.
- Whether fields are iframes, shadow DOM, or dynamic components, if observable.
- Whether labels change by order type.

## Field-Specific Selector Targets

- Account selector.
- Instrument/ticker field.
- Buy/sell side.
- Quantity / `antal`.
- Amount in SEK.
- Order type.
- Price / `kurs`.
- Validity.
- Fees/courtage summary.
- Total amount.
- Warning/error area.
- `Granska köp`.
- `Granska sälj`.
- Confirmation modal.
- `Bekräfta köp`.
- `Bekräfta sälj`.
- `Avbryt`.

## Sensitivity And Redaction Policy

- Never capture personal identity.
- Never capture account number.
- Never capture holdings/saldo unless blurred.
- Never capture BankID/2FA.
- Never capture credentials.
- Screenshots should be cropped/redacted.
- Notes should use generic labels, not account identifiers.
- Do not paste session tokens, cookies, local storage, request headers, or
  account-specific values into docs.

## Safe Operator Procedure

1. Log in manually.
2. Navigate manually to one liquid test instrument.
3. Open order panel manually.
4. Do not use agent.
5. Do not submit.
6. Inspect labels/selectors manually only if safe.
7. Record generic selector/label observations.
8. If confirmation modal appears, do not click `Bekräfta`.
9. Close/cancel the modal/order panel.
10. Confirm no order was placed.

## Hard Stop Boundaries

- Do not click `Bekräfta köp`.
- Do not click `Bekräfta sälj`.
- Do not allow any agent-controlled click in Avanza.
- Do not allow code to read credentials/session tokens.
- Do not continue if account/order risk feels unclear.
- Stop immediately if final button receives focus unexpectedly.
- Stop immediately if warning, validation, market-status, account, currency,
  or amount context feels ambiguous.

## Output Evidence Template

```text
Date:
Browser:
Instrument used:
Order type observed:
Account selector label/structure:
Ticker field label/structure:
Side selector label/structure:
Quantity field label/structure:
Price field label/structure:
Error message examples:
Review button label:
Confirmation modal labels:
Final button label:
Cancel button label:
Ambiguous/dynamic fields:
Redaction/sensitivity note:
Order placed: no
Final click: no
```

## Result Statuses For Future Reconnaissance

- `real_avanza_dom_selector_recon_plan_created`
- `real_avanza_dom_selector_recon_passed`
- `real_avanza_dom_selector_recon_passed_with_warnings`
- `real_avanza_dom_selector_recon_blocked`

## Result Status

`real_avanza_dom_selector_recon_plan_created`

## Recommended Next Action

Action 1015 - Run Human-Led Real Avanza DOM/Selector Reconnaissance.

## Validation Results

- Documentation/static review completed.
- `./node_modules/.bin/tsc --noEmit` passed.
- `npm run lint` passed with the known `app/trade-app.tsx` Babel deopt note.
- Optional runtime denial harness import check reported
  `runtime-denial-script-absent`.
- Audit writer runtime path import search returned no app/components/hooks
  matches.
- Route/provider/scan static search was not invoked as runtime behavior; it
  returned documentation/policy references and existing contract-test
  forbidden-fragment assertions only.
- UI/app-shell audit writer import scan returned no matches.
- Market-loop/scanner search was static only and did not invoke scans.
- `NEXT_PUBLIC_*SERVICE*` and service-role leakage search returned
  documentation/policy references and contract-test forbidden-fragment
  assertions only; no secret values were printed.
- Avanza-dom-recon-plan executable-code safety scan returned documentation
  language, pure guard/type names, and contract-test policy assertions only; no
  executable Avanza/browser/broker/fetch/Supabase/env/service-role/provider/
  route/scan integration was added.
- Automatic-mode safety scan returned policy/blocking language and test fixture
  assertions only.
- Dead-doc/path scan returned no missing files.
- Result-status and next-action consistency scans passed.
- `git diff --check` passed.
- Touched-file trailing whitespace scan returned no matches.
- `find docs -type f -size 0` returned no output.
- `.env.local` diff check returned no output.

## Action 1015 Reconnaissance Results Update

- Created `docs/real-avanza-dom-selector-reconnaissance-results.md`.
- Result status:
  `real_avanza_dom_selector_recon_blocked`.
- Operator-provided DOM/selector evidence was not available, so no selector
  observations were invented.
- Recommended next action: Action 1016 - Repeat Human-Led Real Avanza
  DOM/Selector Reconnaissance With Evidence.

## Not Performed

- No runtime code change.
- No browser automation.
- No Avanza access from code.
- No Avanza integration.
- No Avanza URL runtime constant.
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
