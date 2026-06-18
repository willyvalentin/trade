# Avanza Confirmation Capture Manual QA Observation Log


## 1. Purpose

Safe place to record real manual Avanza observations later.

Current status:

- This document is currently blank unless user-provided observations are added.
- No real post-submit final confirmation/readback observations are recorded.
- No real account/order-history observations are recorded.
- Capture/readback readiness remains blocked.

This log does not implement capture, automation, OCR/browser extraction,
persistence, execution-record creation, audit append, or trade mutation.

## 2. Safety/privacy rules

Before recording observations:

- Do not record BankID details.
- Do not record session secrets.
- Do not record passwords.
- Do not record cookies, tokens, browser storage, or raw session identifiers.
- Do not record full account numbers.
- Redact or mask account names and account ids.
- Avoid recording balances or holdings unrelated to the tested order.
- Screenshots must be redacted before storage.
- Use value categories where possible instead of sensitive raw values.
- Do not ingest observations into app runtime.
- Do not write observations to Supabase.
- Do not write observations to localStorage.
- Do not append audit events.
- Do not create execution records.
- Do not mutate trades.
- Do not use automatic mode.

## 3. Observation session template

| Field | Value |
| --- | --- |
| Session id | |
| Date/time/timezone | |
| Observer | |
| Environment/browser/device | |
| Avanza UI variant if known | |
| Account type/category/masked reference | |
| Instrument category | |
| Buy/sell | |
| Order type | |
| Quantity category | |
| Price type | |
| Submitted manually? | yes / no |
| Cancelled/preview-only? | yes / no |
| Notes | |

## 5. Final confirmation/readback observation template

| Field | Observed yes/no | Value category | Exact label text if safe | Confidence | Privacy sensitivity | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Confirmation title/status | | submitted / filled / accepted / placed / ambiguous / not visible | | high / medium / low | low / medium / high | |
| Order id/order number | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Confirmation id/equivalent | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Instrument name | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Ticker/ISIN/instrument id | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Side | | buy / sell / ambiguous / not visible | | high / medium / low | low / medium / high | |
| Quantity | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Execution/fill/limit price | | execution / fill / limit / accepted / ambiguous / not visible | | high / medium / low | low / medium / high | |
| Currency | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Total amount | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Fee/commission | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Order type | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Confirmation timestamp | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Account context | | masked / visible / too sensitive / not visible | | high / medium / low | low / medium / high | |
| Venue/market | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Partial/full fill status | | full / partial / multiple / ambiguous / not visible | | high / medium / low | low / medium / high | |
| Warnings/messages | | visible / not visible / ambiguous | | high / medium / low | low / medium / high | |
| Provenance/source identity | | clear / ambiguous / not visible | | high / medium / low | low / medium / high | |

## 6. Account/order-history observation template

| Field | Finding |
| --- | --- |
| Delay before order visible | |
| Order id/reference availability | visible / not visible / ambiguous |
| Status lifecycle | |
| Fill status | full / partial / multiple / ambiguous / not visible |
| Partial/full fill details | |
| Execution price | visible / not visible / ambiguous |
| Fee/commission | visible / not visible / ambiguous |
| Timestamp | visible / not visible / ambiguous |
| Instrument identifiers | visible / not visible / ambiguous |
| Account context | masked / visible / too sensitive / not visible |
| Reliability versus final confirmation | stronger / weaker / same / unknown |
| Missing fields | |
| Ambiguity notes | |

## 7. Buy/sell comparison template

| Field | Buy session id | Sell session id | Same/different | Wording differences | Risk notes |
| --- | --- | --- | --- | --- | --- |
| Source page identity | | | same / different / unknown | | |
| Confirmation title/status | | | same / different / unknown | | |
| Order id/reference | | | same / different / unknown | | |
| Confirmation id/equivalent | | | same / different / unknown | | |
| Instrument fields | | | same / different / unknown | | |
| Side/action wording | | | same / different / unknown | | |
| Quantity | | | same / different / unknown | | |
| Price/fill price | | | same / different / unknown | | |
| Currency | | | same / different / unknown | | |
| Fee/commission | | | same / different / unknown | | |
| Timestamp | | | same / different / unknown | | |
| History status | | | same / different / unknown | | |

## 8. Partial-fill observation template

| Field | Finding |
| --- | --- |
| Partial fill observed? | yes / no / not tested |
| Multiple fills visible? | yes / no / not tested |
| Aggregation behavior | aggregated / separate fills / unclear / not tested |
| Individual fill prices shown? | yes / no / not tested |
| Individual fill timestamps shown? | yes / no / not tested |
| Fill ids shown? | yes / no / not tested |
| Remaining quantity shown? | yes / no / not tested |
| Unresolved ambiguity | |
| Conservative handling | review-only / blocked / not applicable |

## 9. Evidence contract gap update block

| Required evidence field | Status | Source | Fallback needed? | Privacy-sensitive? | Notes |
| --- | --- | --- | --- | --- | --- |
| final confirmation/history source identity | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| broker order id/order number | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| confirmation/fill/execution id | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| instrument name | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| ticker/ISIN/instrument id | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| side | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| quantity | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| execution/fill price | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| currency | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| fee/commission | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| confirmation timestamp | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| account context | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| fill status | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| provenance/fingerprint source | confirmed available / order-history only / unavailable / ambiguous / not tested / privacy-sensitive | final / history / both / none | yes / no | yes / no | |
| manual confirmation checkpoint | confirmed available / unavailable / ambiguous / not tested | human note / none | yes / no | yes / no | |

## 10. Readiness decision block

Choose one after observations are recorded:

- [x] Still not ready. Current log has no real observations.
- [ ] Ready for evidence contract update.
- [ ] Ready for capture read-only prototype design.
- [ ] Ready for capture contract types.

Reason:

- Current real post-submit final confirmation observations: none recorded.
- Current real account/order-history observations: none recorded.
- Capture/readback readiness: blocked.

## 11. Guardrails

Recording observations does not enable:

- capture implementation.
- persistence.
- Supabase writes.
- localStorage writes.
- audit append.
- execution-record creation.
- trade mutation.
- automatic mode.
- browser/OCR extraction.
- Avanza/browser automation.

A separate reassessment is required after real observations are added.

## 12. Current status

Current real post-submit final confirmation observations:

- none recorded.

Current real account/order-history observations:

- none recorded.

Capture/readback readiness:

- blocked.

## 13. Recommended next action

Recommended next action:

**Action 481 - Reassess Real Avanza Manual QA Observations**

Rationale:

- This action created a safe blank log only.
- Once user-provided observations are recorded, the next safe repository step is
  to reassess those observations before any evidence contract update, prototype
  design, or capture implementation.

## 14. Verification

Verification for this documentation/log action:

- `git diff --check`

No runtime code changes were made. No Avanza/browser automation, OCR/browser
extraction, capture implementation, live broker data ingestion,
persistence/write behavior, Supabase/localStorage write behavior, audit append,
execution-record creation, trade mutation, or UI wiring was added.

## Action 481 Follow-Up

Action 481 created
`docs/avanza-confirmation-capture-real-manual-qa-observations-reassessment.md`.

Observation status:

- The observation log remains blank for real final confirmation/readback
  findings.
- The observation log remains blank for real account/order-history findings.
- Capture/readback readiness remains blocked.

Next recommended action:

**Action 482 - Create User Manual QA Runbook**

## Action 482 Follow-Up

Action 482 created
`docs/avanza-confirmation-capture-user-manual-qa-runbook.md`.

Observation-log impact:

- The runbook explains how to fill this log safely during a future manual QA
  session.
- This log still contains no real final confirmation/readback observations.
- This log still contains no real account/order-history observations.

Next recommended action:

**Action 483 - Reassess User-Recorded Avanza Manual QA Observations**

## Action 483 Follow-Up

Action 483 created
`docs/avanza-confirmation-capture-user-recorded-observations-reassessment.md`.

Observation status:

- This log still contains no real user-recorded final confirmation/readback
  observations.
- This log still contains no real user-recorded account/order-history
  observations.
- Required evidence fields remain unobserved.
- Capture/readback readiness remains blocked.

Next recommended action:

## Action 484 - Record Real Avanza Manual QA Observations


### 01 Session metadata - [KLART]

| Field | Value |
| --- | --- |
| Session id | AVANZA-QA-BUY-001 |
| Date/time/timezone | 2026-06-15 20:48:29 Europe/Stockholm |
| Observer | Willy |
| Environment/browser/device | Desktop Web | Safari | Macbook Pro |
| Avanza UI variant if known | Desktop Web |
| Account type/category/masked reference | Kapitalförsäkring |
| Instrument category | Stock |
| Buy/sell | Buy |
| Order type | Limit |
| Quantity category | 5 shares |
| Price type | limit/executed price in USD |
| Submitted manually? | yes |
| Cancelled/preview-only? | no |
| Notes | Avräkningsnota available for completed buy transaction. Sensitive account/depot identifiers should be masked. |


### 02 Source page observations

| Source page | Observed yes/no | Fields visible | Screenshot/text reference | Redaction status | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Order form | yes | instrument, buy side, quantity, price/amount, account context | Full buy flow screenshot / order form crop | redacted / needs redaction | high | Pre-submit only. Useful for intended values, not confirmation evidence. |
| Order preview/review | yes | instrument, side, quantity, estimated price/amount, account context, possible cost summary | Full buy flow screenshot / review crop | redacted / needs redaction | high | Pre-submit review only. Must not be treated as final broker confirmation. |
| Signing/waiting state | yes | signing/submission progress state | Full buy flow screenshot / signing crop | redacted / needs redaction | medium | Intermediate state only. Not confirmation evidence. |
| Final confirmation/readback | yes | order sent/accepted status, limited order context | Full buy flow screenshot / final modal crop | redacted / needs redaction | medium | Shows "Din order gick till marknad". Treat as post-submit acknowledgement, not complete execution/fill evidence. |
| Account/order history | yes | transaction/order detail panel, instrument, side/type, quantity, price/amount, date/account context likely visible | Full buy flow screenshot / transaction detail crop | redacted / needs redaction | medium | Appears to be strongest future readback source, but exact labels still need manual verification. |
| Failed/cancelled state | no | not tested | none | not stored | low | Not tested in this session. |


### 03 Final confirmation/readback observation - [KLART]

| Field | Finding |
| --- | --- |
| Confirmation title/status | not from final modal; avräkningsnota observed |
| Order id/order number | visible as avräkningsnota number / reference, 1658691571 |
| Confirmation id/equivalent | ambiguous; no separate confirmation id verified |
| Instrument name | visible, GAMESTOP CORP NEW CL A |
| Ticker/ISIN/instrument id | ISIN visible, US36467W1099 |
| Side | Buy |
| Quantity | visible, 5 |
| Execution/fill/limit price | visible, 21,695 USD |
| Currency | visible, USD |
| Total amount | visible |
| Fee/commission | visible |
| Order type | visible, L |
| Confirmation timestamp | execution time visible, 260615 20:48:29 |
| Account context | visible but high privacy sensitivity; mask |
| Venue/market | visible, USA1 |
| Partial/full fill status | full inferred from single execution row and total quantity 5, but mark as inferred |
| Warnings/messages | none observed |
| Provenance/source identity | avräkningsnota / post-trade note |


### 04 Account/order-history observation - [KLART]

| Field | Finding |
| --- | --- |
| Delay before order visible | unknown / not measured |
| Order id/reference availability | visible |
| Status lifecycle | completed trade / avräkningsnota generated |
| Fill status | full, based on total quantity matching executed quantity |
| Partial/full fill details | no partial fill indicated; single execution row observed |
| Execution price | 21,695 USD |
| Fee/commission | visible, 9,43 SEK |
| Timestamp | visible, 260615 20:48:29 |
| Instrument identifiers | visible, ISIN US36467W1099 |
| Account context | visible but privacy-sensitive; mask depot/account details |
| Reliability versus final confirmation | stronger |
| Missing fields | confirmation id/equivalent not clearly separate from avräkningsnota/order number |
| Ambiguity notes | Avräkningsnota provides strong post-trade evidence, but clarify whether “Nummer” should be treated as broker order id, note id, or settlement note reference. |


### 05 Evidence contract gap update

| Required evidence field | Status | Source | Fallback needed? | Privacy-sensitive? | Notes |
| --- | --- | --- | --- | --- | --- |
| final confirmation/history source identity | confirmed available | both | no | no | Final modal and account/order-history source were observed. |
| broker order id/order number | ambiguous / not tested | history | yes | no | Not clearly observed. Verify exact order-history label. |
| confirmation/fill/execution id | not tested | none | yes | no | No confirmation id/equivalent verified. |
| instrument name | confirmed available | both | no | no | Instrument/security visible in flow and history. |
| ticker/ISIN/instrument id | ambiguous / not tested | history | yes | no | Needs manual verification in account/order-history detail. |
| side | confirmed available | both | no | no | BUY flow observed. |
| quantity | confirmed available | both | no | no | Quantity visible in flow/history, exact label should be verified. |
| execution/fill price | ambiguous | history | yes | no | History likely contains price/rate; final modal does not clearly show execution/fill price. |
| currency | confirmed available / ambiguous | history | yes | no | Currency visible in flow/history, exact source should be verified. |
| fee/commission | not tested / ambiguous | history | yes | no | Needs manual verification. |
| confirmation timestamp | ambiguous / not tested | history | yes | no | Transaction date visible, exact timestamp not verified. |
| account context | confirmed available / privacy-sensitive | both / history | no | yes | Must remain masked. |
| fill status | ambiguous / not tested | history | yes | no | Full/partial fill status not verified. |
| provenance/fingerprint source | confirmed available | both | no | no | Screenshot/source page references exist, but should remain redacted. |
| manual confirmation checkpoint | confirmed available | human note | no | no | User manually submitted the order. |


### 06 Readiness decision

- [x] Still not ready. Partial real BUY-flow observations exist, but production-critical fields remain unverified.
- [ ] Ready for evidence contract update.
- [ ] Ready for capture read-only prototype design.
- [ ] Ready for capture contract types.

Reason:

- Pre-submit order form/review states are documented.
- Post-submit final modal is documented as `Din order gick till marknad`, but it is not sufficient as complete execution/fill evidence by itself.
- Account/order-history detail panel is observed and appears to be the strongest future readback source.
- Exact order-history labels still need manual verification, especially order id/reference, confirmation id/equivalent, exact timestamp, fee/commission, instrument identifier, and partial/full fill status.
- Capture/readback readiness remains blocked.
- Persistence remains blocked.
- Trade mutation remains blocked.


### 07 Summary block

Summary:

- Full manual BUY-flow was observed from order form to account/order-history detail panel.
- Order form and review/preview are pre-submit only and not production-safe confirmation evidence.
- The post-submit final modal confirms that the order went to market, but does not clearly provide complete execution/fill evidence.
- Account/order-history appears to be the primary future evidence source, but exact field labels must be manually verified.
- No persistence, execution-record creation, trade mutation, capture implementation, or automatic mode is enabled by these observations.

Recommended next step after manually filling real values:

**Action 485 - Reassess Recorded Avanza Manual QA Observations**


| Source page | Observed yes/no | Fields visible | Screenshot/text reference | Redaction status | Confidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Order form | | | | none / redacted / needs redaction / not stored | high / medium / low | |
| Order preview/review | | | | none / redacted / needs redaction / not stored | high / medium / low | |
| Final confirmation/readback | | | | none / redacted / needs redaction / not stored | high / medium / low | |
| Account/order history | | | | none / redacted / needs redaction / not stored | high / medium / low | |
| Failed/cancelled state | | | | none / redacted / needs redaction / not stored | high / medium / low | |


---


## 3A. Full example session - copy this format

This is a complete example of how a real manual BUY-flow observation can be recorded.
Replace the placeholder values with what was actually observed. Keep `unknown`,
`not clearly observed`, or `needs verification` when a field was not visible.
Do not treat this example as production-safe evidence.

## Action 485 - Two-stage broker evidence interpretation

Action 485 created
`docs/two-stage-broker-evidence-flow-design.md`.

Interpretation of the recorded Avanza findings:

- The immediate transaction detail/readback should be logged as Immediate
  Broker Readback.
- Immediate Broker Readback can support a future provisional trade state only
  after a separate approved trade-mutation design exists.
- The immediate readback must be marked provisional and final-note-pending when
  Avanza indicates that amount/cost information arrives with the overnight
  note.
- The `avrakningsnota`/PDF or equivalent final note should be logged as Final
  Broker Settlement Note.
- Final Broker Settlement Note is the preferred source for official trade
  details, fees, totals, ISIN, settlement dates, and final audit references.
- Matching between the provisional readback and final note must be conservative
  and review-blocked on partial, duplicate, or mismatched candidates.

Additional fields to capture for Immediate Broker Readback:

| Field | Observation |
| --- | --- |
| evidence stage | immediate_readback |
| provisional status | provisional / needs_review |
| final note pending | yes / no |
| visible broker event fields | |
| missing final-note fields | |
| source page identity | |
| handoff payload fingerprint | |

Additional fields to capture for Final Broker Settlement Note:

| Field | Observation |
| --- | --- |
| evidence stage | final_settlement_note |
| note/reference number | |
| business date | |
| settlement date | |
| print date | |
| ISIN | |
| commission/fees | |
| consideration/total amount | |
| matched provisional trade | exact / partial / mismatch / duplicate / unknown |

No runtime behavior, capture implementation, persistence, execution-record
creation, audit append, trade mutation, UI wiring, or broker automation is
enabled by this interpretation.

## Action 486 - Two-stage broker evidence contract types

Action 486 created `lib/two-stage-broker-evidence-contract.ts`.

Observation-log impact:

- Future observations can map immediate transaction/readback evidence to
  `ImmediateBrokerReadbackEvidence`.
- Future final `avrakningsnota`/PDF or transaction-history note observations can
  map to `FinalBrokerSettlementNoteEvidence`.
- Missing immediate-readback fields and final-note fields now have explicit
  contract vocabulary.
- The contract keeps immediate readback provisional and final-note-pending.
- The final settlement note remains official evidence only after future
  matching/validation, and the contract still does not persist or mutate.

Next recommended action:

**Action 487 - Reassess Two-Stage Broker Evidence Contract Types**

## Action 487 - Two-stage contract reassessment

Action 487 created
`docs/two-stage-broker-evidence-contract-reassessment.md`.

Observation-log impact:

- The reassessment confirms the two-stage contract gives future manual QA a
  safe vocabulary for immediate readback and final settlement note observations.
- Immediate readback observations must still be marked provisional and
  final-note-pending.
- Final settlement note observations must still be matched and validated before
  any future finalization boundary.
- No capture/readback implementation, persistence, execution-record creation,
  audit append, trade mutation, UI wiring, browser automation, or Avanza
  behavior is enabled.

Next recommended action:

**Action 488 - Create Final Settlement Note Matching Design**

## Action 488 - Final settlement note matching design

Action 488 created `docs/final-settlement-note-matching-design.md`.

Observation-log impact:

- Future final note observations should record enough fields to support
  conservative matching: broker, masked account/category, instrument identity,
  side, quantity, trade/business date, execution time, execution price,
  currency, note/reference number, total amount, commission/fee, FX rate,
  handoff fingerprint, and provenance.
- Partial fills, duplicate note candidates, missing note references, and
  account/instrument/side/quantity/date conflicts should be logged explicitly.
- Matching remains design-only and does not finalize, persist, create execution
  records, or mutate trades.

Next recommended action:

**Action 489 - Create Final Settlement Note Matching Contract Types**

## Action 489 - Final settlement note matching contract types

Action 489 created `lib/final-settlement-note-matching-contract.ts`.

Observation-log impact:

- Future manual QA findings can map observed final note fields into the
  matching contract vocabulary.
- Missing hard gates, weak soft signals, duplicate candidates, partial-fill
  ambiguity, and mismatch reasons now have type-only labels.
- This does not implement capture, matching, finalization, persistence,
  execution-record creation, audit append, trade mutation, UI wiring, browser
  automation, or Avanza behavior.

Next recommended action:

**Action 490 - Reassess Final Settlement Note Matching Contract Types**

## Action 490 - Final settlement note matching contract reassessment

Action 490 created
`docs/final-settlement-note-matching-contract-reassessment.md`.

Observation-log impact:

- The reassessment confirms manual QA observations can use the matching
  vocabulary safely without implying implemented matching.
- Missing hard gates, weak soft signals, duplicate candidates, partial-fill
  ambiguity, and mismatch reasons remain documentation/type labels until a
  future validator exists.
- No capture, matching, finalization, persistence, execution-record creation,
  audit append, trade mutation, UI wiring, browser automation, or Avanza
  behavior was added.

Next recommended action:

**Action 491 - Create Final Settlement Note Matching Validator**
