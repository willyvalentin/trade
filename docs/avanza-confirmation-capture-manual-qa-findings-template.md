# Avanza Confirmation Capture Manual QA Findings Template

## 1. Purpose

Template for recording real Avanza manual QA observations safely.

Use this only after a manual observation session. Do not prefill actual Avanza
final confirmation/readback or account/order-history values unless they were
observed and documented safely.

Action 479 fill status:

- Existing repo findings were applied only where documented.
- Existing findings come from sanitized pre-submit Avanza UI research in
  `docs/avanza-ui-research-mapping.md`,
  `docs/avanza-manual-selector-notes.md`, and related manual mapping docs.
- No actual post-submit final confirmation/readback findings were found.
- No actual account/order-history findings were found.
- Post-submit capture/readback remains blocked.

This template does not implement capture, automation, OCR/browser extraction,
persistence, execution-record creation, or trade mutation.

## 2. Scope

Included:

- post-submit final confirmation/readback observations.
- account/order-history observations.
- buy flow observations.
- sell flow observations.
- full-fill observations.
- partial-fill observations.
- privacy/redaction status.
- evidence-contract gap mapping.

Excluded:

- Avanza/browser automation.
- capture implementation.
- OCR/browser extraction.
- live broker data ingestion into Ture runtime.
- Supabase/localStorage writes.
- persistence.
- audit append.
- execution-record creation.
- trade mutation.
- automatic mode.

## 3. Safety and privacy header

Complete before adding findings:

- [x] No passwords recorded in this repo fill.
- [x] No BankID prompts or security details recorded in this repo fill.
- [x] No session secrets, cookies, tokens, or browser storage recorded in this
  repo fill.
- [x] No account number stored unless masked.
- [x] Existing screenshot references are documented as sanitized/redacted
  research only; no raw screenshots were added.
- [x] No unnecessary balances captured.
- [x] No unnecessary holdings captured.
- [x] Observations use value categories rather than sensitive raw values where
  possible.
- [x] No app ingestion/runtime write.
- [x] No Supabase write.
- [x] No localStorage write.
- [x] No audit append.
- [x] No execution-record creation.
- [x] No trade mutation.

Redaction notes:

- Account identifiers should be masked or categorized.
- Raw URLs should not be stored.
- Raw page text should be avoided if it includes sensitive data.
- Screenshots should be referenced only after redaction.

## 4. QA session metadata

| Field | Value |
| --- | --- |
| QA date | No real post-submit QA session recorded yet. Existing source docs are dated 2026-06-11. |
| Observer | Not recorded for post-submit capture QA. Existing docs are repo documentation-only research intake. |
| Environment/device/browser | Not recorded for post-submit capture QA. |
| Avanza UI variant if known | Sanitized UI research covered manual order flow through confirmation modal only. |
| Account type, masked/category only | Not recorded for post-submit capture QA. Existing docs warn account context is sensitive. |
| Market/session state | Not recorded for post-submit capture QA. |
| Timezone | Not recorded for post-submit capture QA. |
| Instrument category | Stock/order-flow research only; no post-submit evidence findings. |
| Buy/sell | Existing pre-submit docs cover buy and sell variants. Post-submit buy/sell not tested. |
| Order type | Existing pre-submit docs cover Advanced and note Stop Loss/Glidande as out of scope. |
| Quantity category | Pre-submit quantity field observed as `Antal`; no post-submit fill quantity findings. |
| Price type | Pre-submit/review price/course labels observed; no post-submit execution/fill price findings. |
| Was order actually submitted manually? | No actual post-submit manual confirmation findings found in repo. |
| Was order cancelled/preview-only? | Existing research stopped at confirmation modal / pre-submit boundary. |
| Notes | Existing findings are partial pre-submit UI research only. Capture/readback remains blocked. |

## 5. Source pages observed

| Source page | Observed yes/no | Screenshot/text reference | Redaction status | Confidence | Notes |
| --- | --- | --- | --- | --- | --- |
| Order form | yes, partial pre-submit findings | `docs/avanza-ui-research-mapping.md`; `docs/avanza-manual-selector-notes.md` | documented as sanitized research; no new screenshots stored | medium | Observed labels include Advanced, Konto, Belopp i SEK, Antal, Kurs, Villkor, Avgifter, Totalt belopp inkl. avgifter. Not broker confirmation evidence. |
| Order preview/review | yes, partial pre-submit findings | `docs/avanza-ui-research-mapping.md`; `docs/avanza-manual-selector-notes.md` | documented as sanitized research; no new screenshots stored | medium | Review labels `Granska kop` / `Granska salj` documented. Preview/review is not production-safe confirmation evidence. |
| Final confirmation/readback | no post-submit findings | none found | not stored | low | Existing docs cover confirmation modal before final `Bekrafta`, not post-submit readback. Required fields remain unverified. |
| Account/order history | no findings | none found | not stored | low | No account/order-history observations found for broker references, fill status, timestamps, or fees. |
| Cancelled/failed order state | unknown for post-submit capture | no final/history findings found | not stored | low | Existing docs mention cancel/exit path templates and `Avbryt`, but no completed post-submit cancelled/failed state findings. |

## 6. Field observation matrix

Use categories rather than sensitive raw values when possible.

| Field | Order form | Order preview | Final confirmation | Account/order history | Observed value category | Confidence | Privacy sensitivity | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Broker/order id | not documented | not documented | not tested | not tested | unknown / not tested | low | medium | Required broker reference remains unverified. |
| Confirmation id/equivalent | not documented | not documented | not tested | not tested | unknown / not tested | low | medium | No final/history equivalent found. |
| Instrument name | observed on stock/detail and modal research | observed in confirmation modal research | not tested post-submit | not tested | available from pre-submit research only | medium | low | Not production-safe broker confirmation evidence. |
| Ticker | search/detail research partially covers ticker/name | not proven for preview | not tested | not tested | available from pre-submit research only / ambiguous | medium | low | Final/history visibility unknown. |
| ISIN | not documented | not documented | not tested | not tested | unknown / not tested | low | low | Needs manual QA. |
| Instrument id | not documented | not documented | not tested | not tested | unknown / not tested | low | low | Needs manual QA. |
| Side | `Kop` / `Salj` entry labels documented | `Granska kop/salj`; `Bekrafta kop/salj` labels documented pre-submit | not tested post-submit | not tested | available from pre-submit research only | medium | low | Final/history side wording unknown. |
| Quantity | `Antal` documented | confirmation modal `Antal` documented pre-submit | not tested post-submit | not tested | available from pre-submit research only | medium | low | Fill quantity remains unverified. |
| Price/fill price | `Kurs` documented | confirmation modal `Kurs` documented pre-submit | not tested post-submit | not tested | available from pre-submit research only / fill unknown | medium | low | Execution/fill price remains unverified. |
| Limit price | `Kurs`/price-course labels documented | confirmation modal `Kurs` documented pre-submit | not tested post-submit | not tested | available from pre-submit research only | medium | low | Not a confirmed fill price. |
| Currency | currency-specific price labels noted as variable | FX/currency fields noted in modal research | not tested post-submit | not tested | ambiguous / needs manual QA | medium | low | Currency/fx fields may vary by instrument. |
| Total amount | total including fees documented on order form | `Totalt belopp` documented in modal research | not tested post-submit | not tested | available from pre-submit research only | medium | low | Not broker confirmation evidence. |
| Fee/commission | `Avgifter` documented | `Courtage`, `Valutaväxling`, FX labels documented in modal research | not tested post-submit | not tested | available from pre-submit research only | medium | low | Final/history fee evidence unknown. |
| Order type | Advanced/Stop Loss/Glidande documented | preview/modal tied to selected order flow | not tested post-submit | not tested | available from pre-submit research only | medium | low | Final/history order type unknown. |
| Confirmation timestamp | not documented | not documented | not tested | not tested | unknown / not tested | low | low | Required timestamp remains unverified. |
| Captured timestamp | not applicable | not applicable | not recorded | not recorded | not recorded | low | low | No capture session occurred. |
| Account context | `Konto` documented | confirmation modal `Konto` documented pre-submit | not tested post-submit | not tested | visible pre-submit / privacy-sensitive | medium | high | Must be masked/category-only if recorded later. |
| Venue/market | search/detail research requires market/currency verification | not proven for modal | not tested | not tested | ambiguous / needs manual QA | low | low | Final/history visibility unknown. |
| Fill status | not documented | not documented | not tested | not tested | unknown / not tested | low | low | No fill status findings. |
| Partial/full fill indicator | not documented | not documented | not tested | not tested | unknown / not tested | low | low | Partial-fill behavior remains unknown. |
| Warning/status messages | validation classes documented pre-submit | warning/status messages not proven final | not tested | not tested | available from pre-submit research only / ambiguous | medium | medium | Broker-result warnings unknown. |
| Source page identity | order form/review/modal identities documented | confirmation modal identity documented as stop point | not tested post-submit | not tested | clear for pre-submit only | medium | low | Final confirmation/history source identity unverified. |
| Provenance clues | sanitized research package referenced | sanitized research package referenced | not tested | not tested | present for docs only / insufficient | medium | medium | Not production provenance for broker evidence. |

## 7. Final confirmation/readback detailed template

| Question | Finding |
| --- | --- |
| Title/status text category | No actual post-submit final confirmation/readback observations found. Existing docs cover pre-submit confirmation modal only. |
| Does the page clearly indicate a submitted order? | not tested / unknown |
| Does the page clearly indicate a filled execution? | not tested / unknown |
| Broker order id/reference availability | not tested / unknown |
| Confirmation id/equivalent availability | not tested / unknown |
| Field labels observed | No post-submit labels documented. Pre-submit modal labels include Instrument, Konto, Antal, Kurs, Belopp exkl. avg., Courtage, Valutaväxling, Preliminär växlingskurs, Giltig t.o.m., Totalt belopp, Bekräfta köp/sälj, Avbryt. |
| Visual distinction from preview | not tested / unknown |
| Timestamp format | not tested / unknown |
| Timestamp timezone | not tested / unknown |
| Missing fields | Broker reference, confirmation/equivalent id, fill status, execution timestamp, final/history provenance all unverified. |
| Ambiguity notes | Capture remains blocked because no actual post-submit final confirmation/readback findings exist. |
| Sensitive data nearby | unknown |
| Redaction status | no post-submit artifact stored |

## 8. Account/order-history detailed template

| Question | Finding |
| --- | --- |
| Delay before order visible | not tested / unknown |
| Status lifecycle observed | not tested / unknown |
| Broker order id/reference availability | not tested / unknown |
| Confirmation/fill/execution id availability | not tested / unknown |
| Fill details visible | not tested / unknown |
| Partial fill display visible | not tested / unknown |
| Multiple fills visible | not tested / unknown |
| Price/fee availability | not tested / unknown |
| Timestamp format | not tested / unknown |
| Timestamp timezone | not tested / unknown |
| Field reliability versus final confirmation | unknown |
| Missing fields | All account/order-history broker confirmation fields remain unverified. |
| Ambiguity notes | No actual account/order-history observations found in repo. Capture fallback reliability remains unknown. |
| Sensitive data nearby | unknown |
| Redaction status | no account/order-history artifact stored |

## 9. Buy vs sell comparison template

| Key field | Buy observation | Sell observation | Same/different | Wording differences | Risk notes |
| --- | --- | --- | --- | --- | --- |
| Title/status | Pre-submit buy flow documented through confirmation modal only. | Pre-submit sell flow documented through confirmation modal only. | unknown post-submit | Buy/sell labels differ at action/review/final button level. | Post-submit title/status not tested. |
| Broker/order id | not tested | not tested | unknown | unknown | Required broker id availability remains unknown. |
| Confirmation id/equivalent | not tested | not tested | unknown | unknown | Required confirmation/equivalent id remains unknown. |
| Instrument identity | Pre-submit instrument identity required/observed at search/detail/modal level. | Pre-submit instrument identity required/observed at search/detail/modal level. | likely same pre-submit, unknown post-submit | unknown post-submit | Do not infer post-submit availability. |
| Side/action wording | `Kop`, `Granska kop`, `Bekrafta kop` documented as pre-submit/final-button labels. | `Salj`, `Granska salj`, `Bekrafta salj` documented as pre-submit/final-button labels. | different | buy/sell wording differs by action label. | Final button is a danger boundary, not evidence of submitted order. |
| Quantity | `Antal` documented pre-submit/modal. | `Antal` documented pre-submit/modal. | same pre-submit, unknown post-submit | none documented beyond side-specific flow. | Fill quantity not verified. |
| Price/fill price | `Kurs` documented pre-submit/modal. | `Kurs` documented pre-submit/modal. | same pre-submit, unknown post-submit | none documented beyond side-specific flow. | Execution/fill price not verified. |
| Currency | Currency-specific labels and FX fields noted as variable. | Currency-specific labels and FX fields noted as variable. | unknown | may vary by instrument/currency, not side alone. | Needs manual QA. |
| Fee/commission | Fee/courtage and FX fields documented pre-submit/modal. | Fee/courtage and FX fields documented pre-submit/modal. | unknown post-submit | unknown | Final/history fee evidence not verified. |
| Total amount | Total amount documented pre-submit/modal. | Total amount documented pre-submit/modal. | unknown post-submit | unknown | Not broker confirmation evidence. |
| Timestamp | not tested | not tested | unknown | unknown | Required timestamp remains unknown. |
| Account/order history status | not tested | not tested | unknown | unknown | No history findings exist. |

## 10. Partial-fill observation template

| Question | Finding |
| --- | --- |
| Partial fill observed? | not tested |
| Multiple fills visible? | not tested |
| Fill aggregation shown? | not tested |
| Individual fill prices shown? | not tested |
| Individual fill timestamps shown? | not tested |
| Fill ids shown? | not tested |
| Remaining quantity shown? | not tested |
| Unresolved ambiguity | No actual partial-fill final confirmation or order-history behavior is documented. |
| Default conservative handling | review-only / blocked until real findings and a partial-fill policy exist |

## 11. Evidence contract gap mapping

| Required evidence field | Status | Source | Fallback needed? | Privacy-sensitive? | Notes |
| --- | --- | --- | --- | --- | --- |
| final confirmation/history source identity | not tested for actual final/history sources | none | yes | no | Pre-submit confirmation modal identity exists, but it is not broker confirmation evidence. |
| broker order id/order number | not tested | none | yes | possible | No actual final/history broker reference finding. |
| confirmation/fill/execution id | not tested | none | yes | possible | No actual final/history equivalent finding. |
| instrument name | available from existing pre-submit research only | pre-submit form/modal | yes | no | Not production-safe evidence until confirmed on final/history source. |
| ticker/ISIN/instrument id | available from existing pre-submit research only / partially unknown | pre-submit search/detail | yes | no | ISIN/instrument id not documented as final/history fields. |
| side | available from existing pre-submit research only | pre-submit action/review/modal labels | yes | no | Final/history side still unverified. |
| quantity | available from existing pre-submit research only | pre-submit order form/modal | yes | no | Fill quantity still unverified. |
| execution/fill price | available from existing pre-submit research only; fill price unknown | pre-submit order form/modal | yes | no | Execution/fill price remains unknown. |
| currency | ambiguous / not tested on final/history | pre-submit labels only | yes | no | Currency/FX varies by instrument; needs QA. |
| confirmation timestamp | not tested | none | yes | no | Required field remains unknown. |
| captured timestamp | not recorded | none | yes | no | No capture session occurred. |
| order status/fill status | not tested | none | yes | no | Filled/placed/partial status unknown. |
| fee/commission | available from existing pre-submit research only | pre-submit order form/modal | yes | no | Final/history fee evidence unknown. |
| account context | available from existing pre-submit research only; privacy-sensitive | pre-submit order form/modal | yes | yes | Must be masked/category-only if recorded later. |
| provenance/fingerprint source | documentation provenance only; production provenance not available | sanitized research docs | yes | possible | Not adequate for broker confirmation evidence. |
| manual confirmation checkpoint | not available for post-submit QA | none | yes | no | No manual final confirmation session findings found. |

## 12. Readiness decision after findings

After entering findings, choose all that apply:

- [ ] Ready for evidence contract update.
- [ ] Ready for capture prototype design.
- [ ] Ready for capture contract types.
- [x] Not ready.
- [x] More manual QA required.

Explanation:

| Question | Answer |
| --- | --- |
| Which fields are confirmed available? | Only pre-submit/order-flow fields are documented: order form labels, review labels, and confirmation modal labels. No production-safe final/history evidence fields are confirmed. |
| Which fields are unavailable? | No final confirmation/readback or account/order-history findings are available in repo docs. |
| Which fields are ambiguous? | Broker references, confirmation/equivalent ids, fill status, execution/fill price, timestamps, order-history reliability, partial fills, and final/history provenance. |
| Which fields need order-history fallback? | Unknown. Order-history availability itself is not tested. |
| Which fields are privacy-sensitive? | Account context is documented as sensitive; future screenshots/text may include account identifiers, balances, holdings, raw URLs, cookies, or tokens. |
| Is partial-fill behavior understood? | No. |
| Does buy/sell behavior differ? | Pre-submit labels differ by buy/sell; post-submit differences are not tested. |
| Does capture remain blocked? | yes |

## 13. Summary block

| Field | Summary |
| --- | --- |
| Findings summary | Partial pre-submit Avanza UI research exists for order form, review, and confirmation modal states. No actual post-submit final confirmation/readback or account/order-history findings exist in repo docs. |
| Blockers | Missing broker order id/confirmation id findings, missing final/history timestamp findings, missing fill status findings, missing order-history reliability findings, missing partial-fill observations, missing privacy-safe post-submit artifact strategy. |
| Risks | Treating pre-submit modal fields as broker confirmation, accepting missing ids, overcapturing account data, partial-fill ambiguity, premature capture/prototype/persistence work. |
| Recommended next action | Action 480 - Record Real Avanza Manual QA Observations |
| Capture remains blocked? | yes |

## 14. Guardrails reminder

Completed findings do not enable:

- persistence.
- Supabase writes.
- localStorage writes.
- audit append.
- execution-record creation.
- trade mutation.
- automatic mode.
- capture implementation without separate design and reassessment.
- browser/OCR extraction without separate design and reassessment.
- Avanza/browser automation without separate design and reassessment.

## 15. Candidate next actions

A. Fill Manual QA Findings Template

- Use this template during or after a real manual QA session.

B. Reassess Manual QA Findings After Real Observations

- Required after the template contains real observations.
- Determines whether capture prototype design, evidence contract updates, or
  more QA should happen next.

C. Update Evidence Contract Based on Manual QA

- Only safe if actual findings reveal contract gaps.

D. Create Avanza Confirmation Capture Read-only Prototype Design

- Only safe if actual findings show reliable fields and privacy-safe
  observation boundaries.

## 16. Recommended next action

Recommended next action:

**Action 480 - Record Real Avanza Manual QA Observations**

Rationale:

- The template is now filled with existing repo findings only.
- No actual final confirmation/account-history findings are available yet.
- The next step is a real, safely redacted manual observation pass before any
  reassessment, contract update, or prototype design.

## 17. Verification

Verification for this documentation/template action:

- `git diff --check`

No runtime code changes were made. No Avanza/browser automation, OCR/browser
extraction, capture implementation, live broker data ingestion,
persistence/write behavior, Supabase/localStorage write behavior, audit append,
execution-record creation, trade mutation, or UI wiring was added.

## Action 480 Follow-Up

Action 480 created
`docs/avanza-confirmation-capture-manual-qa-observation-log.md`.

Observation-log result:

- A dedicated blank log now exists for future user-provided real Avanza manual
  observations.
- The log explicitly records that no real post-submit final confirmation or
  account/order-history observations are currently recorded.
- The filled findings template remains based only on existing pre-submit repo
  findings.

Next recommended action:

**Action 481 - Reassess Real Avanza Manual QA Observations**

## Action 481 Follow-Up

Action 481 created
`docs/avanza-confirmation-capture-real-manual-qa-observations-reassessment.md`.

Template status:

- The template still contains only existing pre-submit repo findings.
- No real post-submit final confirmation/readback findings have been recorded.
- No real account/order-history findings have been recorded.
- A user manual QA runbook is recommended before expecting real findings.

Next recommended action:

**Action 482 - Create User Manual QA Runbook**

## Action 482 Follow-Up

Action 482 created
`docs/avanza-confirmation-capture-user-manual-qa-runbook.md`.

Findings-template impact:

- The runbook directs the user to update this template after recording real
  observations in the observation log.
- The template remains based on existing pre-submit findings only until the user
  records real final/history observations.

Next recommended action:

**Action 483 - Reassess User-Recorded Avanza Manual QA Observations**

## Action 483 Follow-Up

Action 483 created
`docs/avanza-confirmation-capture-user-recorded-observations-reassessment.md`.

Findings-template impact:

- No user-recorded real Avanza observations were found in this template.
- Existing pre-submit findings remain excluded from production-safe broker
  confirmation evidence.
- Final confirmation/readback and account/order-history fields remain
  unobserved.

Next recommended action:

**Action 484 - Record Real Avanza Manual QA Observations**
