# Avanza Broker Confirmation Evidence Types Reassessment

## 1. Purpose

Reassess the Avanza broker confirmation evidence types after Action 455.
The goal is to verify that
`lib/avanza-broker-confirmation-evidence-contract.ts` remains
type/constant-only, aligned with the evidence contract, and disconnected from
capture, OCR/browser extraction, validation, conversion, persistence, Supabase,
audit, trade mutation, browser, and Avanza behavior.

## 2. Current evidence type inventory

Module:

- `lib/avanza-broker-confirmation-evidence-contract.ts`

Source types:

- `order_form`
- `order_preview`
- `final_confirmation`
- `account_order_history`
- `manual_user_provided`

Source category constants:

- `AVANZA_CONFIRMATION_EVIDENCE_ALLOWED_SOURCE_TYPES`
- `AVANZA_CONFIRMATION_EVIDENCE_DISALLOWED_SOURCE_TYPES`

Evidence shape:

- `AvanzaConfirmationEvidence`
- contract version.
- `broker: "avanza"`.
- source type and page/flow identifier.
- side, quantity, price, currency.
- confirmation and captured timestamps.
- manual confirmation checkpoint.
- source classification.
- provenance metadata.
- privacy metadata.
- instrument evidence.
- broker references.
- optional order status, order type, account context, handoff fingerprint,
  fees, total amount, settlement impact, partial-fill evidence, raw field map,
  warnings, rejection reasons, and metadata.

Provenance metadata:

- `AvanzaConfirmationEvidenceProvenance`
- capture method.
- capture mode.
- page identity.
- captured timestamp.
- evidence fingerprint.
- source classification.
- sanitized browser/session labels.
- URL pattern classification.
- extraction confidence.
- field confidence.
- user confirmation checkpoint.
- screenshot/text hashes.
- capture/request/handoff identifiers.

Field confidence model:

- `AvanzaConfirmationEvidenceFieldConfidence`
- `AvanzaConfirmationEvidenceFieldConfidenceMap`
- confidence can be attached to instrument, side, quantity, price, timestamp,
  broker reference, status, and currency.

Price/partial-fill evidence:

- `AvanzaPriceEvidence`
- price field types include execution, average fill, filled, limit, and
  accepted price.
- `AvanzaPartialFillEvidence`
- partial-fill status can be `partial`, `multiple_fills`, or `unclear`.

Rejection/warning flags:

- `AVANZA_CONFIRMATION_EVIDENCE_REJECTION_REASONS`
- `AvanzaConfirmationEvidenceRejectionReason`
- `AVANZA_CONFIRMATION_EVIDENCE_WARNINGS`
- `AvanzaConfirmationEvidenceWarning`

Privacy metadata:

- `AvanzaConfirmationEvidencePrivacyMetadata`
- explicit booleans for raw screenshots, raw text, raw DOM, credentials,
  cookies/tokens, account number, balance/holdings, masked account id, raw URL,
  and raw sensitive data.

## 3. Boundary verification

Type-only/constants-only:

- The module exports string-literal arrays, type aliases, and structured TypeScript
  types.
- It has no functions.
- It has no side effects.
- It imports only `BrokerResultSourceClassification` as a type-only import.

No capture:

- No capture state, browser session, page readback, selector, or Avanza page
  interaction is implemented.

No OCR/browser extraction:

- OCR/text/browser extraction is represented only as future provenance/capture
  method metadata.
- No extraction code exists.

No validation:

- Rejection reasons and warnings are modeled, but no validator consumes or
  produces them.
- Allowed/disallowed source arrays are metadata only.

No `BrokerExecutionResult` conversion:

- The module does not import or create `BrokerExecutionResult` values.
- The evidence shape is a future input contract only.

No persistence:

- No Supabase client is imported.
- No localStorage or database access exists.
- No record storage is attempted.

No Supabase/audit/trade/browser/Avanza behavior:

- No Supabase behavior exists.
- No audit append exists.
- No trade mutation exists.
- No browser or Avanza automation exists.

## 4. Alignment with evidence contract

Required fields:

- Broker is modeled as `"avanza"`.
- Instrument evidence includes name plus ticker/ISIN/instrument id options.
- Broker references include order id/order number, confirmation id, fill id,
  execution id, broker reference, and strong equivalent reference.
- Side, quantity, price, currency, confirmation timestamp, captured timestamp,
  source page/flow id, manual confirmation marker, source classification, and
  provenance are modeled.
- Handoff payload fingerprint is available on both evidence and provenance.

Optional fields:

- Commission, fee, total amount, settlement impact, venue/market, account
  context, partial fills, raw field map, warnings, and metadata are modeled.

Source types:

- The five source types match the contract.
- Final confirmation and account/order history are identified as allowed
  source categories.
- Order form, order preview, and manual user-provided are identified as
  disallowed for confirmed execution evidence by default.

Provenance:

- Capture method, capture mode, page identity, captured timestamp, evidence
  fingerprint, source classification, extraction confidence, field confidence,
  user checkpoint, hashes, and request/capture identifiers are modeled.

Partial fill handling:

- Partial, multiple-fill, and unclear partial-fill states are modeled.
- Filled quantity, remaining quantity, average fill price, fill timestamp,
  fill ids, and order id are available.
- The type does not decide whether partial fills map to one or many records.

Privacy/security:

- Sensitive raw data indicators are explicit.
- Masked account id and raw URL storage indicators are explicit.
- The type makes overcapture visible to future validators.

Rejection reasons:

- The explicit contract reasons are modeled:
  - `missing_final_confirmation_source`
  - `source_is_order_preview`
  - `missing_order_id`
  - `missing_confirmation_timestamp`
  - `missing_instrument_identifier`
  - `side_mismatch`
  - `quantity_mismatch`
  - `price_invalid`
  - `provenance_missing`
  - `extraction_confidence_low`
  - `partial_fill_ambiguous`

## 5. Remaining gaps

- No evidence validator exists.
- No `BrokerExecutionResult` confirmation validator exists.
- No capture implementation exists.
- No Avanza capture readiness reassessment has been done after evidence
  typing.
- No source/provenance enforcement exists.
- No conversion mapping from evidence to `BrokerExecutionResult` exists.
- No policy exists yet for assigning `broker_confirmed` or
  `production_safe_candidate` from evidence.
- No partial-fill accounting policy exists.

## 6. Candidate next actions

A. Create Avanza Broker Confirmation Evidence Validator

- safest next implementation-adjacent step.
- can remain pure and deterministic.
- should validate evidence source type, required fields, provenance, privacy
  flags, broker references, timestamps, partial-fill ambiguity, and confidence
  without capture/conversion/persistence.
- creates a clean input gate before BrokerExecutionResult confirmation design.

B. Create BrokerExecutionResult Confirmation Validator Design

- useful, but should ideally consume a first-pass evidence validator contract.
- closer to conversion and production semantics.

C. Reassess Avanza Broker Confirmation Capture Readiness

- valuable, but closer to browser/Avanza behavior.
- should wait until evidence validation is designed or implemented.

D. Create Evidence-to-BrokerExecutionResult Mapping Design

- useful after validation semantics are clearer.
- risks implying conversion readiness too early.

## 7. Recommended next action

**Action 457 - Create Avanza Broker Confirmation Evidence Validator**

Rationale:

- Evidence types are now explicit enough for a pure validator.
- A pure validator can reject obvious unsafe evidence without capture,
  conversion, persistence, Supabase writes, audit append, trade mutation,
  browser automation, or Avanza behavior.
- This should remain a metadata-only gate and not create
  `BrokerExecutionResult` values.

## 8. Risk assessment

Types mistaken for validation risk:

- high. The type module models evidence shape only. It does not prove evidence
  is real, complete, broker-originating, or production-safe.

Partial-fill ambiguity:

- high. The type can represent partial fills but does not define accounting or
  record-mapping policy.

Missing provenance risk:

- high. Provenance fields exist but are not enforced yet.

Privacy overcapture risk:

- high. Privacy metadata can indicate raw/sensitive data, but no validator
  blocks overcapture yet.

Future OCR/browser extraction trust risk:

- high. OCR/browser capture methods are labels only. Extraction output must be
  treated as untrusted until validated.

Avanza UI drift risk:

- medium/high. Source/page identity types do not protect against changed Avanza
  wording or flow structure.

Conversion false-positive risk:

- high. Future conversion must not treat typed evidence as confirmed execution
  without validation, source classification checks, and handoff matching.

## 9. Verification

Verification for this documentation-only reassessment:

- `git diff --check`

No runtime code changes were made. No capture implementation, OCR/browser
extraction, validation implementation, `BrokerExecutionResult` conversion,
persistence/write behavior, Supabase behavior, audit append, trade mutation,
browser behavior, or Avanza behavior was added.

## Action 457 Follow-Up

Action 457 created
`lib/avanza-broker-confirmation-evidence-validator.ts`.

Result:

- Added pure deterministic `validateAvanzaConfirmationEvidence(...)`.
- Validator checks source type, broker reference, timestamps, instrument
  identity, side, quantity, price, provenance, source classification policy,
  partial-fill ambiguity, and field confidence.
- Validator returns typed `valid`, `rejected`, or `needs_review` results.
- Added focused e2e pure-helper coverage for valid final confirmation
  evidence, order-preview rejection, missing order id, missing provenance,
  invalid quantity/price, partial-fill ambiguity, and low confidence.

Boundary:

- No capture/OCR/browser extraction was added.
- No `BrokerExecutionResult` conversion was added.
- No persistence/write behavior, Supabase behavior, audit append, trade
  mutation, browser behavior, or Avanza behavior was added.

Next recommended action:

**Action 458 - Reassess Avanza Broker Confirmation Evidence Validator**

## Action 458 Follow-Up

Action 458 created
`docs/avanza-broker-confirmation-evidence-validator-reassessment.md`.

Result:

- Verified `validateAvanzaConfirmationEvidence(...)` remains pure,
  conservative, and evidence-only.
- Confirmed the validator does not capture, extract, convert, persist, append
  audit, mutate trades, automate browsers, or touch Avanza.
- Documented validation coverage for source type, broker reference,
  timestamps, instrument identity, side, quantity, price, provenance, source
  classification policy, partial-fill ambiguity, and confidence.
- Documented remaining gaps before BrokerExecutionResult conversion.

Next recommended action:

**Action 459 - Create Evidence-to-BrokerExecutionResult Mapping Design**
