# Avanza Broker Confirmation Evidence Contract

## 1. Purpose

Define the required evidence for an Avanza-originating confirmed execution
before any future `BrokerExecutionResult` conversion.

This contract is documentation-only. It does not implement browser automation,
OCR, extraction, capture, conversion, persistence, Supabase writes, audit
append, trade mutation, broker result creation, or Avanza behavior.

## 2. Scope

Included:

- Avanza confirmation/readback evidence requirements.
- Semi-automatic manual confirmation path evidence requirements.
- Source and provenance metadata expectations.
- Required extracted/readback fields before confirmation validation.
- Conservative validation prerequisites and rejection flags.

Excluded:

- Browser automation implementation.
- OCR implementation.
- DOM/text/screenshot extraction implementation.
- `BrokerExecutionResult` conversion.
- Execution record persistence.
- Supabase reads or writes.
- Audit append.
- Trade mutation.
- Automatic mode enablement.

## 3. Evidence source types

Order form / pre-submit source:

- Disallowed as confirmed execution evidence.
- May help compare intended order inputs only.
- Must not be used to create a `BrokerExecutionResult`.

Order preview source:

- Disallowed as confirmed execution evidence.
- Includes review pages, pre-confirmation summaries, and any page before the
  human final confirmation.
- Maps to rejection/uncertainty such as `source_is_order_preview`.

Final confirmation / readback source:

- Allowed evidence source if it is clearly after final confirmation.
- Must include filled/executed wording or an explicitly reviewed broker
  equivalent before full execution can be claimed.
- Must distinguish confirmed execution from placed, accepted, pending,
  rejected, cancelled, or unclear status.

Account / order history source:

- Allowed evidence source if it references the same order/instrument/action and
  contains sufficient broker-originating confirmation or fill details.
- May be stronger than immediate readback when it exposes order id, fill id,
  execution timestamp, and execution price.

Manual user-provided source:

- Not sufficient by itself for production-safe evidence.
- May be used in the semi-automatic path only as a checkpoint that the human
  performed the final broker action.
- Must be paired with final broker readback or account/order history evidence
  before confirmation.

## 4. Required confirmation evidence fields

Required fields for a future production-safe Avanza confirmation evidence
object:

- `broker`: `avanza`.
- account context if available, sanitized and non-sensitive.
- broker order id / order number when available.
- confirmation id, fill id, execution id, or broker-specific equivalent when
  available.
- instrument name.
- ticker, ISIN, broker instrument id, or another stable instrument identifier
  when available.
- side: `buy` or `sell`.
- quantity.
- execution price, average fill price, or reviewed limit/filled price field.
- currency.
- order type when available.
- confirmation timestamp from broker evidence.
- captured timestamp from the capture/readback process.
- source page/flow identifier.
- manual confirmation marker for semi-automatic path.
- source classification.
- handoff payload fingerprint link when available.

Production-safe evidence should not rely on a single user-entered field when a
broker-originating field is available.

## 5. Optional evidence fields

Optional fields:

- commission/courtage/fee.
- total amount.
- settlement or cash impact.
- venue/market.
- account name/type, sanitized.
- partial fill status.
- filled quantity.
- remaining quantity.
- average price across fills.
- screenshot or text capture reference if a future privacy design allows it.
- raw extracted field map after sanitization.
- warning flags.
- broker status text.
- page language/locale.
- extraction notes.

Optional fields may improve review confidence but must not override missing
required confirmation identity, source, timestamp, instrument, side, quantity,
or price evidence.

## 6. Provenance metadata

Required or expected provenance metadata:

- capture method, such as browser readback, text extraction, OCR, account
  history lookup, or manual review.
- capture agent/mode, such as semi-automatic supervised capture.
- browser/session context as a sanitized identifier only.
- page identity, such as final confirmation, receipt, order status, or account
  history.
- URL pattern classification without storing sensitive raw URLs unless a
  separate privacy design explicitly allows it.
- capture timestamp.
- extraction confidence.
- field-level confidence for instrument, side, quantity, price, timestamp, and
  broker reference fields.
- user confirmation checkpoint for semi-automatic path.
- source screenshot/text hash if a future design allows storing a hash.
- evidence fingerprint suitable for idempotency and duplicate review.

Provenance metadata should prove that evidence is broker-originating and not
preview/dev/mock/dry-run/local diagnostic data.

## 7. Validation prerequisites

Before a future validator can mark Avanza evidence as confirmation-capable:

- Evidence must come from final confirmation/readback or account/order history,
  not order form or preview sources.
- Side must match the expected handoff action.
- Instrument identity must match the expected handoff ticker/instrument using
  a reviewed identity policy.
- Quantity must match expected quantity unless a future partial-fill policy
  explicitly allows otherwise.
- Price must be numeric, finite, positive, and within reviewed tolerance.
- Confirmation timestamp must be present and plausible.
- Captured timestamp must be present and plausible.
- Source classification must not be `preview_only`, `dev_fixture`,
  `mock_broker`, `dry_run`, or `local_diagnostics`.
- Broker order id, confirmation id, fill id, execution id, or a reviewed strong
  equivalent is required for a production-safe path.
- A manual confirmation checkpoint is required for semi-automatic flows.
- Evidence must link back to the handoff payload fingerprint when available.

Passing these prerequisites would not itself persist records, append audit, or
mutate trades. It would only make evidence eligible for a future confirmation
validator/converter.

## 8. Partial fill handling

Representation:

- If Avanza exposes partial-fill state, evidence should preserve status,
  filled quantity, remaining quantity, average fill price, fill timestamp, and
  broker fill/reference ids when available.
- Multiple fills may need either one aggregate execution record or multiple
  execution records. This is unresolved.

Unresolved questions:

- Whether one Avanza order with multiple fills maps to one record or one record
  per fill.
- How fees/courtage should be allocated across fills.
- How remaining quantity should affect live position state.
- How duplicate detection should handle multiple fills sharing one order id.

Default conservative behavior:

- If partial-fill data is unclear, the evidence should be blocked or marked
  needs-review.
- Partial-fill evidence must not be mapped to a full-fill execution record
  until a dedicated partial-fill policy exists.

## 9. Rejection reasons / uncertainty flags

Future validators should map missing or unsafe evidence to explicit reasons:

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

Additional useful uncertainty flags:

- `status_not_filled_or_executed`
- `account_context_missing`
- `handoff_fingerprint_missing`
- `currency_missing`
- `broker_reference_ambiguous`
- `manual_confirmation_missing`
- `timestamp_out_of_range`

## 10. Security/privacy

Privacy requirements:

- Avoid storing unnecessary sensitive account data.
- Redact or mask account identifiers if account context is needed.
- Do not store credentials, cookies, tokens, 2FA material, balances, holdings,
  account numbers, raw DOM, or unsanitized page text.
- Do not store raw screenshots unless a future privacy and retention design
  explicitly allows it.
- Prefer hashes/references over raw screenshots or raw text.
- Minimize browser/session details to non-sensitive provenance labels.
- Keep evidence payloads separate from trade mutation and persistence write
  behavior until those boundaries are explicitly designed.

## 11. Relationship to BrokerExecutionResult

This evidence contract is input to future confirmation validation and
conversion work.

It does not:

- create a `BrokerExecutionResult`.
- convert Avanza readback into execution record data.
- persist anything.
- write Supabase.
- append audit events.
- mutate trades.
- authorize automatic mode.
- click or automate Avanza.

A future `BrokerExecutionResult` confirmation validator should consume evidence
that satisfies this contract, apply source classification validation, verify
handoff matching, and return explicit rejection/needs-review/eligible metadata.

## 12. Candidate next actions

A. Create Avanza Broker Confirmation Evidence Types

- safest next step if the contract should become type-checkable.
- can remain type-only and avoid browser/capture/conversion behavior.
- should model required fields, optional fields, provenance metadata, evidence
  source types, and rejection flags.

B. Create BrokerExecutionResult Confirmation Validator Design

- useful after evidence fields are typeable.
- should specify how evidence, source classification, and handoff matching
  combine.
- should remain design-only before any runtime validator implementation.

C. Reassess Avanza Broker Confirmation Capture Readiness

- useful but closer to browser and Avanza behavior.
- should wait until evidence types and validator design are clearer.

D. Create Avanza Confirmation Capture Manual QA Checklist

- useful for manual review and test planning.
- lower implementation risk but less foundational than evidence types.

## 13. Recommended next action

**Action 455 - Create Avanza Broker Confirmation Evidence Types**

Rationale:

- The evidence contract now defines the shape and boundaries in prose.
- Type-only evidence contracts are the safest way to make future validators and
  conversion designs precise.
- This keeps capture, browser automation, conversion, persistence, Supabase,
  audit append, and trade mutation out of scope.

## 14. Risk assessment

Preview mistaken as confirmation:

- high. Order form and preview sources are visually broker-like but are not
  confirmed execution evidence.

Missing order id:

- high. Missing broker reference weakens idempotency and duplicate protection.
  A strong equivalent must be explicitly reviewed before production use.

Partial fill ambiguity:

- high. Incorrectly treating a partial fill as a full fill can corrupt
  execution records and future trade state.

Field extraction error:

- high. OCR/text/browser extraction can misread instrument, quantity, price,
  currency, or timestamp. Field-level confidence and handoff matching are
  required.

Account privacy risk:

- high. Account numbers, balances, holdings, credentials, tokens, cookies, raw
  DOM, and screenshots must be minimized or excluded.

UI drift risk:

- medium/high. Avanza wording, order states, and page structure may change.
  Evidence source classification and final confirmation detection must be
  conservative.

Spoofed evidence risk:

- high. User-entered or local diagnostic values can spoof broker-like fields.
  Broker-originating provenance and source classification are required.

## 15. Verification

Verification for this documentation-only contract:

- `git diff --check`

No runtime code changes were made. No Avanza/browser automation, OCR/browser
extraction, `BrokerExecutionResult` creation, conversion/capture
implementation, persistence/write behavior, Supabase behavior, audit append,
or trade mutation was added.

## Action 455 Follow-Up

Action 455 created
`lib/avanza-broker-confirmation-evidence-contract.ts`.

Result:

- Added type/constant-only Avanza broker confirmation evidence contracts.
- Modeled source types:
  - `order_form`
  - `order_preview`
  - `final_confirmation`
  - `account_order_history`
  - `manual_user_provided`
- Modeled evidence, provenance, field confidence, field map, privacy,
  instrument, broker reference, price, account context, partial-fill,
  warning, and rejection reason types.
- Explicitly modeled rejection reasons and uncertainty warnings from this
  contract.
- Confirmed the module does not implement capture, extraction, validation,
  conversion, persistence, Supabase behavior, audit append, trade mutation,
  browser automation, or Avanza behavior.

Next recommended action:

**Action 456 - Reassess Avanza Broker Confirmation Evidence Types**

## Action 456 Follow-Up

Action 456 created
`docs/avanza-broker-confirmation-evidence-types-reassessment.md`.

Result:

- Verified `lib/avanza-broker-confirmation-evidence-contract.ts` remains
  type/constant-only.
- Confirmed source types, evidence shape, provenance, field confidence,
  privacy metadata, partial fills, warnings, and rejection reasons align with
  this contract.
- Confirmed the module has no capture, OCR/browser extraction, validation,
  conversion, persistence, Supabase, audit append, trade mutation, browser, or
  Avanza behavior.
- Documented remaining gaps before broker confirmation enforcement.

Next recommended action:

**Action 457 - Create Avanza Broker Confirmation Evidence Validator**

## Action 457 Follow-Up

Action 457 created
`lib/avanza-broker-confirmation-evidence-validator.ts`.

Contract impact:

- The evidence contract now has a pure validator for completeness/provenance
  sanity checks.
- The validator uses this contract's rejection reasons and warnings.
- Ambiguous partial fills and low confidence return `needs_review`.
- Hard blockers such as preview sources, missing broker references, missing
  provenance, invalid quantity, or invalid price reject conservatively.
- The validator does not capture, extract, convert, persist, append audit,
  mutate trades, automate browsers, or touch Avanza.

Next recommended action:

**Action 458 - Reassess Avanza Broker Confirmation Evidence Validator**

## Action 458 Follow-Up

Action 458 created
`docs/avanza-broker-confirmation-evidence-validator-reassessment.md`.

Contract impact:

- The pure evidence validator was reassessed as aligned with this contract.
- `valid` evidence means field-sane evidence only, not a BrokerExecutionResult
  and not persistence readiness.
- Partial-fill ambiguity and low confidence remain `needs_review`.
- Mapping to BrokerExecutionResult remains a future design step.

Next recommended action:

**Action 459 - Create Evidence-to-BrokerExecutionResult Mapping Design**

## Action 459 Follow-Up

Action 459 created
`docs/avanza-evidence-to-broker-execution-result-mapping-design.md`.

Contract impact:

- Validated evidence now has a design-only downstream mapping target.
- Mapping remains future-only and does not create BrokerExecutionResults.
- Evidence validation, mapping, execution-record creation, persistence, and
  trade mutation remain separate boundaries.

Next recommended action:

**Action 460 - Create BrokerExecutionResult Confirmation Validator Design**

## Action 460 Follow-Up

Action 460 created
`docs/broker-execution-result-confirmation-validator-design.md`.

Evidence-contract impact:

- The future confirmation validator will consume validated evidence and raw
  evidence snapshots.
- Evidence remains separate from BrokerExecutionResult candidates.
- The design keeps evidence validation, confirmation validation, mapping,
  persistence, and trade mutation separate.

Next recommended action:

**Action 461 - Create BrokerExecutionResult Confirmation Validator Contract Types**

## Action 475 Follow-Up

Action 475 created
`docs/avanza-broker-confirmation-capture-readiness-reassessment.md`.

Evidence-contract impact:

- The evidence contract remains the target shape for future capture output.
- Capture/readback is not ready for implementation because actual Avanza final
  confirmation and account/order-history fields have not been manually
  inventoried.
- Manual QA should verify broker references, timestamps, instrument identifiers,
  side/quantity/price/currency labels, partial-fill visibility, and privacy
  constraints before any capture prototype.

Next recommended action:

**Action 476 - Create Avanza Confirmation Capture Manual QA Checklist**

## Action 476 Follow-Up

Action 476 created
`docs/avanza-confirmation-capture-manual-qa-checklist.md`.

Evidence-contract impact:

- The checklist maps required evidence fields against final confirmation and
  account/order-history visibility.
- It asks manual QA to classify each field as visible, not visible, ambiguous,
  needing fallback, or privacy-sensitive.
- Evidence contract changes remain future work after manual QA findings are
  reassessed.

Next recommended action:

**Action 477 - Reassess Manual QA Findings**

## Action 477 Follow-Up

Action 477 created
`docs/avanza-confirmation-capture-manual-qa-findings-reassessment.md`.

Evidence-contract impact:

- No final confirmation/account-history findings are available to justify
  evidence contract updates.
- Required broker confirmation fields remain unknown or untested for actual
  post-submit Avanza sources.
- Existing pre-submit observations should not be promoted to confirmed evidence
  fields.

Next recommended action:

**Action 478 - Create Manual QA Findings Template**

## Action 483 Follow-Up

Action 483 created
`docs/avanza-confirmation-capture-user-recorded-observations-reassessment.md`.

Evidence-contract impact:

- No user-recorded final confirmation/readback observations are available to
  update this evidence contract.
- No user-recorded account/order-history observations are available to update
  this evidence contract.
- Required broker confirmation fields remain unobserved for real Avanza
  final/history sources.
- Pre-submit findings remain excluded from production-safe evidence.

Next recommended action:

**Action 484 - Record Real Avanza Manual QA Observations**

## Action 478 Follow-Up

Action 478 created
`docs/avanza-confirmation-capture-manual-qa-findings-template.md`.

Evidence-contract impact:

- The template includes an evidence contract gap mapping table for real manual
  findings.
- The contract remains unchanged until actual findings justify an update.
- No final/history field availability was invented.

Next recommended action:

**Action 479 - Fill Manual QA Findings Template**

## Action 479 Follow-Up

Action 479 filled
`docs/avanza-confirmation-capture-manual-qa-findings-template.md`.

Evidence-contract impact:

- Existing findings do not prove final confirmation or order-history evidence
  field availability.
- The evidence contract should not be updated from pre-submit observations.
- Required broker references, confirmation ids/equivalents, timestamps, fill
  status, and provenance remain manual QA gaps.

Next recommended action:

**Action 480 - Record Real Avanza Manual QA Observations**

## Action 480 Follow-Up

Action 480 created
`docs/avanza-confirmation-capture-manual-qa-observation-log.md`.

Evidence-contract impact:

- The log includes an evidence contract gap update block for future
  observations.
- No actual final/history findings were added.
- The evidence contract remains unchanged and capture readiness remains blocked.

Next recommended action:

**Action 481 - Reassess Real Avanza Manual QA Observations**

## Action 481 Follow-Up

Action 481 created
`docs/avanza-confirmation-capture-real-manual-qa-observations-reassessment.md`.

Evidence-contract impact:

- No real observations exist to justify evidence contract changes.
- All post-submit final confirmation and account/order-history evidence fields
  remain not observed.
- The evidence contract remains unchanged.

Next recommended action:

**Action 482 - Create User Manual QA Runbook**

## Action 482 Follow-Up

Action 482 created
`docs/avanza-confirmation-capture-user-manual-qa-runbook.md`.

Evidence-contract impact:

- The runbook explains how to record real observations needed for future
  evidence contract reassessment.
- The contract remains unchanged because no real observations were added.

Next recommended action:

**Action 483 - Reassess User-Recorded Avanza Manual QA Observations**

## Action 485 Follow-Up - Two-Stage Evidence Contract Direction

Action 485 created
`docs/two-stage-broker-evidence-flow-design.md`.

Contract direction:

- Future Avanza evidence should carry explicit stage metadata:
  `immediate_readback` or `final_settlement_note`.
- Immediate readback evidence should include provisional status,
  missing-fields metadata, and a final-note-pending flag.
- Final settlement note evidence should include official note/reference,
  business date, settlement date, instrument/ISIN, quantity, price, currency,
  commission, consideration, total amount, account context, and provenance when
  available.
- Evidence validation should not treat immediate readback as final settlement
  evidence.
- The current documentation still enables no capture, mapper write,
  execution-record creation, persistence, audit append, or trade mutation.

Next recommended action:

**Action 486 - Create Two-Stage Broker Evidence Contract Types**

## Action 486 Follow-Up - Two-Stage Contract Types

Action 486 created `lib/two-stage-broker-evidence-contract.ts`.

Evidence-contract impact:

- The new contract types explicitly separate immediate readback from final
  settlement-note evidence.
- Immediate readback evidence is provisional, final-note-pending, and not final
  official settlement evidence.
- Final settlement-note evidence can model official Avanza note fields, but
  still does not imply persistence, finalization, or trade mutation.
- The default safety policy keeps persistence, trade mutation, finalization,
  automatic mode, capture implementation, matching implementation, audit append,
  and execution-record creation disabled.
- The existing Avanza confirmation evidence contract remains unchanged at
  runtime.

Next recommended action:

**Action 487 - Reassess Two-Stage Broker Evidence Contract Types**

## Action 487 Follow-Up - Two-Stage Contract Reassessment

Action 487 created
`docs/two-stage-broker-evidence-contract-reassessment.md`.

Evidence-contract impact:

- The reassessment confirmed `lib/two-stage-broker-evidence-contract.ts` is
  type/constant-only.
- Immediate readback remains explicitly provisional and not final settlement
  evidence.
- Final settlement-note evidence remains an official source candidate but not
  persistence or finalization approval.
- Existing Avanza evidence validation and capture docs remain disconnected from
  runtime capture, matching, persistence, execution-record creation, and trade
  mutation.

Next recommended action:

**Action 488 - Create Final Settlement Note Matching Design**

## Action 488 Follow-Up - Final Settlement Note Matching Design

Action 488 created `docs/final-settlement-note-matching-design.md`.

Evidence-contract impact:

- Future Avanza final settlement note evidence should be matchable against
  provisional readback by broker, account/category, instrument identity, side,
  quantity, dates, price/currency, note reference, and provenance.
- Evidence validation remains separate from matching.
- A valid final settlement note does not automatically match, persist,
  finalize, create an execution record, or mutate trade state.

Next recommended action:

**Action 489 - Create Final Settlement Note Matching Contract Types**

## Action 489 Follow-Up - Matching Contract Types Created

Action 489 created `lib/final-settlement-note-matching-contract.ts`.

Evidence-contract impact:

- Future Avanza settlement note evidence can now be referenced by a type-only
  matching input/result contract.
- Evidence validation remains separate from matching.
- A typed match result still does not persist, finalize, create execution
  records, append audit, mutate trades, or automate Avanza.

Next recommended action:

**Action 490 - Reassess Final Settlement Note Matching Contract Types**

## Action 490 Follow-Up - Matching Contract Reassessment

Action 490 created
`docs/final-settlement-note-matching-contract-reassessment.md`.

Evidence-contract impact:

- The matching contract remains separate from Avanza evidence validation.
- Valid note evidence still does not imply a successful match.
- A future match result still does not imply finalization, persistence,
  execution-record creation, trade mutation, or Avanza automation.

Next recommended action:

**Action 491 - Create Final Settlement Note Matching Validator**

## Action 491 Follow-Up - Matching Validator Created

Action 491 created
`lib/final-settlement-note-matching-validator.ts`.

Evidence-contract impact:

- Avanza confirmation evidence validation remains separate from final
  settlement-note matching.
- The validator can compare future final settlement-note evidence with
  provisional readback/trade context using hard gates and soft signals.
- A valid Avanza final note still does not automatically persist, finalize,
  create an execution record, mutate trades, or automate Avanza.
- The validator result keeps `safeToFinalize=false`, `safeToPersist=false`,
  and `safeToMutateTrade=false`.

Next recommended action:

**Action 492 - Reassess Final Settlement Note Matching Validator**

## Action 492 Follow-Up - Matching Validator Reassessed

Action 492 created
`docs/final-settlement-note-matching-validator-reassessment.md`.

Evidence-contract impact:

- The Avanza confirmation evidence contract remains separate from final
  settlement-note matching.
- The validator is confirmed as matching-only and does not capture Avanza
  pages, automate Avanza, persist evidence, create execution records, finalize
  trades, or mutate trade state.
- `matchingImplementationEnabled=true` is limited to pure validator logic.

Next recommended action:

**Action 493 - Create Final Settlement Note Match Dev Preview Design**
