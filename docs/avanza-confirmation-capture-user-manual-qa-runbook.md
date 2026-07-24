# Avanza Confirmation Capture User Manual QA Runbook

## 1. Purpose

Give the user a safe, practical process for manually collecting Avanza final
confirmation/readback and account/order-history observations.

This runbook is for manual observation only. It does not implement capture,
automation, OCR/browser extraction, persistence, execution-record creation,
audit append, or trade mutation.

## 2. Current blocker

Capture/readback is blocked because:

- no real post-submit final confirmation observations exist yet.
- no real account/order-history observations exist yet.
- no production-safe broker confirmation source exists yet.

Completing this runbook does not enable:

- capture implementation.
- persistence.
- trade mutation.
- automatic mode.
- Supabase/localStorage writes.
- execution-record creation.

Any future implementation still requires a separate reassessment after real
observations are recorded.

## 3. Safety prerequisites

Before starting:

- Do not record BankID details.
- Do not record session secrets.
- Do not record passwords.
- Do not store full account numbers.
- Redact screenshots before saving.
- Avoid unrelated balances.
- Avoid unrelated holdings.
- Use masked/category values where possible.
- Use the smallest safe/manual test only if you explicitly decide to do so.
- Do not use automation to click KOP or SALJ.
- Do not use automation to click Granska.
- Do not use automation to click Bekrafta.
- Do not ingest observations into the app runtime.
- Do not write observations to Supabase.
- Do not write observations to localStorage.
- Do not append audit events.
- Do not mutate trades.

## 4. Files to use

Use these files together:

- `docs/avanza-confirmation-capture-manual-qa-observation-log.md`
  - primary place to record real manual observations.
  - use this for session details, source pages, final confirmation fields,
    account/order-history fields, buy/sell comparison, partial-fill notes, and
    evidence gap status.
- `docs/avanza-confirmation-capture-manual-qa-findings-template.md`
  - structured findings summary.
  - use this after or during observation to summarize what was actually found
    versus still unknown.
- `docs/avanza-confirmation-capture-manual-qa-checklist.md`
  - preparation and safety checklist.
  - use this before starting and when deciding whether findings are sufficient.

Do not store sensitive raw data in any of these files.

## 5. Manual QA flow overview

1. Prepare a QA session entry.
2. Observe the order form.
3. Observe the order preview/review.
4. If you manually submit a safe order, observe post-submit final
   confirmation/readback.
5. Observe account/order history after submission.
6. Record buy/sell differences if both are tested.
7. Record partial-fill behavior if observed.
8. Update evidence contract gap mapping.
9. Mark a readiness decision.

If no manual submission occurs, mark post-submit final confirmation and
account/order-history sections as `not tested`.

## 6. Pre-submit observation steps

Record order form fields:

- instrument name/ticker if visible.
- account context as masked/category only.
- side/action.
- order type.
- quantity.
- limit/price/course fields.
- currency labels.
- fees/courtage estimates.
- total amount estimates.
- validation messages.
- visible warnings.

Record preview/review fields:

- review title/status.
- `Granska` wording.
- instrument fields.
- side.
- quantity.
- price/course.
- account context as masked/category only.
- fees.
- total amount.
- final confirmation button label if visible.
- cancel/exit affordance.

Important:

- Pre-submit fields are not production-safe broker confirmation evidence.
- Order form, preview, and confirmation modal-before-submit fields must not be
  treated as submitted or filled execution data.
- Use them only to compare intent/readback and to document UI differences.

## 7. Post-submit final confirmation steps

Only use this section if you manually submit an order outside automation.

Record:

- confirmation title/status.
- order id/order number.
- confirmation id/equivalent.
- instrument name.
- ticker, ISIN, or instrument id if visible.
- side.
- quantity.
- execution/fill/limit price.
- currency.
- total amount.
- fee/commission.
- order type.
- confirmation timestamp and timezone.
- account context as masked/category only.
- venue/market if visible.
- partial/full fill status.
- warnings/messages.
- provenance/source identity.
- redacted screenshot/text reference.

If a field is missing or unclear, mark it as:

- `not visible`
- `ambiguous`
- `not tested`
- `privacy-sensitive`

Do not infer filled execution from wording that only says the order was placed
or accepted.

## 8. Account/order-history steps

After manual submission, observe account/order history.

Record:

- when the order appears.
- delay before visibility.
- order status lifecycle.
- order id/reference.
- confirmation/fill/execution id if visible.
- fill status.
- execution price.
- fee/commission.
- timestamp and timezone.
- instrument identifiers.
- account context as masked/category only.
- whether history is more reliable than final confirmation.
- missing fields.
- ambiguity notes.

If history has stronger references than the immediate final confirmation, mark
the field as `only available in order history` in the evidence gap mapping.

## 9. Buy vs sell comparison

If both buy and sell are tested, record separate session ids.

Compare:

- confirmation title/status.
- order id/reference behavior.
- confirmation id/equivalent behavior.
- instrument fields.
- side/action wording.
- quantity.
- execution/fill price.
- currency.
- fee/commission.
- timestamp.
- account/order-history status.
- warning/status messages.

Mark:

- same.
- different.
- unknown.
- not tested.

Add risk notes for any wording or field differences that could confuse future
capture.

## 10. Partial-fill observation

Watch for:

- partial fill status.
- multiple fills.
- aggregated fill rows.
- separate fill rows.
- individual fill prices.
- individual fill timestamps.
- fill ids.
- remaining quantity.

If unclear:

- mark partial-fill behavior as ambiguous.
- use conservative handling: review-only or blocked.
- do not treat ambiguous partial fills as full fills.

## 11. Redaction checklist

Before saving any artifact:

- [ ] Account numbers masked.
- [ ] Account labels masked if identifying.
- [ ] Balances hidden unless directly required and safely categorized.
- [ ] Holdings hidden unless directly required and safely categorized.
- [ ] Personal names hidden.
- [ ] BankID/security prompts not captured.
- [ ] Cookies/tokens/session details not captured.
- [ ] Raw URLs not stored.
- [ ] Screenshots redacted before saving.
- [ ] Filename does not include personal, account, or instrument-sensitive
  details.

Safe file naming examples:

- `avanza-qa-session-001-final-confirmation-redacted.png`
- `avanza-qa-session-001-order-history-redacted.png`
- `avanza-qa-session-001-notes.md`

## 12. Evidence contract gap mapping instructions

For each required evidence field, mark one status:

- `confirmed available`
- `only available in order history`
- `unavailable`
- `ambiguous`
- `not tested`
- `privacy-sensitive`
- `fallback needed`

Use `confirmed available` only when the field is visible on a real
post-submit final confirmation/readback or account/order-history source.

Do not mark pre-submit order form or preview fields as production-safe
confirmation evidence.

## 13. Readiness decision guide

Mark `still not ready` when:

- final confirmation/readback was not observed.
- account/order-history was not observed.
- broker references are missing.
- timestamps are missing.
- fill status is unknown.
- privacy-sensitive fields cannot be safely redacted.
- partial-fill behavior is ambiguous.

Evidence contract update may be possible when:

- actual final/history observations show fields that the current evidence
  contract does not model.
- the findings are redacted and safe to discuss.

Read-only prototype design may be possible when:

- final/history source identity is clear.
- required broker references are visible or a fallback is documented.
- timestamp and fill-status behavior are understood.
- privacy/redaction constraints are clear.

Persistence and trade mutation remain blocked regardless of this runbook. They
require separate design, implementation, and reassessment.

## 14. After completing manual QA

After recording observations:

1. Save only redacted/safe artifacts.
2. Update `docs/avanza-confirmation-capture-manual-qa-observation-log.md`.
3. Update `docs/avanza-confirmation-capture-manual-qa-findings-template.md`.
4. Do not change runtime code.
5. Ask Codex to reassess the recorded observations before any capture
   implementation.

The next Codex action should reassess actual recorded observations before any
evidence contract update, prototype design, capture implementation,
persistence, or trade mutation.

## 15. Guardrails

This runbook does not enable:

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

Separate reassessment is required after observations are recorded.

## 16. Recommended next action

Recommended next action:

**Action 483 - Reassess User-Recorded Avanza Manual QA Observations**

Rationale:

- Codex cannot perform the real Avanza session.
- Once the user records observations, the next safe step is reassessment before
  any contract update, prototype design, or implementation.

## 17. Verification

Verification for this documentation/runbook action:

- `git diff --check`

No runtime code changes were made. No Avanza/browser automation, OCR/browser
extraction, capture implementation, live broker data ingestion,
persistence/write behavior, Supabase/localStorage write behavior, audit append,
execution-record creation, trade mutation, or UI wiring was added.

## Action 483 Follow-Up

Action 483 created
`docs/avanza-confirmation-capture-user-recorded-observations-reassessment.md`.

Runbook impact:

- The reassessment confirmed no user-recorded real final confirmation/readback
  observations have been added.
- The reassessment confirmed no user-recorded real account/order-history
  observations have been added.
- The runbook remains the correct process for the next real-world manual QA
  step.
- Capture/readback remains blocked.

Next recommended action:

**Action 484 - Record Real Avanza Manual QA Observations**

## Action 485 Follow-Up - Two-Stage Manual QA Guidance

Action 485 created
`docs/two-stage-broker-evidence-flow-design.md`.

Runbook update:

- During future manual QA, record immediate post-submit readback separately from
  the final settlement note.
- For immediate readback, record visible broker event fields and mark missing
  amount/cost fields as provisional with final note pending.
- On the next day or when available, record the final `avrakningsnota`/PDF or
  transaction-history note as the official settlement source.
- Do not treat the immediate readback as final PnL/statistics evidence.
- Do not create execution records, persist official results, or mutate trades
  from either stage under this runbook.

Next recommended action:

**Action 486 - Create Two-Stage Broker Evidence Contract Types**
