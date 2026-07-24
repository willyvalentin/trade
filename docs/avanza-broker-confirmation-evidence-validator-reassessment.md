# Avanza Broker Confirmation Evidence Validator Reassessment

## 1. Purpose

Reassess the Avanza broker confirmation evidence validator after Action 457.
The goal is to verify that `validateAvanzaConfirmationEvidence(...)` remains
pure, conservative, evidence-only, and disconnected from capture, OCR/browser
extraction, `BrokerExecutionResult` conversion, persistence, Supabase, audit,
trade mutation, browser, and Avanza flows.

## 2. Current validator inventory

Validator module:

- `lib/avanza-broker-confirmation-evidence-validator.ts`

Exported API:

- `validateAvanzaConfirmationEvidence(evidence)`
- `AVANZA_CONFIRMATION_EVIDENCE_VALIDATION_STATUSES`
- `AvanzaConfirmationEvidenceValidationStatus`
- `AvanzaConfirmationEvidenceValidationResult`

Input evidence shape:

- accepts `Partial<AvanzaConfirmationEvidence> | null | undefined`.
- validates evidence metadata without assuming capture or extraction happened.

Result statuses:

- `valid`
- `rejected`
- `needs_review`

Rejection reasons:

- uses `AvanzaConfirmationEvidenceRejectionReason` from the evidence contract.
- hard blockers return `rejected`.
- review-only reasons currently include:
  - `extraction_confidence_low`
  - `partial_fill_ambiguous`

Warning behavior:

- uses `AvanzaConfirmationEvidenceWarning`.
- warnings include missing/uncertain contextual fields such as currency,
  manual confirmation, handoff fingerprint, non-filled status, account context,
  and partial confidence.

Source classification policy usage:

- calls `validateBrokerResultSourceForUsage(...)` with intended usage
  `execution_record_creation`.
- source classification remains a pure policy check.
- a disallowed source classification causes conservative rejection via
  `provenance_missing`.

Field confidence handling:

- confidence below `0.7` on extraction confidence or key field confidence
  returns `needs_review` with `extraction_confidence_low`.
- low confidence adds `field_confidence_partial`.

Partial-fill handling:

- `partially_filled` status or partial-fill evidence statuses `partial`,
  `multiple_fills`, or `unclear` return `needs_review`.
- the validator does not decide accounting, record count, average price
  policy, or trade mutation.

E2E coverage summary:

- `tests/e2e/execution-sandbox.spec.ts` includes
  `validates Avanza confirmation evidence without capture or conversion`.
- Covered paths:
  - valid final confirmation evidence returns `valid`.
  - order preview source rejects.
  - missing broker reference rejects.
  - missing provenance rejects.
  - invalid quantity and price reject.
  - ambiguous partial fill returns `needs_review`.
  - low confidence returns `needs_review`.

## 3. Boundary verification

Pure only:

- The validator is deterministic and only evaluates input evidence plus static
  policy constants.
- It does not read time, environment, network, browser state, storage, or app
  state.

Evidence-only:

- The validator checks source type, broker reference, timestamps, instrument
  identity, side, quantity, price, provenance, source classification policy,
  partial-fill ambiguity, and field confidence.
- It does not prove broker-originating evidence beyond the fields supplied.

No capture:

- No capture state is created.
- No Avanza page is read.
- No selector, URL, or browser session is touched.

No OCR/browser extraction:

- OCR/browser extraction is not implemented.
- Field confidence is treated as input metadata only.

No `BrokerExecutionResult` conversion:

- No `BrokerExecutionResult` types are imported.
- No conversion output is built.
- A `valid` evidence result is not a broker result.

No persistence/write:

- No Supabase client is imported.
- No localStorage or database access exists.
- No execution record storage is attempted.

No Supabase/audit/trade/browser/Avanza behavior:

- No Supabase behavior exists.
- No audit append exists.
- No trade mutation exists.
- No browser automation exists.
- No Avanza behavior exists.

## 4. Validation coverage verification

Final confirmation / account history source requirements:

- `final_confirmation` and `account_order_history` are the allowed source
  categories.
- any source outside the allowed list adds
  `missing_final_confirmation_source`.

Order preview / order form / manual-only behavior:

- `order_preview` adds both `missing_final_confirmation_source` and
  `source_is_order_preview`.
- `order_form` and `manual_user_provided` are not allowed source categories
  and therefore fail the final-confirmation source check.

Broker reference checks:

- at least one order id, order number, confirmation id, fill id, execution id,
  broker reference, or strong equivalent reference must be present.
- missing all references adds `missing_order_id`.

Timestamp checks:

- confirmation timestamp must parse as a valid timestamp.
- invalid or missing confirmation timestamp adds
  `missing_confirmation_timestamp`.
- invalid or missing captured timestamp warns with `timestamp_out_of_range`.

Instrument identity checks:

- at least one instrument name, ticker, ISIN, or instrument id must be present.
- missing instrument identity adds `missing_instrument_identifier`.

Side / quantity / price checks:

- missing side adds `side_mismatch`.
- non-positive or non-finite quantity adds `quantity_mismatch`.
- non-positive or non-finite price adds `price_invalid`.

Provenance checks:

- provenance with an evidence fingerprint is required.
- missing provenance or missing evidence fingerprint adds
  `provenance_missing`.

Source classification checks:

- the validator calls the source classification validator for
  `execution_record_creation`.
- disallowed source policy results add `provenance_missing`.
- a valid evidence result does not bypass future creation or persistence gates.

Partial-fill ambiguity handling:

- partial-filled status or partial-fill evidence returns `needs_review`.
- this preserves the current policy that partial-fill accounting is unresolved.

Low-confidence handling:

- low extraction or field confidence returns `needs_review`.
- low confidence adds `extraction_confidence_low` and
  `field_confidence_partial`.

## 5. Remaining gaps before BrokerExecutionResult conversion

- No evidence-to-`BrokerExecutionResult` mapping implementation exists.
- No `BrokerExecutionResult` confirmation validator exists.
- No Avanza capture/readback implementation exists.
- No real source evidence acquisition exists.
- No persistence integration exists.
- No trade mutation integration exists.
- No screenshot/text provenance storage design exists.
- No policy exists for converting `needs_review` evidence into manual
  acceptance.
- No production source has authority to assign `production_safe_candidate`.

## 6. Candidate next actions

A. Create Evidence-to-BrokerExecutionResult Mapping Design

- safest next design step.
- can define how validated evidence fields would map to a future broker result
  without implementing conversion.
- can preserve current no-capture/no-persistence/no-mutation boundaries.

B. Create BrokerExecutionResult Confirmation Validator Design

- useful, but broader than mapping design because it combines evidence
  validation, conversion eligibility, source classification, and future result
  safety policy.

C. Reassess Avanza Broker Confirmation Capture Readiness

- useful later, but closer to browser/Avanza behavior.
- should wait until mapping and confirmation validator design are clearer.

D. Create Avanza Confirmation Capture Manual QA Checklist

- useful for manual review and QA, but less foundational than mapping the
  validated evidence shape.

## 7. Recommended next action

**Action 459 - Create Evidence-to-BrokerExecutionResult Mapping Design**

Rationale:

- Evidence types and a pure evidence validator now exist.
- The next safe step is to design, not implement, how validated evidence would
  map into a future `BrokerExecutionResult`.
- This keeps capture, OCR/browser extraction, conversion implementation,
  persistence, Supabase writes, audit append, trade mutation, browser
  automation, and Avanza behavior out of scope.

## 8. Risk assessment

Validator mistaken for confirmed broker result risk:

- high. `valid` means the evidence object passes field sanity checks only; it
  is not a `BrokerExecutionResult`.

Valid evidence mistaken for persistence approval risk:

- high. A valid evidence result does not authorize Supabase writes,
  execution-record persistence, audit append, or trade mutation.

Preview/source misclassification risk:

- high. The validator rejects preview sources, but future capture must still
  correctly label source types.

Provenance gap risk:

- medium/high. Evidence fingerprints and source classification are checked,
  but no screenshot/text storage design or external provenance proof exists.

Partial-fill ambiguity risk:

- high. Partial fills currently return `needs_review` and remain unmapped to
  execution records.

Future OCR/browser extraction trust risk:

- high. Future extraction output must remain untrusted input until validated.

Avanza UI drift risk:

- medium/high. The validator cannot detect UI wording or flow changes unless
  they are represented in evidence fields.

Conversion false-positive risk:

- high. Future mapping must avoid treating field-sane evidence as a confirmed
  filled execution without confirmation validator checks.

Trade mutation coupling risk:

- high. Trade mutation remains a separate future boundary and must not be
  bundled with evidence validation or result conversion.

## 9. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No capture implementation, OCR/browser
extraction, `BrokerExecutionResult` conversion, persistence/write behavior,
Supabase behavior, audit append, trade mutation, browser behavior, or Avanza
behavior was added.

## Action 459 Follow-Up

Action 459 created
`docs/avanza-evidence-to-broker-execution-result-mapping-design.md`.

Result:

- Defined documentation-only mapping rules from validated Avanza confirmation
  evidence to future `BrokerExecutionResult` fields.
- Documented preconditions, field mapping, result status model, partial-fill
  handling, idempotency/fingerprint mapping, provenance mapping,
  rejection/needs-review behavior, and relationships to execution records and
  trade mutation.
- Confirmed no mapping implementation, BrokerExecutionResult creation,
  capture/OCR/browser extraction, persistence, Supabase behavior, audit append,
  trade mutation, browser behavior, or Avanza behavior was added.

Next recommended action:

**Action 460 - Create BrokerExecutionResult Confirmation Validator Design**

## Action 460 Follow-Up

Action 460 created
`docs/broker-execution-result-confirmation-validator-design.md`.

Evidence-validator impact:

- The evidence validator remains upstream of the future BrokerExecutionResult
  confirmation validator.
- The confirmation validator design defines how evidence validation, source
  classification, intent matching, idempotency readiness, partial-fill review,
  and no-write/no-mutation safety metadata should combine.
- No validator implementation was added.

Next recommended action:

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**

## Action 461 Follow-Up

Action 461 created
`lib/broker-execution-result-confirmation-validator-contract.ts`.

Evidence-validator impact:

- The Avanza evidence validator remains the upstream pure validation step.
- The new confirmation validator contract references the evidence validation
  result as input but does not implement confirmation validation.
- The contract carries no capture, conversion, persistence, audit append, trade
  mutation, browser, or Avanza behavior.

Next recommended action:

**Action 462 - Reassess BrokerExecutionResult Confirmation Validator Contract Types**

## Action 462 Follow-Up

Action 462 created
`docs/broker-execution-result-confirmation-validator-contract-reassessment.md`.

Evidence-validator impact:

- The evidence validator remains the upstream pure Avanza evidence check.
- The confirmation validator contract reassessment verified that evidence
  validation results are represented as input, not reimplemented or bypassed.
- No capture, conversion, persistence, audit append, trade mutation, browser,
  or Avanza behavior was added.

Next recommended action:

**Action 463 - Create BrokerExecutionResult Confirmation Validator**

## Action 463 Follow-Up

Action 463 created
`lib/broker-execution-result-confirmation-validator.ts`.

Evidence-validator impact:

- The Avanza evidence validator remains the upstream evidence-only gate.
- The new confirmation validator consumes its result and does not duplicate
  capture, OCR/browser extraction, or Avanza behavior.
- Rejected evidence returns rejected confirmation results; review evidence
  returns needs-review or partial-fill review confirmation results.
- No mapping, persistence, audit append, trade mutation, UI wiring, browser, or
  Avanza behavior was added.

Next recommended action:

**Action 464 - Reassess BrokerExecutionResult Confirmation Validator**

## Action 464 Follow-Up

Action 464 created
`docs/broker-execution-result-confirmation-validator-reassessment.md`.

Evidence-validator impact:

- The confirmation validator was verified as downstream of the Avanza evidence
  validator.
- The evidence validator remains evidence-only; confirmation validation remains
  conversion-eligibility-only.
- No capture, mapper, BrokerExecutionResult creation, persistence, audit
  append, trade mutation, browser, or Avanza behavior was added.

Next recommended action:

**Action 465 - Create Evidence-to-BrokerExecutionResult Mapper Contract Types**

## Action 475 Follow-Up

Action 475 created
`docs/avanza-broker-confirmation-capture-readiness-reassessment.md`.

Evidence-validator impact:

- The evidence validator remains a pure field/provenance gate, not a capture
  implementation.
- Capture readiness is still blocked by unknown real Avanza readback fields and
  privacy constraints.
- Manual QA should define what future captured evidence can safely contain
  before any browser/OCR/readback prototype is designed.

Next recommended action:

**Action 476 - Create Avanza Confirmation Capture Manual QA Checklist**

## Action 476 Follow-Up

Action 476 created
`docs/avanza-confirmation-capture-manual-qa-checklist.md`.

Evidence-validator impact:

- Manual QA can now compare real Avanza observed fields against the validator's
  required source, broker reference, timestamp, instrument, side, quantity,
  price, provenance, and partial-fill gates.
- The validator remains unchanged and pure.
- Any validator changes should wait until manual QA findings are reassessed.

Next recommended action:

**Action 477 - Reassess Manual QA Findings**

## Action 477 Follow-Up

Action 477 created
`docs/avanza-confirmation-capture-manual-qa-findings-reassessment.md`.

Evidence-validator impact:

- No actual final confirmation/account-history findings exist to change
  validator behavior.
- The validator remains conservative and unchanged.
- Missing broker references, timestamps, provenance, and partial-fill behavior
  remain unresolved capture-readiness gaps.

Next recommended action:

**Action 478 - Create Manual QA Findings Template**

## Action 478 Follow-Up

Action 478 created
`docs/avanza-confirmation-capture-manual-qa-findings-template.md`.

Evidence-validator impact:

- The template can capture whether real observations satisfy validator gates.
- The validator remains unchanged.
- Any validator update remains blocked until the template contains real
  findings and those findings are reassessed.

Next recommended action:

**Action 479 - Fill Manual QA Findings Template**
