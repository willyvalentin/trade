# Avanza Confirmation Capture Manual QA Checklist

## 1. Purpose

Manual QA checklist for observing Avanza final confirmation/readback fields
before any capture implementation.

This checklist exists to answer what Avanza actually displays after manual
confirmation and in account/order history. It does not implement capture,
automation, OCR, browser extraction, persistence, execution-record creation, or
trade mutation.

## 2. Scope

Included:

- manual observation.
- paper/small safe test planning if the user explicitly chooses to perform one
  later.
- final confirmation/readback page observation.
- account/order history readback observation.
- buy and sell flow comparison.
- field availability documentation.
- privacy and redaction checks.
- evidence-contract gap mapping.

Excluded:

- Avanza/browser automation.
- automatic KOP/SALJ clicking.
- OCR/browser extraction.
- capture implementation.
- live broker data ingestion into Ture.
- persistence/write behavior.
- Supabase/localStorage writes.
- audit append.
- execution-record creation.
- trade mutation.
- automatic mode.

## 3. Safety prerequisites

Before manual QA:

- Do not run production automation.
- Do not let Ture click KOP, SALJ, Granska, Bekrafta, or any equivalent final
  broker action.
- Do not record secrets, passwords, cookies, tokens, session identifiers,
  account numbers, balances, holdings, or raw URLs.
- Do not store unnecessary account data.
- Use the smallest possible safe/manual test only if the user explicitly
  chooses to do so.
- If screenshots are stored, redact them first.
- Prefer notes that describe value categories instead of sensitive actual
  values.
- Do not ingest observed data into app runtime state.
- Do not write observed data to Supabase or localStorage.
- Do not append audit events.
- Do not create execution records.
- Do not mutate live/history trade state.
- Keep the manual final confirmation boundary explicit: only the user may
  choose to submit an actual broker order outside Ture automation.

## 4. Manual QA preparation

Record the test context before observing any page:

| Field | Manual note |
| --- | --- |
| QA date/time | |
| Timezone | |
| Browser/device | |
| Desktop/mobile layout | |
| Avanza account type | |
| Instrument tested | |
| Flow | buy / sell |
| Order type | market / limit / other |
| Quantity category | small / paper / not submitted |
| Price assumption | market / limit / preview only |
| Was order actually confirmed manually? | yes / no |
| Was order cancelled or preview-only? | yes / no |
| Did order appear in account/order history? | yes / no / delayed |
| Redaction status for any artifacts | none stored / redacted / needs review |

Notes:

- Use categories whenever possible rather than sensitive exact values.
- If an actual order is manually confirmed, document that it was a human action,
  not Ture automation.
- If the flow is preview-only or cancelled, label it as not confirmed evidence.

## 5. Order form / pre-submit observation

Manually observe the order form before any review or confirmation step.

Record:

- visible instrument fields.
- visible side/action fields.
- visible quantity fields.
- visible price/limit/market fields.
- visible account context.
- visible fee/commission estimate, if any.
- visible warnings or validation messages.
- whether any order id/reference is visible.
- whether any timestamp is visible.
- whether sensitive account data is visible.

Trust boundary:

- Order form fields are not confirmation evidence.
- Order form fields may help compare intent versus readback later.
- Order form fields must not be treated as broker-confirmed execution data.

## 6. Order preview observation

Manually observe the review/preview page before any final confirmation.

Record:

- preview title/status.
- instrument name.
- ticker, ISIN, instrument id, market, or venue if visible.
- side/action wording.
- quantity.
- price/limit/accepted price wording.
- currency.
- total amount.
- fee/commission estimate, if visible.
- account context.
- warnings/messages.
- whether order id/order number exists.
- whether confirmation id/fill id/execution id exists.
- whether timestamp exists.
- how preview differs visually/textually from final confirmation.

Trust boundary:

- Order preview is not production-safe confirmation evidence.
- A preview page can be user-intent evidence only.
- Preview must not feed BrokerExecutionResult confirmation, persistence, or
  trade mutation.

## 7. Final confirmation/readback observation

Only perform this section if the user manually chooses to submit an actual
broker order outside automation.

Capture manually:

- exact visible confirmation title/status.
- broker order id or order number, if shown.
- confirmation id, fill id, execution id, or strong equivalent, if shown.
- instrument name.
- ticker, ISIN, instrument id, market, or venue, if shown.
- side/action wording.
- quantity.
- execution/fill/average/accepted/limit price wording.
- currency.
- total amount.
- fee/commission, if shown.
- order type.
- broker timestamp and displayed timezone, if shown.
- captured observation timestamp and local timezone.
- account context, if shown.
- partial/full fill information.
- warnings/messages.
- links or navigation options to order status/history.
- screenshot/text evidence notes with redaction status.

Safety notes:

- Do not store raw screenshots unless redacted.
- Do not store raw page text if it includes sensitive data.
- Do not store account numbers, balances, holdings, cookies, tokens, raw URLs,
  or credentials.
- Label any field that is not clearly broker-originating as ambiguous.

## 8. Account/order history observation

Observe where and when the order appears in account/order history.

Record:

- page/location where the order appears.
- delay before visibility.
- order id/reference.
- confirmation/fill/execution id if shown.
- order status.
- fill status.
- partial/full fill details.
- filled quantity.
- remaining quantity.
- execution price or average fill price.
- fee/commission.
- timestamp and timezone.
- instrument name.
- ticker, ISIN, instrument id, market, or venue.
- side/action wording.
- account context.
- whether history fields are more reliable than immediate final confirmation.
- whether history fields differ from immediate final confirmation.

Trust boundary:

- Account/order history may be the stronger source if it exposes broker
  references and fill details.
- History data still must be validated and privacy-reviewed before any future
  capture prototype can consume it.

## 9. Buy vs sell comparison

For buy and sell flows, compare:

- confirmation title/status wording.
- action/side wording.
- order id/reference visibility.
- confirmation/fill/execution id visibility.
- price label wording.
- fee/commission wording.
- total amount wording.
- timestamp display.
- account context display.
- order history status wording.
- partial-fill wording.
- privacy-sensitive surrounding fields.

Document whether the evidence contract needs distinct buy/sell parsing or
whether the same field model is sufficient.

## 10. Partial fill checklist

For any order type where partial fills may occur, record:

- whether partial fill can occur for the tested order type.
- whether the immediate final confirmation shows partial fill state.
- whether account/order history shows partial fill state.
- whether multiple fills are visible.
- whether fill ids are visible.
- whether each fill has its own price/timestamp.
- whether average fill price is visible.
- whether remaining quantity is visible.
- whether final confirmation differs from later history.

Policy reminder:

- Ambiguous partial fills must remain review-only.
- Partial-fill evidence must not be mapped to a full-fill execution record until
  a dedicated partial-fill policy exists.

## 11. Evidence contract gap mapping

For each required evidence field, mark availability:

| Evidence field | Final confirmation | Account/order history | Status | Notes |
| --- | --- | --- | --- | --- |
| source type is final confirmation/history | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| broker order id/order number | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| confirmation/fill/execution id | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| instrument name | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| ticker | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| ISIN | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| instrument id | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| side | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| quantity | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| execution/fill price | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| currency | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| confirmation timestamp | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| captured timestamp | manually recorded | manually recorded | visible / ambiguous / fallback needed | |
| order status | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| fee/commission | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| total amount | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| account context | visible / not visible | visible / not visible | privacy-sensitive / safe masked / avoid | |
| partial fill fields | visible / not visible | visible / not visible | visible / ambiguous / fallback needed | |
| provenance/fingerprint source | manual note / screenshot hash / text hash | manual note / screenshot hash / text hash | needs design | |
| manual confirmation checkpoint | yes / no | yes / no | required | |
| handoff fingerprint linkage | yes / no | yes / no | needs design | |

Use these status labels:

- `visible on final confirmation`
- `visible in account/order history`
- `not visible`
- `ambiguous`
- `needs fallback`
- `privacy-sensitive`

## 12. Capture readiness outcome

After manual QA, classify readiness:

- `not ready`
- `ready for capture prototype design`
- `ready for capture contract types`
- `ready for read-only local prototype later`

Explain:

- which fields are reliably visible.
- which fields require account/order-history fallback.
- which fields are missing.
- which fields are privacy-sensitive.
- whether buy/sell differs enough to require separate mapping.
- whether partial-fill handling blocks implementation.
- whether screenshots/text artifacts can be safely redacted.
- whether the evidence contract needs updates.

Default outcome before completed manual QA:

- `not ready`

## 13. Manual QA result template

Reusable observation table:

| Date/time | Environment/device | Flow | Source page | Field | Observed value category | Confidence | Notes | Screenshot/redaction status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | buy/sell | form/preview/final/history | | visible/not visible/ambiguous/privacy-sensitive | high/medium/low | | none/redacted/needs redaction |

Reusable summary:

| Question | Answer |
| --- | --- |
| Is final confirmation distinguishable from preview? | |
| Does immediate confirmation expose a broker order id/reference? | |
| Does account/order history expose stronger references? | |
| Are execution price and quantity clearly broker-originating? | |
| Is confirmation timestamp visible and parseable? | |
| Are partial fills visible or ambiguous? | |
| Are sensitive fields near the target evidence? | |
| Can evidence be documented without raw sensitive data? | |
| Is a read-only prototype design safe to start? | |

## 14. Guardrails after QA

Manual QA results do not enable:

- persistence.
- Supabase writes.
- localStorage writes.
- audit append.
- execution-record creation.
- trade mutation.
- automatic mode.
- real browser automation.
- OCR/browser extraction.
- live broker evidence ingestion.

Further design and reassessment are required before any implementation.

## 15. Candidate next actions

A. Reassess Manual QA Findings

- safest next step after the checklist is used.
- determines whether the project can proceed to prototype design, contract
  updates, or more manual investigation.

B. Create Avanza Confirmation Capture Read-only Prototype Design

- appropriate only if manual QA confirms reliable fields and privacy-safe
  observation boundaries.

C. Create Avanza Confirmation Capture Contract Types

- appropriate if manual QA reveals capture-specific metadata not covered by the
  existing evidence contract.

D. Update Evidence Contract Based on Manual QA

- appropriate if final confirmation or account-history fields differ from the
  current contract assumptions.

## 16. Recommended next action

Recommended next action:

**Action 477 - Reassess Manual QA Findings**

Rationale:

- This checklist does not itself produce implementation readiness.
- The next safe step is to review the completed manual observations and decide
  whether capture prototype design, contract updates, or further QA is
  appropriate.

## 17. Verification

Verification for this documentation/checklist action:

- `git diff --check`

No runtime code changes were made. No Avanza/browser automation, OCR/browser
extraction, capture implementation, live broker data ingestion,
persistence/write behavior, Supabase/localStorage write behavior, audit append,
execution-record creation, trade mutation, or UI wiring was added.

## Action 477 Follow-Up

Action 477 created
`docs/avanza-confirmation-capture-manual-qa-findings-reassessment.md`.

Findings result:

- Existing repo docs contain partial pre-submit Avanza UI research for order
  form, review, and confirmation modal states.
- No actual post-submit final confirmation/readback or account/order-history
  findings were found.
- Capture/readback remains blocked until real manual findings are recorded.

Next recommended action:

**Action 478 - Create Manual QA Findings Template**

## Action 478 Follow-Up

Action 478 created
`docs/avanza-confirmation-capture-manual-qa-findings-template.md`.

Checklist impact:

- The checklist now has a companion findings template for recording actual
  manual observations.
- The template keeps form, preview, final confirmation, and account/order
  history observations distinct.
- No observations were prefilled and no runtime behavior was added.

Next recommended action:

**Action 479 - Fill Manual QA Findings Template**

## Action 479 Follow-Up

Action 479 filled
`docs/avanza-confirmation-capture-manual-qa-findings-template.md` with existing
repo findings only.

Checklist impact:

- The filled template confirms the repo still lacks actual post-submit final
  confirmation/readback and account/order-history findings.
- The checklist remains the source for what a future real manual observation
  pass must collect.
- Capture/readback remains blocked.

Next recommended action:

**Action 480 - Record Real Avanza Manual QA Observations**

## Action 480 Follow-Up

Action 480 created
`docs/avanza-confirmation-capture-manual-qa-observation-log.md`.

Checklist impact:

- Future real manual QA observations should be recorded in the observation log.
- The log preserves the checklist's redaction, no-ingestion, no-write, and
  no-mutation guardrails.
- No actual observations were invented or marked as completed.

Next recommended action:

**Action 481 - Reassess Real Avanza Manual QA Observations**

## Action 481 Follow-Up

Action 481 created
`docs/avanza-confirmation-capture-real-manual-qa-observations-reassessment.md`.

Checklist impact:

- The checklist remains unfulfilled by real final/history findings.
- The next useful documentation step is a user-facing runbook that explains how
  to perform and record the manual QA session safely.
- Capture/readback remains blocked.

Next recommended action:

**Action 482 - Create User Manual QA Runbook**

## Action 482 Follow-Up

Action 482 created
`docs/avanza-confirmation-capture-user-manual-qa-runbook.md`.

Checklist impact:

- The runbook turns the checklist/log/template into a practical user process.
- It keeps pre-submit, post-submit final confirmation, and order-history
  observations separate.
- It preserves redaction, no-ingestion, no-write, and no-mutation guardrails.

Next recommended action:

**Action 483 - Reassess User-Recorded Avanza Manual QA Observations**

## Action 483 Follow-Up

Action 483 created
`docs/avanza-confirmation-capture-user-recorded-observations-reassessment.md`.

Checklist impact:

- The checklist remains unfulfilled by real final confirmation/readback
  observations.
- The checklist remains unfulfilled by real account/order-history observations.
- The next required step is still user-performed manual QA outside Codex.
- Capture/readback remains blocked.

Next recommended action:

**Action 484 - Record Real Avanza Manual QA Observations**
